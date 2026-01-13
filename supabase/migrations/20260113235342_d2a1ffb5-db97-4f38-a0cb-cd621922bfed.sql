-- Create a table to track daily challenge completions for streak logic
CREATE TABLE IF NOT EXISTS public.daily_challenge_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id),
  completion_date date NOT NULL DEFAULT CURRENT_DATE,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, completion_date)
);

-- Enable RLS
ALTER TABLE public.daily_challenge_completions ENABLE ROW LEVEL SECURITY;

-- Users can read their own completions
CREATE POLICY "Users can read their own daily completions" 
ON public.daily_challenge_completions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own completions (via function)
CREATE POLICY "Users can insert their own daily completions" 
ON public.daily_challenge_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Immutable
CREATE POLICY "Daily completions are immutable" 
ON public.daily_challenge_completions 
FOR UPDATE 
USING (false) 
WITH CHECK (false);

CREATE POLICY "Daily completions cannot be deleted" 
ON public.daily_challenge_completions 
FOR DELETE 
USING (false);

-- Index for efficient lookup
CREATE INDEX idx_daily_completions_user_date ON public.daily_challenge_completions(user_id, completion_date);

-- Function to complete daily challenge and update streak
CREATE OR REPLACE FUNCTION public.complete_daily_challenge(p_challenge_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_challenge RECORD;
  v_yesterday_completed BOOLEAN;
  v_current_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get challenge details
  SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Challenge not found');
  END IF;

  -- Check if already completed today's daily
  IF EXISTS (
    SELECT 1 FROM daily_challenge_completions 
    WHERE user_id = v_user_id AND completion_date = CURRENT_DATE
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already completed today''s daily challenge');
  END IF;

  -- Record daily completion
  INSERT INTO daily_challenge_completions (user_id, challenge_id, completion_date)
  VALUES (v_user_id, p_challenge_id, CURRENT_DATE);

  -- Check if completed yesterday's daily for streak calculation
  SELECT EXISTS (
    SELECT 1 FROM daily_challenge_completions 
    WHERE user_id = v_user_id AND completion_date = CURRENT_DATE - 1
  ) INTO v_yesterday_completed;

  -- Get current streak
  SELECT COALESCE(streak, 0) INTO v_current_streak FROM profiles WHERE id = v_user_id;

  -- Calculate new streak
  IF v_yesterday_completed THEN
    v_new_streak := v_current_streak + 1;
  ELSE
    -- Start new streak at 1 (today's completion)
    v_new_streak := 1;
  END IF;

  -- Update user's streak
  UPDATE profiles SET streak = v_new_streak WHERE id = v_user_id;

  -- Also record the regular challenge completion if not already done
  INSERT INTO challenge_completions (user_id, challenge_id, xp_earned)
  VALUES (v_user_id, p_challenge_id, v_challenge.xp_reward)
  ON CONFLICT DO NOTHING;

  -- Update user XP
  UPDATE profiles SET xp = COALESCE(xp, 0) + v_challenge.xp_reward WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'streak', v_new_streak,
    'xp_earned', v_challenge.xp_reward,
    'streak_continued', v_yesterday_completed
  );
END;
$$;

-- Function to check and reset streak if daily was missed
CREATE OR REPLACE FUNCTION public.check_daily_streak()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_yesterday_completed BOOLEAN;
  v_current_streak INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if completed yesterday
  SELECT EXISTS (
    SELECT 1 FROM daily_challenge_completions 
    WHERE user_id = v_user_id AND completion_date = CURRENT_DATE - 1
  ) INTO v_yesterday_completed;

  -- Get current streak
  SELECT COALESCE(streak, 0) INTO v_current_streak FROM profiles WHERE id = v_user_id;

  -- If missed yesterday and has a streak, check if we need to reset
  IF NOT v_yesterday_completed AND v_current_streak > 0 THEN
    -- Check if completed today already
    IF NOT EXISTS (
      SELECT 1 FROM daily_challenge_completions 
      WHERE user_id = v_user_id AND completion_date = CURRENT_DATE
    ) THEN
      -- Streak is broken - reset to 0
      UPDATE profiles SET streak = 0 WHERE id = v_user_id;
      RETURN json_build_object(
        'success', true,
        'streak', 0,
        'streak_broken', true,
        'message', 'Streak broken - you missed yesterday''s daily challenge'
      );
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'streak', v_current_streak,
    'streak_broken', false
  );
END;
$$;