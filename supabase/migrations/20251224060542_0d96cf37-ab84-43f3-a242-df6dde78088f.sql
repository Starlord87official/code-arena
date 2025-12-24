
-- Drop existing overly permissive policies on clan_announcements
DROP POLICY IF EXISTS "Announcements are publicly readable" ON public.clan_announcements;
DROP POLICY IF EXISTS "Anyone can create announcements" ON public.clan_announcements;
DROP POLICY IF EXISTS "Anyone can delete announcements" ON public.clan_announcements;
DROP POLICY IF EXISTS "Anyone can update announcements" ON public.clan_announcements;

-- Create strict RLS policies for clan_announcements

-- 1. Students can only read announcements of their own clan
-- Mentors can read announcements of clans they mentor
CREATE POLICY "Users can read announcements of their clan"
ON public.clan_announcements
FOR SELECT
USING (
  -- User is a member of the clan
  EXISTS (
    SELECT 1 FROM public.clan_members
    WHERE clan_members.clan_id = clan_announcements.clan_id
    AND clan_members.user_id = auth.uid()
  )
  OR
  -- User is a mentor of the clan
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.clan_id = clan_announcements.clan_id
    AND user_roles.user_id = auth.uid()
    AND user_roles.role = 'mentor'
  )
);

-- 2. Only mentors of a clan can create announcements for that clan
CREATE POLICY "Mentors can create announcements for their clan"
ON public.clan_announcements
FOR INSERT
WITH CHECK (
  mentor_id = auth.uid()
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.clan_id = clan_announcements.clan_id
    AND user_roles.user_id = auth.uid()
    AND user_roles.role = 'mentor'
  )
);

-- 3. Only the mentor who created an announcement can update it
CREATE POLICY "Mentors can update their own announcements"
ON public.clan_announcements
FOR UPDATE
USING (
  mentor_id = auth.uid()
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.clan_id = clan_announcements.clan_id
    AND user_roles.user_id = auth.uid()
    AND user_roles.role = 'mentor'
  )
);

-- 4. Only the mentor who created an announcement can delete it
CREATE POLICY "Mentors can delete their own announcements"
ON public.clan_announcements
FOR DELETE
USING (
  mentor_id = auth.uid()
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.clan_id = clan_announcements.clan_id
    AND user_roles.user_id = auth.uid()
    AND user_roles.role = 'mentor'
  )
);
