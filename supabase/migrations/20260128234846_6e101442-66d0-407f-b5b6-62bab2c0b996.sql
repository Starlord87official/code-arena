-- =====================================================
-- FIX: Remove SECURITY DEFINER from Views, Use RPCs Instead
-- =====================================================
-- Pattern: Views should be SECURITY INVOKER (default)
-- For exposing limited public data, use SECURITY DEFINER functions

-- PART 1: Create SECURITY DEFINER function for leaderboard data
-- This replaces the SECURITY DEFINER view pattern
-- --------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_leaderboard_data(
  p_division TEXT DEFAULT NULL,
  p_limit INT DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  division TEXT,
  xp INT,
  streak INT,
  joined_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.division,
    COALESCE(p.xp, 0) as xp,
    COALESCE(p.streak, 0) as streak,
    p.created_at as joined_at
  FROM public.profiles p
  WHERE p.username IS NOT NULL
    AND (p_division IS NULL OR p.division = p_division)
  ORDER BY COALESCE(p.xp, 0) DESC, COALESCE(p.streak, 0) DESC, p.created_at ASC
  LIMIT p_limit;
$$;

-- PART 2: Recreate public_profiles view WITHOUT SECURITY DEFINER
-- Now uses SECURITY INVOKER (default) - will only return user's own row
-- For public data, frontend should use get_leaderboard_data() or get_public_profile()
-- --------------------------------------------------------------
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true, security_barrier = true) AS
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

-- Grant access (view will respect RLS on profiles)
GRANT SELECT ON public.public_profiles TO authenticated;

-- PART 3: Recreate mentor_invites_safe view WITHOUT SECURITY DEFINER
-- Since mentor_invites has no SELECT policy, this view won't return data
-- Frontend should use a SECURITY DEFINER function instead
-- --------------------------------------------------------------
DROP VIEW IF EXISTS public.mentor_invites_safe;
CREATE VIEW public.mentor_invites_safe
WITH (security_invoker = true, security_barrier = true) AS
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

GRANT SELECT ON public.mentor_invites_safe TO authenticated;

-- PART 4: Create SECURITY DEFINER function for mentor invites
-- This allows invite creators to see their masked invite data
-- --------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_mentor_invites()
RETURNS TABLE (
  id UUID,
  email_masked TEXT,
  name TEXT,
  expertise mentor_expertise,
  invited_by UUID,
  clan_id TEXT,
  status invite_status,
  accepted_by UUID,
  created_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mi.id,
    CASE 
      WHEN LENGTH(mi.email) > 3 THEN 
        LEFT(mi.email, 2) || '***@' || SPLIT_PART(mi.email, '@', 2)
      ELSE 
        '***@' || SPLIT_PART(mi.email, '@', 2)
    END as email_masked,
    mi.name,
    mi.expertise,
    mi.invited_by,
    mi.clan_id,
    mi.status,
    mi.accepted_by,
    mi.created_at,
    mi.accepted_at
  FROM public.mentor_invites mi
  WHERE mi.invited_by = auth.uid()
  ORDER BY mi.created_at DESC;
$$;