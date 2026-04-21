
-- =====================================================================
-- HOTFIX: battle_participants RLS recursion
-- =====================================================================
CREATE OR REPLACE FUNCTION public.is_match_participant(_match_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.battle_participants
    WHERE match_id = _match_id AND user_id = _user_id
  );
$$;

DROP POLICY IF EXISTS "Users can view participants of their matches" ON public.battle_participants;
CREATE POLICY "Users can view participants of their matches"
ON public.battle_participants
FOR SELECT
USING (public.is_match_participant(match_id, auth.uid()));

-- Also harden battle_matches & battle_match_problems if they self-reference
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='battle_matches'
      AND policyname='Users can view their own matches'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view their own matches" ON public.battle_matches';
  END IF;
END $$;

CREATE POLICY "Users can view their own matches"
ON public.battle_matches
FOR SELECT
USING (
  created_by = auth.uid()
  OR public.is_match_participant(id, auth.uid())
);

-- =====================================================================
-- Schema additions
-- =====================================================================
ALTER TABLE public.battle_queue
  ADD COLUMN IF NOT EXISTS search_window_elo int NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS enqueued_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.rank_states
  ADD COLUMN IF NOT EXISTS dodge_count_24h int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dodge_window_started_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_battle_queue_window_search
  ON public.battle_queue(status, mmr, search_window_elo)
  WHERE status = 'searching';

-- =====================================================================
-- Helper: initial window from tier band
-- =====================================================================
CREATE OR REPLACE FUNCTION public.mm_initial_window(_mmr int)
RETURNS int
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN _mmr >= 2200 THEN 100  -- Diamond+
    WHEN _mmr >= 1400 THEN 75   -- Gold-Plat
    ELSE 50                      -- Iron-Silver
  END;
$$;

-- Widening step (called by tick): 50→100→150→250→400, etc.
CREATE OR REPLACE FUNCTION public.mm_widen_window(_mmr int, _current int)
RETURNS int
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN _mmr >= 2200 THEN
      CASE WHEN _current < 150 THEN 150
           WHEN _current < 250 THEN 250
           WHEN _current < 400 THEN 400
           ELSE 600 END
    WHEN _mmr >= 1400 THEN
      CASE WHEN _current < 125 THEN 125
           WHEN _current < 200 THEN 200
           WHEN _current < 300 THEN 300
           ELSE 500 END
    ELSE
      CASE WHEN _current < 100 THEN 100
           WHEN _current < 150 THEN 150
           WHEN _current < 250 THEN 250
           ELSE 400 END
  END;
$$;

-- =====================================================================
-- Replace mm_create_match to add 30-min repeat-opponent guard
-- =====================================================================
CREATE OR REPLACE FUNCTION public.mm_create_match(
  p_user_a uuid, p_user_b uuid, p_mode text, p_config_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  v_match_id uuid;
  v_season_id uuid;
  v_duration int := 30;
  v_problem_count int := 3;
  v_recent_match boolean;
BEGIN
  -- Repeat-opponent guard: skip pairing if these two played in last 30 minutes
  SELECT EXISTS (
    SELECT 1
    FROM battle_matches bm
    JOIN battle_participants pa ON pa.match_id = bm.id AND pa.user_id = p_user_a
    JOIN battle_participants pb ON pb.match_id = bm.id AND pb.user_id = p_user_b
    WHERE bm.ended_at IS NOT NULL
      AND bm.ended_at > now() - interval '30 minutes'
  ) INTO v_recent_match;

  IF v_recent_match THEN
    RETURN NULL; -- caller (tick) leaves both in queue
  END IF;

  SELECT id INTO v_season_id FROM seasons WHERE status = 'active' LIMIT 1;

  IF p_config_id IS NOT NULL THEN
    SELECT duration_minutes, problem_count
      INTO v_duration, v_problem_count
      FROM battle_configs WHERE id = p_config_id;
  END IF;

  INSERT INTO battle_matches (
    created_by, mode, status, state, duration_minutes,
    problem_count, config_id, season_id, phase_started_at
  ) VALUES (
    p_user_a, p_mode, 'pending', 'match_found',
    COALESCE(v_duration, 30), COALESCE(v_problem_count, 3),
    p_config_id, v_season_id, now()
  ) RETURNING id INTO v_match_id;

  INSERT INTO battle_participants (match_id, user_id)
    VALUES (v_match_id, p_user_a), (v_match_id, p_user_b);

  UPDATE battle_queue
     SET status = 'matched', matched_at = now()
   WHERE user_id IN (p_user_a, p_user_b)
     AND status = 'searching';

  RETURN v_match_id;
END;
$function$;

-- =====================================================================
-- Tick body: widen windows + try pairings
-- =====================================================================
CREATE OR REPLACE FUNCTION public.mm_tick()
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_paired int := 0;
  v_a record;
  v_b record;
  v_match uuid;
BEGIN
  -- Step 1: widen search windows for entries older than 10 seconds since last expansion
  UPDATE battle_queue
     SET search_window_elo = mm_widen_window(mmr, search_window_elo),
         last_search_expansion_at = now()
   WHERE status = 'searching'
     AND last_search_expansion_at < now() - interval '10 seconds';

  -- Step 2: pair players. After 60s in queue, allow loose (window × 2).
  FOR v_a IN
    SELECT id, user_id, mmr, mode, config_id, search_window_elo, enqueued_at
      FROM battle_queue
     WHERE status = 'searching'
       AND target_user_id IS NULL
     ORDER BY enqueued_at ASC
  LOOP
    -- Skip if this row was just paired in a prior loop iteration
    IF NOT EXISTS (SELECT 1 FROM battle_queue WHERE id = v_a.id AND status = 'searching') THEN
      CONTINUE;
    END IF;

    SELECT bq.id, bq.user_id, bq.mmr, bq.search_window_elo
      INTO v_b
      FROM battle_queue bq
     WHERE bq.status = 'searching'
       AND bq.user_id <> v_a.user_id
       AND bq.mode = v_a.mode
       AND bq.target_user_id IS NULL
       AND ABS(bq.mmr - v_a.mmr) <= GREATEST(
             v_a.search_window_elo,
             bq.search_window_elo,
             CASE WHEN v_a.enqueued_at < now() - interval '60 seconds'
                  THEN v_a.search_window_elo * 2 ELSE 0 END
           )
     ORDER BY ABS(bq.mmr - v_a.mmr) ASC
     LIMIT 1;

    IF v_b.id IS NULL THEN CONTINUE; END IF;

    v_match := mm_create_match(v_a.user_id, v_b.user_id, v_a.mode, v_a.config_id);
    IF v_match IS NOT NULL THEN
      v_paired := v_paired + 1;
    END IF;
  END LOOP;

  -- Step 3: expire stale queue entries (>5 min)
  UPDATE battle_queue
     SET status = 'expired'
   WHERE status = 'searching' AND expires_at < now();

  RETURN v_paired;
END;
$$;

-- =====================================================================
-- Patch mm_enqueue: respect lockouts, set initial window + enqueued_at
-- =====================================================================
CREATE OR REPLACE FUNCTION public.mm_enqueue(
  p_mode text, p_config_key text DEFAULT NULL, p_target_user uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_mmr int := 1000;
  v_season_id uuid;
  v_config_id uuid;
  v_queue_id uuid;
  v_locked_until timestamptz;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;

  -- Honor active lockouts (dodge / tilt cooldowns)
  SELECT MAX(locked_until) INTO v_locked_until
    FROM queue_lockouts
   WHERE user_id = v_uid AND locked_until > now();

  IF v_locked_until IS NOT NULL THEN
    RAISE EXCEPTION 'queue_lockout_active:%', extract(epoch from v_locked_until)::bigint;
  END IF;

  SELECT id INTO v_season_id FROM seasons WHERE status='active' LIMIT 1;
  SELECT COALESCE(mmr,1000) INTO v_mmr FROM rank_states
    WHERE user_id = v_uid AND season_id = v_season_id;

  IF p_config_key IS NOT NULL THEN
    SELECT id INTO v_config_id FROM battle_configs
     WHERE key = p_config_key AND is_active LIMIT 1;
  END IF;

  -- Clean up any stale entries first
  UPDATE battle_queue SET status = 'cancelled'
   WHERE user_id = v_uid AND status = 'searching';

  INSERT INTO battle_queue (
    user_id, mode, elo, mmr, config_id, target_user_id,
    status, search_window_elo, enqueued_at, last_search_expansion_at
  ) VALUES (
    v_uid, p_mode, v_mmr, v_mmr, v_config_id, p_target_user,
    'searching', mm_initial_window(v_mmr), now(), now()
  ) RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$;

-- =====================================================================
-- Dodge penalty RPC
-- =====================================================================
CREATE OR REPLACE FUNCTION public.re_apply_dodge_penalty(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count int;
  v_lp_penalty int;
  v_lock_minutes int;
  v_locked_until timestamptz;
  v_season_id uuid;
BEGIN
  SELECT id INTO v_season_id FROM seasons WHERE status='active' LIMIT 1;

  -- Count dodges in the last 24h
  SELECT COUNT(*) INTO v_count
    FROM queue_lockouts
   WHERE user_id = p_user_id
     AND reason = 'dodge'
     AND created_at > now() - interval '24 hours';

  -- Escalation
  IF v_count = 0 THEN
    v_lp_penalty := 3;  v_lock_minutes := 5;
  ELSIF v_count = 1 THEN
    v_lp_penalty := 10; v_lock_minutes := 15;
  ELSE
    v_lp_penalty := 15; v_lock_minutes := 30;
  END IF;

  v_locked_until := now() + (v_lock_minutes || ' minutes')::interval;

  INSERT INTO queue_lockouts (user_id, reason, locked_until, meta)
  VALUES (p_user_id, 'dodge', v_locked_until,
          jsonb_build_object('lp_penalty', v_lp_penalty, 'count_24h', v_count + 1));

  -- Apply LP penalty + counter
  IF v_season_id IS NOT NULL THEN
    UPDATE rank_states
       SET lp = GREATEST(0, lp - v_lp_penalty),
           dodge_count_24h = dodge_count_24h + 1,
           dodge_window_started_at = COALESCE(dodge_window_started_at, now())
     WHERE user_id = p_user_id AND season_id = v_season_id;
  END IF;

  RETURN jsonb_build_object(
    'lp_penalty', v_lp_penalty,
    'lock_minutes', v_lock_minutes,
    'locked_until', v_locked_until,
    'count_24h', v_count + 1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.re_apply_dodge_penalty(uuid) TO authenticated, service_role;

-- =====================================================================
-- Active lockout helper (for FE countdown)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_active_queue_lockout()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row record;
BEGIN
  IF v_uid IS NULL THEN RETURN NULL; END IF;
  SELECT reason, locked_until, meta INTO v_row
    FROM queue_lockouts
   WHERE user_id = v_uid AND locked_until > now()
   ORDER BY locked_until DESC LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'reason', v_row.reason,
    'locked_until', v_row.locked_until,
    'meta', v_row.meta
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_queue_lockout() TO authenticated;

-- =====================================================================
-- Patch get_online_warriors with Master+ ghosting
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_online_warriors(p_limit integer DEFAULT 12)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_caller_mmr int := 0;
  v_season_id uuid;
  v_rows jsonb;
BEGIN
  SELECT id INTO v_season_id FROM seasons WHERE status='active' LIMIT 1;
  IF v_uid IS NOT NULL THEN
    SELECT COALESCE(mmr,0) INTO v_caller_mmr FROM rank_states
      WHERE user_id = v_uid AND season_id = v_season_id;
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_rows FROM (
    SELECT DISTINCT ON (user_id)
      user_id,
      CASE
        WHEN v_caller_mmr >= 2400 AND elo >= 2400
          THEN 'Challenger #' || LPAD((abs(hashtext(user_id::text)) % 9999)::text, 4, '0')
        ELSE handle
      END AS handle,
      elo,
      rank_label,
      status
    FROM (
      SELECT
        bq.user_id,
        COALESCE(p.username, p.email, 'warrior') AS handle,
        bq.elo,
        CASE
          WHEN bq.elo >= 2400 THEN 'Challenger'
          WHEN bq.elo >= 1800 THEN 'Master'
          WHEN bq.elo >= 1600 THEN 'Diamond'
          WHEN bq.elo >= 1400 THEN 'Platinum'
          WHEN bq.elo >= 1200 THEN 'Gold'
          WHEN bq.elo >= 1000 THEN 'Silver'
          ELSE 'Bronze'
        END AS rank_label,
        'queueing' AS status,
        bq.created_at AS sort_at
      FROM battle_queue bq
      LEFT JOIN profiles p ON p.id = bq.user_id
      WHERE bq.status = 'searching'
        AND (v_uid IS NULL OR bq.user_id <> v_uid)
      UNION ALL
      SELECT
        bp.user_id,
        COALESCE(p.username, p.email, 'warrior') AS handle,
        bp.elo_before AS elo,
        CASE
          WHEN bp.elo_before >= 2400 THEN 'Challenger'
          WHEN bp.elo_before >= 1800 THEN 'Master'
          WHEN bp.elo_before >= 1600 THEN 'Diamond'
          WHEN bp.elo_before >= 1400 THEN 'Platinum'
          WHEN bp.elo_before >= 1200 THEN 'Gold'
          WHEN bp.elo_before >= 1000 THEN 'Silver'
          ELSE 'Bronze'
        END AS rank_label,
        'in_match' AS status,
        bp.created_at AS sort_at
      FROM battle_participants bp
      JOIN battle_matches bm ON bm.id = bp.match_id
      LEFT JOIN profiles p ON p.id = bp.user_id
      WHERE bm.state IN ('match_found','ready_check','ban_pick','active','judging')
        AND (v_uid IS NULL OR bp.user_id <> v_uid)
    ) src
    ORDER BY user_id, sort_at DESC
    LIMIT p_limit
  ) t;

  RETURN v_rows;
END;
$$;
