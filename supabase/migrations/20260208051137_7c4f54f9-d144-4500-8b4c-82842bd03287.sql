
-- =============================================
-- CONTEST MODULE: Complete Database Schema
-- =============================================

-- 1. Contests table
CREATE TABLE public.contests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'elite')),
  format TEXT NOT NULL DEFAULT 'icpc' CHECK (format IN ('icpc', 'ioi', 'mixed')),
  mode TEXT NOT NULL DEFAULT 'solo' CHECK (mode IN ('solo', 'duo', 'clan')),
  duration_minutes INT NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'live', 'ended')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_participants INT DEFAULT 500,
  xp_reward INT NOT NULL DEFAULT 100,
  rating_impact BOOLEAN NOT NULL DEFAULT true,
  is_championship_qualifier BOOLEAN NOT NULL DEFAULT false,
  rules_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Contest problems
CREATE TABLE public.contest_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  constraints_text TEXT[],
  examples JSONB NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  points INT NOT NULL DEFAULT 100,
  time_limit_ms INT NOT NULL DEFAULT 2000,
  memory_limit_kb INT NOT NULL DEFAULT 262144,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Problem testcases
CREATE TABLE public.problem_testcases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID NOT NULL REFERENCES public.contest_problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 0
);

-- 4. Contest registrations
CREATE TABLE public.contest_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID,
  language TEXT DEFAULT 'cpp',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

-- 5. Contest teams
CREATE TABLE public.contest_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  clan_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Contest submissions
CREATE TABLE public.contest_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.contest_problems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.contest_teams(id),
  language TEXT NOT NULL DEFAULT 'cpp',
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'judging', 'accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compilation_error')),
  score INT DEFAULT 0,
  runtime_ms INT,
  memory_kb INT,
  testcases_passed INT DEFAULT 0,
  testcases_total INT DEFAULT 0,
  penalty_time INT DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. User ratings
CREATE TABLE public.user_contest_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  rating INT NOT NULL DEFAULT 1200,
  max_rating INT NOT NULL DEFAULT 1200,
  contests_played INT NOT NULL DEFAULT 0,
  best_rank INT,
  current_streak INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Rating changes
CREATE TABLE public.contest_rating_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  old_rating INT NOT NULL,
  new_rating INT NOT NULL,
  delta INT NOT NULL,
  rank INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Contest announcements
CREATE TABLE public.contest_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Contest integrity tracking
CREATE TABLE public.contest_integrity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tab_switches INT NOT NULL DEFAULT 0,
  fullscreen_exits INT NOT NULL DEFAULT 0,
  copy_paste_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

-- Enable RLS
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_testcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contest_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_rating_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_integrity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "contests_select" ON public.contests FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "contest_problems_select" ON public.contest_problems FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.contests c WHERE c.id = contest_id AND c.status IN ('live', 'ended'))
    AND EXISTS (SELECT 1 FROM public.contest_registrations cr WHERE cr.contest_id = contest_problems.contest_id AND cr.user_id = auth.uid())
  );

CREATE POLICY "testcases_select" ON public.problem_testcases FOR SELECT USING (is_sample = true AND auth.uid() IS NOT NULL);

CREATE POLICY "registrations_select" ON public.contest_registrations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "registrations_insert" ON public.contest_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "registrations_delete" ON public.contest_registrations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "teams_select" ON public.contest_teams FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "teams_insert" ON public.contest_teams FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "submissions_select" ON public.contest_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "submissions_insert" ON public.contest_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_select" ON public.user_contest_ratings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "ratings_insert" ON public.user_contest_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_update" ON public.user_contest_ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "rating_changes_select" ON public.contest_rating_changes FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "announcements_select" ON public.contest_announcements FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "integrity_select" ON public.contest_integrity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "integrity_insert" ON public.contest_integrity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "integrity_update" ON public.contest_integrity FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_contest_problems_contest ON public.contest_problems(contest_id);
CREATE INDEX idx_contest_registrations_contest ON public.contest_registrations(contest_id);
CREATE INDEX idx_contest_registrations_user ON public.contest_registrations(user_id);
CREATE INDEX idx_contest_submissions_contest ON public.contest_submissions(contest_id);
CREATE INDEX idx_contest_submissions_user ON public.contest_submissions(user_id);
CREATE INDEX idx_contest_submissions_problem ON public.contest_submissions(problem_id);
CREATE INDEX idx_contest_rating_changes_contest ON public.contest_rating_changes(contest_id);
CREATE INDEX idx_contest_rating_changes_user ON public.contest_rating_changes(user_id);
CREATE INDEX idx_contests_status ON public.contests(status);
CREATE INDEX idx_contests_start_time ON public.contests(start_time);

-- =============================================
-- SEED DATA with valid UUIDs
-- =============================================

-- Seed: 5 demo contests
INSERT INTO public.contests (id, title, description, difficulty, format, mode, duration_minutes, status, start_time, end_time, max_participants, xp_reward, rating_impact, is_championship_qualifier) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-000000000001', 'Sprint Alpha', 'Quick 30-minute sprint. 2 problems. Perfect for warm-up.', 'beginner', 'mixed', 'solo', 30, 'upcoming', now() + interval '2 days', now() + interval '2 days' + interval '30 minutes', 200, 50, true, false),
  ('a1b2c3d4-e5f6-4a7b-8c9d-000000000002', 'CodeLock Weekly #12', 'Standard weekly rated contest. 3 original problems.', 'intermediate', 'icpc', 'solo', 60, 'upcoming', now() + interval '5 days', now() + interval '5 days' + interval '60 minutes', 500, 100, true, false),
  ('a1b2c3d4-e5f6-4a7b-8c9d-000000000003', 'Elite Showdown', 'A live 90-minute IOI-style contest. Partial scoring.', 'elite', 'ioi', 'solo', 90, 'live', now() - interval '30 minutes', now() + interval '60 minutes', 300, 200, true, true),
  ('a1b2c3d4-e5f6-4a7b-8c9d-000000000004', 'Weekly Blitz #11', 'Last week''s rated contest. ICPC format.', 'intermediate', 'icpc', 'solo', 60, 'ended', now() - interval '7 days', now() - interval '7 days' + interval '60 minutes', 500, 100, true, false),
  ('a1b2c3d4-e5f6-4a7b-8c9d-000000000005', 'Clan Championship Qualifier', 'Clan-mode qualifier for the championship. Best 5 members score.', 'elite', 'ioi', 'clan', 120, 'ended', now() - interval '14 days', now() - interval '14 days' + interval '120 minutes', 100, 250, true, true);

-- Seed: Problems for Elite Showdown (live)
INSERT INTO public.contest_problems (id, contest_id, label, title, problem_statement, constraints_text, examples, difficulty, points, order_index) VALUES
  ('b2c3d4e5-f6a7-4b8c-9d0e-000000000001', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000003', 'A', 'Matrix Signal', 'Given a 2D matrix of integers, find the maximum sum submatrix of size K×K.', ARRAY['1 ≤ N, M ≤ 1000', '1 ≤ K ≤ min(N,M)'], '[{"input": "3 3 2\n1 2 3\n4 5 6\n7 8 9", "output": "28"}]', 'medium', 100, 0),
  ('b2c3d4e5-f6a7-4b8c-9d0e-000000000002', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000003', 'B', 'Token Sequence', 'Given a string of tokens, find the longest subsequence where no two adjacent tokens share a common character.', ARRAY['1 ≤ |S| ≤ 100000', 'Tokens are lowercase alpha strings'], '[{"input": "abc bcd cde def", "output": "2"}]', 'hard', 200, 1),
  ('b2c3d4e5-f6a7-4b8c-9d0e-000000000003', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000003', 'C', 'Grid Walker', 'Count distinct paths in a weighted grid from (1,1) to (N,M) where the path sum is exactly K.', ARRAY['1 ≤ N, M ≤ 50', '0 ≤ grid[i][j] ≤ 100'], '[{"input": "2 2 3\n1 2\n1 1", "output": "1"}]', 'hard', 300, 2),
  ('b2c3d4e5-f6a7-4b8c-9d0e-000000000004', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000003', 'D', 'Quantum Bridge', 'Find the maximum flow while minimizing bridges used between N islands.', ARRAY['2 ≤ N ≤ 500', '1 ≤ M ≤ 5000'], '[{"input": "4 5\n1 2 10\n1 3 5\n2 4 8\n3 4 7\n2 3 3", "output": "15 3"}]', 'extreme', 400, 3);

-- Seed: Problems for Weekly Blitz #11 (ended)
INSERT INTO public.contest_problems (contest_id, label, title, problem_statement, constraints_text, examples, difficulty, points, order_index) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-000000000004', 'A', 'Balanced Brackets', 'Check if a string of brackets is balanced.', ARRAY['1 ≤ |S| ≤ 100000'], '[{"input": "(())", "output": "YES"}]', 'easy', 100, 0),
  ('a1b2c3d4-e5f6-4a7b-8c9d-000000000004', 'B', 'Prefix XOR', 'Find the maximum XOR of any subarray.', ARRAY['1 ≤ N ≤ 100000'], '[{"input": "3\n1 2 3", "output": "3"}]', 'medium', 200, 1),
  ('a1b2c3d4-e5f6-4a7b-8c9d-000000000004', 'C', 'Tree Distances', 'Find the diameter of a tree.', ARRAY['2 ≤ N ≤ 200000'], '[{"input": "5\n1 2\n1 3\n3 4\n3 5", "output": "3"}]', 'hard', 300, 2);
