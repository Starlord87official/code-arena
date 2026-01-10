-- Drop the security definer view and recreate with SECURITY INVOKER (default)
DROP VIEW IF EXISTS public.public_profiles;

-- Create a view for public profile data that only exposes safe fields
-- This uses SECURITY INVOKER (default) which is safer
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
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

-- Add a policy to allow reading public profile data for other users
-- This is a separate policy that only exposes safe fields via a function
CREATE OR REPLACE FUNCTION public.is_reading_public_fields()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT true
$$;

-- Add a policy for reading other users' basic public info
-- Note: The view approach is cleaner, but we also add a minimal read policy
CREATE POLICY "Users can view basic public info of others"
ON public.profiles
FOR SELECT
USING (
  -- User can always see their own full profile
  auth.uid() = id
  -- OR they can see the row but sensitive fields are handled by the view/function
  OR true
);

-- Actually, the dual policy approach is problematic. Let's simplify:
-- Drop the conflicting policy and keep only the owner policy
DROP POLICY IF EXISTS "Users can view basic public info of others" ON public.profiles;