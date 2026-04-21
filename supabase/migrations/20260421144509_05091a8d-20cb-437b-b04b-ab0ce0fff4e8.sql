-- Step 4: Matchmaking Engine Rewrite

-- 1. Extend battle_queue (additive)
ALTER TABLE public.battle_queue
  ADD COLUMN IF NOT EXISTS mmr int NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS config_id uuid REFERENCES public.battle_configs(id),
  ADD COLUMN IF NOT EXISTS dodge_until timestamptz,
  ADD COLUMN IF NOT EXISTS last_search_expansion_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_battle_queue_status_mmr ON public.battle_queue (status, mmr);
CREATE UNIQUE INDEX IF NOT EXISTS uq_battle_queue_user_searching
  ON public.battle_queue (user_id) WHERE status = 'searching';

-- 2. mm_recent_opponents
CREATE TABLE IF NOT EXISTS public.mm_recent_opponents (
  user_id uuid NOT NULL,
  opponent_id uuid NOT NULL,
  last_match_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, opponent_id)
);
ALTER TABLE public.mm_recent_opponents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own recent opponents" ON public.mm_recent_opponents;
CREATE POLICY "Users read own recent opponents" ON public.mm_recent_opponents
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "No direct write to recent opponents" ON public.mm_recent_opponents;
CREATE POLICY "No direct write to recent opponents" ON public.mm_recent_opponents
  FOR INSERT WITH CHECK (false);
CREATE INDEX IF NOT EXISTS idx_mm_recent_opp_time ON public.mm_recent_opponents (last_match_at);

-- 3. mm_dodge_state
CREATE TABLE IF NOT EXISTS public.mm_dodge_state (
  user_id uuid PRIMARY KEY,
  dodge_count int NOT NULL DEFAULT 0,
  dodge_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mm_dodge_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own dodge state" ON public.mm_dodge_state;
CREATE POLICY "Users read own dodge state" ON public.mm_dodge_state
  FOR SELECT USING (user_id = auth.uid());

-- Drop legacy/conflicting signatures
DROP FUNCTION IF EXISTS public.mm_enqueue(text, text, uuid);
DROP FUNCTION IF EXISTS public.mm_dequeue(text);
DROP FUNCTION IF EXISTS public.mm_tick();
DROP FUNCTION IF EXISTS public.mm_status();
DROP FUNCTION IF EXISTS public.mm_create_match(uuid, uuid, text, uuid);
DROP FUNCTION IF EXISTS public.mm_apply_dodge(uuid);
DROP FUNCTION IF EXISTS public.join_battle_queue(text, uuid);
DROP FUNCTION IF EXISTS public.cancel_battle_queue();
DROP FUNCTION IF EXISTS public.check_battle_queue_status();

-- 4. mm_enqueue
CREATE FUNCTION public.mm_enqueue(
  p_mode text,
  p_config_key text DEFAULT 'casual_duo',
  p_target_user uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_existing uuid;
  v_config_id uuid;
  v_mmr int := 1000;
  v_dodge timestamptz;
  v_queue_id uuid;
  v_season_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  SELECT dodge_until INTO v_dodge FROM mm_dodge_state WHERE user_id = v_user;
  IF v_dodge IS NOT NULL AND v_dodge > now() THEN
    RAISE EXCEPTION 'dodge_cooldown_active until %', v_dodge;
  END IF;

  SELECT id INTO v_existing FROM battle_queue
    WHERE user_id = v_user AND status = 'searching' LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  SELECT id INTO v_config_id FROM battle_configs
    WHERE key = p_config_key AND is_active = true LIMIT 1;

  SELECT id INTO v_season_id FROM seasons WHERE status = 'active' LIMIT 1;
  IF v_season_id IS NOT NULL THEN
    SELECT mmr INTO v_mmr FROM rank_states
      WHERE user_id = v_user AND season_id = v_season_id;
    IF v_mmr IS NULL THEN
      INSERT INTO rank_states (user_id, season_id, mmr)
        VALUES (v_user, v_season_id, 1000)
        ON CONFLICT (user_id, season_id) DO NOTHING;
      v_mmr := 1000;
    END IF;
  END IF;

  INSERT INTO battle_queue (user_id, mode, elo, mmr, status, target_user_id, config_id)
    VALUES (v_user, p_mode, COALESCE(v_mmr,1000), COALESCE(v_mmr,1000), 'searching', p_target_user, v_config_id)
    RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$;

-- 5. mm_create_match (internal helper)
CREATE FUNCTION public.mm_create_match(
  p_user_a uuid,
  p_user_b uuid,
  p_mode text,
  p_config_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match_id uuid;
  v_season_id uuid;
  v_duration int := 30;
  v_problem_count int := 3;
  v_mmr_a int := 1000;
  v_mmr_b int := 1000;
  v_problems uuid[];
  v_pid uuid;
  v_idx int := 0;
BEGIN
  SELECT id INTO v_season_id FROM seasons WHERE status = 'active' LIMIT 1;

  IF p_config_id IS NOT NULL THEN
    SELECT duration_minutes, problem_count
      INTO v_duration, v_problem_count
      FROM battle_configs WHERE id = p_config_id;
  END IF;

  SELECT COALESCE(mmr,1000) INTO v_mmr_a FROM rank_states
    WHERE user_id = p_user_a AND season_id = v_season_id;
  SELECT COALESCE(mmr,1000) INTO v_mmr_b FROM rank_states
    WHERE user_id = p_user_b AND season_id = v_season_id;

  INSERT INTO battle_matches (
    created_by, mode, status, state, duration_minutes,
    problem_count, config_id, season_id, phase_started_at
  ) VALUES (
    p_user_a, p_mode, 'pending', 'match_found', COALESCE(v_duration,30),
    COALESCE(v_problem_count,3), p_config_id, v_season_id, now()
  ) RETURNING id INTO v_match_id;

  INSERT INTO battle_participants (match_id, user_id, elo_before)
    VALUES (v_match_id, p_user_a, COALESCE(v_mmr_a,1000)),
           (v_match_id, p_user_b, COALESCE(v_mmr_b,1000));

  -- Random active DSA challenges (pick_problem_set may not exist with this signature)
  SELECT array_agg(id) INTO v_problems FROM (
    SELECT id FROM challenges
      WHERE is_active = true AND challenge_type = 'dsa'
      ORDER BY random() LIMIT COALESCE(v_problem_count,3)
  ) s;

  IF v_problems IS NOT NULL THEN
    FOREACH v_pid IN ARRAY v_problems LOOP
      INSERT INTO battle_match_problems (match_id, challenge_id, order_index, points)
        VALUES (v_match_id, v_pid, v_idx, 100);
      v_idx := v_idx + 1;
    END LOOP;
  END IF;

  INSERT INTO mm_recent_opponents (user_id, opponent_id, last_match_at)
    VALUES (p_user_a, p_user_b, now()), (p_user_b, p_user_a, now())
    ON CONFLICT (user_id, opponent_id)
    DO UPDATE SET last_match_at = now();

  INSERT INTO battle_event_log (match_id, user_id, event_type, payload)
    VALUES (v_match_id, NULL, 'match_found',
      jsonb_build_object('user_a', p_user_a, 'user_b', p_user_b, 'mode', p_mode));

  UPDATE battle_matches
    SET state = 'ready_check', phase_started_at = now()
    WHERE id = v_match_id;
  INSERT INTO battle_event_log (match_id, user_id, event_type, payload)
    VALUES (v_match_id, NULL, 'state_transition',
      jsonb_build_object('from','match_found','to','ready_check'));

  RETURN v_match_id;
END;
$$;

-- 6. mm_tick
CREATE FUNCTION public.mm_tick() RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int := 0;
  v_a record;
  v_b record;
  v_window int;
  v_match_id uuid;
BEGIN
  -- 1) Direct-target invites first
  FOR v_a IN
    SELECT * FROM battle_queue
      WHERE status = 'searching' AND target_user_id IS NOT NULL
      ORDER BY created_at ASC
  LOOP
    SELECT * INTO v_b FROM battle_queue
      WHERE status = 'searching'
        AND user_id = v_a.target_user_id
        AND (target_user_id IS NULL OR target_user_id = v_a.user_id)
        AND mode = v_a.mode
      LIMIT 1;
    IF v_b.id IS NOT NULL THEN
      v_match_id := mm_create_match(v_a.user_id, v_b.user_id, v_a.mode, COALESCE(v_a.config_id, v_b.config_id));
      UPDATE battle_queue SET status = 'matched', matched_at = now()
        WHERE id IN (v_a.id, v_b.id);
      v_count := v_count + 1;
    END IF;
  END LOOP;

  -- 2) Open queue pairing
  FOR v_a IN
    SELECT * FROM battle_queue
      WHERE status = 'searching' AND target_user_id IS NULL
      ORDER BY created_at ASC
  LOOP
    PERFORM 1 FROM battle_queue WHERE id = v_a.id AND status = 'searching';
    IF NOT FOUND THEN CONTINUE; END IF;

    v_window := LEAST(50 + floor(EXTRACT(EPOCH FROM (now() - v_a.created_at))/10)::int * 30, 400);

    SELECT bq.* INTO v_b FROM battle_queue bq
      WHERE bq.status = 'searching'
        AND bq.id <> v_a.id
        AND bq.user_id <> v_a.user_id
        AND bq.mode = v_a.mode
        AND bq.target_user_id IS NULL
        AND abs(bq.mmr - v_a.mmr) <= v_window
        AND NOT EXISTS (
          SELECT 1 FROM mm_recent_opponents r
            WHERE r.user_id = v_a.user_id
              AND r.opponent_id = bq.user_id
              AND r.last_match_at > now() - interval '30 minutes'
        )
      ORDER BY abs(bq.mmr - v_a.mmr) ASC, bq.created_at ASC
      LIMIT 1;

    IF v_b.id IS NOT NULL THEN
      v_match_id := mm_create_match(v_a.user_id, v_b.user_id, v_a.mode, COALESCE(v_a.config_id, v_b.config_id));
      UPDATE battle_queue SET status = 'matched', matched_at = now()
        WHERE id IN (v_a.id, v_b.id);
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

-- 7. mm_dequeue
CREATE FUNCTION public.mm_dequeue(p_reason text DEFAULT 'user_cancel')
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_deleted int;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  DELETE FROM battle_queue WHERE user_id = v_user AND status = 'searching';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF p_reason = 'dodge' THEN
    INSERT INTO mm_dodge_state (user_id, dodge_count, dodge_until, updated_at)
      VALUES (v_user, 1, now() + interval '60 seconds', now())
      ON CONFLICT (user_id) DO UPDATE
        SET dodge_count = mm_dodge_state.dodge_count + 1,
            dodge_until = now() + (LEAST(mm_dodge_state.dodge_count + 1, 10) * interval '60 seconds'),
            updated_at = now();
  END IF;

  RETURN v_deleted;
END;
$$;

-- 8. mm_apply_dodge (internal — called from ready_check_respond decline)
CREATE FUNCTION public.mm_apply_dodge(p_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO mm_dodge_state (user_id, dodge_count, dodge_until, updated_at)
    VALUES (p_user, 1, now() + interval '60 seconds', now())
    ON CONFLICT (user_id) DO UPDATE
      SET dodge_count = mm_dodge_state.dodge_count + 1,
          dodge_until = now() + (LEAST(mm_dodge_state.dodge_count + 1, 10) * interval '60 seconds'),
          updated_at = now();
END;
$$;

-- 9. mm_status
CREATE FUNCTION public.mm_status() RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_q record;
  v_match record;
  v_opponent uuid;
  v_dodge timestamptz;
  v_dodge_remaining int := 0;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'status', 'idle');
  END IF;

  SELECT dodge_until INTO v_dodge FROM mm_dodge_state WHERE user_id = v_user;
  IF v_dodge IS NOT NULL AND v_dodge > now() THEN
    v_dodge_remaining := GREATEST(0, EXTRACT(EPOCH FROM (v_dodge - now()))::int);
  END IF;

  SELECT bm.id, bm.mode, bm.state, bm.status INTO v_match
  FROM battle_matches bm
  JOIN battle_participants bp ON bp.match_id = bm.id
  WHERE bp.user_id = v_user
    AND bm.state IN ('match_found','ready_check','ban_pick','active','judging')
  ORDER BY bm.created_at DESC
  LIMIT 1;

  IF v_match.id IS NOT NULL THEN
    SELECT user_id INTO v_opponent FROM battle_participants
      WHERE match_id = v_match.id AND user_id <> v_user LIMIT 1;
    RETURN jsonb_build_object(
      'success', true,
      'status', 'in_battle',
      'match_id', v_match.id,
      'opponent_id', v_opponent,
      'mode', v_match.mode,
      'match_state', v_match.state,
      'dodge_remaining', v_dodge_remaining
    );
  END IF;

  SELECT id, mode, status, created_at, matched_at INTO v_q
    FROM battle_queue
    WHERE user_id = v_user
      AND status IN ('searching','matched')
    ORDER BY created_at DESC LIMIT 1;

  IF v_q.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'idle',
      'dodge_remaining', v_dodge_remaining
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', v_q.status,
    'queue_id', v_q.id,
    'mode', v_q.mode,
    'wait_time', EXTRACT(EPOCH FROM (now() - v_q.created_at))::int,
    'dodge_remaining', v_dodge_remaining
  );
END;
$$;

-- 10. Shim rewrites
CREATE FUNCTION public.join_battle_queue(
  p_mode text,
  p_target_user_id uuid DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_queue_id uuid;
  v_config_key text;
BEGIN
  v_config_key := CASE
    WHEN p_mode = 'ranked' THEN 'ranked_duo'
    WHEN p_mode = 'quick' THEN 'casual_duo'
    ELSE 'casual_duo'
  END;
  v_queue_id := mm_enqueue(p_mode, v_config_key, p_target_user_id);
  PERFORM mm_tick();
  RETURN v_queue_id::text;
END;
$$;

CREATE FUNCTION public.cancel_battle_queue() RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN mm_dequeue('user_cancel');
END;
$$;

CREATE FUNCTION public.check_battle_queue_status() RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v jsonb;
BEGIN
  v := mm_status();
  IF (v->>'match_id') IS NOT NULL THEN
    v := v || jsonb_build_object(
      'session_id', v->>'match_id',
      'battle_id', v->>'match_id'
    );
  END IF;
  RETURN v;
END;
$$;