-- =============================================
-- DUO BATTLE MATCHMAKING SCHEMA
-- =============================================

-- Battle queue for matchmaking
CREATE TABLE public.battle_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('quick', 'ranked', 'custom')),
  elo INTEGER NOT NULL DEFAULT 1000,
  status TEXT NOT NULL DEFAULT 'searching' CHECK (status IN ('searching', 'matched', 'cancelled', 'expired')),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For custom duels
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  matched_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '5 minutes'),
  UNIQUE(user_id, status) -- User can only have one active search
);

-- Battle sessions for active/completed battles
CREATE TABLE public.battle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id TEXT UNIQUE NOT NULL DEFAULT 'battle_' || gen_random_uuid()::text,
  player_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('quick', 'ranked', 'custom')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'abandoned')),
  player_a_score INTEGER NOT NULL DEFAULT 0,
  player_b_score INTEGER NOT NULL DEFAULT 0,
  player_a_elo INTEGER NOT NULL DEFAULT 1000,
  player_b_elo INTEGER NOT NULL DEFAULT 1000,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  problems JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  xp_awarded_a INTEGER DEFAULT 0,
  xp_awarded_b INTEGER DEFAULT 0,
  elo_change INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User battle stats for tracking individual performance
CREATE TABLE public.user_battle_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  elo INTEGER NOT NULL DEFAULT 1000,
  total_duels INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  win_streak INTEGER NOT NULL DEFAULT 0,
  best_win_streak INTEGER NOT NULL DEFAULT 0,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  last_battle_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.battle_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_battle_stats ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR battle_queue
-- =============================================

-- Users can view their own queue entries
CREATE POLICY "Users can view own queue entries"
ON public.battle_queue FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own queue entries (via RPC only in practice)
CREATE POLICY "Users can insert own queue entries"
ON public.battle_queue FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own queue entries (cancel)
CREATE POLICY "Users can update own queue entries"
ON public.battle_queue FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Users can delete their own queue entries
CREATE POLICY "Users can delete own queue entries"
ON public.battle_queue FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES FOR battle_sessions
-- =============================================

-- Users can view sessions they participate in
CREATE POLICY "Users can view own battle sessions"
ON public.battle_sessions FOR SELECT
TO authenticated
USING (player_a_id = auth.uid() OR player_b_id = auth.uid());

-- No direct inserts - only via RPC
CREATE POLICY "No direct battle session inserts"
ON public.battle_sessions FOR INSERT
TO authenticated
WITH CHECK (false);

-- Users can update sessions they're in (for submitting solutions)
CREATE POLICY "Users can update own battle sessions"
ON public.battle_sessions FOR UPDATE
TO authenticated
USING (player_a_id = auth.uid() OR player_b_id = auth.uid());

-- No direct deletes
CREATE POLICY "No direct battle session deletes"
ON public.battle_sessions FOR DELETE
TO authenticated
USING (false);

-- =============================================
-- RLS POLICIES FOR user_battle_stats
-- =============================================

-- Anyone authenticated can view battle stats (for leaderboards)
CREATE POLICY "Authenticated users can view battle stats"
ON public.user_battle_stats FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own stats (via RPC in practice)
CREATE POLICY "Users can update own battle stats"
ON public.user_battle_stats FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own stats
CREATE POLICY "Users can insert own battle stats"
ON public.user_battle_stats FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =============================================
-- MATCHMAKING FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.join_battle_queue(
  p_mode TEXT,
  p_target_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_elo INTEGER;
  v_existing_queue RECORD;
  v_match RECORD;
  v_session_id UUID;
  v_battle_id TEXT;
  v_queue_entry RECORD;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if user is already in an active battle
  IF EXISTS (
    SELECT 1 FROM battle_sessions
    WHERE (player_a_id = v_user_id OR player_b_id = v_user_id)
    AND status = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already in an active battle');
  END IF;
  
  -- Cancel any existing queue entries
  UPDATE battle_queue
  SET status = 'cancelled'
  WHERE user_id = v_user_id AND status = 'searching';
  
  -- Get user's ELO
  SELECT COALESCE(elo, 1000) INTO v_user_elo
  FROM user_battle_stats
  WHERE user_id = v_user_id;
  
  IF v_user_elo IS NULL THEN
    v_user_elo := 1000;
    -- Create stats record if not exists
    INSERT INTO user_battle_stats (user_id, elo)
    VALUES (v_user_id, 1000)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- For ranked mode, try to find a match within ELO range
  IF p_mode = 'ranked' THEN
    SELECT * INTO v_match
    FROM battle_queue
    WHERE status = 'searching'
    AND mode = 'ranked'
    AND user_id != v_user_id
    AND ABS(elo - v_user_elo) <= 200
    AND expires_at > now()
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
  ELSIF p_mode = 'custom' AND p_target_user_id IS NOT NULL THEN
    -- For custom, look for specific user waiting for us
    SELECT * INTO v_match
    FROM battle_queue
    WHERE status = 'searching'
    AND mode = 'custom'
    AND user_id = p_target_user_id
    AND target_user_id = v_user_id
    AND expires_at > now()
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
  ELSE
    -- Quick match - find anyone
    SELECT * INTO v_match
    FROM battle_queue
    WHERE status = 'searching'
    AND mode = p_mode
    AND user_id != v_user_id
    AND expires_at > now()
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
  END IF;
  
  -- If match found, create battle session
  IF v_match.id IS NOT NULL THEN
    v_battle_id := 'battle_' || gen_random_uuid()::text;
    
    INSERT INTO battle_sessions (
      battle_id, player_a_id, player_b_id, mode,
      player_a_elo, player_b_elo, status,
      duration_minutes
    ) VALUES (
      v_battle_id, v_match.user_id, v_user_id, p_mode,
      v_match.elo, v_user_elo, 'active',
      CASE p_mode WHEN 'quick' THEN 15 WHEN 'ranked' THEN 30 ELSE 20 END
    )
    RETURNING id INTO v_session_id;
    
    -- Update matched queue entry
    UPDATE battle_queue
    SET status = 'matched', matched_at = now()
    WHERE id = v_match.id;
    
    RETURN json_build_object(
      'success', true,
      'matched', true,
      'session_id', v_session_id,
      'battle_id', v_battle_id,
      'opponent_id', v_match.user_id
    );
  END IF;
  
  -- No match found, add to queue
  INSERT INTO battle_queue (user_id, mode, elo, target_user_id)
  VALUES (v_user_id, p_mode, v_user_elo, p_target_user_id)
  RETURNING * INTO v_queue_entry;
  
  RETURN json_build_object(
    'success', true,
    'matched', false,
    'queue_id', v_queue_entry.id,
    'message', 'Searching for opponent...'
  );
END;
$$;

-- =============================================
-- CHECK QUEUE STATUS FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.check_battle_queue_status()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_queue RECORD;
  v_session RECORD;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if in active battle
  SELECT * INTO v_session
  FROM battle_sessions
  WHERE (player_a_id = v_user_id OR player_b_id = v_user_id)
  AND status = 'active'
  LIMIT 1;
  
  IF v_session.id IS NOT NULL THEN
    RETURN json_build_object(
      'success', true,
      'status', 'in_battle',
      'session_id', v_session.id,
      'battle_id', v_session.battle_id,
      'opponent_id', CASE 
        WHEN v_session.player_a_id = v_user_id THEN v_session.player_b_id
        ELSE v_session.player_a_id
      END
    );
  END IF;
  
  -- Check queue status
  SELECT * INTO v_queue
  FROM battle_queue
  WHERE user_id = v_user_id
  AND status = 'searching'
  AND expires_at > now()
  LIMIT 1;
  
  IF v_queue.id IS NOT NULL THEN
    RETURN json_build_object(
      'success', true,
      'status', 'searching',
      'queue_id', v_queue.id,
      'mode', v_queue.mode,
      'wait_time', EXTRACT(EPOCH FROM (now() - v_queue.created_at))::integer
    );
  END IF;
  
  -- Check if was just matched
  SELECT * INTO v_queue
  FROM battle_queue
  WHERE user_id = v_user_id
  AND status = 'matched'
  ORDER BY matched_at DESC
  LIMIT 1;
  
  IF v_queue.id IS NOT NULL THEN
    -- Find the session
    SELECT * INTO v_session
    FROM battle_sessions
    WHERE player_a_id = v_user_id OR player_b_id = v_user_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_session.id IS NOT NULL THEN
      RETURN json_build_object(
        'success', true,
        'status', 'matched',
        'session_id', v_session.id,
        'battle_id', v_session.battle_id
      );
    END IF;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'status', 'idle'
  );
END;
$$;

-- =============================================
-- CANCEL QUEUE FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.cancel_battle_queue()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  UPDATE battle_queue
  SET status = 'cancelled'
  WHERE user_id = v_user_id AND status = 'searching';
  
  RETURN json_build_object('success', true);
END;
$$;

-- =============================================
-- COMPLETE BATTLE FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.complete_duo_battle(
  p_session_id UUID,
  p_player_a_score INTEGER,
  p_player_b_score INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Get session and verify user is participant
  SELECT * INTO v_session
  FROM battle_sessions
  WHERE id = p_session_id
  AND (player_a_id = v_user_id OR player_b_id = v_user_id)
  AND status = 'active';
  
  IF v_session.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Battle session not found or already completed');
  END IF;
  
  -- Determine winner
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
  
  -- Calculate ELO change (only for ranked)
  IF v_session.mode = 'ranked' AND NOT v_is_draw THEN
    -- Simple ELO: winner gets +25, loser gets -25
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
  
  -- Update session
  UPDATE battle_sessions
  SET 
    status = 'completed',
    player_a_score = p_player_a_score,
    player_b_score = p_player_b_score,
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
      elo = GREATEST(user_battle_stats.elo - v_elo_change, 100), -- Min ELO of 100
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
    -- Draw - update both
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

-- =============================================
-- GET USER BATTLE STATS FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.get_user_battle_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_stats RECORD;
  v_next_rank TEXT;
  v_elo_to_next INTEGER;
  v_progress INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get or create stats
  INSERT INTO user_battle_stats (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_stats
  FROM user_battle_stats
  WHERE user_id = v_user_id;
  
  -- Calculate rank progress
  IF v_stats.elo < 1000 THEN
    v_next_rank := 'Silver';
    v_elo_to_next := 1000 - v_stats.elo;
    v_progress := (v_stats.elo * 100 / 1000);
  ELSIF v_stats.elo < 1200 THEN
    v_next_rank := 'Gold';
    v_elo_to_next := 1200 - v_stats.elo;
    v_progress := ((v_stats.elo - 1000) * 100 / 200);
  ELSIF v_stats.elo < 1400 THEN
    v_next_rank := 'Platinum';
    v_elo_to_next := 1400 - v_stats.elo;
    v_progress := ((v_stats.elo - 1200) * 100 / 200);
  ELSIF v_stats.elo < 1600 THEN
    v_next_rank := 'Diamond';
    v_elo_to_next := 1600 - v_stats.elo;
    v_progress := ((v_stats.elo - 1400) * 100 / 200);
  ELSIF v_stats.elo < 1800 THEN
    v_next_rank := 'Master';
    v_elo_to_next := 1800 - v_stats.elo;
    v_progress := ((v_stats.elo - 1600) * 100 / 200);
  ELSIF v_stats.elo < 2000 THEN
    v_next_rank := 'Grandmaster';
    v_elo_to_next := 2000 - v_stats.elo;
    v_progress := ((v_stats.elo - 1800) * 100 / 200);
  ELSE
    v_next_rank := 'Max Rank';
    v_elo_to_next := 0;
    v_progress := 100;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'stats', json_build_object(
      'elo', v_stats.elo,
      'total_duels', v_stats.total_duels,
      'wins', v_stats.wins,
      'losses', v_stats.losses,
      'draws', v_stats.draws,
      'win_rate', CASE WHEN v_stats.total_duels > 0 
        THEN ROUND((v_stats.wins::numeric / v_stats.total_duels) * 100)
        ELSE 0 END,
      'win_streak', v_stats.win_streak,
      'best_win_streak', v_stats.best_win_streak,
      'total_xp_earned', v_stats.total_xp_earned,
      'next_rank', v_next_rank,
      'elo_to_next', v_elo_to_next,
      'rank_progress', v_progress
    )
  );
END;
$$;