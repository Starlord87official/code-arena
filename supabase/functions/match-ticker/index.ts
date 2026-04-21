import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mm-cron-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const expectedSecret = Deno.env.get("MM_CRON_SECRET");
  const provided = req.headers.get("x-mm-cron-secret");

  if (expectedSecret && provided !== expectedSecret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const [finalized, created, sweep] = await Promise.all([
      supabase.rpc("tick_active_matches"),
      supabase.rpc("mm_tick"),
      supabase.rpc("reconnect_sweep"),
    ]);

    if (finalized.error) console.error("tick_active_matches:", finalized.error);
    if (created.error) console.error("mm_tick:", created.error);
    if (sweep.error) console.error("reconnect_sweep:", sweep.error);

    // Drain judge queue (best-effort, ignore failures so ticker stays cheap)
    let judgeProcessed = 0;
    try {
      const judgeResp = await fetch(`${supabaseUrl}/functions/v1/judge-worker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
          ...(Deno.env.get("JUDGE_WORKER_SECRET")
            ? { "x-judge-secret": Deno.env.get("JUDGE_WORKER_SECRET")! }
            : {}),
        },
        body: "{}",
      });
      if (judgeResp.ok) {
        const body = await judgeResp.json().catch(() => ({}));
        judgeProcessed = body.jobs_processed ?? 0;
      } else {
        console.error("judge-worker non-ok:", judgeResp.status);
      }
    } catch (e) {
      console.error("judge-worker invoke failed:", e);
    }

    return new Response(
      JSON.stringify({
        matches_finalized: finalized.data ?? 0,
        matches_created: created.data ?? 0,
        forfeits_processed: sweep.data ?? 0,
        judge_jobs_processed: judgeProcessed,
        errors: {
          finalize: finalized.error?.message ?? null,
          mm_tick: created.error?.message ?? null,
          sweep: sweep.error?.message ?? null,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
