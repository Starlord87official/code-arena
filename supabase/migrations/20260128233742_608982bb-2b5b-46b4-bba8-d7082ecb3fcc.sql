-- =====================================================
-- SECURITY FIX: Protect Sensitive Profile & Email Data
-- =====================================================

-- PART 1: Fix profiles table exposure
-- ------------------------------------
-- Problem: Current policy allows any authenticated user to read all profile data
-- Solution: Restrict to owner-only access, use public_profiles view for discovery

-- Remove the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Allow authenticated users to read public profile fields" ON public.profiles;

-- Ensure only profile owners can read their own full data
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;
CREATE POLICY "Users can view their own full profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Recreate public_profiles view WITHOUT security_invoker (bypasses RLS)
-- This is safe because the view only exposes non-sensitive public columns
-- and the WHERE clause ensures only valid profiles are shown
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_barrier = true) AS
SELECT 
  id,
  username,
  avatar_url,
  division,
  COALESCE(xp, 0) as xp,
  COALESCE(streak, 0) as streak,
  created_at as joined_at
FROM public.profiles
WHERE username IS NOT NULL;

-- Grant read access to authenticated users only
GRANT SELECT ON public.public_profiles TO authenticated;

-- PART 2: Fix mentor email exposure
-- ----------------------------------
-- Problem: Mentors can read raw email addresses from mentor_invites
-- Solution: Remove direct SELECT access, force use of the masked view

-- Remove the policy that exposes raw emails to invite senders
DROP POLICY IF EXISTS "Mentors can view their sent invites metadata only" ON public.mentor_invites;

-- Recreate mentor_invites_safe view WITHOUT security_invoker (bypasses RLS)
-- Safety is enforced by:
-- 1. The WHERE clause limiting access to own invites only
-- 2. Email masking in the SELECT clause
-- 3. Token field is completely excluded
DROP VIEW IF EXISTS public.mentor_invites_safe;
CREATE VIEW public.mentor_invites_safe
WITH (security_barrier = true) AS
SELECT 
  id,
  CASE 
    WHEN LENGTH(email) > 3 THEN 
      LEFT(email, 2) || '***@' || SPLIT_PART(email, '@', 2)
    ELSE 
      '***@' || SPLIT_PART(email, '@', 2)
  END as email_masked,
  name,
  expertise,
  invited_by,
  clan_id,
  status,
  accepted_by,
  created_at,
  accepted_at
FROM public.mentor_invites
WHERE invited_by = auth.uid();

-- Grant read access to authenticated users
GRANT SELECT ON public.mentor_invites_safe TO authenticated;