-- Create doubt_comments table
CREATE TABLE public.doubt_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doubt_id UUID NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_doubt_comments_doubt_id ON public.doubt_comments(doubt_id);
CREATE INDEX idx_doubt_comments_created_at ON public.doubt_comments(created_at);
CREATE INDEX idx_doubt_comments_user_id ON public.doubt_comments(user_id);

-- Enable RLS
ALTER TABLE public.doubt_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone authenticated can read comments on doubts they can see
CREATE POLICY "Users can read comments on visible doubts"
ON public.doubt_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doubts d
    WHERE d.id = doubt_comments.doubt_id
    AND (
      d.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_roadmap_progress urp
        WHERE urp.user_id = auth.uid()
          AND urp.topic_id = d.topic_id
          AND urp.state IN ('in_progress', 'completed')
      )
    )
  )
);

-- Authenticated users can insert comments on doubts they can see
CREATE POLICY "Users can add comments to visible doubts"
ON public.doubt_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.doubts d
    WHERE d.id = doubt_comments.doubt_id
    AND (
      d.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_roadmap_progress urp
        WHERE urp.user_id = auth.uid()
          AND urp.topic_id = d.topic_id
          AND urp.state IN ('in_progress', 'completed')
      )
    )
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.doubt_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments OR doubt owner can delete comments on their doubt
CREATE POLICY "Users can delete own comments or doubt owner can delete"
ON public.doubt_comments
FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.doubts d
    WHERE d.id = doubt_comments.doubt_id
    AND d.user_id = auth.uid()
  )
);

-- Create function to get comments with user info
CREATE OR REPLACE FUNCTION public.get_doubt_comments(p_doubt_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_comments JSONB;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', dc.id,
      'doubt_id', dc.doubt_id,
      'user_id', dc.user_id,
      'content', dc.content,
      'created_at', dc.created_at,
      'username', p.username,
      'avatar_url', p.avatar_url
    ) ORDER BY dc.created_at ASC
  ), '[]'::jsonb) INTO v_comments
  FROM public.doubt_comments dc
  JOIN public.profiles p ON p.id = dc.user_id
  WHERE dc.doubt_id = p_doubt_id;

  RETURN json_build_object('success', true, 'comments', v_comments);
END;
$$;

-- Create function to add a comment
CREATE OR REPLACE FUNCTION public.add_doubt_comment(p_doubt_id UUID, p_content TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_comment RECORD;
  v_username TEXT;
  v_avatar_url TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Verify user can see this doubt
  IF NOT EXISTS (
    SELECT 1 FROM public.doubts d
    WHERE d.id = p_doubt_id
    AND (
      d.user_id = v_user_id
      OR EXISTS (
        SELECT 1 FROM public.user_roadmap_progress urp
        WHERE urp.user_id = v_user_id
          AND urp.topic_id = d.topic_id
          AND urp.state IN ('in_progress', 'completed')
      )
    )
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Cannot comment on this doubt');
  END IF;

  -- Get user profile info
  SELECT username, avatar_url INTO v_username, v_avatar_url
  FROM public.profiles WHERE id = v_user_id;

  -- Insert comment
  INSERT INTO public.doubt_comments (doubt_id, user_id, content)
  VALUES (p_doubt_id, v_user_id, p_content)
  RETURNING * INTO v_comment;

  RETURN json_build_object(
    'success', true,
    'comment', json_build_object(
      'id', v_comment.id,
      'doubt_id', v_comment.doubt_id,
      'user_id', v_comment.user_id,
      'content', v_comment.content,
      'created_at', v_comment.created_at,
      'username', v_username,
      'avatar_url', v_avatar_url
    )
  );
END;
$$;

-- Create function to delete a comment
CREATE OR REPLACE FUNCTION public.delete_doubt_comment(p_comment_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_comment RECORD;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get comment and verify ownership
  SELECT dc.*, d.user_id as doubt_owner_id INTO v_comment
  FROM public.doubt_comments dc
  JOIN public.doubts d ON d.id = dc.doubt_id
  WHERE dc.id = p_comment_id;

  IF v_comment IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Comment not found');
  END IF;

  -- Check if user is comment author or doubt owner
  IF v_comment.user_id != v_user_id AND v_comment.doubt_owner_id != v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized to delete this comment');
  END IF;

  DELETE FROM public.doubt_comments WHERE id = p_comment_id;

  RETURN json_build_object('success', true);
END;
$$;

-- Function to get comment count for a doubt
CREATE OR REPLACE FUNCTION public.get_doubt_comment_count(p_doubt_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::INTEGER FROM public.doubt_comments WHERE doubt_id = p_doubt_id;
$$;