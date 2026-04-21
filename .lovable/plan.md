

# Step 7 — Code Execution + Judging Pipeline

## Goal
Replace the stub judge with a real code execution + verdict pipeline so battle submissions are actually compiled, run against testcases, and scored. Today, `apply_submission_verdict` accepts a verdict from the client; this step makes the **server** the source of truth via an edge function judge that reads testcases, executes code, and writes the verdict server-side.

## Backend changes

### 1. Migration: testcases + judge contract

**New table `challenge_testcases`** (per-challenge hidden test data):
- `id uuid pk`
- `challenge_id uuid not null` → references `challenges`
- `order_index int not null default 0`
- `input text not null`
- `expected_output text not null`
- `is_sample boolean default false` (sample = visible to user; rest = hidden)
- `weight int default 1`
- `time_limit_ms int default 2000`
- `memory_limit_kb int default 262144`
- RLS: only `is_sample=true` rows readable by authenticated users; full rows readable by `SECURITY DEFINER` judge function only.

**New table `judge_jobs`** (queue for async judging):
- `id uuid pk`, `submission_id uuid not null unique`
- `match_id uuid`, `user_id uuid`, `status text` (`queued`/`running`/`done`/`failed`)
- `attempts int default 0`, `last_error text`
- `created_at`, `picked_up_at`, `finished_at`
- RLS: participants read own jobs; insert/update via SECURITY DEFINER only.

### 2. RPCs

- **`enqueue_judge_job(p_submission_id uuid)`** — internal. Called by the existing submission insert path; creates a `judge_jobs` row in `queued` state and notifies via `pg_notify('judge_queue', submission_id)`.
- **`claim_judge_job()`** — `SECURITY DEFINER`, called by the judge worker. Locks the next `queued` job (`SKIP LOCKED`), bumps `status='running'`, returns submission + code + testcases payload.
- **`finalize_judge_job(p_job_id uuid, p_verdict text, p_passed int, p_total int, p_runtime_ms int, p_memory_kb int, p_compile_log text)`** — writes verdict back to `battle_match_submissions`, calls `apply_submission_verdict` (Step 2), marks job `done`. On failure path: bumps `attempts`, requeues if `attempts < 3`, else marks `failed` with synthetic `RE` verdict.

### 3. Edge function: `judge-worker`

`supabase/functions/judge-worker/index.ts`
- Validates shared secret header `x-judge-secret`.
- Loop (bounded by 25s wall clock to stay under edge timeout): `claim_judge_job()` → run code → `finalize_judge_job()`.
- Execution backend: stub runner for now that supports `python` and `javascript` via a sandboxed `eval` with stdin/stdout capture and per-testcase timeout. Returns one of `accepted` / `wrong_answer` / `tle` / `runtime_error` / `compile_error`.
- Returns `{ jobs_processed, verdicts: [...] }`.

### 4. Edge function: `match-ticker` extension

`supabase/functions/match-ticker/index.ts` — also POSTs to `judge-worker` once per tick to drain the queue without needing a separate cron entry.

### 5. Submission entry rewrite

Update `apply_submission_verdict` (Step 2) → split into two RPCs:
- **`submit_match_solution(p_match_id, p_problem_id, p_code, p_language)`** — caller-facing. Inserts a row into `battle_match_submissions` with `verdict='pending'`, calls `enqueue_judge_job`, returns `{ submission_id, status: 'queued' }`. Replaces direct verdict write from the client.
- The internal score-application logic stays in `apply_submission_verdict`, now only callable by `finalize_judge_job`.

Client can no longer self-report verdicts.

## Frontend changes

### 1. `src/components/battle-v2/workspace/CodeEditor.tsx` (or its submit handler hook)
- Submit flow becomes: `submit_match_solution` → toast "Judging…" → wait for realtime update on `battle_match_submissions` (already wired in Step 6 via `useBattleRealtime`) → display verdict from server.
- Remove any client-side verdict computation; verdict UI now reads `submission.verdict` only.

### 2. `src/components/battle-v2/workspace/VerdictOverlay.tsx`
- Render `pending` state with a "Judging on server…" spinner before the realtime verdict arrives.
- Map server verdicts (`accepted` / `wrong_answer` / `tle` / `runtime_error` / `compile_error`) to existing AC / WA / TLE / RE visuals.

### 3. `src/hooks/useSolveChallenge.ts` (non-battle path)
- Untouched for solo challenge flow this step (deferred); battle path is the only one switched to server judging.

## Files touched

- `supabase/migrations/<new>.sql` — `challenge_testcases`, `judge_jobs`, judge RPCs, split of `apply_submission_verdict`.
- `supabase/functions/judge-worker/index.ts` — new.
- `supabase/functions/match-ticker/index.ts` — calls `judge-worker` per tick.
- `src/components/battle-v2/workspace/CodeEditor.tsx` — submit via new RPC.
- `src/components/battle-v2/workspace/VerdictOverlay.tsx` — pending state.

## Verification

1. Submit known-correct Python solution → row created with `pending` → within ~2s realtime updates verdict to `accepted`, score applied, opponent ticker reflects change.
2. Submit infinite-loop code → judge marks `tle`, no score awarded.
3. Submit syntax error → `compile_error` verdict, attempts=1, no requeue.
4. Manually call `claim_judge_job()` after worker outage → drains backlog cleanly.

## Out of scope (deferred)

- C++/Java execution (only Python + JS in MVP runner).
- Custom testcase weighting UI for admins.
- Streaming per-testcase progress to the client.
- Switching solo `useSolveChallenge` to the same pipeline (separate step).

