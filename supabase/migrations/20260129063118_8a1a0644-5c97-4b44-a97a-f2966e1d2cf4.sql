-- Revoke direct SELECT access on public_profiles view
-- All access must go through SECURITY DEFINER RPCs: get_leaderboard_data(), get_public_profile()
REVOKE ALL ON public.public_profiles FROM anon, authenticated;

-- Create a general-purpose RPC for listing public profiles (optional, for completeness)
CREATE OR REPLACE FUNCTION public.get_public_profiles(
  p_limit integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  username text,
  avatar_url text,
  division text,
  xp integer,
  streak integer,
  joined_at timestamptz
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
  FROM profiles p
  WHERE p.username IS NOT NULL
  ORDER BY p.xp DESC NULLS LAST
  LIMIT p_limit;
$$;