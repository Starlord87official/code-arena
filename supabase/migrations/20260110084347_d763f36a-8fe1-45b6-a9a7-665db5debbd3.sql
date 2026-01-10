-- =============================================
-- SECURE battle_history TABLE
-- =============================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can insert battle history" ON public.battle_history;
DROP POLICY IF EXISTS "Battle history is publicly readable" ON public.battle_history;

-- Enable RLS (should already be enabled)
ALTER TABLE public.battle_history ENABLE ROW LEVEL SECURITY;

-- SELECT: Only clan members involved in the battle can view
CREATE POLICY "Clan members can view their battle history"
ON public.battle_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clan_members cm
    WHERE cm.user_id = auth.uid()
    AND (cm.clan_id = battle_history.clan_a_id OR cm.clan_id = battle_history.clan_b_id)
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND (ur.clan_id = battle_history.clan_a_id OR ur.clan_id = battle_history.clan_b_id)
  )
);

-- INSERT: Block all direct inserts
CREATE POLICY "No direct battle history inserts"
ON public.battle_history
FOR INSERT
TO authenticated
WITH CHECK (false);

-- UPDATE: Block all updates (immutable records)
CREATE POLICY "Battle history is immutable"
ON public.battle_history
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- DELETE: Block all deletes
CREATE POLICY "Battle history cannot be deleted"
ON public.battle_history
FOR DELETE
TO authenticated
USING (false);

-- Create SECURITY DEFINER RPC for recording battle results
CREATE OR REPLACE FUNCTION public.record_battle_result(
  p_battle_id text,
  p_clan_a_id text,
  p_clan_a_name text,
  p_clan_a_score integer,
  p_clan_b_id text,
  p_clan_b_name text,
  p_clan_b_score integer,
  p_problems_solved_a integer,
  p_problems_solved_b integer,
  p_total_problems integer,
  p_started_at timestamptz,
  p_ended_at timestamptz,
  p_mvp_username text DEFAULT NULL,
  p_mvp_xp integer DEFAULT NULL,
  p_xp_change integer DEFAULT 0,
  p_elo_change integer DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_winner text;
  v_result record;
BEGIN
  -- Verify caller is a member or mentor of one of the clans
  IF NOT EXISTS (
    SELECT 1 FROM public.clan_members WHERE user_id = auth.uid() AND clan_id IN (p_clan_a_id, p_clan_b_id)
  ) AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND clan_id IN (p_clan_a_id, p_clan_b_id) AND role = 'mentor'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized to record battle results');
  END IF;
  
  -- Determine winner
  IF p_clan_a_score > p_clan_b_score THEN
    v_winner := p_clan_a_id;
  ELSIF p_clan_b_score > p_clan_a_score THEN
    v_winner := p_clan_b_id;
  ELSE
    v_winner := NULL; -- Draw
  END IF;
  
  -- Insert battle record
  INSERT INTO public.battle_history (
    battle_id, clan_a_id, clan_a_name, clan_a_score,
    clan_b_id, clan_b_name, clan_b_score,
    problems_solved_a, problems_solved_b, total_problems,
    started_at, ended_at, winner,
    mvp_username, mvp_xp, xp_change, elo_change
  ) VALUES (
    p_battle_id, p_clan_a_id, p_clan_a_name, p_clan_a_score,
    p_clan_b_id, p_clan_b_name, p_clan_b_score,
    p_problems_solved_a, p_problems_solved_b, p_total_problems,
    p_started_at, p_ended_at, v_winner,
    p_mvp_username, p_mvp_xp, p_xp_change, p_elo_change
  )
  RETURNING * INTO v_result;
  
  RETURN json_build_object('success', true, 'battle', row_to_json(v_result));
END;
$$;