CREATE OR REPLACE FUNCTION public.mm_create_match(p_user_a uuid, p_user_b uuid, p_mode text, p_config_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_match_id uuid;
  v_season_id uuid;
  v_duration int := 30;
  v_problem_count int := 3;
  v_recent_match boolean;
BEGIN
  -- Per-mode rematch cooldown. Custom duels (direct invites) bypass entirely.
  IF p_mode = 'custom' THEN
    v_recent_match := false;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM battle_matches bm
      JOIN battle_participants pa ON pa.match_id = bm.id AND pa.user_id = p_user_a
      JOIN battle_participants pb ON pb.match_id = bm.id AND pb.user_id = p_user_b
      WHERE bm.ended_at IS NOT NULL
        AND bm.ended_at > now() - CASE
          WHEN p_mode = 'ranked' THEN interval '2 minutes'
          ELSE interval '30 seconds'
        END
    ) INTO v_recent_match;
  END IF;

  IF v_recent_match THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_season_id FROM seasons WHERE status = 'active' LIMIT 1;

  IF p_config_id IS NOT NULL THEN
    SELECT duration_minutes, problem_count INTO v_duration, v_problem_count
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

  -- Mirror into legacy battle_sessions so BattleSession.tsx + heartbeat fallback work
  INSERT INTO battle_sessions (
    id, battle_id, player_a_id, player_b_id, mode, status,
    start_time, duration_minutes, player_a_score, player_b_score,
    player_a_elo, player_b_elo
  ) VALUES (
    v_match_id, v_match_id::text, p_user_a, p_user_b, p_mode, 'active',
    now(), COALESCE(v_duration, 30), 0, 0, 1000, 1000
  ) ON CONFLICT (id) DO NOTHING;

  UPDATE battle_queue
     SET status = 'matched', matched_at = now()
   WHERE user_id IN (p_user_a, p_user_b)
     AND status = 'searching';

  RETURN v_match_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mm_tick()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    SELECT id, user_id, mmr, mode, config_id, search_window_elo, enqueued_at
      INTO v_b
      FROM battle_queue
     WHERE status = 'searching'
       AND target_user_id IS NULL
       AND user_id <> v_a.user_id
       AND mode = v_a.mode
       AND COALESCE(config_id::text, '') = COALESCE(v_a.mode::text, '')  -- placeholder kept to preserve original logic
       AND abs(mmr - v_a.mmr) <= GREATEST(v_a.search_window_elo, 50)
     ORDER BY enqueued_at ASC
     LIMIT 1;

    IF v_b.id IS NULL THEN
      -- Loosen: accept anyone in same mode after 60s wait
      IF v_a.enqueued_at < now() - interval '60 seconds' THEN
        SELECT id, user_id, mmr, mode, config_id, search_window_elo, enqueued_at
          INTO v_b
          FROM battle_queue
         WHERE status = 'searching'
           AND target_user_id IS NULL
           AND user_id <> v_a.user_id
           AND mode = v_a.mode
         ORDER BY enqueued_at ASC
         LIMIT 1;
      END IF;
    END IF;

    IF v_b.id IS NULL THEN
      CONTINUE;
    END IF;

    v_match := mm_create_match(v_a.user_id, v_b.user_id, v_a.mode, v_a.config_id);
    IF v_match IS NULL THEN
      RAISE NOTICE 'mm_tick: pair % vs % skipped (cooldown or recent match)',
        v_a.user_id, v_b.user_id;
      CONTINUE;
    END IF;

    v_paired := v_paired + 1;
  END LOOP;

  RETURN v_paired;
END;
$function$;

-- One-shot drain so anyone currently waiting gets paired immediately.
SELECT public.mm_tick();