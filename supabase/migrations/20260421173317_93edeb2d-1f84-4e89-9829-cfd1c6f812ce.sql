CREATE OR REPLACE FUNCTION public.re_k_factor(_games integer, _deviation integer, _is_placement boolean)
RETURNS integer LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN _is_placement THEN 48
    WHEN _games < 30 THEN 32
    WHEN _games < 100 THEN 24
    WHEN _deviation < 80 THEN 12
    ELSE 16
  END;
$$;

CREATE OR REPLACE FUNCTION public.re_tier_from_lp(_lp integer)
RETURNS rank_tier LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN _lp >= 4000 THEN 'challenger'::public.rank_tier
    WHEN _lp >= 3500 THEN 'grandmaster'::public.rank_tier
    WHEN _lp >= 3000 THEN 'master'::public.rank_tier
    WHEN _lp >= 2400 THEN 'diamond'::public.rank_tier
    WHEN _lp >= 1800 THEN 'platinum'::public.rank_tier
    WHEN _lp >= 1200 THEN 'gold'::public.rank_tier
    WHEN _lp >= 600 THEN 'silver'::public.rank_tier
    ELSE 'bronze'::public.rank_tier
  END;
$$;