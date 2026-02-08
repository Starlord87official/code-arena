
-- =============================================
-- CLAN ARENA MODULE - Full Database Schema
-- =============================================

-- 1. Clans table (the core entity)
CREATE TABLE public.clans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  tag text NOT NULL UNIQUE,
  description text,
  motto text,
  privacy text NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  max_members integer NOT NULL DEFAULT 10 CHECK (max_members IN (5, 10, 15)),
  level integer NOT NULL DEFAULT 1,
  total_xp bigint NOT NULL DEFAULT 0,
  weekly_xp bigint NOT NULL DEFAULT 0,
  rank_tier text NOT NULL DEFAULT 'bronze' CHECK (rank_tier IN ('bronze', 'silver', 'gold', 'elite', 'legend')),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Clan Members (one user = one clan enforced by unique user_id)
CREATE TABLE public.clan_members_v2 (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'co_leader', 'member')),
  weekly_xp bigint NOT NULL DEFAULT 0,
  total_xp bigint NOT NULL DEFAULT 0,
  daily_xp_today bigint NOT NULL DEFAULT 0,
  daily_xp_date date NOT NULL DEFAULT CURRENT_DATE,
  last_active_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Clan Applications (public clans: apply + approve)
CREATE TABLE public.clan_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(clan_id, user_id)
);

-- 4. Clan Invites (private clans: invite-only)
CREATE TABLE public.clan_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(clan_id, user_id)
);

-- 5. Clan Wars (weekly matchups)
CREATE TABLE public.clan_wars (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start date NOT NULL,
  clan_a uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  clan_b uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  score_a bigint NOT NULL DEFAULT 0,
  score_b bigint NOT NULL DEFAULT 0,
  result text NOT NULL DEFAULT 'pending' CHECK (result IN ('a_win', 'b_win', 'draw', 'pending')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Clan War Contributions (per member per war)
CREATE TABLE public.clan_war_contributions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_war_id uuid NOT NULL REFERENCES public.clan_wars(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  points bigint NOT NULL DEFAULT 0,
  source text NOT NULL CHECK (source IN ('challenge', 'oa', 'championship')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Clan Activity Log (internal feed)
CREATE TABLE public.clan_activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Clan Quests (weekly objectives)
CREATE TABLE public.clan_quests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start date NOT NULL,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  quest_type text NOT NULL,
  target integer NOT NULL DEFAULT 0,
  progress integer NOT NULL DEFAULT 0,
  reward_xp integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_clan_members_v2_clan ON public.clan_members_v2(clan_id);
CREATE INDEX idx_clan_members_v2_user ON public.clan_members_v2(user_id);
CREATE INDEX idx_clan_applications_clan ON public.clan_applications(clan_id);
CREATE INDEX idx_clan_applications_user ON public.clan_applications(user_id);
CREATE INDEX idx_clan_invites_user ON public.clan_invites(user_id);
CREATE INDEX idx_clan_activity_log_clan ON public.clan_activity_log(clan_id);
CREATE INDEX idx_clan_quests_clan_week ON public.clan_quests(clan_id, week_start);
CREATE INDEX idx_clan_wars_week ON public.clan_wars(week_start);
CREATE INDEX idx_clans_rank ON public.clans(rank_tier);
CREATE INDEX idx_clans_weekly_xp ON public.clans(weekly_xp DESC);

-- =============================================
-- RLS POLICIES
-- =============================================

-- CLANS
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public clans are visible to all authenticated users"
  ON public.clans FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only creator can insert clan"
  ON public.clans FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Leader or co_leader can update clan"
  ON public.clans FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clan_members_v2
    WHERE clan_members_v2.clan_id = clans.id
      AND clan_members_v2.user_id = auth.uid()
      AND clan_members_v2.role IN ('leader', 'co_leader')
  ));

CREATE POLICY "Only leader can delete clan"
  ON public.clans FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.clan_members_v2
    WHERE clan_members_v2.clan_id = clans.id
      AND clan_members_v2.user_id = auth.uid()
      AND clan_members_v2.role = 'leader'
  ));

-- CLAN MEMBERS V2
ALTER TABLE public.clan_members_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan members visible to same-clan members"
  ON public.clan_members_v2 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clan_members_v2 cm
      WHERE cm.clan_id = clan_members_v2.clan_id
        AND cm.user_id = auth.uid()
    )
    OR
    -- Also allow viewing for clan browsing (public clan member counts)
    EXISTS (
      SELECT 1 FROM public.clans c
      WHERE c.id = clan_members_v2.clan_id AND c.privacy = 'public'
    )
  );

CREATE POLICY "No direct insert to clan_members_v2"
  ON public.clan_members_v2 FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Members can update their own record"
  ON public.clan_members_v2 FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Members can leave or leaders can remove"
  ON public.clan_members_v2 FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.clan_members_v2 cm
      WHERE cm.clan_id = clan_members_v2.clan_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('leader', 'co_leader')
    )
  );

-- CLAN APPLICATIONS
ALTER TABLE public.clan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications"
  ON public.clan_applications FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.clan_members_v2 cm
      WHERE cm.clan_id = clan_applications.clan_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('leader', 'co_leader')
    )
  );

CREATE POLICY "Users can apply to public clans"
  ON public.clan_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.clans c WHERE c.id = clan_id AND c.privacy = 'public')
  );

CREATE POLICY "Leaders can update applications"
  ON public.clan_applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clan_members_v2 cm
    WHERE cm.clan_id = clan_applications.clan_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('leader', 'co_leader')
  ));

CREATE POLICY "Users can delete own pending applications"
  ON public.clan_applications FOR DELETE
  USING (user_id = auth.uid() AND status = 'pending');

-- CLAN INVITES
ALTER TABLE public.clan_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites sent to them"
  ON public.clan_invites FOR SELECT
  USING (
    user_id = auth.uid()
    OR invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.clan_members_v2 cm
      WHERE cm.clan_id = clan_invites.clan_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('leader', 'co_leader')
    )
  );

CREATE POLICY "Leader/co-leader can create invites"
  ON public.clan_invites FOR INSERT
  WITH CHECK (
    auth.uid() = invited_by
    AND EXISTS (
      SELECT 1 FROM public.clan_members_v2 cm
      WHERE cm.clan_id = clan_invites.clan_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('leader', 'co_leader')
    )
  );

CREATE POLICY "Invitees can update invite status"
  ON public.clan_invites FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Inviter or invitee can delete invite"
  ON public.clan_invites FOR DELETE
  USING (user_id = auth.uid() OR invited_by = auth.uid());

-- CLAN WARS
ALTER TABLE public.clan_wars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan wars are readable by authenticated users"
  ON public.clan_wars FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "No direct insert to clan_wars"
  ON public.clan_wars FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update to clan_wars"
  ON public.clan_wars FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete of clan_wars"
  ON public.clan_wars FOR DELETE
  USING (false);

-- CLAN WAR CONTRIBUTIONS
ALTER TABLE public.clan_war_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "War contributions readable by authenticated users"
  ON public.clan_war_contributions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "No direct insert to war contributions"
  ON public.clan_war_contributions FOR INSERT
  WITH CHECK (false);

-- CLAN ACTIVITY LOG
ALTER TABLE public.clan_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan members can read activity log"
  ON public.clan_activity_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clan_members_v2 cm
    WHERE cm.clan_id = clan_activity_log.clan_id
      AND cm.user_id = auth.uid()
  ));

CREATE POLICY "No direct insert to activity log"
  ON public.clan_activity_log FOR INSERT
  WITH CHECK (false);

-- CLAN QUESTS
ALTER TABLE public.clan_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan members can read quests"
  ON public.clan_quests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clan_members_v2 cm
    WHERE cm.clan_id = clan_quests.clan_id
      AND cm.user_id = auth.uid()
  ));

CREATE POLICY "No direct insert to quests"
  ON public.clan_quests FOR INSERT
  WITH CHECK (false);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Create Clan (RPC)
CREATE OR REPLACE FUNCTION public.create_clan(
  p_name text,
  p_tag text,
  p_description text DEFAULT NULL,
  p_motto text DEFAULT NULL,
  p_privacy text DEFAULT 'public',
  p_max_members integer DEFAULT 10,
  p_timezone text DEFAULT 'Asia/Kolkata'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_clan_id uuid;
  v_existing_membership uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check user not already in a clan
  SELECT id INTO v_existing_membership FROM clan_members_v2 WHERE user_id = v_user_id;
  IF v_existing_membership IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'You are already in a clan. Leave your current clan first.');
  END IF;

  -- Validate tag format
  IF length(p_tag) < 3 OR length(p_tag) > 5 OR p_tag != upper(p_tag) THEN
    RETURN json_build_object('success', false, 'error', 'Tag must be 3-5 uppercase characters');
  END IF;

  -- Validate privacy
  IF p_privacy NOT IN ('public', 'private') THEN
    RETURN json_build_object('success', false, 'error', 'Privacy must be public or private');
  END IF;

  -- Validate max_members
  IF p_max_members NOT IN (5, 10, 15) THEN
    RETURN json_build_object('success', false, 'error', 'Max members must be 5, 10, or 15');
  END IF;

  -- Insert clan
  INSERT INTO clans (name, tag, description, motto, privacy, max_members, timezone, created_by)
  VALUES (p_name, p_tag, p_description, p_motto, p_privacy, p_max_members, p_timezone, v_user_id)
  RETURNING id INTO v_clan_id;

  -- Insert creator as leader
  INSERT INTO clan_members_v2 (clan_id, user_id, role)
  VALUES (v_clan_id, v_user_id, 'leader');

  -- Log activity
  INSERT INTO clan_activity_log (clan_id, type, message, meta)
  VALUES (v_clan_id, 'clan_created', 'Clan was created', json_build_object('created_by', v_user_id)::jsonb);

  RETURN json_build_object('success', true, 'clan_id', v_clan_id);
END;
$$;

-- Apply to Clan (RPC)
CREATE OR REPLACE FUNCTION public.apply_to_clan(p_clan_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_clan record;
  v_existing_membership uuid;
  v_member_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check user not already in a clan
  SELECT id INTO v_existing_membership FROM clan_members_v2 WHERE user_id = v_user_id;
  IF v_existing_membership IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'You are already in a clan');
  END IF;

  -- Get clan info
  SELECT * INTO v_clan FROM clans WHERE id = p_clan_id;
  IF v_clan IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Clan not found');
  END IF;

  IF v_clan.privacy != 'public' THEN
    RETURN json_build_object('success', false, 'error', 'This clan is invite-only');
  END IF;

  -- Check capacity
  SELECT count(*) INTO v_member_count FROM clan_members_v2 WHERE clan_id = p_clan_id;
  IF v_member_count >= v_clan.max_members THEN
    RETURN json_build_object('success', false, 'error', 'Clan is full');
  END IF;

  -- Insert or update application
  INSERT INTO clan_applications (clan_id, user_id, status)
  VALUES (p_clan_id, v_user_id, 'pending')
  ON CONFLICT (clan_id, user_id) DO UPDATE SET status = 'pending', created_at = now();

  RETURN json_build_object('success', true, 'message', 'Application submitted');
END;
$$;

-- Approve Application (RPC)
CREATE OR REPLACE FUNCTION public.approve_clan_application(p_application_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_app record;
  v_clan record;
  v_member_count integer;
  v_applicant_username text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_app FROM clan_applications WHERE id = p_application_id AND status = 'pending';
  IF v_app IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Application not found or already processed');
  END IF;

  -- Check caller is leader/co_leader
  IF NOT EXISTS (
    SELECT 1 FROM clan_members_v2
    WHERE clan_id = v_app.clan_id AND user_id = v_user_id AND role IN ('leader', 'co_leader')
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Only leaders can approve applications');
  END IF;

  -- Check applicant not already in a clan
  IF EXISTS (SELECT 1 FROM clan_members_v2 WHERE user_id = v_app.user_id) THEN
    UPDATE clan_applications SET status = 'rejected' WHERE id = p_application_id;
    RETURN json_build_object('success', false, 'error', 'Applicant is already in a clan');
  END IF;

  -- Check capacity
  SELECT * INTO v_clan FROM clans WHERE id = v_app.clan_id;
  SELECT count(*) INTO v_member_count FROM clan_members_v2 WHERE clan_id = v_app.clan_id;
  IF v_member_count >= v_clan.max_members THEN
    RETURN json_build_object('success', false, 'error', 'Clan is full');
  END IF;

  -- Approve
  UPDATE clan_applications SET status = 'approved' WHERE id = p_application_id;

  -- Add member
  INSERT INTO clan_members_v2 (clan_id, user_id, role)
  VALUES (v_app.clan_id, v_app.user_id, 'member');

  -- Get username for log
  SELECT username INTO v_applicant_username FROM profiles WHERE id = v_app.user_id;

  -- Log activity
  INSERT INTO clan_activity_log (clan_id, type, message, meta)
  VALUES (v_app.clan_id, 'member_joined', coalesce(v_applicant_username, 'A new member') || ' joined the clan',
    json_build_object('user_id', v_app.user_id)::jsonb);

  RETURN json_build_object('success', true, 'message', 'Application approved');
END;
$$;

-- Leave Clan (RPC)
CREATE OR REPLACE FUNCTION public.leave_clan_v2()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_membership record;
  v_member_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_membership FROM clan_members_v2 WHERE user_id = v_user_id;
  IF v_membership IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'You are not in a clan');
  END IF;

  -- Leader cannot leave without transferring
  IF v_membership.role = 'leader' THEN
    SELECT count(*) INTO v_member_count FROM clan_members_v2 WHERE clan_id = v_membership.clan_id;
    IF v_member_count > 1 THEN
      RETURN json_build_object('success', false, 'error', 'Transfer leadership before leaving. You are the leader.');
    END IF;
    -- If leader is only member, delete the clan
    DELETE FROM clans WHERE id = v_membership.clan_id;
    RETURN json_build_object('success', true, 'message', 'You left and the clan was disbanded');
  END IF;

  -- Remove member
  DELETE FROM clan_members_v2 WHERE id = v_membership.id;

  -- Log activity
  INSERT INTO clan_activity_log (clan_id, type, message, meta)
  VALUES (v_membership.clan_id, 'member_left', 'A member left the clan',
    json_build_object('user_id', v_user_id)::jsonb);

  RETURN json_build_object('success', true, 'message', 'You have left the clan');
END;
$$;

-- Transfer Leadership (RPC)
CREATE OR REPLACE FUNCTION public.transfer_clan_leadership(p_new_leader_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_membership record;
  v_target_membership record;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_membership FROM clan_members_v2 WHERE user_id = v_user_id AND role = 'leader';
  IF v_membership IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'You are not a clan leader');
  END IF;

  SELECT * INTO v_target_membership FROM clan_members_v2
  WHERE user_id = p_new_leader_id AND clan_id = v_membership.clan_id;
  IF v_target_membership IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Target user is not in your clan');
  END IF;

  -- Transfer
  UPDATE clan_members_v2 SET role = 'member' WHERE id = v_membership.id;
  UPDATE clan_members_v2 SET role = 'leader' WHERE id = v_target_membership.id;

  -- Log
  INSERT INTO clan_activity_log (clan_id, type, message, meta)
  VALUES (v_membership.clan_id, 'leadership_transferred', 'Leadership was transferred',
    json_build_object('from', v_user_id, 'to', p_new_leader_id)::jsonb);

  RETURN json_build_object('success', true, 'message', 'Leadership transferred');
END;
$$;

-- =============================================
-- SEED DATA (3 demo clans + members + wars + quests)
-- =============================================

-- Note: We use static UUIDs for seed data so UI can reference them
DO $$
DECLARE
  clan1_id uuid := 'a1111111-1111-1111-1111-111111111111';
  clan2_id uuid := 'b2222222-2222-2222-2222-222222222222';
  clan3_id uuid := 'c3333333-3333-3333-3333-333333333333';
  fake_user uuid := '00000000-0000-0000-0000-000000000001';
  this_week date := date_trunc('week', now())::date;
  last_week date := (date_trunc('week', now()) - interval '7 days')::date;
BEGIN
  -- Insert demo clans (bypass RLS via DO block in migration)
  INSERT INTO clans (id, name, tag, description, motto, privacy, max_members, level, total_xp, weekly_xp, rank_tier, created_by)
  VALUES
    (clan1_id, 'Code Titans', 'TITAN', 'Elite competitive coding squad. We grind OAs and dominate wars.', 'Code or Die', 'public', 15, 8, 45200, 3800, 'gold', fake_user),
    (clan2_id, 'Binary Beasts', 'BEAST', 'Rising stars focused on DSA mastery and interview prep.', 'Binary > Everything', 'public', 10, 5, 22100, 1900, 'silver', fake_user),
    (clan3_id, 'Shadow Coders', 'SHDW', 'Invite-only elite clan. Top performers only.', 'In the shadows, we compile', 'private', 5, 12, 78500, 6200, 'elite', fake_user)
  ON CONFLICT (name) DO NOTHING;

  -- Seed wars
  INSERT INTO clan_wars (week_start, clan_a, clan_b, score_a, score_b, result)
  VALUES
    (last_week, clan1_id, clan2_id, 4200, 3100, 'a_win'),
    (last_week, clan3_id, clan1_id, 5800, 4500, 'a_win'),
    (this_week, clan1_id, clan3_id, 1200, 1800, 'pending')
  ON CONFLICT DO NOTHING;

  -- Seed quests for this week
  INSERT INTO clan_quests (week_start, clan_id, quest_type, target, progress, reward_xp)
  VALUES
    (this_week, clan1_id, 'Solve 80 problems', 80, 34, 500),
    (this_week, clan1_id, 'Complete 20 OAs', 20, 8, 300),
    (this_week, clan1_id, 'Win 3 challenge battles', 3, 1, 200),
    (this_week, clan2_id, 'Solve 60 problems', 60, 22, 400),
    (this_week, clan2_id, 'Complete 15 OAs', 15, 5, 250),
    (this_week, clan3_id, 'Solve 100 problems', 100, 67, 600),
    (this_week, clan3_id, 'Win 5 challenge battles', 5, 3, 350)
  ON CONFLICT DO NOTHING;

  -- Seed activity logs
  INSERT INTO clan_activity_log (clan_id, type, message, meta)
  VALUES
    (clan1_id, 'challenge_solved', 'Tony completed Hard DSA challenge (+80 Clan XP)', '{"xp": 80}'::jsonb),
    (clan1_id, 'oa_completed', 'Sarah finished SDE-1 OA (Score: 85%) (+120 Clan XP)', '{"xp": 120, "score": 85}'::jsonb),
    (clan1_id, 'war_won', 'Clan War won vs Binary Beasts! (+500 XP)', '{"xp": 500}'::jsonb),
    (clan1_id, 'quest_completed', 'Weekly quest completed: Solve 80 problems', '{"quest": "Solve 80 problems"}'::jsonb),
    (clan1_id, 'member_joined', 'Alex joined the clan', '{}'::jsonb),
    (clan2_id, 'challenge_solved', 'Mike solved Medium Array problem (+40 Clan XP)', '{"xp": 40}'::jsonb),
    (clan2_id, 'oa_completed', 'Lisa completed Backend OA (Score: 72%) (+90 Clan XP)', '{"xp": 90}'::jsonb),
    (clan2_id, 'member_joined', 'New member joined the clan', '{}'::jsonb),
    (clan3_id, 'war_won', 'Clan War won vs Code Titans! (+600 XP)', '{"xp": 600}'::jsonb),
    (clan3_id, 'challenge_solved', 'Ghost solved Hard Graph problem (+80 Clan XP)', '{"xp": 80}'::jsonb),
    (clan3_id, 'oa_completed', 'Phantom aced SDE-2 OA (Score: 95%) (+150 Clan XP)', '{"xp": 150}'::jsonb)
  ON CONFLICT DO NOTHING;
END $$;
