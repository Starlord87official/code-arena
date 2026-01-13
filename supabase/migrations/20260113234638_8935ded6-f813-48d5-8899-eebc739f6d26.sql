-- Drop existing function to update return type (already dropped, just ensure)
DROP FUNCTION IF EXISTS public.get_challenge_stats();

-- Recreate with updated return type including success rate
-- Use ONLY challenge_completions for success rate (counts successful attempts)
CREATE OR REPLACE FUNCTION public.get_challenge_stats()
RETURNS TABLE (
  challenge_id uuid,
  solve_count bigint,
  attempt_count bigint,
  success_rate numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id as challenge_id,
    COALESCE(cc.solve_count, 0) as solve_count,
    COALESCE(cc.solve_count, 0) as attempt_count,  -- For now, use completions as attempts
    CASE 
      WHEN COALESCE(cc.solve_count, 0) = 0 THEN NULL
      ELSE 100.0  -- If completed, it was successful
    END as success_rate
  FROM challenges c
  LEFT JOIN (
    SELECT challenge_id, COUNT(DISTINCT user_id) as solve_count
    FROM challenge_completions
    GROUP BY challenge_id
  ) cc ON cc.challenge_id = c.id
  WHERE c.is_active = true;
$$;