-- A. Patch get_match_result: drop reference to non-existent profiles.email
CREATE OR REPLACE FUNCTION public.get_match_result(p_match_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_match RECORD;
  v_players jsonb;
  v_rounds jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  IF NOT EXISTS (SELECT 1 FROM battle_participants WHERE match_id = p_match_id AND user_id = v_uid) THEN
    RAISE EXCEPTION 'not_a_participant';
  END IF;

  SELECT id, winner_id, is_draw, started_at, ended_at, mode, duration_minutes, invalidated_reason
  INTO v_match FROM battle_matches WHERE id = p_match_id;

  SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) INTO v_players FROM (
    SELECT
      bp.user_id,
      COALESCE(p.username, 'warrior') AS handle,
      bp.score,
      bp.problems_solved,
      bp.wrong_submissions,
      bp.total_solve_time_sec,
      bp.elo_before,
      bp.elo_after,
      bp.elo_change,
      bp.xp_earned,
      bp.integrity_score,
      bp.is_forfeit
    FROM battle_participants bp
    LEFT JOIN profiles p ON p.id = bp.user_id
    WHERE bp.match_id = p_match_id
  ) x;

  SELECT COALESCE(jsonb_agg(row_to_json(r) ORDER BY r.order_index), '[]'::jsonb) INTO v_rounds FROM (
    SELECT
      bmp.id AS problem_id,
      bmp.order_index,
      c.title,
      c.difficulty,
      (
        SELECT s.user_id FROM battle_match_submissions s
        WHERE s.match_id = p_match_id AND s.problem_id = bmp.id AND s.verdict = 'accepted'
        ORDER BY s.submitted_at ASC LIMIT 1
      ) AS winner_user_id
    FROM battle_match_problems bmp
    JOIN challenges c ON c.id = bmp.challenge_id
    WHERE bmp.match_id = p_match_id
  ) r;

  RETURN jsonb_build_object(
    'match_id', v_match.id,
    'winner_id', v_match.winner_id,
    'is_draw', COALESCE(v_match.is_draw, false),
    'duration_sec', CASE WHEN v_match.started_at IS NOT NULL AND v_match.ended_at IS NOT NULL
      THEN extract(epoch FROM (v_match.ended_at - v_match.started_at))::int ELSE 0 END,
    'mode', v_match.mode,
    'invalidated_reason', v_match.invalidated_reason,
    'players', v_players,
    'rounds', v_rounds
  );
END;
$function$;

-- B. Finalize the orphan match
UPDATE battle_matches
   SET state='completed', status='completed',
       is_draw=true, winner_id=NULL,
       ended_at = COALESCE(ended_at, now())
 WHERE id='858e60ed-7cba-4964-8136-8e8738ce25b9';

-- C. Defensive cleanup of half-finalized matches
UPDATE battle_matches bm
   SET state='completed', status='completed',
       is_draw=true,
       ended_at=COALESCE(bm.ended_at, bs.end_time, now())
  FROM battle_sessions bs
 WHERE bs.id = bm.id
   AND bs.status='completed'
   AND bm.state::text <> 'completed';