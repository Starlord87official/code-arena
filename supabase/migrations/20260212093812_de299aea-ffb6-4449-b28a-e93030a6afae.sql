
-- ================================================================
-- DUO BATTLE SYSTEM - New Schema (parallel to legacy battle tables)
-- ================================================================

-- 1. battle_matches: Core match record
CREATE TABLE public.battle_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'quick' CHECK (mode IN ('quick', 'ranked', 'custom')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'no_contest')),
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  problem_count INTEGER NOT NULL DEFAULT 2,
  hints_enabled BOOLEAN NOT NULL DEFAULT true,
  is_rated BOOLEAN NOT NULL DEFAULT false,
  
  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Results (populated on completion)
  winner_id UUID,
  is_draw BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by UUID NOT NULL,
  invite_id UUID  -- links to battle_invites for custom duels
);

ALTER TABLE public.battle_matches ENABLE ROW LEVEL SECURITY;

-- 2. battle_participants: Players in a match
CREATE TABLE public.battle_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.battle_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Scoring
  score INTEGER NOT NULL DEFAULT 0,
  problems_solved INTEGER NOT NULL DEFAULT 0,
  wrong_submissions INTEGER NOT NULL DEFAULT 0,
  hints_used INTEGER NOT NULL DEFAULT 0,
  total_solve_time_sec INTEGER NOT NULL DEFAULT 0,
  
  -- ELO tracking
  elo_before INTEGER NOT NULL DEFAULT 1000,
  elo_after INTEGER,
  elo_change INTEGER DEFAULT 0,
  
  -- XP
  xp_earned INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  is_forfeit BOOLEAN NOT NULL DEFAULT false,
  disconnected_at TIMESTAMPTZ,
  reconnected_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(match_id, user_id)
);

ALTER TABLE public.battle_participants ENABLE ROW LEVEL SECURITY;

-- 3. battle_match_problems: Problems assigned to a match (references challenges table)
CREATE TABLE public.battle_match_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.battle_matches(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  order_index INTEGER NOT NULL DEFAULT 0,
  
  -- Points based on difficulty
  points INTEGER NOT NULL DEFAULT 100,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(match_id, challenge_id)
);

ALTER TABLE public.battle_match_problems ENABLE ROW LEVEL SECURITY;

-- 4. battle_match_submissions: Code submissions during a match
CREATE TABLE public.battle_match_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.battle_matches(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.battle_match_problems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  code TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'cpp',
  
  -- Result
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error')),
  score INTEGER NOT NULL DEFAULT 0,
  runtime_ms INTEGER,
  memory_kb INTEGER,
  testcases_passed INTEGER DEFAULT 0,
  testcases_total INTEGER DEFAULT 0,
  
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.battle_match_submissions ENABLE ROW LEVEL SECURITY;

-- 5. battle_invites: Custom duel invitations
CREATE TABLE public.battle_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  
  -- Custom settings
  duration_minutes INTEGER NOT NULL DEFAULT 15 CHECK (duration_minutes >= 10 AND duration_minutes <= 60),
  problem_count INTEGER NOT NULL DEFAULT 2 CHECK (problem_count >= 1 AND problem_count <= 5),
  difficulty_mix TEXT[] NOT NULL DEFAULT ARRAY['easy', 'medium'],
  hints_enabled BOOLEAN NOT NULL DEFAULT true,
  is_rated BOOLEAN NOT NULL DEFAULT false,
  
  -- State
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  match_id UUID REFERENCES public.battle_matches(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  responded_at TIMESTAMPTZ,
  
  -- Prevent duplicate pending invites
  CONSTRAINT no_self_invite CHECK (sender_id != receiver_id)
);

ALTER TABLE public.battle_invites ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES
-- ================================================================

-- battle_matches: Users can only see matches they participate in
CREATE POLICY "Users can view their own matches"
  ON public.battle_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battle_participants bp
      WHERE bp.match_id = battle_matches.id AND bp.user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "No direct insert to battle_matches"
  ON public.battle_matches FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update to battle_matches"
  ON public.battle_matches FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete of battle_matches"
  ON public.battle_matches FOR DELETE
  USING (false);

-- battle_participants: Users can view participants of their matches
CREATE POLICY "Users can view participants of their matches"
  ON public.battle_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battle_participants bp2
      WHERE bp2.match_id = battle_participants.match_id AND bp2.user_id = auth.uid()
    )
  );

CREATE POLICY "No direct insert to battle_participants"
  ON public.battle_participants FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update to battle_participants"
  ON public.battle_participants FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete of battle_participants"
  ON public.battle_participants FOR DELETE
  USING (false);

-- battle_match_problems: Users can view problems of their matches
CREATE POLICY "Users can view problems of their matches"
  ON public.battle_match_problems FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battle_participants bp
      WHERE bp.match_id = battle_match_problems.match_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "No direct insert to battle_match_problems"
  ON public.battle_match_problems FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct delete of battle_match_problems"
  ON public.battle_match_problems FOR DELETE
  USING (false);

-- battle_match_submissions: Users can view submissions of their matches, insert for active matches
CREATE POLICY "Users can view submissions of their matches"
  ON public.battle_match_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battle_participants bp
      WHERE bp.match_id = battle_match_submissions.match_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can submit to active matches"
  ON public.battle_match_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.battle_matches bm
      WHERE bm.id = battle_match_submissions.match_id AND bm.status = 'active'
    )
    AND EXISTS (
      SELECT 1 FROM public.battle_participants bp
      WHERE bp.match_id = battle_match_submissions.match_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "No direct update to battle_match_submissions"
  ON public.battle_match_submissions FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete of battle_match_submissions"
  ON public.battle_match_submissions FOR DELETE
  USING (false);

-- battle_invites: sender and receiver can view, sender can cancel, receiver can accept/decline
CREATE POLICY "Users can view their invites"
  ON public.battle_invites FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send invites"
  ON public.battle_invites FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND status = 'pending');

CREATE POLICY "Sender can cancel, receiver can respond"
  ON public.battle_invites FOR UPDATE
  USING (
    (sender_id = auth.uid() AND status = 'pending')
    OR (receiver_id = auth.uid() AND status = 'pending')
  );

CREATE POLICY "Sender can delete cancelled invites"
  ON public.battle_invites FOR DELETE
  USING (sender_id = auth.uid() AND status IN ('cancelled', 'expired', 'declined'));

-- ================================================================
-- INDEXES for performance
-- ================================================================
CREATE INDEX idx_battle_participants_match ON public.battle_participants(match_id);
CREATE INDEX idx_battle_participants_user ON public.battle_participants(user_id);
CREATE INDEX idx_battle_match_problems_match ON public.battle_match_problems(match_id);
CREATE INDEX idx_battle_match_submissions_match ON public.battle_match_submissions(match_id);
CREATE INDEX idx_battle_match_submissions_user ON public.battle_match_submissions(user_id);
CREATE INDEX idx_battle_invites_receiver ON public.battle_invites(receiver_id, status);
CREATE INDEX idx_battle_invites_sender ON public.battle_invites(sender_id, status);
CREATE INDEX idx_battle_matches_status ON public.battle_matches(status);
