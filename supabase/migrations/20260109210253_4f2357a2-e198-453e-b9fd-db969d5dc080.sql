-- AI Usage Tracking table
CREATE TABLE public.ai_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  context JSONB,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage"
  ON public.ai_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for efficient daily usage queries
CREATE INDEX idx_ai_usage_user_date ON public.ai_usage (user_id, created_at);

-- AI Settings table for global kill switch
CREATE TABLE public.ai_settings (
  id TEXT NOT NULL DEFAULT 'global' PRIMARY KEY,
  ai_enabled BOOLEAN NOT NULL DEFAULT true,
  daily_limit_per_user INTEGER NOT NULL DEFAULT 20,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.ai_settings (id, ai_enabled, daily_limit_per_user)
VALUES ('global', true, 20);

-- Allow read access to settings for all authenticated users
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI settings"
  ON public.ai_settings FOR SELECT
  USING (true);

-- Function to check user's daily AI usage
CREATE OR REPLACE FUNCTION public.get_ai_usage_today()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_today_count INTEGER;
  v_daily_limit INTEGER;
  v_ai_enabled BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;
  
  -- Get settings
  SELECT ai_enabled, daily_limit_per_user 
  INTO v_ai_enabled, v_daily_limit
  FROM ai_settings 
  WHERE id = 'global';
  
  -- Count today's usage
  SELECT COUNT(*)
  INTO v_today_count
  FROM ai_usage
  WHERE user_id = v_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
  
  RETURN json_build_object(
    'used', v_today_count,
    'limit', v_daily_limit,
    'remaining', GREATEST(0, v_daily_limit - v_today_count),
    'ai_enabled', v_ai_enabled
  );
END;
$$;

-- Function to record AI usage
CREATE OR REPLACE FUNCTION public.record_ai_usage(
  p_insight_type TEXT,
  p_context JSONB DEFAULT NULL,
  p_tokens_used INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_today_count INTEGER;
  v_daily_limit INTEGER;
  v_ai_enabled BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;
  
  -- Get settings
  SELECT ai_enabled, daily_limit_per_user 
  INTO v_ai_enabled, v_daily_limit
  FROM ai_settings 
  WHERE id = 'global';
  
  IF NOT v_ai_enabled THEN
    RETURN json_build_object('error', 'AI insights are temporarily disabled');
  END IF;
  
  -- Count today's usage
  SELECT COUNT(*)
  INTO v_today_count
  FROM ai_usage
  WHERE user_id = v_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
  
  IF v_today_count >= v_daily_limit THEN
    RETURN json_build_object(
      'error', 'Daily AI limit reached',
      'used', v_today_count,
      'limit', v_daily_limit
    );
  END IF;
  
  -- Record the usage
  INSERT INTO ai_usage (user_id, insight_type, context, tokens_used)
  VALUES (v_user_id, p_insight_type, p_context, p_tokens_used);
  
  RETURN json_build_object(
    'success', true,
    'used', v_today_count + 1,
    'remaining', v_daily_limit - v_today_count - 1
  );
END;
$$;