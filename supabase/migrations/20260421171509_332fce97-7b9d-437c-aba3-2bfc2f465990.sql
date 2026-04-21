
-- Step 9: Battle V2 read-side aggregation RPCs

-- 1) get_user_battle_summary
CREATE OR REPLACE FUNCTION public.get_user_battle_summary(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := COALESCE(p_user_id, auth.uid());
  v_elo int;
  v_total int := 0;
  v_wins int := 0;
  v_losses int := 0;
  v_draws int := 0;
  v_streak int := 0;
  v_mvp int := 0;
  v_rank text := 'Bronze';
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('elo', 1000, 'rank_label', 'Bronze', 'total_matches', 0, 'wins', 0, 'losses', 0, 'draws', 0, 'win_rate', 0, 'current_streak', 0, 'mvp_count', 0);
  END IF;

  -- Latest ELO from participants
  SELECT COALESCE(elo_after, elo_before) INTO v_elo
  FROM battle_participants
  WHERE user_id = v_uid AND elo_after IS NOT NULL
  ORDER BY created_at DESC LIMIT 1;
  v_elo := COALESCE(v_elo, 1000);

  -- Aggregate W/L/D from completed matches
  SELECT
    COUNT(*) FILTER (WHERE bm.state = 'completed'),
    COUNT(*) FILTER (WHERE bm.state = 'completed' AND bm.winner_id = v_uid),
    COUNT(*) FILTER (WHERE bm.state = 'completed' AND bm.winner_id IS NOT NULL AND bm.winner_id <> v_uid AND bm.is_draw IS NOT TRUE),
    COUNT(*) FILTER (WHERE bm.state = 'completed' AND bm.is_draw IS TRUE)
  INTO v_total, v_wins, v_losses, v_draws
  FROM battle_participants bp
  JOIN battle_matches bm ON bm.id = bp.match_id
  WHERE bp.user_id = v_uid;

  -- Current streak (consecutive wins from most recent)
  SELECT COUNT(*) INTO v_streak
  FROM (
    SELECT bm.winner_id = v_uid AS won
    FROM battle_participants bp
    JOIN battle_matches bm ON bm.id = bp.match_id
    WHERE bp.user_id = v_uid AND bm.state = 'completed'
    ORDER BY bm.ended_at DESC NULLS LAST
  ) t
  WHERE t.won
    AND NOT EXISTS (
      SELECT 1 FROM (
        SELECT row_number() OVER () rn, bm2.winner_id = v_uid AS won2
        FROM battle_participants bp2
        JOIN battle_matches bm2 ON bm2.id = bp2.match_id
        WHERE bp2.user_id = v_uid AND bm2.state = 'completed'
        ORDER BY bm2.ended_at DESC NULLS LAST
      ) x WHERE NOT x.won2 AND x.rn <= (SELECT count(*) FROM battle_participants bp3 JOIN battle_matches bm3 ON bm3.id = bp3.match_id WHERE bp3.user_id = v_uid AND bm3.state = 'completed' AND bm3.ended_at >= bm.ended_at)
    );

  -- Simpler streak calc fallback
  IF v_streak IS NULL THEN v_streak := 0; END IF;

  v_rank := CASE
    WHEN v_elo >= 2000 THEN 'Grandmaster'
    WHEN v_elo >= 1800 THEN 'Master'
    WHEN v_elo >= 1600 THEN 'Diamond'
    WHEN v_elo >= 1400 THEN 'Platinum'
    WHEN v_elo >= 1200 THEN 'Gold'
    WHEN v_elo >= 1000 THEN 'Silver'
    ELSE 'Bronze'
  END;

  RETURN jsonb_build_object(
    'elo', v_elo,
    'rank_label', v_rank,
    'total_matches', v_total,
    'wins', v_wins,
    'losses', v_losses,
    'draws', v_draws,
    'win_rate', CASE WHEN v_total > 0 THEN round((v_wins::numeric / v_total) * 100) ELSE 0 END,
    'current_streak', COALESCE(v_streak, 0),
    'mvp_count', v_mvp
  );
END;
$$;

-- Cleaner streak version overriding the messy CTE above
CREATE OR REPLACE FUNCTION public.get_user_battle_summary(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := COALESCE(p_user_id, auth.uid());
  v_elo int;
  v_total int := 0;
  v_wins int := 0;
  v_losses int := 0;
  v_draws int := 0;
  v_streak int := 0;
  v_rank text := 'Bronze';
  r RECORD;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('elo', 1000, 'rank_label', 'Bronze', 'total_matches', 0, 'wins', 0, 'losses', 0, 'draws', 0, 'win_rate', 0, 'current_streak', 0, 'mvp_count', 0);
  END IF;

  SELECT COALESCE(elo_after, elo_before) INTO v_elo
  FROM battle_participants
  WHERE user_id = v_uid AND elo_after IS NOT NULL
  ORDER BY created_at DESC LIMIT 1;
  v_elo := COALESCE(v_elo, 1000);

  SELECT
    COUNT(*) FILTER (WHERE bm.state = 'completed'),
    COUNT(*) FILTER (WHERE bm.state = 'completed' AND bm.winner_id = v_uid),
    COUNT(*) FILTER (WHERE bm.state = 'completed' AND bm.winner_id IS NOT NULL AND bm.winner_id <> v_uid AND bm.is_draw IS NOT TRUE),
    COUNT(*) FILTER (WHERE bm.state = 'completed' AND bm.is_draw IS TRUE)
  INTO v_total, v_wins, v_losses, v_draws
  FROM battle_participants bp
  JOIN battle_matches bm ON bm.id = bp.match_id
  WHERE bp.user_id = v_uid;

  -- Walk recent matches to compute current win streak
  FOR r IN
    SELECT bm.winner_id = v_uid AS won
    FROM battle_participants bp
    JOIN battle_matches bm ON bm.id = bp.match_id
    WHERE bp.user_id = v_uid AND bm.state = 'completed'
    ORDER BY bm.ended_at DESC NULLS LAST
  LOOP
    IF r.won THEN v_streak := v_streak + 1; ELSE EXIT; END IF;
  END LOOP;

  v_rank := CASE
    WHEN v_elo >= 2000 THEN 'Grandmaster'
    WHEN v_elo >= 1800 THEN 'Master'
    WHEN v_elo >= 1600 THEN 'Diamond'
    WHEN v_elo >= 1400 THEN 'Platinum'
    WHEN v_elo >= 1200 THEN 'Gold'
    WHEN v_elo >= 1000 THEN 'Silver'
    ELSE 'Bronze'
  END;

  RETURN jsonb_build_object(
    'elo', v_elo,
    'rank_label', v_rank,
    'total_matches', v_total,
    'wins', v_wins,
    'losses', v_losses,
    'draws', v_draws,
    'win_rate', CASE WHEN v_total > 0 THEN round((v_wins::numeric / v_total) * 100) ELSE 0 END,
    'current_streak', v_streak,
    'mvp_count', 0
  );
END;
$$;

-- 2) get_recent_battles
CREATE OR REPLACE FUNCTION public.get_recent_battles(p_user_id uuid DEFAULT NULL, p_limit int DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := COALESCE(p_user_id, auth.uid());
  v_rows jsonb;
BEGIN
  IF v_uid IS NULL THEN RETURN '[]'::jsonb; END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_rows FROM (
    SELECT
      bm.id AS match_id,
      bm.mode,
      bm.ended_at,
      COALESCE(p.username, p.email, 'Opponent') AS opponent_handle,
      CASE
        WHEN bm.is_draw IS TRUE THEN 'draw'
        WHEN bm.winner_id = v_uid THEN 'win'
        WHEN bm.winner_id IS NULL THEN 'draw'
        ELSE 'loss'
      END AS result,
      self.score AS score_self,
      opp.score AS score_opp,
      self.elo_change AS elo_change
    FROM battle_participants self
    JOIN battle_matches bm ON bm.id = self.match_id
    LEFT JOIN battle_participants opp ON opp.match_id = bm.id AND opp.user_id <> v_uid
    LEFT JOIN profiles p ON p.id = opp.user_id
    WHERE self.user_id = v_uid AND bm.state = 'completed'
    ORDER BY bm.ended_at DESC NULLS LAST
    LIMIT p_limit
  ) t;

  RETURN v_rows;
END;
$$;

-- 3) get_online_warriors (queue + active match participants, exclude caller)
CREATE OR REPLACE FUNCTION public.get_online_warriors(p_limit int DEFAULT 12)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_rows jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_rows FROM (
    SELECT DISTINCT ON (user_id)
      user_id,
      handle,
      elo,
      rank_label,
      status
    FROM (
      -- Players in queue
      SELECT
        bq.user_id,
        COALESCE(p.username, p.email, 'warrior') AS handle,
        bq.elo,
        CASE
          WHEN bq.elo >= 1800 THEN 'Master'
          WHEN bq.elo >= 1600 THEN 'Diamond'
          WHEN bq.elo >= 1400 THEN 'Platinum'
          WHEN bq.elo >= 1200 THEN 'Gold'
          WHEN bq.elo >= 1000 THEN 'Silver'
          ELSE 'Bronze'
        END AS rank_label,
        'queueing' AS status,
        bq.created_at AS sort_at
      FROM battle_queue bq
      LEFT JOIN profiles p ON p.id = bq.user_id
      WHERE bq.status = 'searching'
        AND (v_uid IS NULL OR bq.user_id <> v_uid)
      UNION ALL
      -- Players in active matches
      SELECT
        bp.user_id,
        COALESCE(p.username, p.email, 'warrior') AS handle,
        bp.elo_before AS elo,
        CASE
          WHEN bp.elo_before >= 1800 THEN 'Master'
          WHEN bp.elo_before >= 1600 THEN 'Diamond'
          WHEN bp.elo_before >= 1400 THEN 'Platinum'
          WHEN bp.elo_before >= 1200 THEN 'Gold'
          WHEN bp.elo_before >= 1000 THEN 'Silver'
          ELSE 'Bronze'
        END AS rank_label,
        'in_match' AS status,
        bp.created_at AS sort_at
      FROM battle_participants bp
      JOIN battle_matches bm ON bm.id = bp.match_id
      LEFT JOIN profiles p ON p.id = bp.user_id
      WHERE bm.state IN ('match_found','ready_check','ban_pick','active','judging')
        AND (v_uid IS NULL OR bp.user_id <> v_uid)
    ) src
    ORDER BY user_id, sort_at DESC
    LIMIT p_limit
  ) t;

  RETURN v_rows;
END;
$$;

-- 4) get_global_battle_stats
CREATE OR REPLACE FUNCTION public.get_global_battle_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_live int;
  v_online int;
  v_today int;
BEGIN
  SELECT count(*) INTO v_live FROM battle_matches WHERE state IN ('active','judging');
  SELECT count(DISTINCT user_id) INTO v_online FROM (
    SELECT user_id FROM battle_queue WHERE status = 'searching'
    UNION
    SELECT bp.user_id
    FROM battle_participants bp
    JOIN battle_matches bm ON bm.id = bp.match_id
    WHERE bm.state IN ('match_found','ready_check','ban_pick','active','judging')
  ) u;
  SELECT count(*) INTO v_today FROM battle_matches
  WHERE state = 'completed' AND ended_at >= now() - interval '24 hours';

  RETURN jsonb_build_object(
    'live_matches', COALESCE(v_live, 0),
    'players_online', COALESCE(v_online, 0),
    'matches_today', COALESCE(v_today, 0)
  );
END;
$$;

-- 5) get_match_briefing
CREATE OR REPLACE FUNCTION public.get_match_briefing(p_match_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_match jsonb;
  v_parts jsonb;
  v_problems jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  IF NOT EXISTS (SELECT 1 FROM battle_participants WHERE match_id = p_match_id AND user_id = v_uid) THEN
    RAISE EXCEPTION 'not_a_participant';
  END IF;

  SELECT to_jsonb(t) INTO v_match FROM (
    SELECT id, mode, state, status, duration_minutes, problem_count, hints_enabled,
           is_rated, started_at, phase_started_at, ended_at
    FROM battle_matches WHERE id = p_match_id
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(x) ORDER BY x.created_at), '[]'::jsonb) INTO v_parts FROM (
    SELECT
      bp.user_id,
      COALESCE(p.username, p.email, 'warrior') AS handle,
      p.avatar_url AS avatar,
      bp.elo_before AS elo,
      CASE
        WHEN bp.elo_before >= 1800 THEN 'Master'
        WHEN bp.elo_before >= 1600 THEN 'Diamond'
        WHEN bp.elo_before >= 1400 THEN 'Platinum'
        WHEN bp.elo_before >= 1200 THEN 'Gold'
        WHEN bp.elo_before >= 1000 THEN 'Silver'
        ELSE 'Bronze'
      END AS rank_label,
      bp.created_at
    FROM battle_participants bp
    LEFT JOIN profiles p ON p.id = bp.user_id
    WHERE bp.match_id = p_match_id
  ) x;

  SELECT COALESCE(jsonb_agg(row_to_json(y) ORDER BY y.order_index), '[]'::jsonb) INTO v_problems FROM (
    SELECT
      bmp.id,
      c.title,
      c.difficulty,
      bmp.points,
      bmp.order_index,
      c.id AS challenge_id
    FROM battle_match_problems bmp
    JOIN challenges c ON c.id = bmp.challenge_id
    WHERE bmp.match_id = p_match_id
  ) y;

  RETURN jsonb_build_object(
    'match', COALESCE(v_match, '{}'::jsonb),
    'participants', COALESCE(v_parts, '[]'::jsonb),
    'problems', COALESCE(v_problems, '[]'::jsonb)
  );
END;
$$;

-- 6) get_match_result
CREATE OR REPLACE FUNCTION public.get_match_result(p_match_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
      COALESCE(p.username, p.email, 'warrior') AS handle,
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

  -- Rounds: per-problem winner = first accepted submission
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
$$;

GRANT EXECUTE ON FUNCTION public.get_user_battle_summary(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_recent_battles(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_warriors(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_battle_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_match_briefing(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_match_result(uuid) TO authenticated;
