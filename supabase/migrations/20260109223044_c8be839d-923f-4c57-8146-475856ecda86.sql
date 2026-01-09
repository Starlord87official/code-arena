-- Create planner_events table for user-created events
CREATE TABLE public.planner_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  end_date DATE,
  category TEXT NOT NULL CHECK (category IN ('study', 'career', 'personal', 'internship', 'revision', 'contest')),
  is_system_event BOOLEAN NOT NULL DEFAULT false,
  system_event_type TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view their own events" 
ON public.planner_events 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own events (but not system events)
CREATE POLICY "Users can create their own events" 
ON public.planner_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND is_system_event = false);

-- Users can update their own non-system events
CREATE POLICY "Users can update their own events" 
ON public.planner_events 
FOR UPDATE 
USING (auth.uid() = user_id AND is_system_event = false);

-- Users can delete their own non-system events
CREATE POLICY "Users can delete their own events" 
ON public.planner_events 
FOR DELETE 
USING (auth.uid() = user_id AND is_system_event = false);

-- Create indexes for efficient queries
CREATE INDEX idx_planner_events_user_date ON public.planner_events(user_id, event_date);
CREATE INDEX idx_planner_events_category ON public.planner_events(category);