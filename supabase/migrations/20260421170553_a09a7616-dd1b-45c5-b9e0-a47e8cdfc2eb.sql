-- ============================================================================
-- Step 8 — Anti-Cheat + Integrity Layer
-- ============================================================================

-- 1. Schema additions ---------------------------------------------------------

ALTER TABLE public.battle_participants
  ADD COLUMN IF NOT EXISTS tab_switches int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paste_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paste_chars_total bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS focus_lost_ms bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS integrity_score int NOT NULL DEFAULT 100;

ALTER TABLE public.battle_match_submissions
  ADD COLUMN IF NOT EXISTS code_normalized_hash text,
  ADD COLUMN IF NOT EXISTS paste_ratio numeric(4,3),
  ADD COLUMN IF NOT EXISTS time_since_problem_open_sec int;

CREATE INDEX IF NOT EXISTS idx_bms_match_problem_hash
  ON public.battle_match_submissions (match_id, problem_id, code_normalized_hash);

-- 2. Submission similarity table ---------------------------------------------

CREATE TABLE IF NOT EXISTS public.submission_similarity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  submission_a uuid NOT NULL,
  submission_b uuid NOT NULL,
  similarity numeric(4,3) NOT NULL,
  algorithm text NOT NULL DEFAULT 'token-jaccard',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.submission_similarity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read similarity" ON public.submission_similarity;
CREATE POLICY "Admins read similarity"
  ON public.submission_similarity FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Similarity insert blocked" ON public.submission_similarity;
CREATE POLICY "Similarity insert blocked"
  ON public.submission_similarity FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Similarity update blocked" ON public.submission_similarity;
CREATE POLICY "Similarity update blocked"
  ON public.submission_similarity FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Similarity delete blocked" ON public.submission_similarity;
CREATE POLICY "Similarity delete blocked"
  ON public.submission_similarity FOR DELETE
  USING (false);

-- 3. Anticheat enum widening (idempotent) ------------------------------------

DO $$
BEGIN
  -- Add any missing kinds we'll emit; ignore if they already exist.
  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
   WHERE t.typname = 'anticheat_kind' AND e.enumlabel = 'behavioral';
  IF NOT FOUND THEN
    ALTER TYPE public.anticheat_kind ADD VALUE 'behavioral';
  END IF;
EXCEPTION WHEN undefined_object THEN
  -- enum doesn't exist; nothing to do (table uses text)
  NULL;
END$$;

DO $$
BEGIN
  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
   WHERE t.typname = 'anticheat_kind' AND e.enumlabel = 'code_similarity';
  IF NOT FOUND THEN
    ALTER TYPE public.anticheat_kind ADD VALUE 'code_similarity';
  END IF;
EXCEPTION WHEN undefined_object THEN NULL;
END$$;

DO $$
BEGIN
  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
   WHERE t.typname = 'anticheat_kind' AND e.enumlabel = 'impossible_solve_time';
  IF NOT FOUND THEN
    ALTER TYPE public.anticheat_kind ADD VALUE 'impossible_solve_time';
  END IF;
EXCEPTION WHEN undefined_object THEN NULL;
END$$;

DO $$
BEGIN
  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
   WHERE t.typname = 'anticheat_kind' AND e.enumlabel = 'paste_solution';
  IF NOT FOUND THEN
    ALTER TYPE public.anticheat_kind ADD VALUE 'paste_solution';
  END IF;
EXCEPTION WHEN undefined_object THEN NULL;
END$$;

DO $$
BEGIN
  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
   WHERE t.typname = 'anticheat_kind' AND e.enumlabel = 'devtools_open';
  IF NOT FOUND THEN
    ALTER TYPE public.anticheat_kind ADD VALUE 'devtools_open';
  END IF;
EXCEPTION WHEN undefined_object THEN NULL;
END$$;

DO $$
BEGIN
  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
   WHERE t.typname = 'anticheat_kind' AND e.enumlabel = 'fullscreen_exit';
  IF NOT FOUND THEN
    ALTER TYPE public.anticheat_kind ADD VALUE 'fullscreen_exit';
  END IF;
EXCEPTION WHEN undefined_object THEN NULL;
END$$;

DO $$
BEGIN
  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
   WHERE t.typname = 'anticheat_status' AND e.enumlabel = 'actioned';
  IF NOT FOUND THEN
    ALTER TYPE public.anticheat_status ADD VALUE 'actioned';
  END IF;
EXCEPTION WHEN undefined_object THEN NULL;
END$$;

-- 4. record_integrity_event ---------------------------------------------------

CREATE OR REPLACE FUNCTION public.record_integrity_event(
  p_match_id uuid,
  p_kind text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_recent int;
  v_focus_ms bigint := COALESCE((p_payload->>'focus_lost_ms')::bigint, 0);
  v_chars int := COALESCE((p_payload->>'chars')::int, 0);
  v_score int;
  v_part record;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Throttle: max 30 events / minute / user / match
  SELECT count(*) INTO v_recent
  FROM public.battle_event_log
  WHERE match_id = p_match_id
    AND user_id = v_user
    AND event_type LIKE 'integrity:%'
    AND created_at > now() - interval '1 minute';

  IF v_recent >= 30 THEN
    RETURN jsonb_build_object('throttled', true);
  END IF;

  -- Must be a participant of an active match
  SELECT bp.* INTO v_part
  FROM public.battle_participants bp
  JOIN public.battle_matches bm ON bm.id = bp.match_id
  WHERE bp.match_id = p_match_id
    AND bp.user_id = v_user
    AND bm.status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ignored', 'not_active_participant');
  END IF;

  -- Apply counter updates
  IF p_kind = 'tab_switch' THEN
    UPDATE public.battle_participants
       SET tab_switches  = tab_switches + 1,
           focus_lost_ms = focus_lost_ms + GREATEST(v_focus_ms, 0)
     WHERE id = v_part.id;
  ELSIF p_kind = 'paste' THEN
    UPDATE public.battle_participants
       SET paste_count       = paste_count + 1,
           paste_chars_total = paste_chars_total + GREATEST(v_chars, 0)
     WHERE id = v_part.id;
  ELSIF p_kind IN ('devtools_open', 'fullscreen_exit') THEN
    -- counter-less but still flag immediately
    INSERT INTO public.anticheat_flags (user_id, match_id, kind, severity, evidence)
    VALUES (v_user, p_match_id, p_kind::public.anticheat_kind, 2, p_payload);
  ELSE
    -- unknown kind, log only
    NULL;
  END IF;

  -- Recompute integrity score
  UPDATE public.battle_participants
     SET integrity_score = GREATEST(
       0,
       100 - tab_switches * 5 - paste_count * 2 - ((focus_lost_ms / 60000)::int * 3)
     )
   WHERE id = v_part.id
   RETURNING integrity_score INTO v_score;

  -- Threshold flags
  IF v_score IS NOT NULL THEN
    IF v_score <= 20 THEN
      INSERT INTO public.anticheat_flags (user_id, match_id, kind, severity, evidence)
      VALUES (v_user, p_match_id, 'behavioral'::public.anticheat_kind, 4,
              jsonb_build_object('integrity_score', v_score, 'reason', 'critical_drop'));
      PERFORM pg_notify('anticheat', p_match_id::text);
    ELSIF v_score <= 50 THEN
      -- Only insert if no recent behavioral pending review
      IF NOT EXISTS (
        SELECT 1 FROM public.anticheat_flags
         WHERE match_id = p_match_id AND user_id = v_user
           AND kind = 'behavioral'::public.anticheat_kind
           AND status = 'pending_review'::public.anticheat_status
           AND created_at > now() - interval '5 minutes'
      ) THEN
        INSERT INTO public.anticheat_flags (user_id, match_id, kind, severity, evidence)
        VALUES (v_user, p_match_id, 'behavioral'::public.anticheat_kind, 2,
                jsonb_build_object('integrity_score', v_score));
      END IF;
    END IF;
  END IF;

  -- Audit trail
  INSERT INTO public.battle_event_log (match_id, user_id, event_type, payload)
  VALUES (p_match_id, v_user, 'integrity:' || p_kind, p_payload || jsonb_build_object('integrity_score', v_score));

  RETURN jsonb_build_object('integrity_score', v_score);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_integrity_event(uuid, text, jsonb) TO authenticated;

-- 5. Code normalization + similarity helpers ---------------------------------

CREATE OR REPLACE FUNCTION public.normalize_code(p_code text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v text := COALESCE(p_code, '');
BEGIN
  -- Strip block comments /* ... */ and line comments (// and #)
  v := regexp_replace(v, '/\*[\s\S]*?\*/', ' ', 'g');
  v := regexp_replace(v, '//[^\n]*', ' ', 'g');
  v := regexp_replace(v, '#[^\n]*', ' ', 'g');
  -- Collapse whitespace
  v := regexp_replace(v, '\s+', ' ', 'g');
  -- Lowercase
  v := lower(v);
  RETURN trim(v);
END;
$$;

CREATE OR REPLACE FUNCTION public.token_jaccard(a text, b text)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  ta text[];
  tb text[];
  inter int;
  uni int;
BEGIN
  ta := regexp_split_to_array(COALESCE(a,''), '[^a-zA-Z0-9_]+');
  tb := regexp_split_to_array(COALESCE(b,''), '[^a-zA-Z0-9_]+');
  IF ta IS NULL OR tb IS NULL THEN RETURN 0; END IF;

  SELECT count(DISTINCT x) INTO inter
  FROM unnest(ta) AS x
  WHERE x <> '' AND x = ANY(tb);

  SELECT count(DISTINCT x) INTO uni
  FROM unnest(ta || tb) AS x
  WHERE x <> '';

  IF uni = 0 THEN RETURN 0; END IF;
  RETURN round((inter::numeric / uni::numeric), 3);
END;
$$;

-- 6. scan_submission_integrity -----------------------------------------------

CREATE OR REPLACE FUNCTION public.scan_submission_integrity(p_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub record;
  v_diff text;
  v_other record;
  v_sim numeric;
  v_norm text;
BEGIN
  SELECT s.*, c.difficulty
  INTO v_sub
  FROM public.battle_match_submissions s
  LEFT JOIN public.battle_match_problems p ON p.id = s.problem_id
  LEFT JOIN public.challenges c ON c.id = p.challenge_id
  WHERE s.id = p_submission_id;

  IF NOT FOUND THEN RETURN; END IF;
  v_diff := COALESCE(v_sub.difficulty, 'medium');

  -- Ensure normalized hash is set
  IF v_sub.code_normalized_hash IS NULL THEN
    v_norm := public.normalize_code(v_sub.code);
    UPDATE public.battle_match_submissions
       SET code_normalized_hash = encode(digest(v_norm, 'sha256'), 'hex')
     WHERE id = v_sub.id;
  END IF;

  -- Impossible solve time
  IF v_sub.verdict::text = 'accepted' AND v_sub.time_since_problem_open_sec IS NOT NULL THEN
    IF (v_diff = 'medium' AND v_sub.time_since_problem_open_sec < 20)
       OR (v_diff = 'hard' AND v_sub.time_since_problem_open_sec < 60) THEN
      INSERT INTO public.anticheat_flags (user_id, match_id, kind, severity, evidence)
      VALUES (v_sub.user_id, v_sub.match_id, 'impossible_solve_time'::public.anticheat_kind, 2,
              jsonb_build_object('seconds', v_sub.time_since_problem_open_sec, 'difficulty', v_diff));
    END IF;
  END IF;

  -- Paste-driven solution
  IF v_sub.verdict::text = 'accepted' AND COALESCE(v_sub.paste_ratio, 0) > 0.7 THEN
    INSERT INTO public.anticheat_flags (user_id, match_id, kind, severity, evidence)
    VALUES (v_sub.user_id, v_sub.match_id, 'paste_solution'::public.anticheat_kind, 3,
            jsonb_build_object('paste_ratio', v_sub.paste_ratio));
  END IF;

  -- Cross-user code similarity (same match + problem, opponent)
  FOR v_other IN
    SELECT id, user_id, code
    FROM public.battle_match_submissions
    WHERE match_id = v_sub.match_id
      AND problem_id = v_sub.problem_id
      AND user_id <> v_sub.user_id
      AND id <> v_sub.id
      AND length(code) > 30
  LOOP
    v_sim := public.token_jaccard(public.normalize_code(v_sub.code), public.normalize_code(v_other.code));
    IF v_sim >= 0.85 THEN
      INSERT INTO public.submission_similarity (match_id, submission_a, submission_b, similarity, algorithm)
      VALUES (v_sub.match_id, v_sub.id, v_other.id, v_sim, 'token-jaccard');

      INSERT INTO public.anticheat_flags (user_id, match_id, kind, severity, evidence)
      VALUES (v_sub.user_id, v_sub.match_id, 'code_similarity'::public.anticheat_kind, 3,
              jsonb_build_object('similarity', v_sim, 'paired_with', v_other.user_id));
      INSERT INTO public.anticheat_flags (user_id, match_id, kind, severity, evidence)
      VALUES (v_other.user_id, v_sub.match_id, 'code_similarity'::public.anticheat_kind, 3,
              jsonb_build_object('similarity', v_sim, 'paired_with', v_sub.user_id));
      EXIT; -- one pair is enough
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.scan_submission_integrity(uuid) TO service_role;

-- 7. Patch submit_match_solution to accept integrity metadata ----------------

CREATE OR REPLACE FUNCTION public.submit_match_solution(
  p_match_id uuid,
  p_problem_id uuid,
  p_code text,
  p_language text DEFAULT 'python',
  p_paste_ratio numeric DEFAULT NULL,
  p_time_since_open_sec int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_sub_id uuid;
  v_norm text;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.battle_participants bp
    JOIN public.battle_matches bm ON bm.id = bp.match_id
    WHERE bp.match_id = p_match_id
      AND bp.user_id = v_user
      AND bm.status = 'active'
  ) THEN
    RAISE EXCEPTION 'not an active participant';
  END IF;

  v_norm := public.normalize_code(p_code);

  INSERT INTO public.battle_match_submissions (
    match_id, problem_id, user_id, code, language, status, verdict,
    code_hash, code_normalized_hash, paste_ratio, time_since_problem_open_sec
  )
  VALUES (
    p_match_id, p_problem_id, v_user, p_code, p_language, 'pending', 'pending'::public.submission_verdict,
    encode(digest(p_code, 'sha256'), 'hex'),
    encode(digest(v_norm, 'sha256'), 'hex'),
    p_paste_ratio,
    p_time_since_open_sec
  )
  RETURNING id INTO v_sub_id;

  PERFORM public.enqueue_judge_job(v_sub_id);

  RETURN jsonb_build_object('submission_id', v_sub_id, 'status', 'queued');
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_match_solution(uuid, uuid, text, text, numeric, int) TO authenticated;

-- 8. apply_integrity_review (admin-only) -------------------------------------

CREATE OR REPLACE FUNCTION public.apply_integrity_review(
  p_flag_id uuid,
  p_action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin uuid := auth.uid();
  v_flag record;
BEGIN
  IF NOT public.is_admin(v_admin) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO v_flag FROM public.anticheat_flags WHERE id = p_flag_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'flag not found'; END IF;

  IF p_action = 'dismiss' THEN
    UPDATE public.anticheat_flags
       SET status = 'dismissed'::public.anticheat_status,
           reviewer_id = v_admin, reviewed_at = now()
     WHERE id = p_flag_id;

  ELSIF p_action = 'warn' THEN
    UPDATE public.anticheat_flags
       SET status = 'actioned'::public.anticheat_status,
           reviewer_id = v_admin, reviewed_at = now(),
           evidence = evidence || jsonb_build_object('action','warn')
     WHERE id = p_flag_id;

  ELSIF p_action = 'invalidate_match' THEN
    IF v_flag.match_id IS NOT NULL THEN
      UPDATE public.battle_matches
         SET invalidated_reason = 'integrity_invalidated'
       WHERE id = v_flag.match_id;
      PERFORM public.finalize_match(v_flag.match_id, 'integrity_invalidated', true);
    END IF;
    UPDATE public.anticheat_flags
       SET status = 'actioned'::public.anticheat_status,
           reviewer_id = v_admin, reviewed_at = now(),
           evidence = evidence || jsonb_build_object('action','invalidate_match')
     WHERE id = p_flag_id;

  ELSIF p_action = 'forfeit_user' THEN
    IF v_flag.match_id IS NOT NULL THEN
      UPDATE public.battle_participants
         SET is_forfeit = true
       WHERE match_id = v_flag.match_id AND user_id = v_flag.user_id;
      PERFORM public.finalize_match(v_flag.match_id, 'integrity_forfeit', false);
    END IF;
    UPDATE public.anticheat_flags
       SET status = 'actioned'::public.anticheat_status,
           reviewer_id = v_admin, reviewed_at = now(),
           evidence = evidence || jsonb_build_object('action','forfeit_user')
     WHERE id = p_flag_id;

  ELSE
    RAISE EXCEPTION 'unknown action: %', p_action;
  END IF;

  INSERT INTO public.battle_event_log (match_id, user_id, event_type, payload)
  VALUES (v_flag.match_id, v_admin, 'integrity:review',
          jsonb_build_object('flag_id', p_flag_id, 'action', p_action, 'subject', v_flag.user_id));

  RETURN jsonb_build_object('ok', true, 'action', p_action);
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_integrity_review(uuid, text) TO authenticated;

-- 9. Patch finalize_match to support skip_rating -----------------------------
-- finalize_match signature is project-defined; we add an overload that accepts
-- a third arg p_skip_rating. If the existing function uses different args,
-- callers above pass through this overload.

DO $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'finalize_match'
      AND pg_get_function_identity_arguments(p.oid) = 'p_match_id uuid, p_reason text, p_skip_rating boolean'
  ) INTO v_exists;

  IF NOT v_exists THEN
    -- Create a thin overload that delegates to the existing 2-arg form,
    -- annotating the match with a skip_rating marker via invalidated_reason
    -- (the 2-arg finalize is expected to honor invalidated_reason for ELO skip).
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION public.finalize_match(
        p_match_id uuid,
        p_reason text,
        p_skip_rating boolean
      )
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $body$
      BEGIN
        IF p_skip_rating THEN
          UPDATE public.battle_matches
             SET invalidated_reason = COALESCE(invalidated_reason, p_reason)
           WHERE id = p_match_id;
        END IF;
        PERFORM public.finalize_match(p_match_id, p_reason);
      END;
      $body$;
    $f$;
  END IF;
END$$;

-- 10. auto_action_critical_flags ---------------------------------------------

CREATE OR REPLACE FUNCTION public.auto_action_critical_flags()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  n int := 0;
BEGIN
  FOR r IN
    SELECT id, match_id
    FROM public.anticheat_flags
    WHERE severity >= 4
      AND status = 'pending_review'::public.anticheat_status
      AND created_at < now() - interval '60 seconds'
      AND match_id IS NOT NULL
  LOOP
    BEGIN
      UPDATE public.battle_matches
         SET invalidated_reason = COALESCE(invalidated_reason, 'auto_integrity_invalidated')
       WHERE id = r.match_id;
      PERFORM public.finalize_match(r.match_id, 'auto_integrity_invalidated', true);
      UPDATE public.anticheat_flags
         SET status = 'actioned'::public.anticheat_status,
             reviewed_at = now(),
             evidence = evidence || jsonb_build_object('action','auto_invalidate')
       WHERE id = r.id;
      n := n + 1;
    EXCEPTION WHEN OTHERS THEN
      -- skip and continue; surface in logs
      RAISE NOTICE 'auto_action_critical_flags failed for flag %: %', r.id, SQLERRM;
    END;
  END LOOP;
  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_action_critical_flags() TO service_role;