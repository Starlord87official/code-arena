
-- Create enum for topic states
CREATE TYPE public.topic_state AS ENUM ('not_started', 'in_progress', 'completed');

-- Create roadmaps table (system-defined, immutable)
CREATE TABLE public.roadmaps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roadmap_topics table (ordered topics within a roadmap)
CREATE TABLE public.roadmap_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id TEXT NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL,
  topic_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(roadmap_id, topic_order)
);

-- Create user_roadmap_progress table (tracks user progress per topic)
CREATE TABLE public.user_roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.roadmap_topics(id) ON DELETE CASCADE,
  state topic_state NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Create user_active_roadmaps table (tracks which roadmaps a user has started)
CREATE TABLE public.user_active_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, roadmap_id)
);

-- Enable RLS on all tables
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_roadmaps ENABLE ROW LEVEL SECURITY;

-- Roadmaps are publicly readable (system-defined)
CREATE POLICY "Roadmaps are publicly readable"
ON public.roadmaps FOR SELECT
USING (true);

-- Roadmap topics are publicly readable
CREATE POLICY "Roadmap topics are publicly readable"
ON public.roadmap_topics FOR SELECT
USING (true);

-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
ON public.user_roadmap_progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress (when starting a topic)
CREATE POLICY "Users can insert their own progress"
ON public.user_roadmap_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- System/mentors can update progress (via security definer function)
CREATE POLICY "Users can update their own progress"
ON public.user_roadmap_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Users can view their active roadmaps
CREATE POLICY "Users can view their active roadmaps"
ON public.user_active_roadmaps FOR SELECT
USING (auth.uid() = user_id);

-- Users can start roadmaps
CREATE POLICY "Users can start roadmaps"
ON public.user_active_roadmaps FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_roadmap_progress_updated_at
BEFORE UPDATE ON public.user_roadmap_progress
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert DSA roadmap
INSERT INTO public.roadmaps (id, name, description)
VALUES ('dsa', 'Data Structures & Algorithms', 'Master the fundamentals of DSA for coding interviews and competitive programming');

-- Insert DSA topics in order
INSERT INTO public.roadmap_topics (roadmap_id, topic_name, topic_order) VALUES
('dsa', 'Arrays', 1),
('dsa', 'Strings', 2),
('dsa', 'Linked List', 3),
('dsa', 'Stack & Queue', 4),
('dsa', 'Recursion', 5),
('dsa', 'Trees', 6),
('dsa', 'Binary Search Trees', 7),
('dsa', 'Graphs', 8),
('dsa', 'Dynamic Programming', 9),
('dsa', 'Greedy', 10),
('dsa', 'Heaps / Priority Queue', 11),
('dsa', 'Bit Manipulation', 12),
('dsa', 'Tries', 13);

-- Function to start a roadmap for a user (initializes all topic progress)
CREATE OR REPLACE FUNCTION public.start_roadmap(p_roadmap_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  topic_record RECORD;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if already started
  IF EXISTS (SELECT 1 FROM public.user_active_roadmaps WHERE user_id = current_user_id AND roadmap_id = p_roadmap_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Roadmap already started');
  END IF;
  
  -- Add to active roadmaps
  INSERT INTO public.user_active_roadmaps (user_id, roadmap_id)
  VALUES (current_user_id, p_roadmap_id);
  
  -- Initialize progress for all topics
  FOR topic_record IN SELECT id FROM public.roadmap_topics WHERE roadmap_id = p_roadmap_id
  LOOP
    INSERT INTO public.user_roadmap_progress (user_id, roadmap_id, topic_id, state)
    VALUES (current_user_id, p_roadmap_id, topic_record.id, 'not_started')
    ON CONFLICT (user_id, topic_id) DO NOTHING;
  END LOOP;
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function to update topic state
CREATE OR REPLACE FUNCTION public.update_topic_state(p_topic_id UUID, p_state topic_state)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  UPDATE public.user_roadmap_progress
  SET 
    state = p_state,
    started_at = CASE WHEN p_state = 'in_progress' AND started_at IS NULL THEN now() ELSE started_at END,
    completed_at = CASE WHEN p_state = 'completed' THEN now() ELSE completed_at END
  WHERE user_id = current_user_id AND topic_id = p_topic_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Topic progress not found');
  END IF;
  
  RETURN jsonb_build_object('success', true);
END;
$$;
