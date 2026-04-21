-- Phase A: Rating Engine v2 (blueprint-aligned)

-- 1. queue_lockouts table for tilt cooldown + dodge penalty
CREATE TABLE IF NOT EXISTS public.queue_lockouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text NOT NULL,
  locked_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_queue_lockouts_user_active
  ON public.queue_lockouts(user_id, locked_until DESC);

ALTER TABLE public.queue_lockouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own lockouts"
  ON public.queue_lockouts FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "No direct lockout writes"
  ON public.queue_lockouts FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct lockout updates"
  ON public.queue_lockouts FOR UPDATE USING (false);
CREATE POLICY "No direct lockout deletes"
  ON public.queue_lockouts FOR DELETE USING (false);

-- 2. Dynamic K-factor per blueprint table
CREATE OR REPLACE FUNCTION public.re_k_factor(_games integer, _deviation integer, _is_placement boolean)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN _is_placement THEN 48
    WHEN _games < 30 THEN 32
    WHEN _games < 100 THEN 24
    WHEN _deviation < 80 THEN 12
    ELSE 16
  END;
$$;

-- 3. Rewrite re_apply_match with RD, performance bonus, streak modifiers, LP smoothing, tilt cooldown
CREATE OR REPLACE FUNCTION public.re_apply_match(_match_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  m record; p record; opp_avg_mmr numeric; exp_score numeric; actual numeric;
  k_base integer; k_eff numeric; rd_mult numeric;
  base_delta integer; perf_bonus_pct numeric; perf_delta integer; mmr_delta integer;
  lp_delta integer; rs public.rank_states;
  new_lp integer; new_tier public.rank_tier; new_division public.rank_division;
  is_rated boolean;
  tier_changed boolean;
  loss_count_2h integer;
  match_duration_sec integer; time_used_sec integer; time_pct numeric;
  hard_solved integer; first_attempts integer;
BEGIN
  SELECT bm.*, bc.is_rated AS cfg_rated INTO m
  FROM public.battle_matches bm
  LEFT JOIN public.battle_configs bc ON bc.id = bm.config_id
  WHERE bm.id = _match_id;
  IF m IS NULL THEN RAISE EXCEPTION 'match not found'; END IF;
  is_rated := COALESCE(m.cfg_rated, m.is_rated, false);
  IF NOT is_rated OR m.season_id IS NULL THEN RETURN; END IF;

  match_duration_sec := COALESCE(m.duration_minutes, 30) * 60;

  FOR p IN SELECT * FROM public.battle_participants WHERE match_id = _match_id LOOP
    rs := public.ensure_rank_state(p.user_id);

    SELECT AVG(rs2.mmr) INTO opp_avg_mmr
    FROM public.battle_participants bp2
    JOIN public.rank_states rs2 ON rs2.user_id = bp2.user_id AND rs2.season_id = m.season_id
    WHERE bp2.match_id = _match_id AND bp2.user_id <> p.user_id;
    IF opp_avg_mmr IS NULL THEN opp_avg_mmr := rs.mmr; END IF;

    actual := CASE WHEN m.is_draw THEN 0.5 WHEN m.winner_id = p.user_id THEN 1.0 ELSE 0.0 END;
    exp_score := public.re_expected_score(rs.mmr, opp_avg_mmr::integer);

    -- Dynamic K with RD multiplier (clamp 0.5..2.0)
    k_base := public.re_k_factor(rs.games_played, rs.mmr_deviation, rs.placements_remaining > 0);
    rd_mult := LEAST(2.0, GREATEST(0.5, rs.mmr_deviation::numeric / 50.0));
    k_eff := k_base * rd_mult;
    base_delta := round(k_eff * (actual - exp_score));

    -- Performance bonus (cap +25% of base)
    perf_bonus_pct := 0;
    IF actual = 1.0 THEN
      time_used_sec := COALESCE(p.total_solve_time_sec, match_duration_sec);
      time_pct := GREATEST(0, LEAST(1, 1.0 - (time_used_sec::numeric / NULLIF(match_duration_sec,0))));
      perf_bonus_pct := perf_bonus_pct + (time_pct * 0.15); -- speed bonus up to +15%

      -- first-attempt accuracy bonus (no wrong submissions): +5%
      IF COALESCE(p.wrong_submissions,0) = 0 AND COALESCE(p.problems_solved,0) > 0 THEN
        perf_bonus_pct := perf_bonus_pct + 0.05;
      END IF;

      -- hard problem bonus: +5% if any hard solved
      SELECT count(*) INTO hard_solved
      FROM public.battle_match_submissions s
      JOIN public.battle_match_problems bmp ON bmp.id = s.problem_id
      JOIN public.challenges c ON c.id = bmp.challenge_id
      WHERE s.match_id = _match_id AND s.user_id = p.user_id
        AND s.verdict = 'accepted' AND lower(c.difficulty) = 'hard';
      IF hard_solved > 0 THEN perf_bonus_pct := perf_bonus_pct + 0.05; END IF;
    END IF;
    perf_bonus_pct := LEAST(0.25, perf_bonus_pct);
    perf_delta := round(base_delta * perf_bonus_pct);

    mmr_delta := base_delta + perf_delta;

    -- LP smoothing: derive LP from MMR delta with streak modifiers
    lp_delta := mmr_delta;
    IF actual = 1.0 THEN
      IF rs.win_streak >= 6 THEN lp_delta := lp_delta + 12;
      ELSIF rs.win_streak >= 4 THEN lp_delta := lp_delta + 8;
      ELSIF rs.win_streak >= 2 THEN lp_delta := lp_delta + 5;
      ELSIF rs.win_streak >= 1 THEN lp_delta := lp_delta + 2;
      END IF;
    ELSIF actual = 0.0 THEN
      -- Loss protection: dampen LP loss on losing streak
      IF rs.loss_streak >= 4 THEN lp_delta := round(lp_delta * 0.65); -- -35%
      ELSIF rs.loss_streak >= 3 THEN lp_delta := round(lp_delta * 0.75); -- -25%
      ELSIF rs.loss_streak >= 2 THEN lp_delta := round(lp_delta * 0.85); -- -15%
      END IF;
      -- Demotion shield clamps loss to -5
      IF rs.demotion_shield > 0 THEN lp_delta := GREATEST(lp_delta, -5); END IF;
    END IF;

    new_lp := GREATEST(0, rs.lp + lp_delta);
    new_tier := public.re_tier_from_lp(new_lp);
    tier_changed := new_tier <> rs.tier;

    -- Iron IV floor (bronze/IV here): clamp at 0 - already done by GREATEST above

    INSERT INTO public.rating_history(user_id, season_id, match_id, mmr_before, mmr_after, lp_before, lp_after, tier_before, tier_after, k_factor, expected_score, actual_score, reason)
    VALUES (p.user_id, m.season_id, _match_id, rs.mmr, rs.mmr + mmr_delta, rs.lp, new_lp, rs.tier, new_tier, k_base, exp_score, actual,
      CASE WHEN actual = 1.0 THEN 'win' WHEN actual = 0.0 THEN 'loss' ELSE 'draw' END);

    UPDATE public.rank_states SET
      mmr = mmr + mmr_delta,
      mmr_deviation = GREATEST(50, mmr_deviation - 10),
      lp = new_lp,
      tier = new_tier,
      games_played = games_played + 1,
      placements_remaining = GREATEST(0, placements_remaining - 1),
      win_streak = CASE WHEN actual = 1.0 THEN win_streak + 1 ELSE 0 END,
      loss_streak = CASE WHEN actual = 0.0 THEN loss_streak + 1 ELSE 0 END,
      demotion_shield = CASE
        WHEN tier_changed AND actual = 1.0 THEN 5
        ELSE GREATEST(0, demotion_shield - 1)
      END,
      last_match_at = now(),
      updated_at = now()
    WHERE user_id = p.user_id AND season_id = m.season_id;

    -- Tilt cooldown: 5 losses in 2h → 30-min queue lockout
    IF actual = 0.0 THEN
      SELECT count(*) INTO loss_count_2h
      FROM public.battle_participants bp3
      JOIN public.battle_matches bm3 ON bm3.id = bp3.match_id
      WHERE bp3.user_id = p.user_id
        AND bm3.ended_at > now() - interval '2 hours'
        AND bm3.winner_id IS NOT NULL
        AND bm3.winner_id <> p.user_id
        AND COALESCE(bm3.is_draw, false) = false;
      IF loss_count_2h >= 5 THEN
        INSERT INTO public.queue_lockouts(user_id, reason, locked_until, meta)
        VALUES (p.user_id, 'tilt_cooldown', now() + interval '30 minutes',
          jsonb_build_object('losses_2h', loss_count_2h));
      END IF;
    END IF;
  END LOOP;
END $function$;

-- 4. Daily RD growth job (idle players gain deviation +5/day, max 150)
CREATE OR REPLACE FUNCTION public.re_grow_deviation()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE c integer;
BEGIN
  WITH d AS (
    UPDATE public.rank_states
    SET mmr_deviation = LEAST(150, mmr_deviation + 5),
        updated_at = now()
    WHERE last_match_at IS NOT NULL
      AND last_match_at < now() - interval '24 hours'
      AND mmr_deviation < 150
    RETURNING 1
  ) SELECT count(*) INTO c FROM d;
  RETURN COALESCE(c,0);
END $$;