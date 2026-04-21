
-- ============================================================================
-- BATTLE V2 BACKEND FOUNDATION
-- ============================================================================

-- 1. ENUMS
DO $$ BEGIN CREATE TYPE public.match_state AS ENUM ('idle','queued','match_found','ready_check','ban_pick','active','judging','completed','cancelled','abandoned','invalidated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.submission_verdict AS ENUM ('pending','accepted','wrong_answer','time_limit','runtime_error','compile_error','memory_limit','internal_error'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.anticheat_kind AS ENUM ('tab_blur','paste_burst','ai_pattern','dup_submission','collusion_window','plagiarism_score','solve_anomaly','disconnect_abuse'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.anticheat_status AS ENUM ('pending_review','dismissed','warning','penalty','match_invalidated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.season_status AS ENUM ('upcoming','active','ended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.rank_tier AS ENUM ('bronze','silver','gold','platinum','diamond','master','grandmaster','challenger'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.rank_division AS ENUM ('IV','III','II','I'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.promotion_status AS ENUM ('active','promoted','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. SEASONS
CREATE TABLE IF NOT EXISTS public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status public.season_status NOT NULL DEFAULT 'upcoming',
  soft_reset_factor numeric NOT NULL DEFAULT 0.75,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read seasons" ON public.seasons;
CREATE POLICY "Anyone can read seasons" ON public.seasons FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins manage seasons" ON public.seasons;
CREATE POLICY "Admins manage seasons" ON public.seasons FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.seasons (name, starts_at, ends_at, status)
SELECT 'Season 1 — Beta', now(), now() + interval '90 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.seasons WHERE status = 'active');

-- 3. RANK STATES
CREATE TABLE IF NOT EXISTS public.rank_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  mmr integer NOT NULL DEFAULT 1000,
  mmr_deviation integer NOT NULL DEFAULT 350,
  lp integer NOT NULL DEFAULT 0,
  tier public.rank_tier NOT NULL DEFAULT 'bronze',
  division public.rank_division NOT NULL DEFAULT 'IV',
  games_played integer NOT NULL DEFAULT 0,
  placements_remaining integer NOT NULL DEFAULT 5,
  win_streak integer NOT NULL DEFAULT 0,
  loss_streak integer NOT NULL DEFAULT 0,
  demotion_shield integer NOT NULL DEFAULT 0,
  last_match_at timestamptz,
  decay_applied_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id)
);
CREATE INDEX IF NOT EXISTS idx_rank_states_season_mmr ON public.rank_states(season_id, mmr DESC);
CREATE INDEX IF NOT EXISTS idx_rank_states_season_tier_lp ON public.rank_states(season_id, tier, lp DESC);
ALTER TABLE public.rank_states ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own rank state" ON public.rank_states;
CREATE POLICY "Users read own rank state" ON public.rank_states FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "No direct rank writes" ON public.rank_states;
CREATE POLICY "No direct rank writes" ON public.rank_states FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "No direct rank updates" ON public.rank_states;
CREATE POLICY "No direct rank updates" ON public.rank_states FOR UPDATE USING (false);
DROP POLICY IF EXISTS "No direct rank deletes" ON public.rank_states;
CREATE POLICY "No direct rank deletes" ON public.rank_states FOR DELETE USING (false);

-- 4. RATING HISTORY
CREATE TABLE IF NOT EXISTS public.rating_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  match_id uuid,
  mmr_before integer NOT NULL,
  mmr_after integer NOT NULL,
  lp_before integer NOT NULL,
  lp_after integer NOT NULL,
  tier_before public.rank_tier NOT NULL,
  tier_after public.rank_tier NOT NULL,
  k_factor integer NOT NULL,
  expected_score numeric NOT NULL,
  actual_score numeric NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rating_history_user_season ON public.rating_history(user_id, season_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rating_history_match ON public.rating_history(match_id);
ALTER TABLE public.rating_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own rating history" ON public.rating_history;
CREATE POLICY "Users read own rating history" ON public.rating_history FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Rating history insert blocked" ON public.rating_history;
CREATE POLICY "Rating history insert blocked" ON public.rating_history FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "Rating history immutable" ON public.rating_history;
CREATE POLICY "Rating history immutable" ON public.rating_history FOR UPDATE USING (false);
DROP POLICY IF EXISTS "Rating history undeletable" ON public.rating_history;
CREATE POLICY "Rating history undeletable" ON public.rating_history FOR DELETE USING (false);

-- 5. BATTLE CONFIGS
CREATE TABLE IF NOT EXISTS public.battle_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  mode text NOT NULL,
  problem_count integer NOT NULL DEFAULT 3,
  difficulty_curve jsonb NOT NULL DEFAULT '["easy","medium","hard"]'::jsonb,
  duration_minutes integer NOT NULL DEFAULT 30,
  submission_limit integer NOT NULL DEFAULT 20,
  ban_count integer NOT NULL DEFAULT 2,
  pick_count integer NOT NULL DEFAULT 2,
  tiebreak_rules jsonb NOT NULL DEFAULT '["solved","score","earliest_last_solve"]'::jsonb,
  is_rated boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.battle_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active configs" ON public.battle_configs;
CREATE POLICY "Anyone can read active configs" ON public.battle_configs FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins manage configs" ON public.battle_configs;
CREATE POLICY "Admins manage configs" ON public.battle_configs FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.battle_configs (key, mode, problem_count, duration_minutes, ban_count, pick_count, is_rated)
VALUES ('ranked_duo','ranked',3,30,2,2,true),('casual_duo','casual',3,30,1,1,false),('quick_solo','quick',2,15,0,0,false),('practice_arena','practice',1,20,0,0,false)
ON CONFLICT (key) DO NOTHING;

-- 6. EXTEND battle_matches
ALTER TABLE public.battle_matches
  ADD COLUMN IF NOT EXISTS state public.match_state NOT NULL DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS phase_started_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS config_id uuid REFERENCES public.battle_configs(id),
  ADD COLUMN IF NOT EXISTS season_id uuid REFERENCES public.seasons(id),
  ADD COLUMN IF NOT EXISTS invalidated_reason text,
  ADD COLUMN IF NOT EXISTS judge_provider text NOT NULL DEFAULT 'stub';
CREATE INDEX IF NOT EXISTS idx_battle_matches_state ON public.battle_matches(state);
CREATE INDEX IF NOT EXISTS idx_battle_matches_season ON public.battle_matches(season_id);

-- 7. EXTEND battle_match_submissions
ALTER TABLE public.battle_match_submissions
  ADD COLUMN IF NOT EXISTS verdict public.submission_verdict NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verdict_payload jsonb,
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS judged_at timestamptz,
  ADD COLUMN IF NOT EXISTS compile_log text,
  ADD COLUMN IF NOT EXISTS code_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_idem ON public.battle_match_submissions(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_match ON public.battle_match_submissions(match_id, submitted_at DESC);

-- 8. EVENT LOG
CREATE TABLE IF NOT EXISTS public.battle_event_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  user_id uuid,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_log_match ON public.battle_event_log(match_id, created_at);
ALTER TABLE public.battle_event_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants read events" ON public.battle_event_log;
CREATE POLICY "Participants read events" ON public.battle_event_log FOR SELECT
  USING (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.battle_participants bp WHERE bp.match_id = battle_event_log.match_id AND bp.user_id = auth.uid()));
DROP POLICY IF EXISTS "Event log insert blocked" ON public.battle_event_log;
CREATE POLICY "Event log insert blocked" ON public.battle_event_log FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "Event log immutable" ON public.battle_event_log;
CREATE POLICY "Event log immutable" ON public.battle_event_log FOR UPDATE USING (false);
DROP POLICY IF EXISTS "Event log undeletable" ON public.battle_event_log;
CREATE POLICY "Event log undeletable" ON public.battle_event_log FOR DELETE USING (false);

-- 9. ANTI-CHEAT FLAGS
CREATE TABLE IF NOT EXISTS public.anticheat_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid,
  user_id uuid NOT NULL,
  kind public.anticheat_kind NOT NULL,
  severity integer NOT NULL DEFAULT 1,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.anticheat_status NOT NULL DEFAULT 'pending_review',
  reviewer_id uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ac_flags_status ON public.anticheat_flags(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ac_flags_user ON public.anticheat_flags(user_id, created_at DESC);
ALTER TABLE public.anticheat_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users insert flags about themselves" ON public.anticheat_flags;
CREATE POLICY "Users insert flags about themselves" ON public.anticheat_flags FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read all flags" ON public.anticheat_flags;
CREATE POLICY "Admins read all flags" ON public.anticheat_flags FOR SELECT USING (public.is_admin(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "Admins update flags" ON public.anticheat_flags;
CREATE POLICY "Admins update flags" ON public.anticheat_flags FOR UPDATE USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Flags undeletable" ON public.anticheat_flags;
CREATE POLICY "Flags undeletable" ON public.anticheat_flags FOR DELETE USING (false);

-- 10. BAN/PICK
CREATE TABLE IF NOT EXISTS public.match_topic_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  topic text NOT NULL,
  source text NOT NULL DEFAULT 'system',
  UNIQUE (match_id, topic)
);
ALTER TABLE public.match_topic_pool ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants read pool" ON public.match_topic_pool;
CREATE POLICY "Participants read pool" ON public.match_topic_pool FOR SELECT USING (EXISTS (SELECT 1 FROM public.battle_participants bp WHERE bp.match_id = match_topic_pool.match_id AND bp.user_id = auth.uid()));
DROP POLICY IF EXISTS "Pool no direct write" ON public.match_topic_pool;
CREATE POLICY "Pool no direct write" ON public.match_topic_pool FOR INSERT WITH CHECK (false);

CREATE TABLE IF NOT EXISTS public.match_topic_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('ban','pick')),
  topic text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_topic_actions_match ON public.match_topic_actions(match_id, order_index);
ALTER TABLE public.match_topic_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants read actions" ON public.match_topic_actions;
CREATE POLICY "Participants read actions" ON public.match_topic_actions FOR SELECT USING (EXISTS (SELECT 1 FROM public.battle_participants bp WHERE bp.match_id = match_topic_actions.match_id AND bp.user_id = auth.uid()));
DROP POLICY IF EXISTS "Actions no direct write" ON public.match_topic_actions;
CREATE POLICY "Actions no direct write" ON public.match_topic_actions FOR INSERT WITH CHECK (false);

-- 11. PROMOTION SERIES
CREATE TABLE IF NOT EXISTS public.promotion_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  target_tier public.rank_tier NOT NULL,
  wins_required integer NOT NULL DEFAULT 3,
  losses_allowed integer NOT NULL DEFAULT 2,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  status public.promotion_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_promo_user_season ON public.promotion_series(user_id, season_id, status);
ALTER TABLE public.promotion_series ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own promo" ON public.promotion_series;
CREATE POLICY "Users read own promo" ON public.promotion_series FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Promo no direct write" ON public.promotion_series;
CREATE POLICY "Promo no direct write" ON public.promotion_series FOR INSERT WITH CHECK (false);

-- 12. LEADERBOARD SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  tier public.rank_tier,
  captured_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lb_season_tier ON public.leaderboard_snapshots(season_id, tier, captured_at DESC);
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads snapshots" ON public.leaderboard_snapshots;
CREATE POLICY "Anyone reads snapshots" ON public.leaderboard_snapshots FOR SELECT USING (auth.uid() IS NOT NULL);

-- 13. HELPERS
CREATE OR REPLACE FUNCTION public.current_season_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.seasons WHERE status = 'active' ORDER BY starts_at DESC LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.ensure_rank_state(_user_id uuid)
RETURNS public.rank_states LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s_id uuid := public.current_season_id(); rs public.rank_states;
BEGIN
  IF s_id IS NULL THEN RAISE EXCEPTION 'no active season'; END IF;
  SELECT * INTO rs FROM public.rank_states WHERE user_id = _user_id AND season_id = s_id;
  IF NOT FOUND THEN
    INSERT INTO public.rank_states(user_id, season_id) VALUES (_user_id, s_id) RETURNING * INTO rs;
  END IF;
  RETURN rs;
END $$;

-- 14. STATE MACHINE
CREATE OR REPLACE FUNCTION public.battle_transition(_match_id uuid, _to public.match_state, _actor uuid DEFAULT NULL)
RETURNS public.match_state LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cur public.match_state; ok boolean := false;
BEGIN
  SELECT state INTO cur FROM public.battle_matches WHERE id = _match_id FOR UPDATE;
  IF cur IS NULL THEN RAISE EXCEPTION 'match not found'; END IF;
  ok := CASE
    WHEN cur = 'idle' AND _to IN ('queued','match_found','cancelled') THEN true
    WHEN cur = 'queued' AND _to IN ('match_found','cancelled') THEN true
    WHEN cur = 'match_found' AND _to IN ('ready_check','cancelled','abandoned') THEN true
    WHEN cur = 'ready_check' AND _to IN ('ban_pick','active','abandoned','cancelled') THEN true
    WHEN cur = 'ban_pick' AND _to IN ('active','abandoned') THEN true
    WHEN cur = 'active' AND _to IN ('judging','abandoned','invalidated') THEN true
    WHEN cur = 'judging' AND _to IN ('completed','invalidated') THEN true
    ELSE false END;
  IF NOT ok THEN RAISE EXCEPTION 'invalid transition % -> %', cur, _to; END IF;
  UPDATE public.battle_matches
    SET state = _to, phase_started_at = now(),
        started_at = COALESCE(started_at, CASE WHEN _to = 'active' THEN now() END),
        ended_at = COALESCE(ended_at, CASE WHEN _to IN ('completed','cancelled','abandoned','invalidated') THEN now() END)
    WHERE id = _match_id;
  INSERT INTO public.battle_event_log(match_id, user_id, event_type, payload)
    VALUES (_match_id, _actor, 'state_transition', jsonb_build_object('from', cur, 'to', _to));
  RETURN _to;
END $$;

-- 15. RATING ENGINE
CREATE OR REPLACE FUNCTION public.re_expected_score(_mmr_a integer, _mmr_b integer)
RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT 1.0 / (1.0 + power(10.0, (_mmr_b - _mmr_a)::numeric / 400.0));
$$;

CREATE OR REPLACE FUNCTION public.re_k_factor(_games integer, _deviation integer, _is_placement boolean)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN _is_placement THEN 60 WHEN _games < 30 THEN 40 WHEN _deviation > 200 THEN 32 ELSE 24 END;
$$;

CREATE OR REPLACE FUNCTION public.re_tier_from_lp(_lp integer)
RETURNS public.rank_tier LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN _lp >= 4000 THEN 'challenger'::public.rank_tier
    WHEN _lp >= 3500 THEN 'grandmaster'::public.rank_tier
    WHEN _lp >= 3000 THEN 'master'::public.rank_tier
    WHEN _lp >= 2400 THEN 'diamond'::public.rank_tier
    WHEN _lp >= 1800 THEN 'platinum'::public.rank_tier
    WHEN _lp >= 1200 THEN 'gold'::public.rank_tier
    WHEN _lp >= 600 THEN 'silver'::public.rank_tier
    ELSE 'bronze'::public.rank_tier END;
$$;

CREATE OR REPLACE FUNCTION public.re_apply_match(_match_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  m record; p record; opp_avg_mmr numeric; exp_score numeric; actual numeric;
  k integer; delta integer; lp_delta integer; rs public.rank_states;
  new_lp integer; new_tier public.rank_tier; is_rated boolean;
BEGIN
  SELECT bm.*, bc.is_rated AS cfg_rated INTO m
  FROM public.battle_matches bm LEFT JOIN public.battle_configs bc ON bc.id = bm.config_id
  WHERE bm.id = _match_id;
  IF m IS NULL THEN RAISE EXCEPTION 'match not found'; END IF;
  is_rated := COALESCE(m.cfg_rated, m.is_rated, false);
  IF NOT is_rated OR m.season_id IS NULL THEN RETURN; END IF;

  FOR p IN SELECT * FROM public.battle_participants WHERE match_id = _match_id LOOP
    rs := public.ensure_rank_state(p.user_id);
    SELECT AVG(rs2.mmr) INTO opp_avg_mmr
    FROM public.battle_participants bp2
    JOIN public.rank_states rs2 ON rs2.user_id = bp2.user_id AND rs2.season_id = m.season_id
    WHERE bp2.match_id = _match_id AND bp2.user_id <> p.user_id;
    IF opp_avg_mmr IS NULL THEN opp_avg_mmr := rs.mmr; END IF;

    actual := CASE WHEN m.is_draw THEN 0.5 WHEN m.winner_id = p.user_id THEN 1.0 ELSE 0.0 END;
    exp_score := public.re_expected_score(rs.mmr, opp_avg_mmr::integer);
    k := public.re_k_factor(rs.games_played, rs.mmr_deviation, rs.placements_remaining > 0);
    delta := round(k * (actual - exp_score));

    lp_delta := delta;
    IF actual = 1.0 AND rs.win_streak >= 3 THEN lp_delta := lp_delta + 5; END IF;
    IF actual = 0.0 AND rs.demotion_shield > 0 THEN lp_delta := GREATEST(lp_delta, -5); END IF;

    new_lp := GREATEST(0, rs.lp + lp_delta);
    new_tier := public.re_tier_from_lp(new_lp);

    INSERT INTO public.rating_history(user_id, season_id, match_id, mmr_before, mmr_after, lp_before, lp_after, tier_before, tier_after, k_factor, expected_score, actual_score, reason)
    VALUES (p.user_id, m.season_id, _match_id, rs.mmr, rs.mmr + delta, rs.lp, new_lp, rs.tier, new_tier, k, exp_score, actual,
      CASE WHEN actual = 1.0 THEN 'win' WHEN actual = 0.0 THEN 'loss' ELSE 'draw' END);

    UPDATE public.rank_states SET
      mmr = mmr + delta,
      mmr_deviation = GREATEST(50, mmr_deviation - 10),
      lp = new_lp, tier = new_tier,
      games_played = games_played + 1,
      placements_remaining = GREATEST(0, placements_remaining - 1),
      win_streak = CASE WHEN actual = 1.0 THEN win_streak + 1 ELSE 0 END,
      loss_streak = CASE WHEN actual = 0.0 THEN loss_streak + 1 ELSE 0 END,
      demotion_shield = CASE WHEN new_tier <> tier AND actual = 1.0 THEN 3 ELSE GREATEST(0, demotion_shield - 1) END,
      last_match_at = now(), updated_at = now()
    WHERE user_id = p.user_id AND season_id = m.season_id;

    UPDATE public.battle_participants SET elo_before = rs.mmr, elo_after = rs.mmr + delta, elo_change = delta
      WHERE match_id = _match_id AND user_id = p.user_id;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.re_decay_inactive(_season_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c integer;
BEGIN
  WITH d AS (
    UPDATE public.rank_states SET lp = GREATEST(0, lp - 25), decay_applied_at = now(), updated_at = now()
    WHERE season_id = _season_id
      AND tier IN ('diamond','master','grandmaster','challenger')
      AND last_match_at < now() - interval '14 days'
      AND (decay_applied_at IS NULL OR decay_applied_at < now() - interval '7 days')
    RETURNING 1
  ) SELECT count(*) INTO c FROM d;
  RETURN COALESCE(c, 0);
END $$;

-- 16. SCORING
CREATE OR REPLACE FUNCTION public.score_problem(_base integer, _solve_sec integer, _limit_sec integer, _wrong integer)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT GREATEST(0, round(_base * GREATEST(0.4, 1.0 - (_solve_sec::numeric / NULLIF(_limit_sec,0)) * 0.6) - (_wrong * 10))::integer);
$$;

CREATE OR REPLACE FUNCTION public.score_match(_match_id uuid)
RETURNS TABLE(winner_id uuid, is_draw boolean) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE top_user uuid; draw boolean := false; top_score integer; rivals integer;
BEGIN
  SELECT bp.user_id, bp.score INTO top_user, top_score
  FROM public.battle_participants bp WHERE bp.match_id = _match_id
  ORDER BY bp.problems_solved DESC, bp.score DESC, bp.total_solve_time_sec ASC LIMIT 1;
  SELECT count(*) INTO rivals FROM public.battle_participants bp
  WHERE bp.match_id = _match_id AND bp.score = top_score AND bp.user_id <> top_user;
  IF rivals > 0 THEN draw := true; top_user := NULL; END IF;
  RETURN QUERY SELECT top_user, draw;
END $$;

-- 17. MATCHMAKING
CREATE OR REPLACE FUNCTION public.mm_enqueue(_mode text, _config_key text DEFAULT NULL, _region text DEFAULT 'auto')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); rs public.rank_states; qid uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  rs := public.ensure_rank_state(uid);
  DELETE FROM public.battle_queue WHERE user_id = uid AND status = 'searching';
  INSERT INTO public.battle_queue(user_id, mode, elo, status) VALUES (uid, _mode, rs.mmr, 'searching') RETURNING id INTO qid;
  RETURN qid;
END $$;

CREATE OR REPLACE FUNCTION public.mm_dequeue(_reason text DEFAULT 'user_cancel')
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c integer;
BEGIN
  WITH d AS (DELETE FROM public.battle_queue WHERE user_id = auth.uid() AND status = 'searching' RETURNING 1)
  SELECT count(*) INTO c FROM d;
  RETURN COALESCE(c, 0);
END $$;

CREATE OR REPLACE FUNCTION public.mm_status()
RETURNS TABLE(queue_id uuid, mode text, elo integer, waiting_seconds integer, matched_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, mode, elo, EXTRACT(EPOCH FROM (now() - created_at))::int, matched_at
  FROM public.battle_queue WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.mm_tick()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q1 record; q2 record; window_size int; new_match uuid; cfg_id uuid; pairs int := 0;
BEGIN
  FOR q1 IN SELECT * FROM public.battle_queue WHERE status='searching' ORDER BY created_at ASC LOOP
    PERFORM 1 FROM public.battle_queue WHERE id = q1.id AND status = 'searching';
    IF NOT FOUND THEN CONTINUE; END IF;
    window_size := 50 + LEAST(350, EXTRACT(EPOCH FROM (now() - q1.created_at))::int * 4);
    SELECT * INTO q2 FROM public.battle_queue
    WHERE status='searching' AND id <> q1.id AND mode = q1.mode AND user_id <> q1.user_id
      AND abs(elo - q1.elo) <= window_size
    ORDER BY abs(elo - q1.elo) ASC LIMIT 1;
    IF q2.id IS NULL THEN CONTINUE; END IF;
    SELECT id INTO cfg_id FROM public.battle_configs WHERE mode = q1.mode AND is_active LIMIT 1;
    INSERT INTO public.battle_matches(created_by, mode, status, state, config_id, season_id, is_rated, problem_count)
    VALUES (q1.user_id, q1.mode, 'pending', 'match_found', cfg_id, public.current_season_id(),
            COALESCE((SELECT is_rated FROM public.battle_configs WHERE id = cfg_id), false),
            COALESCE((SELECT problem_count FROM public.battle_configs WHERE id = cfg_id), 2))
    RETURNING id INTO new_match;
    INSERT INTO public.battle_participants(match_id, user_id, elo_before)
      VALUES (new_match, q1.user_id, q1.elo), (new_match, q2.user_id, q2.elo);
    UPDATE public.battle_queue SET status='matched', matched_at=now() WHERE id IN (q1.id, q2.id);
    INSERT INTO public.battle_event_log(match_id, event_type, payload)
      VALUES (new_match, 'match_found', jsonb_build_object('users', jsonb_build_array(q1.user_id, q2.user_id)));
    pairs := pairs + 1;
  END LOOP;
  RETURN pairs;
END $$;

-- 18. READY CHECK / BAN-PICK
CREATE OR REPLACE FUNCTION public.ready_check_respond(_match_id uuid, _ready boolean)
RETURNS public.match_state LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); total int; ready_count int; cur public.match_state;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  PERFORM 1 FROM public.battle_participants WHERE match_id = _match_id AND user_id = uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'not a participant'; END IF;
  INSERT INTO public.battle_event_log(match_id, user_id, event_type, payload)
    VALUES (_match_id, uid, CASE WHEN _ready THEN 'ready_check_accept' ELSE 'ready_check_decline' END, '{}');
  SELECT state INTO cur FROM public.battle_matches WHERE id = _match_id;
  IF NOT _ready THEN PERFORM public.battle_transition(_match_id, 'cancelled', uid); RETURN 'cancelled'; END IF;
  IF cur = 'match_found' THEN PERFORM public.battle_transition(_match_id, 'ready_check', uid); END IF;
  SELECT count(*) INTO total FROM public.battle_participants WHERE match_id = _match_id;
  SELECT count(DISTINCT user_id) INTO ready_count FROM public.battle_event_log
    WHERE match_id = _match_id AND event_type = 'ready_check_accept';
  IF ready_count >= total THEN PERFORM public.battle_transition(_match_id, 'ban_pick', uid); RETURN 'ban_pick'; END IF;
  RETURN 'ready_check';
END $$;

CREATE OR REPLACE FUNCTION public.ban_topic(_match_id uuid, _topic text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); idx int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  PERFORM 1 FROM public.battle_participants WHERE match_id = _match_id AND user_id = uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'not a participant'; END IF;
  SELECT COALESCE(MAX(order_index),0)+1 INTO idx FROM public.match_topic_actions WHERE match_id = _match_id;
  INSERT INTO public.match_topic_actions(match_id, user_id, action, topic, order_index) VALUES (_match_id, uid, 'ban', _topic, idx);
  INSERT INTO public.battle_event_log(match_id, user_id, event_type, payload) VALUES (_match_id, uid, 'ban_picked', jsonb_build_object('topic', _topic));
END $$;

CREATE OR REPLACE FUNCTION public.pick_topic(_match_id uuid, _topic text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); idx int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  PERFORM 1 FROM public.battle_participants WHERE match_id = _match_id AND user_id = uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'not a participant'; END IF;
  SELECT COALESCE(MAX(order_index),0)+1 INTO idx FROM public.match_topic_actions WHERE match_id = _match_id;
  INSERT INTO public.match_topic_actions(match_id, user_id, action, topic, order_index) VALUES (_match_id, uid, 'pick', _topic, idx);
  INSERT INTO public.battle_event_log(match_id, user_id, event_type, payload) VALUES (_match_id, uid, 'pick_locked', jsonb_build_object('topic', _topic));
END $$;

-- 19. SUBMISSIONS
CREATE OR REPLACE FUNCTION public.submit_battle_solution(_match_id uuid, _problem_id uuid, _language text, _code text, _idempotency_key text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); sid uuid; m_state public.match_state; existing uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  SELECT state INTO m_state FROM public.battle_matches WHERE id = _match_id;
  IF m_state <> 'active' THEN RAISE EXCEPTION 'match not active'; END IF;
  PERFORM 1 FROM public.battle_participants WHERE match_id = _match_id AND user_id = uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'not a participant'; END IF;
  IF _idempotency_key IS NOT NULL THEN
    SELECT id INTO existing FROM public.battle_match_submissions WHERE user_id = uid AND idempotency_key = _idempotency_key;
    IF existing IS NOT NULL THEN RETURN existing; END IF;
  END IF;
  INSERT INTO public.battle_match_submissions(match_id, user_id, problem_id, language, code, status, verdict, idempotency_key, code_hash)
  VALUES (_match_id, uid, _problem_id, _language, _code, 'pending', 'pending', _idempotency_key, md5(_code))
  RETURNING id INTO sid;
  INSERT INTO public.battle_event_log(match_id, user_id, event_type, payload)
    VALUES (_match_id, uid, 'submission_received', jsonb_build_object('submission_id', sid, 'problem_id', _problem_id));
  RETURN sid;
END $$;

CREATE OR REPLACE FUNCTION public.apply_submission_verdict(_submission_id uuid, _verdict public.submission_verdict, _payload jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s record; m record; pts int := 0; solve_sec int; wrong int;
BEGIN
  SELECT * INTO s FROM public.battle_match_submissions WHERE id = _submission_id FOR UPDATE;
  IF s IS NULL THEN RAISE EXCEPTION 'submission not found'; END IF;
  UPDATE public.battle_match_submissions
    SET verdict = _verdict, verdict_payload = _payload, status = _verdict::text, judged_at = now(),
        runtime_ms = COALESCE((_payload->>'runtime_ms')::int, runtime_ms),
        memory_kb  = COALESCE((_payload->>'memory_kb')::int, memory_kb),
        testcases_passed = COALESCE((_payload->>'testcases_passed')::int, testcases_passed),
        testcases_total  = COALESCE((_payload->>'testcases_total')::int, testcases_total)
    WHERE id = _submission_id;
  INSERT INTO public.battle_event_log(match_id, user_id, event_type, payload)
    VALUES (s.match_id, s.user_id, 'verdict_emitted', jsonb_build_object('submission_id', _submission_id, 'verdict', _verdict));
  IF _verdict = 'accepted' THEN
    SELECT bm.*, b.duration_minutes INTO m
      FROM public.battle_matches bm LEFT JOIN public.battle_configs b ON b.id = bm.config_id WHERE bm.id = s.match_id;
    solve_sec := GREATEST(1, EXTRACT(EPOCH FROM (now() - COALESCE(m.started_at, m.created_at)))::int);
    SELECT count(*) INTO wrong FROM public.battle_match_submissions
      WHERE match_id = s.match_id AND user_id = s.user_id AND problem_id = s.problem_id
        AND verdict NOT IN ('accepted','pending');
    pts := public.score_problem(100, solve_sec, GREATEST(60, COALESCE(m.duration_minutes,30)*60), wrong);
    UPDATE public.battle_participants
      SET problems_solved = problems_solved + 1, score = score + pts,
          total_solve_time_sec = total_solve_time_sec + solve_sec
      WHERE match_id = s.match_id AND user_id = s.user_id;
    UPDATE public.battle_match_submissions SET score = pts WHERE id = _submission_id;
  ELSIF _verdict NOT IN ('pending') THEN
    UPDATE public.battle_participants SET wrong_submissions = wrong_submissions + 1
      WHERE match_id = s.match_id AND user_id = s.user_id;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.finalize_match(_match_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m record; res record; result jsonb;
BEGIN
  SELECT * INTO m FROM public.battle_matches WHERE id = _match_id FOR UPDATE;
  IF m IS NULL THEN RAISE EXCEPTION 'match not found'; END IF;
  IF m.state IN ('completed','cancelled','invalidated') THEN
    RETURN jsonb_build_object('status','already_final','state',m.state);
  END IF;
  PERFORM public.battle_transition(_match_id, 'judging', NULL);
  SELECT * INTO res FROM public.score_match(_match_id);
  UPDATE public.battle_matches SET winner_id = res.winner_id, is_draw = res.is_draw WHERE id = _match_id;
  PERFORM public.re_apply_match(_match_id);
  PERFORM public.battle_transition(_match_id, 'completed', NULL);
  result := jsonb_build_object('match_id', _match_id, 'winner_id', res.winner_id, 'is_draw', res.is_draw,
    'participants', (SELECT jsonb_agg(to_jsonb(bp)) FROM public.battle_participants bp WHERE match_id = _match_id));
  RETURN result;
END $$;

-- 20. ANTI-CHEAT
CREATE OR REPLACE FUNCTION public.log_anticheat_event(_match_id uuid, _kind public.anticheat_kind, _evidence jsonb DEFAULT '{}'::jsonb, _severity int DEFAULT 1)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); fid uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  INSERT INTO public.anticheat_flags(match_id, user_id, kind, severity, evidence)
    VALUES (_match_id, uid, _kind, _severity, _evidence) RETURNING id INTO fid;
  INSERT INTO public.battle_event_log(match_id, user_id, event_type, payload)
    VALUES (_match_id, uid, 'anticheat_flag', jsonb_build_object('kind', _kind, 'severity', _severity));
  RETURN fid;
END $$;

CREATE OR REPLACE FUNCTION public.review_anticheat_flag(_flag_id uuid, _decision public.anticheat_status)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'admin only'; END IF;
  UPDATE public.anticheat_flags SET status = _decision, reviewer_id = auth.uid(), reviewed_at = now() WHERE id = _flag_id;
END $$;

CREATE OR REPLACE FUNCTION public.admin_invalidate_match(_match_id uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'admin only'; END IF;
  UPDATE public.battle_matches SET invalidated_reason = _reason WHERE id = _match_id;
  PERFORM public.battle_transition(_match_id, 'invalidated', auth.uid());
END $$;

CREATE OR REPLACE FUNCTION public.ac_dup_submission_trigger()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.code_hash IS NOT NULL THEN
    PERFORM 1 FROM public.battle_match_submissions
      WHERE code_hash = NEW.code_hash AND user_id <> NEW.user_id
        AND submitted_at > now() - interval '1 hour' AND id <> NEW.id LIMIT 1;
    IF FOUND THEN
      INSERT INTO public.anticheat_flags(match_id, user_id, kind, severity, evidence)
        VALUES (NEW.match_id, NEW.user_id, 'dup_submission', 3, jsonb_build_object('code_hash', NEW.code_hash, 'submission_id', NEW.id));
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_ac_dup_submission ON public.battle_match_submissions;
CREATE TRIGGER trg_ac_dup_submission AFTER INSERT ON public.battle_match_submissions
  FOR EACH ROW EXECUTE FUNCTION public.ac_dup_submission_trigger();

-- 21. READ APIS
CREATE OR REPLACE FUNCTION public.get_match_state(_match_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  PERFORM 1 FROM public.battle_participants WHERE match_id = _match_id AND user_id = auth.uid();
  IF NOT FOUND AND NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT jsonb_build_object(
    'match', to_jsonb(m),
    'participants', (SELECT jsonb_agg(to_jsonb(bp)) FROM public.battle_participants bp WHERE match_id = _match_id),
    'problems', (SELECT jsonb_agg(to_jsonb(bmp)) FROM public.battle_match_problems bmp WHERE match_id = _match_id ORDER BY order_index),
    'topic_actions', (SELECT jsonb_agg(to_jsonb(a) ORDER BY a.order_index) FROM public.match_topic_actions a WHERE match_id = _match_id)
  ) INTO result FROM public.battle_matches m WHERE m.id = _match_id;
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.get_rank_snapshot(_user_id uuid DEFAULT NULL, _season_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid; sid uuid; rs public.rank_states; result jsonb;
BEGIN
  uid := COALESCE(_user_id, auth.uid());
  sid := COALESCE(_season_id, public.current_season_id());
  IF uid IS NULL OR sid IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO rs FROM public.rank_states WHERE user_id = uid AND season_id = sid;
  IF rs IS NULL THEN RETURN NULL; END IF;
  result := jsonb_build_object('user_id', rs.user_id, 'season_id', rs.season_id, 'lp', rs.lp, 'tier', rs.tier, 'division', rs.division,
    'games_played', rs.games_played, 'placements_remaining', rs.placements_remaining, 'win_streak', rs.win_streak, 'loss_streak', rs.loss_streak);
  IF uid = auth.uid() OR public.is_admin(auth.uid()) THEN
    result := result || jsonb_build_object('mmr', rs.mmr, 'mmr_deviation', rs.mmr_deviation);
  END IF;
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.get_leaderboard(_season_id uuid DEFAULT NULL, _tier public.rank_tier DEFAULT NULL, _limit int DEFAULT 50)
RETURNS TABLE(user_id uuid, lp integer, tier public.rank_tier, games_played integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT rs.user_id, rs.lp, rs.tier, rs.games_played
  FROM public.rank_states rs
  WHERE rs.season_id = COALESCE(_season_id, public.current_season_id())
    AND (_tier IS NULL OR rs.tier = _tier)
  ORDER BY rs.lp DESC, rs.mmr DESC
  LIMIT LEAST(_limit, 200);
$$;

CREATE OR REPLACE FUNCTION public.get_match_history(_user_id uuid DEFAULT NULL, _limit int DEFAULT 25)
RETURNS TABLE(match_id uuid, mode text, state public.match_state, ended_at timestamptz, winner_id uuid, score integer, opponents jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH uid AS (SELECT COALESCE(_user_id, auth.uid()) AS u)
  SELECT m.id, m.mode, m.state, m.ended_at, m.winner_id, bp.score,
    (SELECT jsonb_agg(jsonb_build_object('user_id', bp2.user_id, 'score', bp2.score, 'solved', bp2.problems_solved))
     FROM public.battle_participants bp2 WHERE bp2.match_id = m.id AND bp2.user_id <> bp.user_id) AS opponents
  FROM public.battle_matches m
  JOIN public.battle_participants bp ON bp.match_id = m.id AND bp.user_id = (SELECT u FROM uid)
  ORDER BY m.created_at DESC
  LIMIT LEAST(_limit, 100);
$$;

-- 22. BACK-COMPAT SHIMS
CREATE OR REPLACE FUNCTION public.join_battle_queue(p_mode text, p_target_user_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN public.mm_enqueue(p_mode, NULL, 'auto'); END $$;

CREATE OR REPLACE FUNCTION public.cancel_battle_queue()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN public.mm_dequeue('user_cancel'); END $$;

-- 23. REALTIME
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_matches; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_participants; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_event_log; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_match_submissions; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.battle_matches REPLICA IDENTITY FULL;
ALTER TABLE public.battle_participants REPLICA IDENTITY FULL;
ALTER TABLE public.battle_event_log REPLICA IDENTITY FULL;
ALTER TABLE public.battle_match_submissions REPLICA IDENTITY FULL;
