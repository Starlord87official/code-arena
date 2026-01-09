-- Create enum for doubt categories
CREATE TYPE public.doubt_category AS ENUM ('study', 'job', 'internship', 'referral');

-- Create enum for doubt difficulty
CREATE TYPE public.doubt_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create doubts table
CREATE TABLE public.doubts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category public.doubt_category NOT NULL,
  topic_id UUID NOT NULL REFERENCES public.roadmap_topics(id),
  difficulty public.doubt_difficulty NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  code_block TEXT,
  is_solved BOOLEAN NOT NULL DEFAULT false,
  solved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

-- Index for efficient queries
CREATE INDEX idx_doubts_user ON public.doubts(user_id);
CREATE INDEX idx_doubts_topic ON public.doubts(topic_id);
CREATE INDEX idx_doubts_status ON public.doubts(is_solved);
CREATE INDEX idx_doubts_category ON public.doubts(category);
CREATE INDEX idx_doubts_difficulty ON public.doubts(difficulty);

-- RLS Policy: Users can view doubts for topics they are studying or completed
CREATE POLICY "Users can view relevant doubts"
  ON public.doubts FOR SELECT
  USING (
    -- User can always see their own doubts
    auth.uid() = user_id
    OR
    -- User can see doubts for topics they're studying/completed at their level or below
    (
      EXISTS (
        SELECT 1 FROM public.user_roadmap_progress urp
        WHERE urp.user_id = auth.uid()
          AND urp.topic_id = doubts.topic_id
          AND urp.state IN ('in_progress', 'completed')
      )
    )
  );

-- RLS Policy: Authenticated users can create doubts
CREATE POLICY "Users can create their own doubts"
  ON public.doubts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND
    -- Can only ask about topics they're studying or completed
    EXISTS (
      SELECT 1 FROM public.user_roadmap_progress urp
      WHERE urp.user_id = auth.uid()
        AND urp.topic_id = doubts.topic_id
        AND urp.state IN ('in_progress', 'completed')
    )
  );

-- RLS Policy: Only doubt owner can update (to mark as solved)
CREATE POLICY "Users can update their own doubts"
  ON public.doubts FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get doubts visible to current user
CREATE OR REPLACE FUNCTION public.get_visible_doubts(
  p_show_solved BOOLEAN DEFAULT false,
  p_category public.doubt_category DEFAULT NULL,
  p_topic_id UUID DEFAULT NULL,
  p_difficulty public.doubt_difficulty DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_items JSONB;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', d.id,
      'user_id', d.user_id,
      'category', d.category,
      'topic_id', d.topic_id,
      'topic_name', rt.topic_name,
      'difficulty', d.difficulty,
      'title', d.title,
      'content', d.content,
      'code_block', d.code_block,
      'is_solved', d.is_solved,
      'solved_at', d.solved_at,
      'created_at', d.created_at,
      'is_own', d.user_id = v_user_id
    ) ORDER BY 
      CASE WHEN d.user_id = v_user_id THEN 0 ELSE 1 END,
      d.created_at DESC
  ), '[]'::jsonb) INTO v_items
  FROM public.doubts d
  JOIN public.roadmap_topics rt ON rt.id = d.topic_id
  WHERE 
    d.is_solved = p_show_solved
    AND (p_category IS NULL OR d.category = p_category)
    AND (p_topic_id IS NULL OR d.topic_id = p_topic_id)
    AND (p_difficulty IS NULL OR d.difficulty = p_difficulty)
    AND (p_search IS NULL OR d.title ILIKE '%' || p_search || '%' OR d.content ILIKE '%' || p_search || '%')
    AND (
      d.user_id = v_user_id
      OR EXISTS (
        SELECT 1 FROM public.user_roadmap_progress urp
        WHERE urp.user_id = v_user_id
          AND urp.topic_id = d.topic_id
          AND urp.state IN ('in_progress', 'completed')
      )
    );

  RETURN json_build_object('success', true, 'doubts', v_items);
END;
$$;

-- Function to create a doubt
CREATE OR REPLACE FUNCTION public.create_doubt(
  p_category public.doubt_category,
  p_topic_id UUID,
  p_difficulty public.doubt_difficulty,
  p_title TEXT,
  p_content TEXT,
  p_code_block TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.doubts;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Verify user has access to this topic
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roadmap_progress urp
    WHERE urp.user_id = v_user_id
      AND urp.topic_id = p_topic_id
      AND urp.state IN ('in_progress', 'completed')
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You can only ask about topics you are studying or have completed');
  END IF;
  
  INSERT INTO public.doubts (
    user_id, category, topic_id, difficulty, title, content, code_block
  ) VALUES (
    v_user_id, p_category, p_topic_id, p_difficulty, p_title, p_content, p_code_block
  )
  RETURNING * INTO v_result;
  
  RETURN json_build_object('success', true, 'doubt', row_to_json(v_result));
END;
$$;

-- Function to mark doubt as solved
CREATE OR REPLACE FUNCTION public.mark_doubt_solved(p_doubt_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.doubts;
BEGIN
  UPDATE public.doubts
  SET 
    is_solved = true,
    solved_at = now(),
    updated_at = now()
  WHERE id = p_doubt_id AND user_id = auth.uid()
  RETURNING * INTO v_result;
  
  IF v_result IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Doubt not found or not authorized');
  END IF;
  
  RETURN json_build_object('success', true, 'doubt', row_to_json(v_result));
END;
$$;

-- Function to get user's eligible topics for asking doubts
CREATE OR REPLACE FUNCTION public.get_eligible_doubt_topics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_topics JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', rt.id,
      'topic_name', rt.topic_name,
      'roadmap_id', rt.roadmap_id,
      'state', urp.state
    ) ORDER BY rt.topic_order
  ), '[]'::jsonb) INTO v_topics
  FROM public.user_roadmap_progress urp
  JOIN public.roadmap_topics rt ON rt.id = urp.topic_id
  WHERE urp.user_id = auth.uid()
    AND urp.state IN ('in_progress', 'completed');

  RETURN json_build_object('success', true, 'topics', v_topics);
END;
$$;