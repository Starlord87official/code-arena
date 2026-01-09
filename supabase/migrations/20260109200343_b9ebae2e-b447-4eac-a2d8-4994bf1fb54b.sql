-- Create user_targets table for storing daily, weekly, monthly problem-solving targets
CREATE TABLE public.user_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  daily_target INTEGER DEFAULT 0,
  weekly_target INTEGER DEFAULT 0,
  monthly_target INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_activity table for tracking daily problem-solving activity
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  problems_solved INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS
ALTER TABLE public.user_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_targets
CREATE POLICY "Users can view their own targets"
ON public.user_targets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own targets"
ON public.user_targets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own targets"
ON public.user_targets FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for user_activity
CREATE POLICY "Users can view their own activity"
ON public.user_activity FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
ON public.user_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
ON public.user_activity FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_activity_date ON public.user_activity(user_id, activity_date);
CREATE INDEX idx_user_activity_range ON public.user_activity(user_id, activity_date DESC);

-- Function to get or create user targets
CREATE OR REPLACE FUNCTION public.get_or_create_user_targets()
RETURNS SETOF public.user_targets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_targets (user_id)
  VALUES (auth.uid())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN QUERY SELECT * FROM public.user_targets WHERE user_id = auth.uid();
END;
$$;

-- Function to update user targets
CREATE OR REPLACE FUNCTION public.update_user_targets(
  p_daily INTEGER DEFAULT NULL,
  p_weekly INTEGER DEFAULT NULL,
  p_monthly INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.user_targets;
BEGIN
  INSERT INTO public.user_targets (user_id, daily_target, weekly_target, monthly_target)
  VALUES (auth.uid(), COALESCE(p_daily, 0), COALESCE(p_weekly, 0), COALESCE(p_monthly, 0))
  ON CONFLICT (user_id) DO UPDATE SET
    daily_target = COALESCE(p_daily, user_targets.daily_target),
    weekly_target = COALESCE(p_weekly, user_targets.weekly_target),
    monthly_target = COALESCE(p_monthly, user_targets.monthly_target),
    updated_at = now()
  RETURNING * INTO v_result;
  
  RETURN json_build_object('success', true, 'data', row_to_json(v_result));
END;
$$;

-- Function to record problem-solving activity
CREATE OR REPLACE FUNCTION public.record_activity(p_problems_solved INTEGER DEFAULT 1)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.user_activity;
BEGIN
  INSERT INTO public.user_activity (user_id, activity_date, problems_solved)
  VALUES (auth.uid(), CURRENT_DATE, p_problems_solved)
  ON CONFLICT (user_id, activity_date) DO UPDATE SET
    problems_solved = user_activity.problems_solved + p_problems_solved,
    updated_at = now()
  RETURNING * INTO v_result;
  
  RETURN json_build_object('success', true, 'data', row_to_json(v_result));
END;
$$;

-- Function to get activity summary for streak and target tracking
CREATE OR REPLACE FUNCTION public.get_activity_summary()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_targets RECORD;
  v_today INTEGER;
  v_week INTEGER;
  v_month INTEGER;
  v_streak INTEGER;
  v_activity JSONB;
BEGIN
  -- Get user targets
  SELECT * INTO v_targets FROM public.user_targets WHERE user_id = auth.uid();
  
  -- Get today's activity
  SELECT COALESCE(SUM(problems_solved), 0) INTO v_today
  FROM public.user_activity
  WHERE user_id = auth.uid() AND activity_date = CURRENT_DATE;
  
  -- Get this week's activity (Monday to Sunday)
  SELECT COALESCE(SUM(problems_solved), 0) INTO v_week
  FROM public.user_activity
  WHERE user_id = auth.uid() 
    AND activity_date >= date_trunc('week', CURRENT_DATE)
    AND activity_date <= CURRENT_DATE;
  
  -- Get this month's activity
  SELECT COALESCE(SUM(problems_solved), 0) INTO v_month
  FROM public.user_activity
  WHERE user_id = auth.uid() 
    AND activity_date >= date_trunc('month', CURRENT_DATE)
    AND activity_date <= CURRENT_DATE;
  
  -- Calculate streak based on daily target
  WITH daily_met AS (
    SELECT 
      activity_date,
      problems_solved >= COALESCE(v_targets.daily_target, 1) AS met_target
    FROM public.user_activity
    WHERE user_id = auth.uid()
    ORDER BY activity_date DESC
  ),
  streak_calc AS (
    SELECT 
      activity_date,
      met_target,
      CASE 
        WHEN NOT met_target THEN 0
        WHEN activity_date = CURRENT_DATE THEN 1
        WHEN activity_date = CURRENT_DATE - 1 THEN 1
        ELSE 0
      END AS is_streak
    FROM daily_met
  )
  SELECT COUNT(*) INTO v_streak
  FROM (
    SELECT activity_date
    FROM public.user_activity ua
    WHERE ua.user_id = auth.uid()
      AND ua.problems_solved >= COALESCE(v_targets.daily_target, 1)
      AND ua.activity_date <= CURRENT_DATE
      AND ua.activity_date >= (
        SELECT COALESCE(
          (SELECT MAX(a2.activity_date) + 1
           FROM public.user_activity a2
           WHERE a2.user_id = auth.uid()
             AND a2.activity_date < CURRENT_DATE
             AND a2.problems_solved < COALESCE(v_targets.daily_target, 1)),
          (SELECT MIN(a3.activity_date) FROM public.user_activity a3 WHERE a3.user_id = auth.uid())
        )
      )
  ) streak_days;
  
  -- Get last 365 days of activity for heatmap
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', activity_date,
      'count', problems_solved
    ) ORDER BY activity_date
  ) INTO v_activity
  FROM public.user_activity
  WHERE user_id = auth.uid()
    AND activity_date >= CURRENT_DATE - INTERVAL '365 days';
  
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
$$;