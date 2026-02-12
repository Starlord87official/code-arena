
-- Create the update_updated_at function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Training Cards table
CREATE TABLE public.lockin_training_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  goal text NOT NULL CHECK (goal IN ('big_tech', 'product', 'oa_sprint', 'placement')),
  focus text NOT NULL CHECK (focus IN ('medium_focused', 'topic_focused', 'company_focused')),
  solved_count integer NOT NULL DEFAULT 0,
  internal_rating integer NOT NULL DEFAULT 1200,
  contest_rating text,
  daily_commitment integer NOT NULL DEFAULT 60 CHECK (daily_commitment IN (30, 60, 90)),
  preferred_slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  language text NOT NULL CHECK (language IN ('cpp', 'java', 'python')),
  pace text NOT NULL CHECK (pace IN ('fast', 'steady', 'slow_deep')),
  comm_style text NOT NULL CHECK (comm_style IN ('chat_only', 'voice_weekends', 'text_summaries')),
  accountability_style text NOT NULL CHECK (accountability_style IN ('strict', 'supportive', 'mixed')),
  no_ghosting_rule boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_card_per_user UNIQUE (user_id)
);

ALTER TABLE public.lockin_training_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all public training cards"
  ON public.lockin_training_cards FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert own training card"
  ON public.lockin_training_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own training card"
  ON public.lockin_training_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own training card"
  ON public.lockin_training_cards FOR DELETE USING (auth.uid() = user_id);

-- Partner stats
CREATE TABLE public.lockin_partner_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  reliability_score integer NOT NULL DEFAULT 0,
  discipline_score integer NOT NULL DEFAULT 0,
  chemistry_score integer NOT NULL DEFAULT 0,
  clutch_score integer NOT NULL DEFAULT 0,
  completed_contracts integer NOT NULL DEFAULT 0,
  total_contracts integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lockin_partner_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view partner stats"
  ON public.lockin_partner_stats FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert own stats"
  ON public.lockin_partner_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats"
  ON public.lockin_partner_stats FOR UPDATE USING (auth.uid() = user_id);

-- Contracts table
CREATE TABLE public.lockin_contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_a_id uuid NOT NULL,
  partner_b_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'abandoned')),
  start_date timestamptz,
  end_date timestamptz,
  daily_target integer NOT NULL DEFAULT 2,
  duo_streak integer NOT NULL DEFAULT 0,
  gap_list text[] NOT NULL DEFAULT '{}',
  next_trial_date timestamptz,
  next_trial_format text DEFAULT 'trial_a' CHECK (next_trial_format IN ('trial_a', 'trial_b', 'trial_c')),
  accepted_by_a boolean NOT NULL DEFAULT false,
  accepted_by_b boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lockin_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contracts"
  ON public.lockin_contracts FOR SELECT USING (auth.uid() = partner_a_id OR auth.uid() = partner_b_id);
CREATE POLICY "Users can create contracts"
  ON public.lockin_contracts FOR INSERT WITH CHECK (auth.uid() = partner_a_id);
CREATE POLICY "Participants can update own contracts"
  ON public.lockin_contracts FOR UPDATE USING (auth.uid() = partner_a_id OR auth.uid() = partner_b_id);

-- Contract missions
CREATE TABLE public.lockin_contract_missions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.lockin_contracts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  mission_date date NOT NULL DEFAULT CURRENT_DATE,
  task_type text NOT NULL CHECK (task_type IN ('new_problem', 'revision', 'trial_prep')),
  title text NOT NULL,
  problem_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'recovery')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lockin_contract_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contract missions"
  ON public.lockin_contract_missions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.lockin_contracts c
    WHERE c.id = contract_id AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
  ));
CREATE POLICY "Users can update own missions"
  ON public.lockin_contract_missions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert missions"
  ON public.lockin_contract_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.lockin_contracts c
    WHERE c.id = contract_id AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
  ));

-- Trials table
CREATE TABLE public.lockin_trials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.lockin_contracts(id) ON DELETE CASCADE,
  format text NOT NULL CHECK (format IN ('trial_a', 'trial_b', 'trial_c')),
  scheduled_at timestamptz NOT NULL,
  started_at timestamptz,
  ended_at timestamptz,
  duration_minutes integer NOT NULL DEFAULT 60,
  problems jsonb NOT NULL DEFAULT '[]'::jsonb,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lockin_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contract participants can view trials"
  ON public.lockin_trials FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.lockin_contracts c WHERE c.id = contract_id AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())));
CREATE POLICY "Contract participants can insert trials"
  ON public.lockin_trials FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.lockin_contracts c WHERE c.id = contract_id AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())));
CREATE POLICY "Contract participants can update trials"
  ON public.lockin_trials FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.lockin_contracts c WHERE c.id = contract_id AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())));

-- Trial reports
CREATE TABLE public.lockin_trial_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trial_id uuid NOT NULL REFERENCES public.lockin_trials(id) ON DELETE CASCADE,
  contract_id uuid NOT NULL REFERENCES public.lockin_contracts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  qualified boolean NOT NULL DEFAULT false,
  time_lost_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  wrong_attempt_patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  revision_plan jsonb NOT NULL DEFAULT '{"day3":[],"day7":[],"day21":[]}'::jsonb,
  next_week_plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lockin_trial_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trial reports"
  ON public.lockin_trial_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trial reports"
  ON public.lockin_trial_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Partner requests
CREATE TABLE public.lockin_partner_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT no_self_invite CHECK (sender_id != receiver_id)
);

ALTER TABLE public.lockin_partner_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own partner requests"
  ON public.lockin_partner_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send partner requests"
  ON public.lockin_partner_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can update request status"
  ON public.lockin_partner_requests FOR UPDATE USING (auth.uid() = receiver_id);

-- Triggers
CREATE TRIGGER update_lockin_training_cards_updated_at
  BEFORE UPDATE ON public.lockin_training_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lockin_contracts_updated_at
  BEFORE UPDATE ON public.lockin_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lockin_partner_stats_updated_at
  BEFORE UPDATE ON public.lockin_partner_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
