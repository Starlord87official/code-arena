-- Drop the overly permissive INSERT policy on user_roles
DROP POLICY IF EXISTS "Mentors can manage roles in their clans" ON public.user_roles;

-- Create stricter INSERT policy: only allow student role via default trigger
-- Mentor role can ONLY be assigned via accept_mentor_invite() function (SECURITY DEFINER)
CREATE POLICY "Only student role can be inserted directly"
ON public.user_roles
FOR INSERT
WITH CHECK (role = 'student');

-- Add UPDATE policy to prevent role escalation
-- No one can directly update roles - changes must go through accept_mentor_invite()
CREATE POLICY "No direct role updates allowed"
ON public.user_roles
FOR UPDATE
USING (false)
WITH CHECK (false);