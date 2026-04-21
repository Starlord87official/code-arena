-- Phase B: Promotion Series + Demotion Shield

-- ============================================================
-- 1. Add tracking columns to promotion_series
-- ============================================================
ALTER TABLE public.promotion_series
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'division' CHECK (kind IN ('division','tier')),
  ADD COLUMN IF NOT EXISTS from_tier public.rank_tier,
  ADD COLUMN IF NOT EXISTS from_division public.rank_division,
  ADD COLUMN IF NOT EXISTS target_division public.rank_division;

-- ============================================================
-- 2. promotion_attempts table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promotion_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES public.promotion_series(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES public.battle_matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  won boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (series_id, match_id)
);
CREATE INDEX IF NOT EXISTS idx_promo_attempts_series ON public.promotion_attempts(series_id);
CREATE INDEX IF NOT EXISTS idx_promo_attempts_user ON public.promotion_attempts(user_id, created_at DESC);

ALTER TABLE public.promotion_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own promo attempts" ON public.promotion_attempts;
CREATE POLICY "Users read own promo attempts" ON public.promotion_attempts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Promo attempts no direct write" ON public.promotion_attempts;
CREATE POLICY "Promo attempts no direct write" ON public.promotion_attempts
  FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "Promo attempts no direct update" ON public.promotion_attempts;
CREATE POLICY "Promo attempts no direct update" ON public.promotion_attempts
  FOR UPDATE USING (false);

-- ============================================================
-- 3. Helpers: division/tier order
-- ============================================================
CREATE OR REPLACE FUNCTION public.re_division_rank(_d public.rank_division)
RETURNS integer LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE _d WHEN 'IV' THEN 1 WHEN 'III' THEN 2 WHEN 'II' THEN 3 WHEN 'I' THEN 4 END;
$$;

CREATE OR REPLACE FUNCTION public.re_division_from_rank(_n integer)
RETURNS public.rank_division LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE _n WHEN 1 THEN 'IV'::public.rank_division WHEN 2 THEN 'III' WHEN 3 THEN 'II' WHEN 4 THEN 'I' END;
$$;

CREATE OR REPLACE FUNCTION public.re_tier_rank(_t public.rank_tier)
RETURNS integer LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE _t
    WHEN 'bronze' THEN 1 WHEN 'silver' THEN 2 WHEN 'gold' THEN 3
    WHEN 'platinum' THEN 4 WHEN 'diamond' THEN 5 WHEN 'master' THEN 6
    WHEN 'grandmaster' THEN 7 WHEN 'challenger' THEN 8
  END;
$$;

CREATE OR REPLACE FUNCTION public.re_tier_from_rank(_n integer)
RETURNS public.rank_tier LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE _n
    WHEN 1 THEN 'bronze'::public.rank_tier WHEN 2 THEN 'silver' WHEN 3 THEN 'gold'
    WHEN 4 THEN 'platinum' WHEN 5 THEN 'diamond' WHEN 6 THEN 'master'
    WHEN 7 THEN 'grandmaster' WHEN 8 THEN 'challenger'
  END;
$$;

-- ============================================================
-- 4. RPC: get_active_promotion_series
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_active_promotion_series(p_user_id uuid DEFAULT NULL)
RETURNS public.promotion_series
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.promotion_series
  WHERE user_id = COALESCE(p_user_id, auth.uid())
    AND season_id = public.current_season_id()
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- ============================================================
-- 5. RPC: re_start_promotion_series
-- ============================================================
CREATE OR REPLACE FUNCTION public.re_start_promotion_series(p_user_id uuid, p_kind text DEFAULT NULL)
RETURNS public.promotion_series
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rs public.rank_states;
  existing public.promotion_series;
  v_kind text;
  v_target_div public.rank_division;
  v_target_tier public.rank_tier;
  v_wins_required integer;
  v_losses_allowed integer;
  inserted public.promotion_series;
BEGIN
  rs := public.ensure_rank_state(p_user_id);

  -- Idempotent: return existing active series
  SELECT * INTO existing FROM public.promotion_series
  WHERE user_id = p_user_id AND season_id = rs.season_id AND status = 'active'
  ORDER BY created_at DESC LIMIT 1;
  IF existing.id IS NOT NULL THEN RETURN existing; END IF;

  -- Determine kind: tier promo only at division I
  v_kind := COALESCE(p_kind, CASE WHEN rs.division = 'I' THEN 'tier' ELSE 'division' END);

  IF v_kind = 'tier' THEN
    v_wins_required := 3;   -- Bo5
    v_losses_allowed := 2;
    v_target_tier := public.re_tier_from_rank(LEAST(8, public.re_tier_rank(rs.tier) + 1));
    v_target_div := 'IV';
  ELSE
    v_wins_required := 2;   -- Bo3
    v_losses_allowed := 1;
    v_target_tier := rs.tier;
    v_target_div := public.re_division_from_rank(LEAST(4, public.re_division_rank(rs.division) + 1));
  END IF;

  INSERT INTO public.promotion_series(
    user_id, season_id, kind, from_tier, from_division,
    target_tier, target_division, wins_required, losses_allowed, status
  ) VALUES (
    p_user_id, rs.season_id, v_kind, rs.tier, rs.division,
    v_target_tier, v_target_div, v_wins_required, v_losses_allowed, 'active'
  ) RETURNING * INTO inserted;

  RETURN inserted;
END $$;

-- ============================================================
-- 6. RPC: re_record_promotion_result
-- ============================================================
CREATE OR REPLACE FUNCTION public.re_record_promotion_result(p_user_id uuid, p_match_id uuid, p_won boolean)
RETURNS public.promotion_series
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  s public.promotion_series;
  rs public.rank_states;
  new_status public.promotion_status;
  retained_lp integer;
BEGIN
  rs := public.ensure_rank_state(p_user_id);

  SELECT * INTO s FROM public.promotion_series
  WHERE user_id = p_user_id AND season_id = rs.season_id AND status = 'active'
  ORDER BY created_at DESC LIMIT 1;
  IF s.id IS NULL THEN RETURN NULL; END IF;

  -- Idempotent attempt log
  INSERT INTO public.promotion_attempts(series_id, match_id, user_id, won)
  VALUES (s.id, p_match_id, p_user_id, p_won)
  ON CONFLICT (series_id, match_id) DO NOTHING;

  IF p_won THEN
    UPDATE public.promotion_series SET wins = wins + 1 WHERE id = s.id RETURNING * INTO s;
  ELSE
    UPDATE public.promotion_series SET losses = losses + 1 WHERE id = s.id RETURNING * INTO s;
  END IF;

  -- Check closure
  IF s.wins >= s.wins_required THEN
    new_status := 'promoted';
    retained_lp := CASE WHEN s.kind = 'tier' THEN 75 ELSE 50 END;

    UPDATE public.rank_states SET
      tier = s.target_tier,
      division = s.target_division,
      lp = retained_lp,
      demotion_shield = 5,
      updated_at = now()
    WHERE user_id = p_user_id AND season_id = rs.season_id;

    UPDATE public.promotion_series
    SET status = 'promoted', closed_at = now()
    WHERE id = s.id RETURNING * INTO s;

  ELSIF s.losses > s.losses_allowed THEN
    new_status := 'failed';
    -- Drop back to 75 LP (one game from another attempt)
    UPDATE public.rank_states SET
      lp = 75,
      updated_at = now()
    WHERE user_id = p_user_id AND season_id = rs.season_id;

    UPDATE public.promotion_series
    SET status = 'failed', closed_at = now()
    WHERE id = s.id RETURNING * INTO s;
  END IF;

  RETURN s;
END $$;

-- ============================================================
-- 7. Rewrite re_apply_match: integrate promo series + demotion shield + division
-- ============================================================
CREATE OR REPLACE FUNCTION public.re_apply_match(_match_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  m record; p record; opp_avg_mmr numeric; exp_score numeric; actual numeric;
  k_base integer; k_eff numeric; rd_mult numeric;
  base_delta integer; perf_bonus_pct numeric; perf_delta integer; mmr_delta integer;
  lp_delta integer; rs public.rank_states;
  new_lp integer; new_tier public.rank_tier; new_division public.rank_division;
  is_rated boolean;
  loss_count_2h integer;
  match_duration_sec integer; time_used_sec integer; time_pct numeric;
  hard_solved integer;
  active_series public.promotion_series;
  is_iron_floor boolean;
  div_rank_n integer; tier_rank_n integer;
  shield_decrement integer;
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

    -- Dynamic K with RD multiplier
    k_base := public.re_k_factor(rs.games_played, rs.mmr_deviation, rs.placements_remaining > 0);
    rd_mult := LEAST(2.0, GREATEST(0.5, rs.mmr_deviation::numeric / 50.0));
    k_eff := k_base * rd_mult;
    base_delta := round(k_eff * (actual - exp_score));

    -- Performance bonus
    perf_bonus_pct := 0;
    IF actual = 1.0 THEN
      time_used_sec := COALESCE(p.total_solve_time_sec, match_duration_sec);
      time_pct := GREATEST(0, LEAST(1, 1.0 - (time_used_sec::numeric / NULLIF(match_duration_sec,0))));
      perf_bonus_pct := perf_bonus_pct + (time_pct * 0.15);
      IF COALESCE(p.wrong_submissions,0) = 0 AND COALESCE(p.problems_solved,0) > 0 THEN
        perf_bonus_pct := perf_bonus_pct + 0.05;
      END IF;
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

    -- Streak modifiers on LP
    lp_delta := mmr_delta;
    IF actual = 1.0 THEN
      IF rs.win_streak >= 6 THEN lp_delta := lp_delta + 12;
      ELSIF rs.win_streak >= 4 THEN lp_delta := lp_delta + 8;
      ELSIF rs.win_streak >= 2 THEN lp_delta := lp_delta + 5;
      ELSIF rs.win_streak >= 1 THEN lp_delta := lp_delta + 2;
      END IF;
    ELSIF actual = 0.0 THEN
      IF rs.loss_streak >= 4 THEN lp_delta := round(lp_delta * 0.65);
      ELSIF rs.loss_streak >= 3 THEN lp_delta := round(lp_delta * 0.75);
      ELSIF rs.loss_streak >= 2 THEN lp_delta := round(lp_delta * 0.85);
      END IF;
    END IF;

    -- Check for active promotion series
    SELECT * INTO active_series FROM public.promotion_series
    WHERE user_id = p.user_id AND season_id = m.season_id AND status = 'active'
    ORDER BY created_at DESC LIMIT 1;

    new_tier := rs.tier;
    new_division := rs.division;
    new_lp := rs.lp;

    IF active_series.id IS NOT NULL AND actual <> 0.5 THEN
      -- Series in progress: do not move LP/tier here; the series RPC handles it
      PERFORM public.re_record_promotion_result(p.user_id, _match_id, actual = 1.0);
      -- After RPC, refresh rank state for history record
      SELECT * INTO rs FROM public.rank_states WHERE user_id = p.user_id AND season_id = m.season_id;
      new_lp := rs.lp;
      new_tier := rs.tier;
      new_division := rs.division;
      shield_decrement := 0; -- series RPC manages shield
    ELSE
      -- Normal LP application
      new_lp := rs.lp + lp_delta;
      is_iron_floor := (rs.tier = 'bronze' AND rs.division = 'IV');

      IF new_lp >= 100 THEN
        -- Cap at 100; series will be auto-started below
        new_lp := 100;
      ELSIF new_lp < 0 THEN
        IF rs.demotion_shield > 0 THEN
          new_lp := 0;  -- shield holds tier; shield decremented below
        ELSIF is_iron_floor THEN
          new_lp := 0;  -- absolute floor
        ELSE
          -- Demote: division first, then tier
          div_rank_n := public.re_division_rank(rs.division);
          IF div_rank_n > 1 THEN
            new_division := public.re_division_from_rank(div_rank_n - 1);
            new_lp := 25;
          ELSE
            -- Drop a tier (if possible), reset division to I
            tier_rank_n := public.re_tier_rank(rs.tier);
            IF tier_rank_n > 1 THEN
              new_tier := public.re_tier_from_rank(tier_rank_n - 1);
              new_division := 'I';
              new_lp := 25;
            ELSE
              new_lp := 0; -- bronze IV floor
            END IF;
          END IF;
        END IF;
      END IF;

      shield_decrement := 1;
    END IF;

    -- Rating history snapshot
    INSERT INTO public.rating_history(
      user_id, season_id, match_id,
      mmr_before, mmr_after, lp_before, lp_after,
      tier_before, tier_after, k_factor, expected_score, actual_score, reason
    ) VALUES (
      p.user_id, m.season_id, _match_id,
      rs.mmr, rs.mmr + mmr_delta, rs.lp, new_lp,
      rs.tier, new_tier, k_base, exp_score, actual,
      CASE WHEN actual = 1.0 THEN 'win' WHEN actual = 0.0 THEN 'loss' ELSE 'draw' END
    );

    -- Persist updates (skip LP/tier/division if series RPC already wrote them)
    IF active_series.id IS NOT NULL AND actual <> 0.5 THEN
      UPDATE public.rank_states SET
        mmr = mmr + mmr_delta,
        mmr_deviation = GREATEST(50, mmr_deviation - 10),
        games_played = games_played + 1,
        placements_remaining = GREATEST(0, placements_remaining - 1),
        win_streak = CASE WHEN actual = 1.0 THEN win_streak + 1 ELSE 0 END,
        loss_streak = CASE WHEN actual = 0.0 THEN loss_streak + 1 ELSE 0 END,
        last_match_at = now(),
        updated_at = now()
      WHERE user_id = p.user_id AND season_id = m.season_id;
    ELSE
      UPDATE public.rank_states SET
        mmr = mmr + mmr_delta,
        mmr_deviation = GREATEST(50, mmr_deviation - 10),
        lp = new_lp,
        tier = new_tier,
        division = new_division,
        games_played = games_played + 1,
        placements_remaining = GREATEST(0, placements_remaining - 1),
        win_streak = CASE WHEN actual = 1.0 THEN win_streak + 1 ELSE 0 END,
        loss_streak = CASE WHEN actual = 0.0 THEN loss_streak + 1 ELSE 0 END,
        demotion_shield = CASE
          WHEN (new_tier <> rs.tier OR new_division <> rs.division) AND actual = 1.0 THEN 5
          ELSE GREATEST(0, demotion_shield - shield_decrement)
        END,
        last_match_at = now(),
        updated_at = now()
      WHERE user_id = p.user_id AND season_id = m.season_id;
    END IF;

    -- Auto-start a promotion series if LP just hit 100 and none active
    IF new_lp >= 100 AND active_series.id IS NULL THEN
      PERFORM public.re_start_promotion_series(p.user_id, NULL);
    END IF;

    -- Tilt cooldown
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

-- Enable realtime for promotion_series so the frontend hook can subscribe
ALTER PUBLICATION supabase_realtime ADD TABLE public.promotion_series;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promotion_attempts;