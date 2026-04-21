
-- 1. rank_states additions
ALTER TABLE public.rank_states
  ADD COLUMN IF NOT EXISTS decay_bank_days int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS peak_tier public.rank_tier,
  ADD COLUMN IF NOT EXISTS peak_division public.rank_division,
  ADD COLUMN IF NOT EXISTS peak_lp int,
  ADD COLUMN IF NOT EXISTS peak_mmr int;

-- 2. season_history table
CREATE TABLE IF NOT EXISTS public.season_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  final_tier public.rank_tier NOT NULL,
  final_division public.rank_division NOT NULL,
  final_lp int NOT NULL DEFAULT 0,
  final_mmr int NOT NULL DEFAULT 1000,
  peak_tier public.rank_tier,
  peak_division public.rank_division,
  peak_lp int,
  peak_mmr int,
  total_matches int NOT NULL DEFAULT 0,
  wins int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  archived_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(season_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_season_history_user ON public.season_history(user_id, archived_at DESC);
CREATE INDEX IF NOT EXISTS idx_season_history_season ON public.season_history(season_id);

ALTER TABLE public.season_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own season history" ON public.season_history;
CREATE POLICY "Users read own season history"
  ON public.season_history FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "No direct season_history writes" ON public.season_history;
CREATE POLICY "No direct season_history writes"
  ON public.season_history FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "No direct season_history updates" ON public.season_history;
CREATE POLICY "No direct season_history updates"
  ON public.season_history FOR UPDATE USING (false);

DROP POLICY IF EXISTS "No direct season_history deletes" ON public.season_history;
CREATE POLICY "No direct season_history deletes"
  ON public.season_history FOR DELETE USING (false);

-- 3. Helper: tier ordinal for "plat+" gating (relies on existing re_tier_rank)
-- bronze=1, silver=2, gold=3, platinum=4, diamond=5, master=6, grandmaster=7, challenger=8 (assumed)
-- We use re_tier_rank to be safe.

-- 4. re_apply_decay()
CREATE OR REPLACE FUNCTION public.re_apply_decay()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_season_id uuid;
  rs record;
  grace_days int;
  weekly_loss int;
  days_since_match int;
  days_inactive int;
  consume int;
  cycles_since_decay numeric;
  cycle_anchor timestamptz;
  lp_loss int;
  new_lp int;
  new_tier public.rank_tier;
  new_division public.rank_division;
  div_rank_n int;
  tier_rank_n int;
  affected int := 0;
BEGIN
  SELECT id INTO current_season_id FROM public.seasons
    WHERE status = 'active'::season_status
    ORDER BY starts_at DESC LIMIT 1;
  IF current_season_id IS NULL THEN RETURN 0; END IF;

  FOR rs IN
    SELECT * FROM public.rank_states
    WHERE season_id = current_season_id
      AND public.re_tier_rank(tier) >= 4   -- platinum+
      AND last_match_at IS NOT NULL
  LOOP
    -- Tier-based grace + weekly loss
    CASE rs.tier
      WHEN 'platinum' THEN grace_days := 21; weekly_loss := 25;
      WHEN 'diamond'  THEN grace_days := 14; weekly_loss := 35;
      WHEN 'master'   THEN grace_days := 10; weekly_loss := 50;
      ELSE grace_days := 7; weekly_loss := 75;  -- grandmaster, challenger
    END CASE;

    days_since_match := floor(extract(epoch FROM now() - rs.last_match_at) / 86400);
    IF days_since_match <= grace_days THEN CONTINUE; END IF;

    days_inactive := days_since_match - grace_days;

    -- Bank absorbs first
    IF rs.decay_bank_days > 0 THEN
      consume := LEAST(rs.decay_bank_days, days_inactive);
      UPDATE public.rank_states
        SET decay_bank_days = decay_bank_days - consume,
            decay_applied_at = now(),
            updated_at = now()
        WHERE id = rs.id;
      affected := affected + 1;
      CONTINUE;
    END IF;

    -- Compute LP loss prorated by time since last decay (or grace expiry)
    cycle_anchor := COALESCE(rs.decay_applied_at, rs.last_match_at + (grace_days || ' days')::interval);
    cycles_since_decay := GREATEST(0, extract(epoch FROM now() - cycle_anchor) / 604800.0);
    lp_loss := GREATEST(weekly_loss, round(weekly_loss * cycles_since_decay));
    -- cap at 2 weekly cycles per tick to avoid one-shot wipes
    lp_loss := LEAST(lp_loss, weekly_loss * 2);

    new_lp := rs.lp - lp_loss;
    new_tier := rs.tier;
    new_division := rs.division;

    IF new_lp < 0 THEN
      div_rank_n := public.re_division_rank(rs.division);
      IF div_rank_n > 1 THEN
        new_division := public.re_division_from_rank(div_rank_n - 1);
        new_lp := 25;
      ELSE
        tier_rank_n := public.re_tier_rank(rs.tier);
        IF tier_rank_n > 1 THEN
          new_tier := public.re_tier_from_rank(tier_rank_n - 1);
          new_division := 'I';
          new_lp := 25;
        ELSE
          new_lp := 0;
        END IF;
      END IF;
    END IF;

    UPDATE public.rank_states
      SET lp = new_lp,
          tier = new_tier,
          division = new_division,
          decay_applied_at = now(),
          updated_at = now()
      WHERE id = rs.id;

    affected := affected + 1;
  END LOOP;

  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.re_apply_decay() FROM PUBLIC, anon, authenticated;

-- 5. Patch re_apply_match: grant decay bank + track peak.
-- We append a post-update step via a wrapper trigger on rank_states that only adjusts
-- peak fields and decay_bank_days when a ranked match increments games_played.
CREATE OR REPLACE FUNCTION public.re_track_peak_and_bank()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  cap int;
BEGIN
  -- Track peak (compare by tier rank, then division rank, then lp; mmr separately)
  IF NEW.peak_tier IS NULL
     OR public.re_tier_rank(NEW.tier) > public.re_tier_rank(NEW.peak_tier)
     OR (public.re_tier_rank(NEW.tier) = public.re_tier_rank(NEW.peak_tier)
         AND public.re_division_rank(NEW.division) > public.re_division_rank(NEW.peak_division))
     OR (NEW.tier = NEW.peak_tier AND NEW.division = NEW.peak_division
         AND NEW.lp > COALESCE(NEW.peak_lp, -1))
  THEN
    NEW.peak_tier := NEW.tier;
    NEW.peak_division := NEW.division;
    NEW.peak_lp := NEW.lp;
  END IF;

  IF NEW.peak_mmr IS NULL OR NEW.mmr > NEW.peak_mmr THEN
    NEW.peak_mmr := NEW.mmr;
  END IF;

  -- Decay bank grant: when games_played increments, +1 day, capped by tier
  IF TG_OP = 'UPDATE' AND NEW.games_played > OLD.games_played THEN
    cap := CASE NEW.tier
      WHEN 'platinum' THEN 14
      WHEN 'diamond'  THEN 10
      WHEN 'master'   THEN 7
      WHEN 'grandmaster' THEN 5
      WHEN 'challenger' THEN 5
      ELSE 0
    END;
    IF cap > 0 THEN
      NEW.decay_bank_days := LEAST(cap, COALESCE(NEW.decay_bank_days, 0) + 1);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rank_states_peak_bank ON public.rank_states;
CREATE TRIGGER trg_rank_states_peak_bank
  BEFORE INSERT OR UPDATE ON public.rank_states
  FOR EACH ROW EXECUTE FUNCTION public.re_track_peak_and_bank();

-- 6. re_close_and_open_season(p_name text, p_starts timestamptz, p_ends timestamptz)
CREATE OR REPLACE FUNCTION public.re_close_and_open_season(
  p_name text,
  p_starts timestamptz,
  p_ends timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_season_id uuid;
  new_season_id uuid;
  archived_count int := 0;
  rs record;
  user_wins int;
  user_losses int;
  user_total int;
  new_mmr int;
  new_tier public.rank_tier;
  new_division public.rank_division;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT id INTO current_season_id FROM public.seasons
    WHERE status = 'active'::season_status
    ORDER BY starts_at DESC LIMIT 1;

  IF current_season_id IS NULL THEN
    RAISE EXCEPTION 'no active season to close';
  END IF;

  -- Archive each rank_state into season_history
  FOR rs IN SELECT * FROM public.rank_states WHERE season_id = current_season_id LOOP
    SELECT
      count(*) FILTER (WHERE bm.winner_id = rs.user_id),
      count(*) FILTER (WHERE bm.winner_id IS NOT NULL AND bm.winner_id <> rs.user_id),
      count(*)
    INTO user_wins, user_losses, user_total
    FROM public.battle_participants bp
    JOIN public.battle_matches bm ON bm.id = bp.match_id
    WHERE bp.user_id = rs.user_id
      AND bm.season_id = current_season_id
      AND bm.ended_at IS NOT NULL;

    INSERT INTO public.season_history(
      season_id, user_id,
      final_tier, final_division, final_lp, final_mmr,
      peak_tier, peak_division, peak_lp, peak_mmr,
      total_matches, wins, losses
    ) VALUES (
      current_season_id, rs.user_id,
      rs.tier, rs.division, rs.lp, rs.mmr,
      COALESCE(rs.peak_tier, rs.tier),
      COALESCE(rs.peak_division, rs.division),
      COALESCE(rs.peak_lp, rs.lp),
      COALESCE(rs.peak_mmr, rs.mmr),
      COALESCE(user_total, 0), COALESCE(user_wins, 0), COALESCE(user_losses, 0)
    )
    ON CONFLICT (season_id, user_id) DO NOTHING;

    archived_count := archived_count + 1;
  END LOOP;

  -- Close current season
  UPDATE public.seasons SET status = 'completed'::season_status WHERE id = current_season_id;

  -- Open new season
  INSERT INTO public.seasons(name, starts_at, ends_at, status)
    VALUES (p_name, p_starts, p_ends, 'active'::season_status)
    RETURNING id INTO new_season_id;

  -- Soft-reset every player into the new season
  FOR rs IN SELECT * FROM public.rank_states WHERE season_id = current_season_id LOOP
    new_mmr := round((rs.mmr + 1200) / 2.0);
    -- Tier from MMR (rough mapping)
    IF new_mmr < 800 THEN new_tier := 'bronze'; new_division := 'IV';
    ELSIF new_mmr < 1100 THEN new_tier := 'silver'; new_division := 'IV';
    ELSIF new_mmr < 1400 THEN new_tier := 'gold'; new_division := 'IV';
    ELSIF new_mmr < 1700 THEN new_tier := 'platinum'; new_division := 'IV';
    ELSIF new_mmr < 2000 THEN new_tier := 'diamond'; new_division := 'IV';
    ELSIF new_mmr < 2400 THEN new_tier := 'master'; new_division := 'IV';
    ELSE new_tier := 'grandmaster'; new_division := 'IV';
    END IF;

    INSERT INTO public.rank_states(
      user_id, season_id, mmr, mmr_deviation, lp, tier, division,
      games_played, placements_remaining, win_streak, loss_streak,
      demotion_shield, decay_bank_days, last_match_at, decay_applied_at,
      peak_tier, peak_division, peak_lp, peak_mmr
    ) VALUES (
      rs.user_id, new_season_id, new_mmr, 100, 0, new_tier, new_division,
      0, 5, 0, 0,
      5, 0, NULL, NULL,
      NULL, NULL, NULL, NULL
    )
    ON CONFLICT (user_id, season_id) DO NOTHING;
  END LOOP;

  RETURN jsonb_build_object(
    'users_archived', archived_count,
    'new_season_id', new_season_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.re_close_and_open_season(text, timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.re_close_and_open_season(text, timestamptz, timestamptz) TO authenticated;
