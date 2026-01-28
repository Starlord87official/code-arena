-- Update get_activity_summary to derive ALL activity from challenge_completions (source of truth)
-- Not from the separate user_activity table which can have fake/orphaned data

CREATE OR REPLACE FUNCTION public.get_activity_summary()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_targets RECORD;
  v_today INTEGER;
  v_week INTEGER;
  v_month INTEGER;
  v_streak INTEGER;
  v_activity JSONB;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Get user targets
  SELECT * INTO v_targets FROM public.user_targets WHERE user_id = v_user_id;
  
  -- Get today's completions (from challenge_completions - the source of truth)
  SELECT COUNT(*) INTO v_today
  FROM public.challenge_completions
  WHERE user_id = v_user_id 
    AND DATE(completed_at) = CURRENT_DATE;
  
  -- Get this week's completions (Monday to Sunday)
  SELECT COUNT(*) INTO v_week
  FROM public.challenge_completions
  WHERE user_id = v_user_id 
    AND DATE(completed_at) >= date_trunc('week', CURRENT_DATE)
    AND DATE(completed_at) <= CURRENT_DATE;
  
  -- Get this month's completions
  SELECT COUNT(*) INTO v_month
  FROM public.challenge_completions
  WHERE user_id = v_user_id 
    AND DATE(completed_at) >= date_trunc('month', CURRENT_DATE)
    AND DATE(completed_at) <= CURRENT_DATE;
  
  -- Calculate streak based on consecutive days with at least one completion
  -- Only count days where user actually completed something
  WITH daily_activity AS (
    SELECT DISTINCT DATE(completed_at) as activity_date
    FROM public.challenge_completions
    WHERE user_id = v_user_id
    ORDER BY activity_date DESC
  ),
  streak_calc AS (
    SELECT 
      activity_date,
      activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date DESC))::integer as streak_group
    FROM daily_activity
    WHERE activity_date >= CURRENT_DATE - INTERVAL '365 days'
  ),
  current_streak AS (
    SELECT COUNT(*) as streak_length
    FROM streak_calc
    WHERE streak_group = (
      SELECT streak_group 
      FROM streak_calc 
      WHERE activity_date = CURRENT_DATE OR activity_date = CURRENT_DATE - 1
      LIMIT 1
    )
  )
  SELECT COALESCE(streak_length, 0) INTO v_streak FROM current_streak;
  
  -- If no activity today or yesterday, streak is 0
  IF NOT EXISTS (
    SELECT 1 FROM public.challenge_completions 
    WHERE user_id = v_user_id 
      AND DATE(completed_at) IN (CURRENT_DATE, CURRENT_DATE - 1)
  ) THEN
    v_streak := 0;
  END IF;
  
  -- Get last 365 days of activity for heatmap (aggregated by date from challenge_completions)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', activity_date,
      'count', problem_count
    ) ORDER BY activity_date
  ), '[]'::jsonb) INTO v_activity
  FROM (
    SELECT 
      DATE(completed_at) as activity_date,
      COUNT(*) as problem_count
    FROM public.challenge_completions
    WHERE user_id = v_user_id
      AND completed_at >= CURRENT_DATE - INTERVAL '365 days'
    GROUP BY DATE(completed_at)
  ) daily_counts;
  
  RETURN json_build_object(
    'targets', CASE WHEN v_targets IS NULL THEN NULL ELSE json_build_object(
      'daily', v_targets.daily_target,
      'weekly', v_targets.weekly_target,
      'monthly', v_targets.monthly_target
    ) END,
    'progress', json_build_object(
      'today', v_today,
      'week', v_week,
      'month', v_month
    ),
    'streak', COALESCE(v_streak, 0),
    'activity', COALESCE(v_activity, '[]'::jsonb)
  );
END;
$function$;