-- =====================================================
-- Final Security Lockdown - Scanner-Compliant Policies
-- =====================================================

-- 1️⃣ mentor_invites – Hard Lock (deny all SELECT)
-- Drop any conflicting SELECT policies first
DROP POLICY IF EXISTS "mentor_invites_sender_or_recipient_only" ON public.mentor_invites;
DROP POLICY IF EXISTS "mentor_invites_no_select" ON public.mentor_invites;
DROP POLICY IF EXISTS "Mentors can view own invites" ON public.mentor_invites;

-- Create explicit deny-all SELECT policy
CREATE POLICY "mentor_invites_deny_all_select"
ON public.mentor_invites
FOR SELECT
USING (false);

-- 2️⃣ profiles – Hard Owner Isolation (zero enumeration)
-- Drop and recreate to ensure clean state
DROP POLICY IF EXISTS "profiles_owner_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_strict_owner_only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create strict owner-only SELECT policy
CREATE POLICY "profiles_strict_owner_only"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- 3️⃣ public_profiles view – Explicit Access Control
-- Views don't support RLS, so use REVOKE/GRANT pattern
REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM authenticated;
GRANT SELECT ON public.public_profiles TO authenticated;

-- 4️⃣ mentor_invites_safe view – Lock completely (RPC only)
REVOKE ALL ON public.mentor_invites_safe FROM anon;
REVOKE ALL ON public.mentor_invites_safe FROM authenticated;

-- Verify views have security_invoker enabled (recreate if needed)
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

-- Re-apply GRANT after view recreation
GRANT SELECT ON public.public_profiles TO authenticated;