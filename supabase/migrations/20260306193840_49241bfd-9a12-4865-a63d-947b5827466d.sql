
-- Add admin-useful columns to existing oa_questions
ALTER TABLE public.oa_questions 
  ADD COLUMN IF NOT EXISTS company TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS topic TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS input_format TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS output_format TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS constraints_text TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS sample_input TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS sample_output TEXT DEFAULT '';

-- OA Testcases table
CREATE TABLE IF NOT EXISTS public.oa_testcases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.oa_questions(id) ON DELETE CASCADE,
  input TEXT NOT NULL DEFAULT '',
  output TEXT NOT NULL DEFAULT '',
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OA Sets table
CREATE TABLE IF NOT EXISTS public.oa_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  duration_minutes INT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OA Set Problems junction
CREATE TABLE IF NOT EXISTS public.oa_set_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES public.oa_sets(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.oa_questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(set_id, question_id)
);

-- Enable RLS
ALTER TABLE public.oa_testcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oa_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oa_set_problems ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins full access oa_questions" ON public.oa_questions
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins full access oa_testcases" ON public.oa_testcases
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins full access oa_sets" ON public.oa_sets
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins full access oa_set_problems" ON public.oa_set_problems
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Read access for students
CREATE POLICY "Authenticated read oa_testcases" ON public.oa_testcases
  FOR SELECT TO authenticated USING (NOT is_hidden);

CREATE POLICY "Authenticated read oa_sets" ON public.oa_sets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read oa_set_problems" ON public.oa_set_problems
  FOR SELECT TO authenticated USING (true);
