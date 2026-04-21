// Battle v2 — Judge Worker
// ----------------------------------------------------------------------------
// Drains the judge_jobs queue: claim → execute code against testcases →
// finalize. Server-authoritative. Supports python + javascript via a stub
// runner (deterministic per code+input). Replace `executeCase` with a real
// sandbox (Judge0/Piston) when ready.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-judge-secret",
};

interface Testcase {
  id: string;
  order_index: number;
  input: string;
  expected_output: string;
  weight: number;
  time_limit_ms: number;
}

interface JudgeJob {
  job_id: string;
  submission_id: string;
  match_id: string;
  problem_id: string;
  user_id: string;
  code: string;
  language: string;
  testcases: Testcase[];
}

type Verdict =
  | "accepted"
  | "wrong_answer"
  | "tle"
  | "runtime_error"
  | "compile_error";

interface CaseResult {
  passed: boolean;
  runtime_ms: number;
  verdict: Verdict;
  error?: string;
}

// --- Stub executor ---------------------------------------------------------
// Deterministic verdict spread based on code hash + per-case content. Real
// sandbox plugs in here. Empty/template code → compile_error / wrong_answer.
async function executeCase(
  code: string,
  language: string,
  tc: Testcase,
): Promise<CaseResult> {
  const trimmed = code.trim();
  if (trimmed.length < 10) {
    return { passed: false, runtime_ms: 1, verdict: "compile_error", error: "empty source" };
  }

  // Cheap deterministic hash
  let h = 5381;
  for (let i = 0; i < trimmed.length; i++) h = ((h << 5) + h + trimmed.charCodeAt(i)) | 0;
  for (let i = 0; i < tc.input.length; i++) h = ((h << 5) + h + tc.input.charCodeAt(i)) | 0;
  const seed = Math.abs(h);
  const roll = seed % 100;

  // Soft language gate: only python/javascript supported in MVP
  const lang = (language || "python").toLowerCase();
  if (!["python", "py", "javascript", "js", "node"].includes(lang)) {
    return { passed: false, runtime_ms: 2, verdict: "compile_error", error: `unsupported language: ${language}` };
  }

  // Heuristic: very short code → likely wrong
  if (trimmed.length < 30 && roll < 60) {
    return { passed: false, runtime_ms: 8, verdict: "wrong_answer" };
  }

  // 75% pass, 15% wrong, 7% TLE, 3% runtime
  if (roll < 75) return { passed: true, runtime_ms: 12 + (seed % 50), verdict: "accepted" };
  if (roll < 90) return { passed: false, runtime_ms: 14 + (seed % 30), verdict: "wrong_answer" };
  if (roll < 97) return { passed: false, runtime_ms: tc.time_limit_ms, verdict: "tle" };
  return { passed: false, runtime_ms: 5, verdict: "runtime_error", error: "stub runtime fault" };
}

async function judgeOne(job: JudgeJob): Promise<{
  verdict: Verdict;
  passed: number;
  total: number;
  runtime_ms: number;
  memory_kb: number;
  compile_log: string | null;
}> {
  // No testcases configured → fall back to a single synthetic case so battles still resolve
  const cases = job.testcases.length > 0
    ? job.testcases
    : [{ id: "synthetic", order_index: 0, input: "", expected_output: "", weight: 1, time_limit_ms: 2000 }];

  let passed = 0;
  let totalRuntime = 0;
  let firstFailure: Verdict | null = null;
  let compileLog: string | null = null;

  for (const tc of cases) {
    const r = await executeCase(job.code, job.language, tc);
    totalRuntime = Math.max(totalRuntime, r.runtime_ms);

    if (r.verdict === "compile_error") {
      compileLog = r.error ?? "compile error";
      return { verdict: "compile_error", passed: 0, total: cases.length, runtime_ms: r.runtime_ms, memory_kb: 0, compile_log: compileLog };
    }

    if (r.passed) {
      passed++;
    } else if (!firstFailure) {
      firstFailure = r.verdict;
      if (r.error) compileLog = r.error;
    }
  }

  const verdict: Verdict = passed === cases.length ? "accepted" : (firstFailure ?? "wrong_answer");
  return {
    verdict,
    passed,
    total: cases.length,
    runtime_ms: totalRuntime,
    memory_kb: 1500 + (passed * 64),
    compile_log: compileLog,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const JUDGE_SECRET = Deno.env.get("JUDGE_WORKER_SECRET");

  // Optional shared-secret gate (skip if not configured to allow internal cron use)
  if (JUDGE_SECRET) {
    const provided = req.headers.get("x-judge-secret");
    if (provided !== JUDGE_SECRET) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const startedAt = Date.now();
  const WALL_BUDGET_MS = 25_000;
  const verdicts: Array<{ submission_id: string; verdict: string }> = [];
  let processed = 0;

  while (Date.now() - startedAt < WALL_BUDGET_MS) {
    const { data: claimed, error: claimErr } = await admin.rpc("claim_judge_job");
    if (claimErr) {
      console.error("claim_judge_job failed:", claimErr);
      break;
    }
    if (!claimed) break; // queue drained

    const job = claimed as JudgeJob;

    try {
      const result = await judgeOne(job);
      const { error: finErr } = await admin.rpc("finalize_judge_job", {
        p_job_id: job.job_id,
        p_verdict: result.verdict,
        p_passed: result.passed,
        p_total: result.total,
        p_runtime_ms: result.runtime_ms,
        p_memory_kb: result.memory_kb,
        p_compile_log: result.compile_log,
        p_error: null,
      });
      if (finErr) {
        console.error("finalize_judge_job failed:", finErr);
      } else {
        verdicts.push({ submission_id: job.submission_id, verdict: result.verdict });
        processed++;
        // Anti-cheat scan (best-effort; never blocks verdict reporting)
        try {
          const { error: scanErr } = await admin.rpc("scan_submission_integrity", {
            p_submission_id: job.submission_id,
          });
          if (scanErr) console.error("scan_submission_integrity:", scanErr);
        } catch (e) {
          console.error("integrity scan threw:", e);
        }
      }
    } catch (e) {
      console.error("judge execution error:", e);
      await admin.rpc("finalize_judge_job", {
        p_job_id: job.job_id,
        p_verdict: "runtime_error",
        p_passed: 0,
        p_total: job.testcases.length,
        p_runtime_ms: 0,
        p_memory_kb: 0,
        p_compile_log: null,
        p_error: String(e),
      });
    }
  }

  return new Response(
    JSON.stringify({ jobs_processed: processed, verdicts }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
