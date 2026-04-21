
DROP FUNCTION IF EXISTS public.ready_check_respond(uuid, boolean);
DROP FUNCTION IF EXISTS public.ban_topic(uuid, text);
DROP FUNCTION IF EXISTS public.pick_topic(uuid, text);
DROP FUNCTION IF EXISTS public.get_match_state(uuid);
DROP FUNCTION IF EXISTS public._battle_topic_action(uuid, text, text);
DROP FUNCTION IF EXISTS public.battle_transition(uuid, match_state, uuid, jsonb);

CREATE OR REPLACE FUNCTION public.battle_transition(
  p_match_id uuid,
  p_to_state match_state,
  p_actor uuid DEFAULT NULL,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS match_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current match_state;
  v_allowed boolean := false;
BEGIN
  SELECT state INTO v_current FROM battle_matches WHERE id = p_match_id FOR UPDATE;
  IF v_current IS NULL THEN
    RAISE EXCEPTION 'match_not_found';
  END IF;

  v_allowed := CASE
    WHEN v_current = 'idle'         AND p_to_state IN ('queued','cancelled') THEN true
    WHEN v_current = 'queued'       AND p_to_state IN ('match_found','cancelled') THEN true
    WHEN v_current = 'match_found'  AND p_to_state IN ('ready_check','cancelled','abandoned') THEN true
    WHEN v_current = 'ready_check'  AND p_to_state IN ('ban_pick','active','abandoned','cancelled') THEN true
    WHEN v_current = 'ban_pick'     AND p_to_state IN ('active','abandoned') THEN true
    WHEN v_current = 'active'       AND p_to_state IN ('judging','abandoned','invalidated') THEN true
    WHEN v_current = 'judging'      AND p_to_state IN ('completed','invalidated') THEN true
    WHEN v_current = 'completed'    AND p_to_state IN ('invalidated') THEN true
    ELSE false
  END;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'invalid_transition: % -> %', v_current, p_to_state;
  END IF;

  UPDATE battle_matches
  SET state = p_to_state,
      phase_started_at = now(),
      started_at = COALESCE(started_at, CASE WHEN p_to_state = 'active' THEN now() END),
      ended_at   = CASE WHEN p_to_state IN ('completed','cancelled','abandoned','invalidated')
                        THEN now() ELSE ended_at END
  WHERE id = p_match_id;

  INSERT INTO battle_event_log (match_id, user_id, event_type, payload)
  VALUES (
    p_match_id,
    COALESCE(p_actor, auth.uid()),
    'state_transition',
    jsonb_build_object('from', v_current, 'to', p_to_state) || COALESCE(p_payload,'{}'::jsonb)
  );

  RETURN p_to_state;
END;
$$;

REVOKE ALL ON FUNCTION public.battle_transition(uuid, match_state, uuid, jsonb) FROM public;

CREATE OR REPLACE FUNCTION public.ready_check_respond(
  p_match_id uuid,
  p_ready boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_state match_state;
  v_ready_count int;
  v_total int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  SELECT state INTO v_state FROM battle_matches WHERE id = p_match_id;
  IF v_state IS NULL THEN RAISE EXCEPTION 'match_not_found'; END IF;
  IF v_state NOT IN ('match_found','ready_check') THEN
    RAISE EXCEPTION 'not_in_ready_phase';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM battle_participants WHERE match_id = p_match_id AND user_id = v_uid) THEN
    RAISE EXCEPTION 'not_a_participant';
  END IF;

  IF v_state = 'match_found' THEN
    PERFORM battle_transition(p_match_id, 'ready_check'::match_state, v_uid);
  END IF;

  INSERT INTO battle_event_log (match_id, user_id, event_type, payload)
  VALUES (p_match_id, v_uid,
          CASE WHEN p_ready THEN 'ready_check_accepted' ELSE 'ready_check_declined' END,
          jsonb_build_object('ready', p_ready));

  IF NOT p_ready THEN
    PERFORM battle_transition(p_match_id, 'cancelled'::match_state, v_uid,
                              jsonb_build_object('reason','ready_check_declined'));
    RETURN jsonb_build_object('success', true, 'state', 'cancelled');
  END IF;

  SELECT COUNT(DISTINCT user_id) INTO v_ready_count
  FROM battle_event_log
  WHERE match_id = p_match_id AND event_type = 'ready_check_accepted';

  SELECT COUNT(*) INTO v_total FROM battle_participants WHERE match_id = p_match_id;

  IF v_ready_count >= v_total AND v_total > 0 THEN
    IF EXISTS (
      SELECT 1 FROM battle_matches m
      JOIN battle_configs c ON c.id = m.config_id
      WHERE m.id = p_match_id AND (c.ban_count > 0 OR c.pick_count > 0)
    ) THEN
      PERFORM battle_transition(p_match_id, 'ban_pick'::match_state, v_uid);
      RETURN jsonb_build_object('success', true, 'state', 'ban_pick');
    ELSE
      PERFORM battle_transition(p_match_id, 'active'::match_state, v_uid);
      RETURN jsonb_build_object('success', true, 'state', 'active');
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'state', 'ready_check', 'ready', v_ready_count, 'total', v_total);
END;
$$;

GRANT EXECUTE ON FUNCTION public.ready_check_respond(uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public._battle_topic_action(
  p_match_id uuid,
  p_topic text,
  p_action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_state match_state;
  v_cfg battle_configs%ROWTYPE;
  v_match battle_matches%ROWTYPE;
  v_user_bans int;
  v_user_picks int;
  v_total_bans int;
  v_total_picks int;
  v_total_participants int;
  v_next int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF p_action NOT IN ('ban','pick') THEN RAISE EXCEPTION 'invalid_action'; END IF;

  SELECT * INTO v_match FROM battle_matches WHERE id = p_match_id FOR UPDATE;
  IF v_match.id IS NULL THEN RAISE EXCEPTION 'match_not_found'; END IF;
  v_state := v_match.state;
  IF v_state <> 'ban_pick' THEN RAISE EXCEPTION 'not_in_ban_pick'; END IF;

  IF NOT EXISTS (SELECT 1 FROM battle_participants WHERE match_id = p_match_id AND user_id = v_uid) THEN
    RAISE EXCEPTION 'not_a_participant';
  END IF;

  SELECT * INTO v_cfg FROM battle_configs WHERE id = v_match.config_id;
  IF v_cfg.id IS NULL THEN RAISE EXCEPTION 'config_missing'; END IF;

  IF NOT EXISTS (SELECT 1 FROM match_topic_pool WHERE match_id = p_match_id AND topic = p_topic) THEN
    RAISE EXCEPTION 'topic_not_in_pool';
  END IF;

  IF EXISTS (SELECT 1 FROM match_topic_actions WHERE match_id = p_match_id AND topic = p_topic) THEN
    RAISE EXCEPTION 'topic_already_actioned';
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE action='ban'),
    COUNT(*) FILTER (WHERE action='pick')
  INTO v_user_bans, v_user_picks
  FROM match_topic_actions
  WHERE match_id = p_match_id AND user_id = v_uid;

  IF p_action = 'ban' AND v_user_bans >= v_cfg.ban_count THEN
    RAISE EXCEPTION 'ban_limit_reached';
  END IF;
  IF p_action = 'pick' AND v_user_picks >= v_cfg.pick_count THEN
    RAISE EXCEPTION 'pick_limit_reached';
  END IF;

  SELECT COALESCE(MAX(order_index),0)+1 INTO v_next FROM match_topic_actions WHERE match_id = p_match_id;

  INSERT INTO match_topic_actions (match_id, user_id, action, topic, order_index)
  VALUES (p_match_id, v_uid, p_action, p_topic, v_next);

  INSERT INTO battle_event_log (match_id, user_id, event_type, payload)
  VALUES (p_match_id, v_uid,
          CASE WHEN p_action='ban' THEN 'ban_picked' ELSE 'pick_locked' END,
          jsonb_build_object('topic', p_topic, 'order', v_next));

  SELECT COUNT(*) INTO v_total_participants FROM battle_participants WHERE match_id = p_match_id;
  SELECT
    COUNT(*) FILTER (WHERE action='ban'),
    COUNT(*) FILTER (WHERE action='pick')
  INTO v_total_bans, v_total_picks
  FROM match_topic_actions WHERE match_id = p_match_id;

  IF v_total_bans >= v_cfg.ban_count * v_total_participants
     AND v_total_picks >= v_cfg.pick_count * v_total_participants THEN
    PERFORM battle_transition(p_match_id, 'active'::match_state, v_uid,
                              jsonb_build_object('reason','ban_pick_complete'));
    RETURN jsonb_build_object('success', true, 'state', 'active');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'state', 'ban_pick',
    'bans', v_total_bans,
    'picks', v_total_picks,
    'expected_bans', v_cfg.ban_count * v_total_participants,
    'expected_picks', v_cfg.pick_count * v_total_participants
  );
END;
$$;

REVOKE ALL ON FUNCTION public._battle_topic_action(uuid, text, text) FROM public;

CREATE OR REPLACE FUNCTION public.ban_topic(p_match_id uuid, p_topic text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT public._battle_topic_action(p_match_id, p_topic, 'ban'); $$;

CREATE OR REPLACE FUNCTION public.pick_topic(p_match_id uuid, p_topic text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT public._battle_topic_action(p_match_id, p_topic, 'pick'); $$;

GRANT EXECUTE ON FUNCTION public.ban_topic(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pick_topic(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_match_state(p_match_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_match jsonb;
  v_participants jsonb;
  v_problems jsonb;
  v_pool jsonb;
  v_actions jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  IF NOT EXISTS (SELECT 1 FROM battle_participants WHERE match_id = p_match_id AND user_id = v_uid) THEN
    RAISE EXCEPTION 'not_a_participant';
  END IF;

  SELECT to_jsonb(m) INTO v_match FROM battle_matches m WHERE id = p_match_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at), '[]'::jsonb) INTO v_participants
  FROM battle_participants p WHERE match_id = p_match_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', mp.id, 'order_index', mp.order_index, 'points', mp.points,
    'challenge_id', mp.challenge_id, 'title', c.title, 'difficulty', c.difficulty, 'tags', c.tags
  ) ORDER BY mp.order_index), '[]'::jsonb) INTO v_problems
  FROM battle_match_problems mp
  LEFT JOIN challenges c ON c.id = mp.challenge_id
  WHERE mp.match_id = p_match_id;

  SELECT COALESCE(jsonb_agg(topic), '[]'::jsonb) INTO v_pool
  FROM match_topic_pool WHERE match_id = p_match_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'user_id', user_id, 'action', action, 'topic', topic, 'order_index', order_index
  ) ORDER BY order_index), '[]'::jsonb) INTO v_actions
  FROM match_topic_actions WHERE match_id = p_match_id;

  RETURN jsonb_build_object(
    'success', true,
    'match', v_match,
    'participants', v_participants,
    'problems', v_problems,
    'topic_pool', v_pool,
    'topic_actions', v_actions
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_match_state(uuid) TO authenticated;
