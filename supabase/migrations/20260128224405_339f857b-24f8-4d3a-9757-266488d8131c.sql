-- ============================================
-- Challenge Packs System with Hybrid Unlocking
-- ============================================

-- 1. First create the challenge_packs table
CREATE TABLE public.challenge_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'folder',
  category text NOT NULL DEFAULT 'general',
  difficulty_range text[] DEFAULT '{}',
  estimated_hours numeric(4,1) DEFAULT 5,
  unlock_level integer DEFAULT 1,
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  order_index integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on challenge_packs
ALTER TABLE public.challenge_packs ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view packs
CREATE POLICY "Authenticated users can view challenge packs"
ON public.challenge_packs FOR SELECT
TO authenticated
USING (true);

-- 2. Now add columns to challenges table
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS pack_id uuid REFERENCES public.challenge_packs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_beta boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS company_tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unlock_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS prerequisite_challenge_id uuid REFERENCES public.challenges(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS estimated_time_minutes integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS pattern_type text;

-- 3. Track user pack progress
CREATE TABLE public.user_pack_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pack_id uuid REFERENCES public.challenge_packs(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, pack_id)
);

-- Enable RLS on user_pack_progress
ALTER TABLE public.user_pack_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their pack progress"
ON public.user_pack_progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can start packs"
ON public.user_pack_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their pack progress"
ON public.user_pack_progress FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_pack_id ON public.challenges(pack_id);
CREATE INDEX IF NOT EXISTS idx_challenges_unlock_level ON public.challenges(unlock_level);
CREATE INDEX IF NOT EXISTS idx_challenges_pattern_type ON public.challenges(pattern_type);
CREATE INDEX IF NOT EXISTS idx_challenges_company_tags ON public.challenges USING GIN(company_tags);
CREATE INDEX IF NOT EXISTS idx_challenge_packs_category ON public.challenge_packs(category);
CREATE INDEX IF NOT EXISTS idx_challenge_packs_order ON public.challenge_packs(order_index);
CREATE INDEX IF NOT EXISTS idx_user_pack_progress_user ON public.user_pack_progress(user_id);

-- 5. Function to get user's unlocked level based on XP
CREATE OR REPLACE FUNCTION public.get_user_level(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(1, FLOOR(COALESCE(xp, 0) / 500) + 1)::integer
  FROM profiles
  WHERE id = p_user_id;
$$;

-- 6. Function to check if a challenge is unlocked for a user
CREATE OR REPLACE FUNCTION public.is_challenge_unlocked(p_user_id uuid, p_challenge_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge RECORD;
  v_user_level integer;
  v_prereq_completed boolean;
BEGIN
  SELECT unlock_level, prerequisite_challenge_id INTO v_challenge
  FROM challenges WHERE id = p_challenge_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  v_user_level := get_user_level(p_user_id);
  
  IF v_user_level < v_challenge.unlock_level THEN
    RETURN false;
  END IF;
  
  IF v_challenge.prerequisite_challenge_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM challenge_completions
      WHERE user_id = p_user_id AND challenge_id = v_challenge.prerequisite_challenge_id
    ) INTO v_prereq_completed;
    
    IF NOT v_prereq_completed THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- 7. Function to get pack statistics
CREATE OR REPLACE FUNCTION public.get_pack_stats(p_pack_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_challenges', COUNT(*),
    'easy_count', COUNT(*) FILTER (WHERE difficulty = 'easy'),
    'medium_count', COUNT(*) FILTER (WHERE difficulty = 'medium'),
    'hard_count', COUNT(*) FILTER (WHERE difficulty = 'hard'),
    'extreme_count', COUNT(*) FILTER (WHERE difficulty = 'extreme'),
    'total_xp', COALESCE(SUM(xp_reward), 0)
  )
  FROM challenges
  WHERE pack_id = p_pack_id AND is_active = true;
$$;

-- 8. Function to get user's pack progress
CREATE OR REPLACE FUNCTION public.get_user_pack_progress(p_user_id uuid, p_pack_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH pack_challenges AS (
    SELECT id FROM challenges WHERE pack_id = p_pack_id AND is_active = true
  ),
  completed AS (
    SELECT COUNT(*) as cnt FROM challenge_completions
    WHERE user_id = p_user_id AND challenge_id IN (SELECT id FROM pack_challenges)
  ),
  total AS (
    SELECT COUNT(*) as cnt FROM pack_challenges
  )
  SELECT json_build_object(
    'completed', completed.cnt,
    'total', total.cnt,
    'percentage', CASE WHEN total.cnt > 0 THEN ROUND((completed.cnt::numeric / total.cnt) * 100) ELSE 0 END
  )
  FROM completed, total;
$$;