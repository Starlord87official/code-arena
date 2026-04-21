
DROP FUNCTION IF EXISTS public.submit_battle_solution(uuid, uuid, text, text, text);
DROP FUNCTION IF EXISTS public.submit_battle_solution(uuid, uuid, text, text);
DROP FUNCTION IF EXISTS public.apply_submission_verdict(uuid, submission_verdict, jsonb);

CREATE OR REPLACE FUNCTION public.submit_battle_solution(
  p_match_id uuid,
  p_problem_id uuid,
  p_language text,
  p_code text,
  p_idempotency_key text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_match record;
  v_existing uuid;
  v_submission_id uuid;
  v_code_hash text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  SELECT m.id, m.status, m.state
    INTO v_match
  FROM public.battle_matches m
  WHERE m.id = p_match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'match not found';
  END IF;

  IF v_match.status <> 'active' THEN
    RAISE EXCEPTION 'match not active (status=%)', v_match.status;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.battle_participants
    WHERE match_id = p_match_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'not a participant';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing
    FROM public.battle_match_submissions
    WHERE match_id = p_match_id
      AND user_id = v_user_id
      AND idempotency_key = p_idempotency_key
    LIMIT 1;

    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  v_code_hash := encode(digest(coalesce(p_code, ''), 'sha256'), 'hex');

  INSERT INTO public.battle_match_submissions (
    match_id, problem_id, user_id,
    code, language, code_hash, idempotency_key,
    status, verdict, score,
    testcases_passed, testcases_total
  )
  VALUES (
    p_match_id, p_problem_id, v_user_id,
    p_code, p_language, v_code_hash, p_idempotency_key,
    'pending', 'pending', 0,
    0, 0
  )
  RETURNING id INTO v_submission_id;

  INSERT INTO public.battle_event_log (match_id, user_id, event_type, payload)
  VALUES (
    p_match_id, v_user_id, 'submission_received',
    jsonb_build_object(
      'submission_id', v_submission_id,
      'problem_id', p_problem_id,
      'language', p_language,
      'code_hash', v_code_hash
    )
  );

  RETURN v_submission_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_battle_solution(uuid, uuid, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.apply_submission_verdict(
  p_submission_id uuid,
  p_verdict submission_verdict,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub record;
  v_score integer := 0;
  v_passed integer := 0;
  v_total integer := 0;
  v_runtime integer := NULL;
  v_memory integer := NULL;
  v_status text;
BEGIN
  SELECT s.id, s.match_id, s.problem_id, s.user_id, s.verdict, s.submitted_at
    INTO v_sub
  FROM public.battle_match_submissions s
  WHERE s.id = p_submission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'submission not found';
  END IF;

  IF v_sub.verdict <> 'pending' THEN
    RETURN jsonb_build_object('already_applied', true, 'verdict', v_sub.verdict);
  END IF;

  v_passed  := COALESCE((p_payload->>'testcases_passed')::int, 0);
  v_total   := COALESCE((p_payload->>'testcases_total')::int, 0);
  v_runtime := NULLIF(p_payload->>'runtime_ms', '')::int;
  v_memory  := NULLIF(p_payload->>'memory_kb', '')::int;

  v_status := CASE p_verdict
    WHEN 'accepted' THEN 'accepted'
    WHEN 'wrong_answer' THEN 'wrong_answer'
    WHEN 'tle' THEN 'tle'
    WHEN 'mle' THEN 'mle'
    WHEN 'runtime_error' THEN 'runtime_error'
    WHEN 'compile_error' THEN 'compile_error'
    ELSE 'rejected'
  END;

  IF p_verdict = 'accepted' THEN
    SELECT points INTO v_score
    FROM public.battle_match_problems
    WHERE id = v_sub.problem_id;
    v_score := COALESCE(v_score, 100);
  END IF;

  UPDATE public.battle_match_submissions
  SET
    verdict = p_verdict,
    verdict_payload = p_payload,
    status = v_status,
    score = v_score,
    testcases_passed = v_passed,
    testcases_total = v_total,
    runtime_ms = v_runtime,
    memory_kb = v_memory,
    judged_at = now()
  WHERE id = p_submission_id;

  IF p_verdict = 'accepted' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.battle_match_submissions
      WHERE match_id = v_sub.match_id
        AND user_id = v_sub.user_id
        AND problem_id = v_sub.problem_id
        AND verdict = 'accepted'
        AND id <> p_submission_id
    ) THEN
      UPDATE public.battle_participants
      SET
        score = score + v_score,
        problems_solved = problems_solved + 1
      WHERE match_id = v_sub.match_id AND user_id = v_sub.user_id;
    END IF;
  ELSE
    UPDATE public.battle_participants
    SET wrong_submissions = wrong_submissions + 1
    WHERE match_id = v_sub.match_id AND user_id = v_sub.user_id;
  END IF;

  INSERT INTO public.battle_event_log (match_id, user_id, event_type, payload)
  VALUES (
    v_sub.match_id, v_sub.user_id, 'verdict_emitted',
    jsonb_build_object(
      'submission_id', p_submission_id,
      'problem_id', v_sub.problem_id,
      'verdict', p_verdict,
      'score', v_score,
      'passed', v_passed,
      'total', v_total
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'verdict', p_verdict,
    'score', v_score,
    'passed', v_passed,
    'total', v_total
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_submission_verdict(uuid, submission_verdict, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_submission_verdict(uuid, submission_verdict, jsonb) FROM anon, authenticated;
