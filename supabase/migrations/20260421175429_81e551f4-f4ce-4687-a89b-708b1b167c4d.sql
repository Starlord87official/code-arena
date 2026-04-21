-- Phase E: Topic ban/pick + ranked leaderboard

-- 1) Add columns to battle_matches
ALTER TABLE public.battle_matches
  ADD COLUMN IF NOT EXISTS banned_topics text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS picked_topics text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS topic_choices jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2) RPC: submit topic choice (ban or pick)
CREATE OR REPLACE FUNCTION public.mm_submit_topic_choice(
  p_match_id uuid,
  p_kind text,
  p_topic text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_match record;
  v_choices jsonb;
  v_user_choices jsonb;
  v_existing text;
  v_participant_count int;
  v_submitted_count int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;
  IF p_kind NOT IN ('ban','pick') THEN
    RAISE EXCEPTION 'invalid kind';
  END IF;
  IF p_topic IS NULL OR length(p_topic) = 0 THEN
    RAISE EXCEPTION 'topic required';
  END IF;

  SELECT * INTO v_match FROM public.battle_matches WHERE id = p_match_id FOR UPDATE;
  IF v_match IS NULL THEN
    RAISE EXCEPTION 'match not found';
  END IF;

  -- Validate participant
  IF NOT EXISTS (
    SELECT 1 FROM public.battle_participants
    WHERE match_id = p_match_id AND user_id = v_uid
  ) THEN
    RAISE EXCEPTION 'not a participant';
  END IF;

  v_choices := COALESCE(v_match.topic_choices, '{}'::jsonb);
  v_user_choices := COALESCE(v_choices -> v_uid::text, '{}'::jsonb);

  -- Append-only: cannot overwrite the same kind
  v_existing := v_user_choices ->> p_kind;
  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION 'already submitted % for this user', p_kind;
  END IF;

  v_user_choices := v_user_choices || jsonb_build_object(p_kind, p_topic);
  v_choices := v_choices || jsonb_build_object(v_uid::text, v_user_choices);

  UPDATE public.battle_matches
     SET topic_choices = v_choices,
         banned_topics = CASE
           WHEN p_kind = 'ban' THEN array_append(banned_topics, p_topic)
           ELSE banned_topics
         END,
         picked_topics = CASE
           WHEN p_kind = 'pick' THEN array_append(picked_topics, p_topic)
           ELSE picked_topics
         END
   WHERE id = p_match_id;

  -- Count participants vs how many have completed both ban+pick
  SELECT count(*) INTO v_participant_count FROM public.battle_participants WHERE match_id = p_match_id;
  SELECT count(*) INTO v_submitted_count
    FROM jsonb_each(v_choices) AS kv(uid, val)
    WHERE (val->>'ban') IS NOT NULL AND (val->>'pick') IS NOT NULL;

  RETURN jsonb_build_object(
    'ok', true,
    'all_done', v_submitted_count >= v_participant_count,
    'submitted', v_submitted_count,
    'participants', v_participant_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.mm_submit_topic_choice(uuid, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mm_submit_topic_choice(uuid, text, text) TO authenticated;

-- 3) RPC: get ranked leaderboard for active season
CREATE OR REPLACE FUNCTION public.get_ranked_leaderboard(
  p_tier_filter text DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  rank_position bigint,
  user_id uuid,
  username text,
  avatar_url text,
  tier rank_tier,
  division rank_division,
  lp int,
  mmr int,
  games_played int,
  win_streak int,
  is_self boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_season uuid;
  v_uid uuid := auth.uid();
BEGIN
  SELECT id INTO v_season FROM public.seasons WHERE status = 'active' ORDER BY starts_at DESC LIMIT 1;
  IF v_season IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH ranked AS (
    SELECT
      rs.user_id,
      p.username,
      p.avatar_url,
      rs.tier,
      rs.division,
      rs.lp,
      rs.mmr,
      rs.games_played,
      rs.win_streak,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE rs.tier
            WHEN 'challenger' THEN 9
            WHEN 'grandmaster' THEN 8
            WHEN 'master' THEN 7
            WHEN 'diamond' THEN 6
            WHEN 'platinum' THEN 5
            WHEN 'gold' THEN 4
            WHEN 'silver' THEN 3
            WHEN 'bronze' THEN 2
            WHEN 'iron' THEN 1
            ELSE 0
          END DESC,
          CASE rs.division
            WHEN 'I' THEN 1
            WHEN 'II' THEN 2
            WHEN 'III' THEN 3
            WHEN 'IV' THEN 4
            ELSE 5
          END ASC,
          rs.lp DESC,
          rs.mmr DESC
      ) AS rn
    FROM public.rank_states rs
    JOIN public.profiles p ON p.id = rs.user_id
    WHERE rs.season_id = v_season
      AND rs.placements_remaining = 0
      AND (p_tier_filter IS NULL OR p_tier_filter = 'all' OR rs.tier::text = p_tier_filter)
  )
  SELECT
    r.rn AS rank_position,
    r.user_id,
    r.username,
    r.avatar_url,
    r.tier,
    r.division,
    r.lp,
    r.mmr,
    r.games_played,
    r.win_streak,
    (r.user_id = v_uid) AS is_self
  FROM ranked r
  WHERE r.rn > p_offset AND r.rn <= p_offset + p_limit
  ORDER BY r.rn ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_ranked_leaderboard(text, int, int) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_ranked_leaderboard(text, int, int) TO authenticated;

-- 4) RPC: get caller's own ranked position (for sticky row)
CREATE OR REPLACE FUNCTION public.get_my_ranked_position(p_tier_filter text DEFAULT NULL)
RETURNS TABLE (
  rank_position bigint,
  user_id uuid,
  username text,
  avatar_url text,
  tier rank_tier,
  division rank_division,
  lp int,
  mmr int,
  games_played int,
  win_streak int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_season uuid;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN;
  END IF;
  SELECT id INTO v_season FROM public.seasons WHERE status = 'active' ORDER BY starts_at DESC LIMIT 1;
  IF v_season IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH ranked AS (
    SELECT
      rs.user_id,
      p.username,
      p.avatar_url,
      rs.tier,
      rs.division,
      rs.lp,
      rs.mmr,
      rs.games_played,
      rs.win_streak,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE rs.tier
            WHEN 'challenger' THEN 9 WHEN 'grandmaster' THEN 8 WHEN 'master' THEN 7
            WHEN 'diamond' THEN 6 WHEN 'platinum' THEN 5 WHEN 'gold' THEN 4
            WHEN 'silver' THEN 3 WHEN 'bronze' THEN 2 WHEN 'iron' THEN 1 ELSE 0
          END DESC,
          CASE rs.division WHEN 'I' THEN 1 WHEN 'II' THEN 2 WHEN 'III' THEN 3 WHEN 'IV' THEN 4 ELSE 5 END ASC,
          rs.lp DESC,
          rs.mmr DESC
      ) AS rn
    FROM public.rank_states rs
    JOIN public.profiles p ON p.id = rs.user_id
    WHERE rs.season_id = v_season
      AND rs.placements_remaining = 0
      AND (p_tier_filter IS NULL OR p_tier_filter = 'all' OR rs.tier::text = p_tier_filter)
  )
  SELECT r.rn, r.user_id, r.username, r.avatar_url, r.tier, r.division, r.lp, r.mmr, r.games_played, r.win_streak
  FROM ranked r
  WHERE r.user_id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_ranked_position(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_my_ranked_position(text) TO authenticated;