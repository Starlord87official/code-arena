-- ============================================================
-- Step 5: Rating Engine + Match Completion
-- ============================================================

-- ── 1. rank_states table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rank_states (
  user_id uuid NOT NULL,
  season_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  mmr int NOT NULL DEFAULT 1000,
  peak_mmr int NOT NULL DEFAULT 1000,
  wins int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  draws int NOT NULL DEFAULT 0,
  games_played int NOT NULL DEFAULT 0,
  placement_remaining int NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, season_id)
);

ALTER TABLE public.rank_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own rank state" ON public.rank_states;
CREATE POLICY "Users read own rank state"
  ON public.rank_states FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "No direct insert rank_states" ON public.rank_states;
CREATE POLICY "No direct insert rank_states"
  ON public.rank_states FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "No direct update rank_states" ON public.rank_states;
CREATE POLICY "No direct update rank_states"
  ON public.rank_states FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "No direct delete rank_states" ON public.rank_states;
CREATE POLICY "No direct delete rank_states"
  ON public.rank_states FOR DELETE
  USING (false);

-- ── 2. ELO helper ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.compute_elo_delta(
  p_rating_a int,
  p_rating_b int,
  p_score_a numeric,
  p_k int DEFAULT 32
)
RETURNS int
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT round(p_k * (p_score_a - (1.0 / (1.0 + power(10.0, (p_rating_b - p_rating_a)::numeric / 400.0)))))::int;
$$;

-- ── 3. score_match ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.score_match(p_match_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH best_per_problem AS (
    SELECT DISTINCT ON (s.user_id, s.problem_id)
      s.user_id,
      s.problem_id,
      s.submitted_at,
      mp.points
    FROM public.battle_match_submissions s
    JOIN public.battle_match_problems mp ON mp.id = s.problem_id
    WHERE s.match_id = p_match_id
      AND s.verdict = 'accepted'
    ORDER BY s.user_id, s.problem_id, s.submitted_at ASC
  ),
  agg AS (
    SELECT
      bp.user_id,
      COALESCE(SUM(bpp.points), 0)::int AS total_score,
      COUNT(bpp.problem_id)::int AS solved,
      MAX(bpp.submitted_at) AS last_solve_at,
      (
        SELECT COUNT(*)::int FROM public.battle_match_submissions s2
        WHERE s2.match_id = p_match_id
          AND s2.user_id = bp.user_id
          AND s2.verdict NOT IN ('accepted'::submission_verdict, 'pending'::submission_verdict)
      ) AS wrongs
    FROM public.battle_participants bp
    LEFT JOIN best_per_problem bpp ON bpp.user_id = bp.user_id
    WHERE bp.match_id = p_match_id
    GROUP BY bp.user_id
  )
  UPDATE public.battle_participants bp
  SET
    score = a.total_score,
    problems_solved = a.solved,
    wrong_submissions = a.wrongs,
    total_solve_time_sec = COALESCE(
      EXTRACT(EPOCH FROM (a.last_solve_at - (
        SELECT phase_started_at FROM public.battle_matches WHERE id = p_match_id
      )))::int,
      0
    )
  FROM agg a
  WHERE bp.match_id = p_match_id AND bp.user_id = a.user_id;
END;
$$;

-- ── 4. finalize_match ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.finalize_match(
  p_match_id uuid,
  p_reason text DEFAULT 'manual'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match record;
  v_p1 record;
  v_p2 record;
  v_winner_id uuid;
  v_is_draw boolean := false;
  v_k int;
  v_delta1 int := 0;
  v_delta2 int := 0;
  v_score1 numeric;
  v_xp1 int := 0;
  v_xp2 int := 0;
  v_state1 record;
  v_state2 record;
  v_last_solve1 timestamptz;
  v_last_solve2 timestamptz;
BEGIN
  SELECT * INTO v_match FROM public.battle_matches WHERE id = p_match_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'match_not_found');
  END IF;

  IF v_match.state = 'completed'::match_state OR v_match.status = 'completed' THEN
    RETURN jsonb_build_object('success', true, 'already_completed', true, 'winner_id', v_match.winner_id);
  END IF;

  PERFORM public.score_match(p_match_id);

  SELECT * INTO v_p1 FROM public.battle_participants
    WHERE match_id = p_match_id ORDER BY created_at ASC LIMIT 1;
  SELECT * INTO v_p2 FROM public.battle_participants
    WHERE match_id = p_match_id AND user_id <> v_p1.user_id ORDER BY created_at ASC LIMIT 1;

  IF v_p2.user_id IS NULL THEN
    v_winner_id := CASE WHEN v_p1.problems_solved > 0 THEN v_p1.user_id ELSE NULL END;
    v_is_draw := v_winner_id IS NULL;
  ELSE
    SELECT MAX(s.submitted_at) INTO v_last_solve1
      FROM public.battle_match_submissions s
      WHERE s.match_id = p_match_id AND s.user_id = v_p1.user_id AND s.verdict = 'accepted';
    SELECT MAX(s.submitted_at) INTO v_last_solve2
      FROM public.battle_match_submissions s
      WHERE s.match_id = p_match_id AND s.user_id = v_p2.user_id AND s.verdict = 'accepted';

    IF v_p1.is_forfeit AND NOT v_p2.is_forfeit THEN
      v_winner_id := v_p2.user_id;
    ELSIF v_p2.is_forfeit AND NOT v_p1.is_forfeit THEN
      v_winner_id := v_p1.user_id;
    ELSIF v_p1.problems_solved <> v_p2.problems_solved THEN
      v_winner_id := CASE WHEN v_p1.problems_solved > v_p2.problems_solved THEN v_p1.user_id ELSE v_p2.user_id END;
    ELSIF v_p1.score <> v_p2.score THEN
      v_winner_id := CASE WHEN v_p1.score > v_p2.score THEN v_p1.user_id ELSE v_p2.user_id END;
    ELSIF v_last_solve1 IS NOT NULL AND v_last_solve2 IS NOT NULL AND v_last_solve1 <> v_last_solve2 THEN
      v_winner_id := CASE WHEN v_last_solve1 < v_last_solve2 THEN v_p1.user_id ELSE v_p2.user_id END;
    ELSE
      v_is_draw := true;
      v_winner_id := NULL;
    END IF;
  END IF;

  IF v_p2.user_id IS NOT NULL THEN
    INSERT INTO public.rank_states (user_id) VALUES (v_p1.user_id)
      ON CONFLICT (user_id, season_id) DO NOTHING;
    INSERT INTO public.rank_states (user_id) VALUES (v_p2.user_id)
      ON CONFLICT (user_id, season_id) DO NOTHING;

    SELECT * INTO v_state1 FROM public.rank_states
      WHERE user_id = v_p1.user_id AND season_id = '00000000-0000-0000-0000-000000000000'::uuid;
    SELECT * INTO v_state2 FROM public.rank_states
      WHERE user_id = v_p2.user_id AND season_id = '00000000-0000-0000-0000-000000000000'::uuid;

    IF v_match.is_rated THEN
      v_k := CASE
        WHEN v_state1.placement_remaining > 0 OR v_state2.placement_remaining > 0 THEN 40
        ELSE 32
      END;
    ELSE
      v_k := 24;
    END IF;

    v_score1 := CASE
      WHEN v_is_draw THEN 0.5
      WHEN v_winner_id = v_p1.user_id THEN 1.0
      ELSE 0.0
    END;

    v_delta1 := public.compute_elo_delta(v_state1.mmr, v_state2.mmr, v_score1, v_k);
    v_delta2 := -v_delta1;

    UPDATE public.battle_participants
      SET elo_before = v_state1.mmr,
          elo_after = v_state1.mmr + v_delta1,
          elo_change = v_delta1
      WHERE match_id = p_match_id AND user_id = v_p1.user_id;

    UPDATE public.battle_participants
      SET elo_before = v_state2.mmr,
          elo_after = v_state2.mmr + v_delta2,
          elo_change = v_delta2
      WHERE match_id = p_match_id AND user_id = v_p2.user_id;

    UPDATE public.rank_states SET
      mmr = mmr + v_delta1,
      peak_mmr = GREATEST(peak_mmr, mmr + v_delta1),
      wins = wins + (CASE WHEN v_winner_id = v_p1.user_id THEN 1 ELSE 0 END),
      losses = losses + (CASE WHEN v_winner_id = v_p2.user_id THEN 1 ELSE 0 END),
      draws = draws + (CASE WHEN v_is_draw THEN 1 ELSE 0 END),
      games_played = games_played + 1,
      placement_remaining = GREATEST(0, placement_remaining - 1),
      updated_at = now()
    WHERE user_id = v_p1.user_id AND season_id = '00000000-0000-0000-0000-000000000000'::uuid;

    UPDATE public.rank_states SET
      mmr = mmr + v_delta2,
      peak_mmr = GREATEST(peak_mmr, mmr + v_delta2),
      wins = wins + (CASE WHEN v_winner_id = v_p2.user_id THEN 1 ELSE 0 END),
      losses = losses + (CASE WHEN v_winner_id = v_p1.user_id THEN 1 ELSE 0 END),
      draws = draws + (CASE WHEN v_is_draw THEN 1 ELSE 0 END),
      games_played = games_played + 1,
      placement_remaining = GREATEST(0, placement_remaining - 1),
      updated_at = now()
    WHERE user_id = v_p2.user_id AND season_id = '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;

  v_xp1 := 50 + COALESCE(v_p1.problems_solved, 0) * 25 + (CASE WHEN v_winner_id = v_p1.user_id THEN 100 ELSE 0 END);
  UPDATE public.battle_participants SET xp_earned = v_xp1
    WHERE match_id = p_match_id AND user_id = v_p1.user_id;

  IF v_p2.user_id IS NOT NULL THEN
    v_xp2 := 50 + COALESCE(v_p2.problems_solved, 0) * 25 + (CASE WHEN v_winner_id = v_p2.user_id THEN 100 ELSE 0 END);
    UPDATE public.battle_participants SET xp_earned = v_xp2
      WHERE match_id = p_match_id AND user_id = v_p2.user_id;
  END IF;

  UPDATE public.battle_matches
    SET winner_id = v_winner_id,
        is_draw = v_is_draw,
        ended_at = now(),
        status = 'completed',
        state = 'completed'::match_state
    WHERE id = p_match_id;

  INSERT INTO public.battle_event_log (match_id, event_type, payload)
  VALUES (
    p_match_id,
    'match_completed',
    jsonb_build_object(
      'reason', p_reason,
      'winner_id', v_winner_id,
      'is_draw', v_is_draw,
      'p1', jsonb_build_object('user_id', v_p1.user_id, 'score', v_p1.score, 'solved', v_p1.problems_solved, 'elo_delta', v_delta1, 'xp', v_xp1),
      'p2', CASE WHEN v_p2.user_id IS NOT NULL THEN jsonb_build_object('user_id', v_p2.user_id, 'score', v_p2.score, 'solved', v_p2.problems_solved, 'elo_delta', v_delta2, 'xp', v_xp2) ELSE NULL END
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'winner_id', v_winner_id,
    'is_draw', v_is_draw,
    'reason', p_reason
  );
END;
$$;

-- ── 5. forfeit_match ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.forfeit_match(p_match_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_participant boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.battle_participants
    WHERE match_id = p_match_id AND user_id = v_uid
  ) INTO v_is_participant;

  IF NOT v_is_participant THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_participant');
  END IF;

  UPDATE public.battle_participants
    SET is_forfeit = true
    WHERE match_id = p_match_id AND user_id = v_uid;

  RETURN public.finalize_match(p_match_id, 'forfeit');
END;
$$;

-- ── 6. tick_active_matches ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.tick_active_matches()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match record;
  v_count int := 0;
  v_total_problems int;
  v_solved_by_user int;
BEGIN
  FOR v_match IN
    SELECT id, phase_started_at, duration_minutes
    FROM public.battle_matches
    WHERE status = 'active'
      AND state IN ('active'::match_state, 'judging'::match_state)
      AND phase_started_at + (duration_minutes || ' minutes')::interval < now()
  LOOP
    PERFORM public.finalize_match(v_match.id, 'time_expired');
    v_count := v_count + 1;
  END LOOP;

  FOR v_match IN
    SELECT m.id
    FROM public.battle_matches m
    WHERE m.status = 'active'
      AND m.state = 'active'::match_state
  LOOP
    SELECT COUNT(*) INTO v_total_problems
      FROM public.battle_match_problems WHERE match_id = v_match.id;

    IF v_total_problems = 0 THEN CONTINUE; END IF;

    SELECT MAX(solved_count) INTO v_solved_by_user
    FROM (
      SELECT s.user_id, COUNT(DISTINCT s.problem_id) AS solved_count
      FROM public.battle_match_submissions s
      WHERE s.match_id = v_match.id AND s.verdict = 'accepted'
      GROUP BY s.user_id
    ) t;

    IF COALESCE(v_solved_by_user, 0) >= v_total_problems THEN
      PERFORM public.finalize_match(v_match.id, 'all_solved');
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ── 7. instant solo-finish helper ───────────────────────────
CREATE OR REPLACE FUNCTION public.check_match_completion_for_user(
  p_match_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total int;
  v_solved int;
  v_state match_state;
BEGIN
  SELECT state INTO v_state FROM public.battle_matches WHERE id = p_match_id;
  IF v_state IS NULL OR v_state <> 'active'::match_state THEN RETURN; END IF;

  SELECT COUNT(*) INTO v_total
    FROM public.battle_match_problems WHERE match_id = p_match_id;
  IF v_total = 0 THEN RETURN; END IF;

  SELECT COUNT(DISTINCT problem_id) INTO v_solved
    FROM public.battle_match_submissions
    WHERE match_id = p_match_id
      AND user_id = p_user_id
      AND verdict = 'accepted';

  IF v_solved >= v_total THEN
    PERFORM public.finalize_match(p_match_id, 'all_solved');
  END IF;
END;
$$;

-- ── 8. complete_duo_battle shim ─────────────────────────────
CREATE OR REPLACE FUNCTION public.complete_duo_battle(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_match boolean;
  v_result jsonb;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.battle_matches WHERE id = p_session_id) INTO v_is_match;

  IF v_is_match THEN
    v_result := public.finalize_match(p_session_id, 'manual_complete');
    RETURN jsonb_build_object(
      'success', COALESCE((v_result->>'success')::boolean, false),
      'winner_id', v_result->>'winner_id',
      'is_draw', COALESCE((v_result->>'is_draw')::boolean, false),
      'session_id', p_session_id
    );
  END IF;

  UPDATE public.battle_sessions
    SET status = 'completed', end_time = now()
    WHERE id = p_session_id AND status <> 'completed';

  RETURN jsonb_build_object('success', true, 'session_id', p_session_id, 'legacy', true);
END;
$$;