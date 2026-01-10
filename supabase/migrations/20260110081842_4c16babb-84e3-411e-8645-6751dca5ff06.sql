-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;

-- Create policy for users to view their own full profile
CREATE POLICY "Users can view their own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a security definer function to get safe public profile fields
-- This prevents direct access to sensitive columns for other users
CREATE OR REPLACE FUNCTION public.get_public_profile_fields(profile_row public.profiles)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', profile_row.id,
    'username', profile_row.username,
    'avatar_url', profile_row.avatar_url,
    'division', profile_row.division,
    'xp', profile_row.xp,
    'streak', profile_row.streak,
    'created_at', profile_row.created_at
  )
$$;

-- Create a view for public profile data that only exposes safe fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  division,
  xp,
  streak,
  created_at as joined_at
FROM public.profiles
WHERE username IS NOT NULL;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;