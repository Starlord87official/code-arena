CREATE OR REPLACE FUNCTION public.get_battle_opponent_profile(p_session_id uuid)
RETURNS TABLE(id uuid, username text, avatar_url text, division text, xp integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_session record;
  v_opponent_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT player_a_id, player_b_id
  INTO v_session
  FROM public.battle_sessions
  WHERE battle_sessions.id = p_session_id;

  IF v_session IS NULL THEN
    RETURN;
  END IF;

  IF v_session.player_a_id = v_user_id THEN
    v_opponent_id := v_session.player_b_id;
  ELSIF v_session.player_b_id = v_user_id THEN
    v_opponent_id := v_session.player_a_id;
  ELSE
    -- Caller is not a participant; return nothing.
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.division,
    COALESCE(p.xp, 0) AS xp
  FROM public.profiles p
  WHERE p.id = v_opponent_id;
END;
$function$;