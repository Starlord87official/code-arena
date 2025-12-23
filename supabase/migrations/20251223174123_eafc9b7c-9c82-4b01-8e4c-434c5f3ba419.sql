-- Create expertise enum for mentors
CREATE TYPE public.mentor_expertise AS ENUM ('dsa', 'cp', 'web', 'system_design');

-- Create invite status enum
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'expired');

-- Create mentor_invites table
CREATE TABLE public.mentor_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  expertise mentor_expertise,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clan_id TEXT,
  status invite_status NOT NULL DEFAULT 'pending',
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.mentor_invites ENABLE ROW LEVEL SECURITY;

-- Mentors can view invites they created
CREATE POLICY "Mentors can view their invites"
ON public.mentor_invites
FOR SELECT
TO authenticated
USING (invited_by = auth.uid());

-- Mentors can create invites
CREATE POLICY "Mentors can create invites"
ON public.mentor_invites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'mentor'
  )
);

-- Anyone can view pending invites by token (for validation)
CREATE POLICY "Anyone can view invite by token"
ON public.mentor_invites
FOR SELECT
USING (status = 'pending');

-- Authenticated users can accept invites (update status)
CREATE POLICY "Users can accept invites"
ON public.mentor_invites
FOR UPDATE
TO authenticated
USING (status = 'pending')
WITH CHECK (status = 'accepted' AND accepted_by = auth.uid());

-- Create index for token lookups
CREATE INDEX idx_mentor_invites_token ON public.mentor_invites(token);
CREATE INDEX idx_mentor_invites_email ON public.mentor_invites(email);

-- Create a secure function to accept mentor invite
CREATE OR REPLACE FUNCTION public.accept_mentor_invite(invite_token TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record public.mentor_invites%ROWTYPE;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find the invite
  SELECT * INTO invite_record
  FROM public.mentor_invites
  WHERE token = invite_token;
  
  IF invite_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid invite token');
  END IF;
  
  IF invite_record.status = 'accepted' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invite already accepted');
  END IF;
  
  IF invite_record.status = 'expired' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invite has expired');
  END IF;
  
  -- Update invite status
  UPDATE public.mentor_invites
  SET status = 'accepted',
      accepted_by = current_user_id,
      accepted_at = now()
  WHERE id = invite_record.id;
  
  -- Assign mentor role (use the clan_id from invite if provided, otherwise use a default)
  INSERT INTO public.user_roles (user_id, clan_id, role)
  VALUES (
    current_user_id,
    COALESCE(invite_record.clan_id, 'global'),
    'mentor'
  )
  ON CONFLICT (user_id, clan_id) DO UPDATE SET role = 'mentor';
  
  RETURN jsonb_build_object(
    'success', true, 
    'clan_id', invite_record.clan_id,
    'message', 'Successfully became a mentor'
  );
END;
$$;