-- Drop the problematic unique constraint that causes duplicate key errors
ALTER TABLE public.battle_queue DROP CONSTRAINT IF EXISTS battle_queue_user_id_status_key;

-- Create a partial unique constraint that only prevents duplicate "searching" entries per user
-- This ensures a user can only have one active search at a time
CREATE UNIQUE INDEX IF NOT EXISTS battle_queue_user_searching_unique 
ON public.battle_queue (user_id) 
WHERE status = 'searching';

-- Replace the cancel_battle_queue function to delete instead of update status
-- This is more idempotent and avoids constraint issues
CREATE OR REPLACE FUNCTION public.cancel_battle_queue()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_deleted_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Delete any searching entries for this user (idempotent - always succeeds)
  DELETE FROM battle_queue
  WHERE user_id = v_user_id AND status = 'searching';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Always return success (idempotent behavior)
  RETURN json_build_object('success', true, 'deleted_count', v_deleted_count);
END;
$function$;