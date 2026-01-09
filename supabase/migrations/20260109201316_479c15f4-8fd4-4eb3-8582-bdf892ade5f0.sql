-- Create revision queue table for manual problem revision tracking
CREATE TABLE public.revision_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  problem_title TEXT NOT NULL,
  topic TEXT,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due', 'overdue', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.revision_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own revision queue"
  ON public.revision_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their revision queue"
  ON public.revision_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revision items"
  ON public.revision_queue FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_revision_queue_user_date ON public.revision_queue(user_id, scheduled_date);
CREATE INDEX idx_revision_queue_status ON public.revision_queue(user_id, status);

-- Function to add problem to revision queue
CREATE OR REPLACE FUNCTION public.add_to_revision_queue(
  p_problem_id TEXT,
  p_problem_title TEXT,
  p_topic TEXT DEFAULT NULL,
  p_days_until_revision INTEGER DEFAULT 3
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.revision_queue;
BEGIN
  INSERT INTO public.revision_queue (
    user_id,
    problem_id,
    problem_title,
    topic,
    scheduled_date,
    status
  )
  VALUES (
    auth.uid(),
    p_problem_id,
    p_problem_title,
    p_topic,
    CURRENT_DATE + p_days_until_revision,
    'upcoming'
  )
  RETURNING * INTO v_result;
  
  RETURN json_build_object('success', true, 'data', row_to_json(v_result));
END;
$$;

-- Function to mark revision as completed (keeps historical data)
CREATE OR REPLACE FUNCTION public.complete_revision_item(p_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.revision_queue;
BEGIN
  UPDATE public.revision_queue
  SET 
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  WHERE id = p_id AND user_id = auth.uid()
  RETURNING * INTO v_result;
  
  IF v_result IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Item not found or not authorized');
  END IF;
  
  RETURN json_build_object('success', true, 'data', row_to_json(v_result));
END;
$$;

-- Function to get revision queue with auto-status update
CREATE OR REPLACE FUNCTION public.get_revision_queue()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_items JSONB;
BEGIN
  -- Update statuses based on current date
  UPDATE public.revision_queue
  SET 
    status = CASE 
      WHEN scheduled_date < CURRENT_DATE AND status != 'completed' THEN 'overdue'
      WHEN scheduled_date = CURRENT_DATE AND status = 'upcoming' THEN 'due'
      ELSE status
    END,
    updated_at = now()
  WHERE user_id = auth.uid() AND status != 'completed';
  
  -- Get all non-completed items
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'problem_id', problem_id,
      'problem_title', problem_title,
      'topic', topic,
      'scheduled_date', scheduled_date,
      'status', status,
      'created_at', created_at
    ) ORDER BY 
      CASE status 
        WHEN 'overdue' THEN 1 
        WHEN 'due' THEN 2 
        ELSE 3 
      END,
      scheduled_date ASC
  ), '[]'::jsonb) INTO v_items
  FROM public.revision_queue
  WHERE user_id = auth.uid() AND status != 'completed';
  
  RETURN json_build_object('success', true, 'items', v_items);
END;
$$;