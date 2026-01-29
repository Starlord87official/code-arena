-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing SELECT policy if any
DROP POLICY IF EXISTS "profiles_owner_only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;

-- Create explicit restrictive SELECT policy - users can ONLY read their own row
CREATE POLICY "profiles_owner_only"
ON public.profiles
FOR SELECT
USING (id = auth.uid());