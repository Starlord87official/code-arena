
CREATE OR REPLACE FUNCTION public.re_track_peak_and_bank()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  cap int;
BEGIN
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
