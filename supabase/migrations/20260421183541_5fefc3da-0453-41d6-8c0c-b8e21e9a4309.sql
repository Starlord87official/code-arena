-- 1. Create validate_battle_session RPC bridging battle_matches + legacy battle_sessions
CREATE OR REPLACE FUNCTION public.validate_battle_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_match_state text;
  v_is_participant boolean;
  v_legacy_status text;
  v_legacy_is_player boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'auth_required');
  END IF;

  -- Path A: new pipeline (battle_matches + battle_participants)
  SELECT bm.state::text INTO v_match_state
    FROM battle_matches bm WHERE bm.id = p_session_id;

  IF v_match_state IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM battle_participants
       WHERE match_id = p_session_id AND user_id = v_uid
    ) INTO v_is_participant;

    IF NOT v_is_participant THEN
      RETURN jsonb_build_object('valid', false, 'reason', 'not_participant');
    END IF;

    IF v_match_state IN ('match_found','ready_check','ban_pick','active','judging') THEN
      RETURN jsonb_build_object('valid', true);
    END IF;

    RETURN jsonb_build_object('valid', false, 'reason', 'expired');
  END IF;

  -- Path B: legacy battle_sessions
  SELECT status,
         (player_a_id = v_uid OR player_b_id = v_uid)
    INTO v_legacy_status, v_legacy_is_player
    FROM battle_sessions WHERE id = p_session_id;

  IF v_legacy_status IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'no_match');
  END IF;
  IF NOT v_legacy_is_player THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_participant');
  END IF;
  IF v_legacy_status = 'active' THEN
    RETURN jsonb_build_object('valid', true);
  END IF;

  RETURN jsonb_build_object('valid', false, 'reason', 'expired');
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_battle_session(uuid) TO authenticated, anon;

-- 2. Patch mm_create_match to mirror match into battle_sessions
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
  SELECT EXISTS (
    SELECT 1 FROM battle_matches bm
    JOIN battle_participants pa ON pa.match_id = bm.id AND pa.user_id = p_user_a
    JOIN battle_participants pb ON pb.match_id = bm.id AND pb.user_id = p_user_b
    WHERE bm.ended_at IS NOT NULL
      AND bm.ended_at > now() - interval '30 minutes'
  ) INTO v_recent_match;

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

-- 3. Backfill the orphan match
INSERT INTO public.battle_sessions (
  id, battle_id, player_a_id, player_b_id, mode, status,
  start_time, duration_minutes, player_a_score, player_b_score,
  player_a_elo, player_b_elo
)
SELECT
  bm.id,
  bm.id::text,
  (SELECT user_id FROM battle_participants WHERE match_id = bm.id ORDER BY created_at ASC LIMIT 1),
  (SELECT user_id FROM battle_participants WHERE match_id = bm.id ORDER BY created_at DESC LIMIT 1),
  bm.mode,
  'active',
  COALESCE(bm.started_at, bm.created_at),
  bm.duration_minutes,
  0, 0, 1000, 1000
FROM battle_matches bm
WHERE bm.id = '858e60ed-7cba-4964-8136-8e8738ce25b9'
  AND NOT EXISTS (SELECT 1 FROM battle_sessions WHERE id = bm.id);

-- 4. Defensive cleanup
UPDATE battle_queue
   SET status = 'cancelled'
 WHERE status = 'searching'
   AND created_at < now() - interval '10 minutes';