// Battle v2 — Judge Dispatcher
// ----------------------------------------------------------------------------
// Receives a submission_id, validates the submission is pending, runs it
// through a pluggable judge provider, and writes the verdict back via the
// `apply_submission_verdict` SECURITY DEFINER RPC.
//
// Current provider: `stub` — deterministic verdict based on code-hash entropy.
// Swap to a real sandbox (Judge0/Piston) by implementing `runJudge()`.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type JudgeVerdict =
  | "accepted"
  | "wrong_answer"
  | "tle"
  | "mle"
  | "runtime_error"
  | "compile_error"
  | "rejected";

interface JudgeOutcome {
  verdict: JudgeVerdict;
  testcases_passed: number;
  testcases_total: number;
  runtime_ms: number;
  memory_kb: number;
  compile_log?: string | null;
}

interface SubmissionRow {
  id: string;
  match_id: string;
  problem_id: string;
  user_id: string;
  code: string;
  language: string;
  code_hash: string | null;
  verdict: string;
}

// ─── Stub judge ─────────────────────────────────────────────────────────────
// Deterministic per-code-hash so a user gets the same verdict on retry of the
// same code, but different code → different verdict. Returns mostly-AC for
// non-trivial code; obviously-empty / placeholder code → WA.
function runStubJudge(sub: SubmissionRow): JudgeOutcome {
  const code = (sub.code ?? "").trim();
  const totalCases = 8;

  // Empty / template-only → wrong answer
  const tooShort = code.length < 30;
  const isTemplate =
    /^def\s+solution\s*\(\s*\)\s*:\s*(#.*)?\s*pass\s*$/m.test(code) ||
    /^function\s+solution\s*\(\s*\)\s*\{\s*\}\s*$/m.test(code);

  if (tooShort || isTemplate) {
    return {
      verdict: "wrong_answer",
      testcases_passed: Math.floor(totalCases * 0.25),
      testcases_total: totalCases,
      runtime_ms: 12,
      memory_kb: 1024,
    };
  }

  // Hash-based deterministic verdict spread
  const hash = sub.code_hash ?? "";
  const seed = parseInt(hash.slice(0, 8) || "0", 16) || 1;
  const roll = seed % 100;

  if (roll < 70) {
    return {
      verdict: "accepted",
      testcases_passed: totalCases,
      testcases_total: totalCases,
      runtime_ms: 18 + (seed % 60),
      memory_kb: 1500 + (seed % 2000),
    };
  }
  if (roll < 88) {
    const passed = Math.floor(totalCases * 0.6);
    return {
      verdict: "wrong_answer",
      testcases_passed: passed,
      testcases_total: totalCases,
      runtime_ms: 22 + (seed % 40),
      memory_kb: 1600,
    };
  }
  if (roll < 95) {
    return {
      verdict: "tle",
      testcases_passed: Math.floor(totalCases * 0.4),
      testcases_total: totalCases,
      runtime_ms: 2000,
      memory_kb: 2048,
    };
  }
  return {
    verdict: "runtime_error",
    testcases_passed: 0,
    testcases_total: totalCases,
    runtime_ms: 5,
    memory_kb: 1024,
    compile_log: "RuntimeError: judge stub deterministic failure",
  };
}

// Pluggable entry point — swap to Judge0 / Piston here.
async function runJudge(sub: SubmissionRow): Promise<JudgeOutcome> {
  const provider = Deno.env.get("BATTLE_JUDGE_PROVIDER") ?? "stub";
  switch (provider) {
    case "stub":
    default:
      return runStubJudge(sub);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(
        JSON.stringify({ error: "server misconfigured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Authenticate the caller (must be logged in user that owns submission)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userResp, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userResp?.user) {
      return new Response(
        JSON.stringify({ error: "unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const userId = userResp.user.id;

    let body: { submission_id?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "invalid json" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const submissionId = body.submission_id;
    if (!submissionId || typeof submissionId !== "string") {
      return new Response(
        JSON.stringify({ error: "submission_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch the submission (service-role bypasses RLS)
    const { data: sub, error: subErr } = await admin
      .from("battle_match_submissions")
      .select("id, match_id, problem_id, user_id, code, language, code_hash, verdict")
      .eq("id", submissionId)
      .maybeSingle();

    if (subErr || !sub) {
      return new Response(
        JSON.stringify({ error: "submission not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (sub.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: "forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (sub.verdict !== "pending") {
      // Already judged — return the existing verdict for idempotency
      return new Response(
        JSON.stringify({ ok: true, already_applied: true, verdict: sub.verdict }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Run the judge
    const outcome = await runJudge(sub as SubmissionRow);

    // Apply verdict via SECURITY DEFINER RPC (only callable by service-role)
    const { data: applyData, error: applyErr } = await admin.rpc(
      "apply_submission_verdict",
      {
        p_submission_id: submissionId,
        p_verdict: outcome.verdict,
        p_payload: {
          testcases_passed: outcome.testcases_passed,
          testcases_total: outcome.testcases_total,
          runtime_ms: outcome.runtime_ms,
          memory_kb: outcome.memory_kb,
          compile_log: outcome.compile_log ?? null,
          provider: Deno.env.get("BATTLE_JUDGE_PROVIDER") ?? "stub",
        },
      },
    );

    if (applyErr) {
      console.error("apply_submission_verdict failed:", applyErr);
      return new Response(
        JSON.stringify({ error: "verdict_apply_failed", detail: applyErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        submission_id: submissionId,
        outcome,
        result: applyData,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("judge-dispatcher fatal:", e);
    return new Response(
      JSON.stringify({ error: "internal_error", detail: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
