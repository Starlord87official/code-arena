DROP FUNCTION IF EXISTS public.score_match(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.complete_duo_battle(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.finalize_match(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.forfeit_match(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.tick_active_matches() CASCADE;
DROP FUNCTION IF EXISTS public.check_match_completion_for_user(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.compute_elo_delta(int, int, numeric, int) CASCADE;