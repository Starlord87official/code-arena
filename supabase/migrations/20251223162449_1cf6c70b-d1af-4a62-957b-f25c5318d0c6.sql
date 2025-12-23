-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('mentor', 'student');

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  clan_id TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, clan_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_clan_role(_user_id UUID, _clan_id TEXT, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND clan_id = _clan_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view roles in their clans"
  ON public.user_roles
  FOR SELECT
  USING (true);

CREATE POLICY "Mentors can manage roles in their clans"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (true);

-- Create clan_announcements table
CREATE TABLE public.clan_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id TEXT NOT NULL,
  mentor_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clan_announcements ENABLE ROW LEVEL SECURITY;

-- Policies for announcements
CREATE POLICY "Announcements are publicly readable"
  ON public.clan_announcements
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create announcements"
  ON public.clan_announcements
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update announcements"
  ON public.clan_announcements
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete announcements"
  ON public.clan_announcements
  FOR DELETE
  USING (true);

-- Create clan_members table for tracking membership
CREATE TABLE public.clan_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id TEXT NOT NULL,
  user_id UUID,
  username TEXT NOT NULL,
  avatar TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clan_id, username)
);

-- Enable RLS
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;

-- Policies for clan_members
CREATE POLICY "Clan members are publicly readable"
  ON public.clan_members
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join clans"
  ON public.clan_members
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update members"
  ON public.clan_members
  FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_clan ON public.user_roles(clan_id);
CREATE INDEX idx_clan_announcements_clan ON public.clan_announcements(clan_id);
CREATE INDEX idx_clan_members_clan ON public.clan_members(clan_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_members;