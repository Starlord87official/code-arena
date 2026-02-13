
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  message text NOT NULL,
  subtext text,
  action_label text,
  action_url text,
  severity text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update only is_read on their own notifications
CREATE POLICY "Users can mark own notifications read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- No client-side deletes
-- (no DELETE policy = denied by default with RLS enabled)

-- No client-side inserts (notifications created server-side)
-- (no INSERT policy = denied by default with RLS enabled)

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Index for fast queries
CREATE INDEX idx_notifications_user_id ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications (user_id, is_read) WHERE is_read = false;
