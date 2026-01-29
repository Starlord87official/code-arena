-- =====================================================
-- Explicit View Access Control for Security Scanners
-- =====================================================

-- 1. mentor_invites_safe: Keep fully locked (access via RPC only)
-- Already has security_invoker=on. Ensure no direct access.
REVOKE ALL ON public.mentor_invites_safe FROM anon;
REVOKE ALL ON public.mentor_invites_safe FROM authenticated;

-- 2. public_profiles: Allow authenticated users only
-- This enables leaderboard, search, and discovery features for signed-in users
REVOKE ALL ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Confirm security_invoker is enabled on both views (idempotent recreate)
-- This ensures the views run with caller's permissions, respecting base table RLS

CREATE OR REPLACE VIEW public.mentor_invites_safe
WITH (security_invoker = on, security_barrier = true) AS
SELECT 
  id,
  CASE 
    WHEN length(email) > 2 THEN 
      left(email, 2) || '***@' || split_part(email, '@', 2)
    ELSE '***@***'
  END as email_masked,
  name,
  expertise,
  invited_by,
  clan_id,
  status,
  accepted_by,
  created_at,
  accepted_at
FROM public.mentor_invites;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = on, security_barrier = true) AS
SELECT 
  id,
  username,
  avatar_url,
  division,
  COALESCE(xp, 0) as xp,
  COALESCE(streak, 0) as streak,
  created_at as joined_at
FROM public.profiles;