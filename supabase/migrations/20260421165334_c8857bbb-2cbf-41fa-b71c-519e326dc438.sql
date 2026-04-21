
-- 1. Enable full row data on realtime updates
ALTER TABLE public.battle_matches REPLICA IDENTITY FULL;
ALTER TABLE public.battle_participants REPLICA IDENTITY FULL;
ALTER TABLE public.battle_match_submissions REPLICA IDENTITY FULL;
ALTER TABLE public.battle_event_log REPLICA IDENTITY FULL;

-- 2. Add to realtime publication (idempotent)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_matches;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_participants;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_match_submissions;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_event_log;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 3. Heartbeat RPC — caller updates own row
CREATE OR REPLACE FUNCTION public.heartbeat_match(p_match_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  UPDATE public.battle_participants
     SET reconnected_at = now(),
         disconnected_at = NULL
   WHERE match_id = p_match_id
     AND user_id  = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.heartbeat_match(uuid) TO authenticated;

-- 4. Mark a participant disconnected (internal)
CREATE OR REPLACE FUNCTION public.mark_participant_disconnected(p_match_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.battle_participants
     SET disconnected_at = now()
   WHERE match_id = p_match_id
     AND user_id  = p_user_id
     AND disconnected_at IS NULL;

  INSERT INTO public.battle_event_log (match_id, user_id, event_type, payload)
  VALUES (p_match_id, p_user_id, 'participant_disconnected',
          jsonb_build_object('at', now()));
END;
$$;

-- 5. Reconnect sweep — auto-forfeit stale players
CREATE OR REPLACE FUNCTION public.reconnect_sweep()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_forfeits int := 0;
  r RECORD;
BEGIN
  -- a) Detect stale heartbeats: anyone in active match without a beat in 30s
  --    gets marked disconnected (idempotent).
  FOR r IN
    SELECT bp.match_id, bp.user_id
      FROM public.battle_participants bp
      JOIN public.battle_matches bm ON bm.id = bp.match_id
     WHERE bm.state IN ('active','ready_check','ban_pick')
       AND bp.is_forfeit = false
       AND bp.disconnected_at IS NULL
       AND COALESCE(bp.reconnected_at, bp.created_at) < now() - interval '30 seconds'
  LOOP
    PERFORM public.mark_participant_disconnected(r.match_id, r.user_id);
  END LOOP;

  -- b) Forfeit anyone whose disconnect grace expired (>60s)
  FOR r IN
    SELECT DISTINCT bp.match_id, bp.user_id
      FROM public.battle_participants bp
      JOIN public.battle_matches bm ON bm.id = bp.match_id
     WHERE bm.state IN ('active','ready_check','ban_pick')
       AND bp.is_forfeit = false
       AND bp.disconnected_at IS NOT NULL
       AND bp.disconnected_at < now() - interval '60 seconds'
       AND (bp.reconnected_at IS NULL OR bp.reconnected_at < bp.disconnected_at)
  LOOP
    UPDATE public.battle_participants
       SET is_forfeit = true
     WHERE match_id = r.match_id AND user_id = r.user_id;

    BEGIN
      PERFORM public.finalize_match(r.match_id, 'reconnect_timeout');
      v_forfeits := v_forfeits + 1;
    EXCEPTION WHEN OTHERS THEN
      -- Don't break the sweep on a single bad match
      RAISE WARNING 'finalize_match failed for %: %', r.match_id, SQLERRM;
    END;
  END LOOP;

  RETURN v_forfeits;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reconnect_sweep() TO service_role;
