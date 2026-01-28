-- FIX SECURITY LINTER: Convert views to SECURITY INVOKER (default)
-- Views should not use SECURITY DEFINER as it bypasses caller's RLS

-- Recreate mentor_invites_safe with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.mentor_invites_safe;

CREATE VIEW public.mentor_invites_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  CASE 
    WHEN LENGTH(email) > 5 THEN 
      CONCAT(LEFT(email, 2), '***@', SPLIT_PART(email, '@', 2))
    ELSE 
      '***@***'
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

GRANT SELECT ON public.mentor_invites_safe TO authenticated;

-- Recreate public_profiles with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true, security_barrier = true) AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.division,
  COALESCE(p.xp, 0) as xp,
  COALESCE(p.streak, 0) as streak,
  p.created_at AS joined_at
FROM public.profiles p
WHERE p.username IS NOT NULL;

GRANT SELECT ON public.public_profiles TO authenticated;

-- Add a profile RLS policy that allows reading public fields via the view
-- This is needed because we removed the permissive policy
CREATE POLICY "Allow authenticated users to read public profile fields"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Owner can see their own full profile
  auth.uid() = id
  OR
  -- Others can only see profiles with usernames (public profiles)
  -- The actual field restriction happens in the view
  username IS NOT NULL
);