-- Remove all SELECT policies on mentor_invites
DROP POLICY IF EXISTS "mentor_invites_sender_or_recipient_only" ON public.mentor_invites;
DROP POLICY IF EXISTS "Recipients can verify own invites" ON public.mentor_invites;
DROP POLICY IF EXISTS "Recipients can check invites" ON public.mentor_invites;

-- Revoke direct SELECT access from all roles
-- All reads must go through get_my_mentor_invites() RPC which masks emails
REVOKE SELECT ON public.mentor_invites FROM authenticated;
REVOKE SELECT ON public.mentor_invites FROM anon;