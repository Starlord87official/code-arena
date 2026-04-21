CREATE OR REPLACE FUNCTION public.mm_enqueue(p_mode text, p_config_key text DEFAULT NULL::text, p_target_user uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_mmr int := 1000;
  v_season_id uuid;
  v_config_id uuid;
  v_queue_id uuid;
  v_locked_until timestamptz;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;

  SELECT MAX(locked_until) INTO v_locked_until
    FROM queue_lockouts
   WHERE user_id = v_uid AND locked_until > now();

  IF v_locked_until IS NOT NULL THEN
    RAISE EXCEPTION 'queue_lockout_active:%', extract(epoch from v_locked_until)::bigint;
  END IF;

  SELECT id INTO v_season_id FROM seasons WHERE status='active' LIMIT 1;

  SELECT COALESCE(rs.mmr, 1000) INTO v_mmr
    FROM rank_states rs
   WHERE rs.user_id = v_uid
     AND (v_season_id IS NULL OR rs.season_id = v_season_id)
   LIMIT 1;

  IF v_mmr IS NULL THEN
    v_mmr := 1000;
  END IF;

  IF p_config_key IS NOT NULL THEN
    SELECT id INTO v_config_id FROM battle_configs
     WHERE key = p_config_key AND is_active LIMIT 1;
  END IF;

  UPDATE battle_queue SET status = 'cancelled'
   WHERE user_id = v_uid AND status = 'searching';

  INSERT INTO battle_queue (
    user_id, mode, elo, mmr, config_id, target_user_id,
    status, search_window_elo, enqueued_at, last_search_expansion_at
  ) VALUES (
    v_uid, p_mode, COALESCE(v_mmr, 1000), COALESCE(v_mmr, 1000), v_config_id, p_target_user,
    'searching', mm_initial_window(COALESCE(v_mmr, 1000)), now(), now()
  ) RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$function$;

UPDATE battle_queue
   SET status = 'cancelled'
 WHERE status = 'searching'
   AND created_at < now() - interval '10 minutes';