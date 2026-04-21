-- ============================================================================
-- Step 7 — Code Execution + Judging Pipeline
-- ============================================================================

-- 1. challenge_testcases ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.challenge_testcases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  input text NOT NULL,
  expected_output text NOT NULL,
  is_sample boolean NOT NULL DEFAULT false,
  weight int NOT NULL DEFAULT 1,
  time_limit_ms int NOT NULL DEFAULT 2000,
  memory_limit_kb int NOT NULL DEFAULT 262144,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_testcases_challenge
  ON public.challenge_testcases(challenge_id, order_index);

ALTER TABLE public.challenge_testcases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authed can read sample testcases"
  ON public.challenge_testcases FOR SELECT
  TO authenticated
  USING (is_sample = true);

CREATE POLICY "Admins manage testcases"
  ON public.challenge_testcases FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 2. judge_jobs ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.judge_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL UNIQUE REFERENCES public.battle_match_submissions(id) ON DELETE CASCADE,
  match_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'queued', -- queued|running|done|failed
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  picked_up_at timestamptz,
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_judge_jobs_status_created
  ON public.judge_jobs(status, created_at);

ALTER TABLE public.judge_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read own jobs"
  ON public.judge_jobs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "No direct insert to judge_jobs"
  ON public.judge_jobs FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update to judge_jobs"
  ON public.judge_jobs FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No direct delete of judge_jobs"
  ON public.judge_jobs FOR DELETE
  TO authenticated
  USING (false);

-- 3. enqueue_judge_job --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enqueue_judge_job(p_submission_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub record;
  v_job_id uuid;
BEGIN
  SELECT id, match_id, user_id INTO v_sub
  FROM public.battle_match_submissions
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'submission not found: %', p_submission_id;
  END IF;

  INSERT INTO public.judge_jobs (submission_id, match_id, user_id, status)
  VALUES (v_sub.id, v_sub.match_id, v_sub.user_id, 'queued')
  ON CONFLICT (submission_id) DO UPDATE SET status = 'queued', attempts = 0
  RETURNING id INTO v_job_id;

  PERFORM pg_notify('judge_queue', v_job_id::text);
  RETURN v_job_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enqueue_judge_job(uuid) FROM PUBLIC, authenticated, anon;

-- 4. submit_match_solution (caller-facing) -----------------------------------
CREATE OR REPLACE FUNCTION public.submit_match_solution(
  p_match_id uuid,
  p_problem_id uuid,
  p_code text,
  p_language text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_sub_id uuid;
  v_job_id uuid;
  v_match_state text;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.battle_participants
    WHERE match_id = p_match_id AND user_id = v_user
  ) THEN
    RAISE EXCEPTION 'not a participant of this match';
  END IF;

  SELECT status INTO v_match_state FROM public.battle_matches WHERE id = p_match_id;
  IF v_match_state IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'match not active';
  END IF;

  INSERT INTO public.battle_match_submissions (
    match_id, problem_id, user_id, code, language, code_hash, verdict, status
  )
  VALUES (
    p_match_id, p_problem_id, v_user,
    COALESCE(p_code, ''), COALESCE(p_language, 'python'),
    encode(digest(COALESCE(p_code, ''), 'sha256'), 'hex'),
    'pending', 'pending'
  )
  RETURNING id INTO v_sub_id;

  v_job_id := public.enqueue_judge_job(v_sub_id);

  RETURN jsonb_build_object(
    'submission_id', v_sub_id,
    'job_id', v_job_id,
    'status', 'queued'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_match_solution(uuid, uuid, text, text) TO authenticated;

-- 5. claim_judge_job ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_judge_job()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job record;
  v_sub record;
  v_tests jsonb;
BEGIN
  WITH next_job AS (
    SELECT id FROM public.judge_jobs
    WHERE status = 'queued'
    ORDER BY created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  UPDATE public.judge_jobs j
     SET status = 'running',
         picked_up_at = now(),
         attempts = j.attempts + 1
    FROM next_job
   WHERE j.id = next_job.id
   RETURNING j.* INTO v_job;

  IF v_job.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT s.id, s.match_id, s.problem_id, s.user_id, s.code, s.language, p.challenge_id
    INTO v_sub
    FROM public.battle_match_submissions s
    JOIN public.battle_match_problems p ON p.id = s.problem_id
   WHERE s.id = v_job.submission_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'id', t.id,
           'order_index', t.order_index,
           'input', t.input,
           'expected_output', t.expected_output,
           'weight', t.weight,
           'time_limit_ms', t.time_limit_ms
         ) ORDER BY t.order_index), '[]'::jsonb)
    INTO v_tests
    FROM public.challenge_testcases t
   WHERE t.challenge_id = v_sub.challenge_id;

  RETURN jsonb_build_object(
    'job_id', v_job.id,
    'submission_id', v_sub.id,
    'match_id', v_sub.match_id,
    'problem_id', v_sub.problem_id,
    'user_id', v_sub.user_id,
    'code', v_sub.code,
    'language', v_sub.language,
    'testcases', v_tests
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_judge_job() FROM PUBLIC, authenticated, anon;

-- 6. finalize_judge_job -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.finalize_judge_job(
  p_job_id uuid,
  p_verdict text,
  p_passed int,
  p_total int,
  p_runtime_ms int,
  p_memory_kb int,
  p_compile_log text DEFAULT NULL,
  p_error text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job record;
  v_apply jsonb;
BEGIN
  SELECT * INTO v_job FROM public.judge_jobs WHERE id = p_job_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'job not found';
  END IF;

  -- Failure / retry path
  IF p_error IS NOT NULL THEN
    IF v_job.attempts < 3 THEN
      UPDATE public.judge_jobs
         SET status = 'queued',
             last_error = p_error,
             picked_up_at = NULL
       WHERE id = p_job_id;
      RETURN jsonb_build_object('ok', false, 'requeued', true, 'attempts', v_job.attempts);
    END IF;

    UPDATE public.judge_jobs
       SET status = 'failed',
           last_error = p_error,
           finished_at = now()
     WHERE id = p_job_id;

    SELECT public.apply_submission_verdict(
      v_job.submission_id,
      'runtime_error'::submission_verdict,
      jsonb_build_object(
        'testcases_passed', 0,
        'testcases_total', COALESCE(p_total, 0),
        'runtime_ms', 0,
        'memory_kb', 0,
        'compile_log', p_error,
        'provider', 'judge_failure'
      )
    ) INTO v_apply;

    RETURN jsonb_build_object('ok', false, 'failed_terminal', true, 'apply', v_apply);
  END IF;

  -- Normal verdict path
  SELECT public.apply_submission_verdict(
    v_job.submission_id,
    p_verdict::submission_verdict,
    jsonb_build_object(
      'testcases_passed', COALESCE(p_passed, 0),
      'testcases_total', COALESCE(p_total, 0),
      'runtime_ms', COALESCE(p_runtime_ms, 0),
      'memory_kb', COALESCE(p_memory_kb, 0),
      'compile_log', p_compile_log,
      'provider', 'judge_worker'
    )
  ) INTO v_apply;

  UPDATE public.judge_jobs
     SET status = 'done',
         finished_at = now(),
         last_error = NULL
   WHERE id = p_job_id;

  RETURN jsonb_build_object('ok', true, 'apply', v_apply);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.finalize_judge_job(uuid, text, int, int, int, int, text, text) FROM PUBLIC, authenticated, anon;
