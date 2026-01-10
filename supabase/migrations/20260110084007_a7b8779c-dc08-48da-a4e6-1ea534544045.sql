-- =============================================
-- SECURE public_profiles VIEW
-- =============================================

-- Drop and recreate the view with RLS-compatible security
DROP VIEW IF EXISTS public.public_profiles;

-- Create the view with only safe public fields
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  division,
  xp,
  streak,
  created_at as joined_at
FROM public.profiles;

-- Enable RLS on the view (requires security_invoker)
ALTER VIEW public.public_profiles SET (security_invoker = on);

-- =============================================
-- SECURE mentor_invites TABLE (RPC-only access)
-- =============================================

-- Drop all existing SELECT policies that expose data
DROP POLICY IF EXISTS "Anyone can view invite by token" ON public.mentor_invites;
DROP POLICY IF EXISTS "Mentors can view their invites" ON public.mentor_invites;

-- Create restrictive policy: mentors can only see invites they created (no email exposure to others)
CREATE POLICY "Mentors can view their own sent invites"
ON public.mentor_invites
FOR SELECT
TO authenticated
USING (invited_by = auth.uid());

-- No client-side SELECT for pending invites - validation via RPC only
-- The accept_mentor_invite RPC already uses SECURITY DEFINER

-- Create a safe RPC to get invite info without exposing email
CREATE OR REPLACE FUNCTION public.get_invite_info(invite_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite record;
BEGIN
  SELECT 
    id,
    status,
    clan_id,
    expertise,
    name,
    created_at
  INTO v_invite
  FROM public.mentor_invites
  WHERE token = invite_token
  AND status = 'pending';
  
  IF v_invite IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invite');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'invite', json_build_object(
      'id', v_invite.id,
      'status', v_invite.status,
      'clan_id', v_invite.clan_id,
      'expertise', v_invite.expertise,
      'name', v_invite.name,
      'created_at', v_invite.created_at
    )
  );
END;
$$;