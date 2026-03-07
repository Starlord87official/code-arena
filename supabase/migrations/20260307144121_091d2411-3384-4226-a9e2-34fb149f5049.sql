
-- =============================================
-- FIX: complete_duo_battle derives scores server-side
-- Instead of trusting client-supplied scores, compute from battle_match_submissions
-- Also adds a one-time completion guard
-- =============================================

CREATE OR REPLACE FUNCTION public.complete_duo_battle(
  p_session_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_session RECORD;
  v_player_a_score INTEGER;
  v_player_b_score INTEGER;
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
  
  -- Get session and verify user is participant AND session is still active
  SELECT * INTO v_session
  FROM battle_sessions
  WHERE id = p_session_id
  AND (player_a_id = v_user_id OR player_b_id = v_user_id)
  AND status = 'active'
  FOR UPDATE; -- Lock the row to prevent race conditions
  
  IF v_session.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Battle session not found or already completed');
  END IF;

  -- Derive scores server-side from battle_match_submissions
  SELECT COALESCE(SUM(CASE WHEN bms.status = 'accepted' THEN bms.score ELSE 0 END), 0)
  INTO v_player_a_score
  FROM battle_match_submissions bms
  WHERE bms.match_id = p_session_id
  AND bms.user_id = v_session.player_a_id;

  SELECT COALESCE(SUM(CASE WHEN bms.status = 'accepted' THEN bms.score ELSE 0 END), 0)
  INTO v_player_b_score
  FROM battle_match_submissions bms
  WHERE bms.match_id = p_session_id
  AND bms.user_id = v_session.player_b_id;
  
  -- Determine winner
  IF v_player_a_score > v_player_b_score THEN
    v_winner_id := v_session.player_a_id;
    v_loser_id := v_session.player_b_id;
    v_is_draw := false;
  ELSIF v_player_b_score > v_player_a_score THEN
    v_winner_id := v_session.player_b_id;
    v_loser_id := v_session.player_a_id;
    v_is_draw := false;
  ELSE
    v_winner_id := NULL;
    v_is_draw := true;
  END IF;
  
  -- Calculate ELO change (only for ranked)
  IF v_session.mode = 'ranked' AND NOT v_is_draw THEN
    v_elo_change := 25;
  ELSE
    v_elo_change := 0;
  END IF;
  
  -- Calculate XP
  IF v_session.mode = 'quick' THEN
    v_winner_xp := 50;
    v_loser_xp := 20;
  ELSIF v_session.mode = 'ranked' THEN
    v_winner_xp := 100;
    v_loser_xp := 30;
  ELSE
    v_winner_xp := 40;
    v_loser_xp := 15;
  END IF;
  
  IF v_is_draw THEN
    v_winner_xp := 35;
    v_loser_xp := 35;
  END IF;
  
  -- Update session with server-derived scores
  UPDATE battle_sessions
  SET 
    status = 'completed',
    player_a_score = v_player_a_score,
    player_b_score = v_player_b_score,
    winner_id = v_winner_id,
    end_time = now(),
    xp_awarded_a = CASE WHEN v_session.player_a_id = v_winner_id THEN v_winner_xp ELSE v_loser_xp END,
    xp_awarded_b = CASE WHEN v_session.player_b_id = v_winner_id THEN v_winner_xp ELSE v_loser_xp END,
    elo_change = v_elo_change
  WHERE id = p_session_id;
  
  -- Update winner stats
  IF v_winner_id IS NOT NULL THEN
    INSERT INTO user_battle_stats (user_id, elo, total_duels, wins, win_streak, best_win_streak, total_xp_earned, last_battle_at)
    VALUES (v_winner_id, 1000 + v_elo_change, 1, 1, 1, 1, v_winner_xp, now())
    ON CONFLICT (user_id) DO UPDATE SET
      elo = user_battle_stats.elo + v_elo_change,
      total_duels = user_battle_stats.total_duels + 1,
      wins = user_battle_stats.wins + 1,
      win_streak = user_battle_stats.win_streak + 1,
      best_win_streak = GREATEST(user_battle_stats.best_win_streak, user_battle_stats.win_streak + 1),
      total_xp_earned = user_battle_stats.total_xp_earned + v_winner_xp,
      last_battle_at = now(),
      updated_at = now();
    
    -- Update loser stats
    INSERT INTO user_battle_stats (user_id, elo, total_duels, losses, win_streak, total_xp_earned, last_battle_at)
    VALUES (v_loser_id, 1000 - v_elo_change, 1, 1, 0, v_loser_xp, now())
    ON CONFLICT (user_id) DO UPDATE SET
      elo = GREATEST(user_battle_stats.elo - v_elo_change, 100),
      total_duels = user_battle_stats.total_duels + 1,
      losses = user_battle_stats.losses + 1,
      win_streak = 0,
      total_xp_earned = user_battle_stats.total_xp_earned + v_loser_xp,
      last_battle_at = now(),
      updated_at = now();
      
    -- Update profiles XP
    UPDATE profiles SET xp = COALESCE(xp, 0) + v_winner_xp WHERE id = v_winner_id;
    UPDATE profiles SET xp = COALESCE(xp, 0) + v_loser_xp WHERE id = v_loser_id;
  ELSE
    -- Draw
    INSERT INTO user_battle_stats (user_id, elo, total_duels, draws, total_xp_earned, last_battle_at)
    VALUES (v_session.player_a_id, 1000, 1, 1, v_winner_xp, now())
    ON CONFLICT (user_id) DO UPDATE SET
      total_duels = user_battle_stats.total_duels + 1,
      draws = user_battle_stats.draws + 1,
      total_xp_earned = user_battle_stats.total_xp_earned + v_winner_xp,
      last_battle_at = now(),
      updated_at = now();
      
    INSERT INTO user_battle_stats (user_id, elo, total_duels, draws, total_xp_earned, last_battle_at)
    VALUES (v_session.player_b_id, 1000, 1, 1, v_loser_xp, now())
    ON CONFLICT (user_id) DO UPDATE SET
      total_duels = user_battle_stats.total_duels + 1,
      draws = user_battle_stats.draws + 1,
      total_xp_earned = user_battle_stats.total_xp_earned + v_loser_xp,
      last_battle_at = now(),
      updated_at = now();
      
    UPDATE profiles SET xp = COALESCE(xp, 0) + v_winner_xp WHERE id = v_session.player_a_id;
    UPDATE profiles SET xp = COALESCE(xp, 0) + v_loser_xp WHERE id = v_session.player_b_id;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'winner_id', v_winner_id,
    'is_draw', v_is_draw,
    'elo_change', v_elo_change,
    'xp_awarded', CASE WHEN v_user_id = v_winner_id THEN v_winner_xp ELSE v_loser_xp END
  );
END;
$$;
