-- A. Patch finalize_match(uuid, text): correct column name, season-aware rank_states upserts, null-safe MMR
CREATE OR REPLACE FUNCTION public.finalize_match(p_match_id uuid, p_reason text DEFAULT 'manual'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_season_id uuid;
  v_mmr1 int;
  v_mmr2 int;
  v_pr1 int;
  v_pr2 int;
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
    -- Resolve season: prefer the match's season, then any active season, else the legacy zero UUID.
    v_season_id := COALESCE(
      v_match.season_id,
      (SELECT id FROM public.seasons WHERE status = 'active' ORDER BY created_at DESC LIMIT 1),
      '00000000-0000-0000-0000-000000000000'::uuid
    );

    INSERT INTO public.rank_states (user_id, season_id) VALUES (v_p1.user_id, v_season_id)
      ON CONFLICT (user_id, season_id) DO NOTHING;
    INSERT INTO public.rank_states (user_id, season_id) VALUES (v_p2.user_id, v_season_id)
      ON CONFLICT (user_id, season_id) DO NOTHING;

    SELECT * INTO v_state1 FROM public.rank_states
      WHERE user_id = v_p1.user_id AND season_id = v_season_id;
    SELECT * INTO v_state2 FROM public.rank_states
      WHERE user_id = v_p2.user_id AND season_id = v_season_id;

    v_mmr1 := COALESCE(v_state1.mmr, 1000);
    v_mmr2 := COALESCE(v_state2.mmr, 1000);
    v_pr1  := COALESCE(v_state1.placements_remaining, 0);
    v_pr2  := COALESCE(v_state2.placements_remaining, 0);

    IF v_match.is_rated THEN
      v_k := CASE WHEN v_pr1 > 0 OR v_pr2 > 0 THEN 40 ELSE 32 END;
    ELSE
      v_k := 24;
    END IF;

    v_score1 := CASE
      WHEN v_is_draw THEN 0.5
      WHEN v_winner_id = v_p1.user_id THEN 1.0
      ELSE 0.0
    END;

    v_delta1 := public.compute_elo_delta(v_mmr1, v_mmr2, v_score1, v_k);
    v_delta2 := -v_delta1;

    UPDATE public.battle_participants
      SET elo_before = v_mmr1,
          elo_after = v_mmr1 + v_delta1,
          elo_change = v_delta1
      WHERE match_id = p_match_id AND user_id = v_p1.user_id;

    UPDATE public.battle_participants
      SET elo_before = v_mmr2,
          elo_after = v_mmr2 + v_delta2,
          elo_change = v_delta2
      WHERE match_id = p_match_id AND user_id = v_p2.user_id;

    UPDATE public.rank_states SET
      mmr = COALESCE(mmr, 1000) + v_delta1,
      peak_mmr = GREATEST(COALESCE(peak_mmr, 1000), COALESCE(mmr, 1000) + v_delta1),
      wins = COALESCE(wins, 0) + (CASE WHEN v_winner_id = v_p1.user_id THEN 1 ELSE 0 END),
      losses = COALESCE(losses, 0) + (CASE WHEN v_winner_id = v_p2.user_id THEN 1 ELSE 0 END),
      draws = COALESCE(draws, 0) + (CASE WHEN v_is_draw THEN 1 ELSE 0 END),
      games_played = COALESCE(games_played, 0) + 1,
      placements_remaining = GREATEST(0, COALESCE(placements_remaining, 0) - 1),
      updated_at = now()
    WHERE user_id = v_p1.user_id AND season_id = v_season_id;

    UPDATE public.rank_states SET
      mmr = COALESCE(mmr, 1000) + v_delta2,
      peak_mmr = GREATEST(COALESCE(peak_mmr, 1000), COALESCE(mmr, 1000) + v_delta2),
      wins = COALESCE(wins, 0) + (CASE WHEN v_winner_id = v_p2.user_id THEN 1 ELSE 0 END),
      losses = COALESCE(losses, 0) + (CASE WHEN v_winner_id = v_p1.user_id THEN 1 ELSE 0 END),
      draws = COALESCE(draws, 0) + (CASE WHEN v_is_draw THEN 1 ELSE 0 END),
      games_played = COALESCE(games_played, 0) + 1,
      placements_remaining = GREATEST(0, COALESCE(placements_remaining, 0) - 1),
      updated_at = now()
    WHERE user_id = v_p2.user_id AND season_id = v_season_id;
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

  -- Mirror to legacy battle_sessions so post-battle screens and any legacy fallback see it as completed.
  UPDATE public.battle_sessions
    SET status = 'completed',
        end_time = now(),
        winner_id = v_winner_id,
        player_a_score = COALESCE(v_p1.score, 0),
        player_b_score = COALESCE(v_p2.score, 0)
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
$function$;

-- B. Repair corrupted battle_sessions rows where player_a_id == player_b_id but participants has 2 distinct users
UPDATE public.battle_sessions bs
   SET player_a_id = sub.p1,
       player_b_id = sub.p2
  FROM (
    SELECT bp.match_id,
           (array_agg(bp.user_id ORDER BY bp.created_at))[1] AS p1,
           (array_agg(bp.user_id ORDER BY bp.created_at))[2] AS p2
      FROM public.battle_participants bp
     GROUP BY bp.match_id
    HAVING count(DISTINCT bp.user_id) >= 2
  ) sub
 WHERE bs.id = sub.match_id
   AND bs.player_a_id = bs.player_b_id;

-- C. Harden complete_duo_battle(uuid,int,int): delegate to finalize_match when a match row exists
CREATE OR REPLACE FUNCTION public.complete_duo_battle(p_session_id uuid, p_player_a_score integer, p_player_b_score integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_session RECORD;
  v_winner_id UUID;
  v_loser_id UUID;
  v_is_draw BOOLEAN;
  v_elo_change INTEGER;
  v_winner_xp INTEGER;
  v_loser_xp INTEGER;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_session
  FROM battle_sessions
  WHERE id = p_session_id
    AND (player_a_id = v_user_id OR player_b_id = v_user_id)
    AND status = 'active';

  IF v_session.id IS NULL THEN
    -- New pipeline: if a battle_matches row exists and caller is a participant, delegate.
    IF EXISTS (
      SELECT 1
        FROM public.battle_matches m
        JOIN public.battle_participants p ON p.match_id = m.id
       WHERE m.id = p_session_id
         AND p.user_id = v_user_id
    ) THEN
      RETURN public.finalize_match(p_session_id, 'manual_complete')::json;
    END IF;
    RETURN json_build_object('success', false, 'error', 'Battle session not found or already completed');
  END IF;

  IF p_player_a_score > p_player_b_score THEN
    v_winner_id := v_session.player_a_id;
    v_loser_id := v_session.player_b_id;
    v_is_draw := false;
  ELSIF p_player_b_score > p_player_a_score THEN
    v_winner_id := v_session.player_b_id;
    v_loser_id := v_session.player_a_id;
    v_is_draw := false;
  ELSE
    v_winner_id := NULL;
    v_is_draw := true;
  END IF;

  IF v_session.mode = 'ranked' AND NOT v_is_draw THEN
    v_elo_change := 25;
  ELSE
    v_elo_change := 0;
  END IF;

  IF v_session.mode = 'quick' THEN
    v_winner_xp := 50; v_loser_xp := 20;
  ELSIF v_session.mode = 'ranked' THEN
    v_winner_xp := 100; v_loser_xp := 30;
  ELSE
    v_winner_xp := 40; v_loser_xp := 15;
  END IF;

  IF v_is_draw THEN
    v_winner_xp := 35; v_loser_xp := 35;
  END IF;

  UPDATE battle_sessions
     SET status = 'completed',
         end_time = now(),
         player_a_score = p_player_a_score,
         player_b_score = p_player_b_score,
         winner_id = v_winner_id,
         elo_change = v_elo_change,
         xp_awarded_a = CASE WHEN v_is_draw THEN v_winner_xp WHEN v_winner_id = v_session.player_a_id THEN v_winner_xp ELSE v_loser_xp END,
         xp_awarded_b = CASE WHEN v_is_draw THEN v_winner_xp WHEN v_winner_id = v_session.player_b_id THEN v_winner_xp ELSE v_loser_xp END
   WHERE id = p_session_id;

  -- Mirror to new pipeline if a match row exists.
  UPDATE public.battle_matches
     SET state = 'completed'::match_state, status = 'completed', ended_at = now(), winner_id = v_winner_id, is_draw = v_is_draw
   WHERE id = p_session_id AND state <> 'completed'::match_state;

  RETURN json_build_object(
    'success', true,
    'winner_id', v_winner_id,
    'is_draw', v_is_draw,
    'elo_change', v_elo_change,
    'xp_awarded', CASE WHEN v_user_id = v_winner_id THEN v_winner_xp ELSE v_loser_xp END
  );
END;
$function$;