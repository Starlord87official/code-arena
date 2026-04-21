
-- 1. Patch mm_enqueue: kick the matcher right after a player joins the queue.
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

  IF v_mmr IS NULL THEN v_mmr := 1000; END IF;

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

  -- Kick the matcher so we pair immediately if a partner is waiting.
  BEGIN
    PERFORM public.mm_tick();
  EXCEPTION WHEN OTHERS THEN
    -- Never let a tick failure roll back enqueue.
    NULL;
  END;

  RETURN v_queue_id;
END;
$function$;

-- 2. Patch check_battle_queue_status: client polling doubles as matcher heartbeat.
-- Must be VOLATILE because mm_tick mutates the queue.
CREATE OR REPLACE FUNCTION public.check_battle_queue_status()
 RETURNS jsonb
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v jsonb;
BEGIN
  -- Run a tick before reading status so an opponent who arrived since
  -- the last poll gets paired with us right now.
  BEGIN
    PERFORM public.mm_tick();
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  v := mm_status();
  IF (v->>'match_id') IS NOT NULL THEN
    v := v || jsonb_build_object(
      'session_id', v->>'match_id',
      'battle_id', v->>'match_id'
    );
  END IF;
  RETURN v;
END;
$function$;

-- 3. Patch get_online_warriors: drop dead p.email reference.
CREATE OR REPLACE FUNCTION public.get_online_warriors(p_limit integer DEFAULT 12)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
        COALESCE(p.username, 'warrior') AS handle,
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
        COALESCE(p.username, 'warrior') AS handle,
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
$function$;

-- 4. Patch get_recent_battles: drop dead p.email reference.
CREATE OR REPLACE FUNCTION public.get_recent_battles(p_user_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 5)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := COALESCE(p_user_id, auth.uid());
  v_rows jsonb;
BEGIN
  IF v_uid IS NULL THEN RETURN '[]'::jsonb; END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_rows FROM (
    SELECT
      bm.id AS match_id,
      bm.mode,
      bm.ended_at,
      COALESCE(p.username, 'Opponent') AS opponent_handle,
      CASE
        WHEN bm.is_draw IS TRUE THEN 'draw'
        WHEN bm.winner_id = v_uid THEN 'win'
        WHEN bm.winner_id IS NULL THEN 'draw'
        ELSE 'loss'
      END AS result,
      self.score AS score_self,
      opp.score AS score_opp,
      self.elo_change AS elo_change
    FROM battle_participants self
    JOIN battle_matches bm ON bm.id = self.match_id
    LEFT JOIN battle_participants opp ON opp.match_id = bm.id AND opp.user_id <> v_uid
    LEFT JOIN profiles p ON p.id = opp.user_id
    WHERE self.user_id = v_uid AND bm.state = 'completed'
    ORDER BY bm.ended_at DESC NULLS LAST
    LIMIT p_limit
  ) t;

  RETURN v_rows;
END;
$function$;

-- 5. Optional pg_cron backstop: schedule mm_tick every 5 seconds if pg_cron is installed.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Drop any pre-existing job with the same name to make this idempotent.
    PERFORM cron.unschedule(jobid)
      FROM cron.job WHERE jobname = 'mm_tick_5s';
    PERFORM cron.schedule(
      'mm_tick_5s',
      '5 seconds',
      $cron$ SELECT public.mm_tick(); $cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- pg_cron may exist but lack the helper signatures we expect; ignore.
  NULL;
END $$;

-- 6. One-shot drain: pair anyone currently stuck in the queue.
SELECT public.mm_tick();
