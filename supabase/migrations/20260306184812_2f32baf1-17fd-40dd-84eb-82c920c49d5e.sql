
-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Create admin check function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'admin'
  )
$$;

-- Admin select policy for profiles (admins can see all profiles)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admin update policy for profiles (admins can update any profile)
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admin policies for notifications table
CREATE POLICY "Admins can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Admin policies for challenges table
CREATE POLICY "Admins can manage challenges"
ON public.challenges
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Admin policies for contests table  
CREATE POLICY "Admins can manage contests"
ON public.contests
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Admin policies for clans table
CREATE POLICY "Admins can manage clans"
ON public.clans
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Admin policies for battle_matches table
CREATE POLICY "Admins can view all battles"
ON public.battle_matches
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admin policies for battle_sessions table
CREATE POLICY "Admins can view all battle sessions"
ON public.battle_sessions
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));
