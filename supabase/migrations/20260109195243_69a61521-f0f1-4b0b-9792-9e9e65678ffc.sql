
-- Fix the complete_revision function (can't use ORDER BY LIMIT in UPDATE)
CREATE OR REPLACE FUNCTION public.complete_revision(p_topic_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  revision_to_complete UUID;
  affected_count INTEGER := 0;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find the earliest pending revision due today or earlier
  SELECT id INTO revision_to_complete
  FROM public.topic_revisions
  WHERE user_id = current_user_id
    AND topic_id = p_topic_id
    AND state = 'pending'
    AND scheduled_date <= CURRENT_DATE
  ORDER BY scheduled_date ASC
  LIMIT 1;
  
  IF revision_to_complete IS NOT NULL THEN
    UPDATE public.topic_revisions
    SET 
      state = 'done',
      completed_at = now()
    WHERE id = revision_to_complete;
    
    affected_count := 1;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'revisions_completed', affected_count
  );
END;
$$;
