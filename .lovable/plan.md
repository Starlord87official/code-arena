

# Battle Module — Backend Foundation

## Audit summary

**Stack**: React + Vite + TS frontend → Supabase (Postgres + RLS + Realtime + Edge Functions). Frontend is `battle-v2/` components + `useMatchmaking` + `useBattleData` hooks, calling RPCs via `supabase.rpc(...)`.

**Already present**
- Tables: `battle_queue`, `battle_sessions` (legacy 1v1-style), `battle_matches` + `battle_participants` + `battle_match_problems` + `battle_match_submissions` (newer richer schema, mostly unused), `battle_invites`, `battle_history`, `user_battle_stats`.
- RPCs: `join_battle_queue`, `cancel_battle_queue`, `check_battle_queue_status`, `complete_duo_battle`, `get_user_battle_stats`, `get_battle_opponent_profile`, `record_battle_result`.
- Realtime: `battle_match_submissions` already subscribed in `BattleSession.tsx`.

**Gaps**
- No seasons / MMR vs LP split / rating history / placements / decay.
- No state machine — `battle_sessions.status` is free-text; no ready_check / ban_pick / judging / invalidated states.
- No real submission pipeline — frontend simulates verdicts client-side.
- No anti-cheat logging, no event log table, no admin invalidation tools.
- Matchmaking is naive (no MMR window expansion, no repeat-opponent guard, no dodge penalty).
- No leaderboard snapshot / promotion series / config table.

## What gets built

### 1. Schema migration — domain models

New tables (all with strict RLS, immutable where audit-critical):

```text
seasons                 (id, name, starts_at, ends_at, status, soft_reset_factor)
rank_states             (user_id, season_id, mmr, mmr_deviation, lp, tier, division,
                         games_played, placements_remaining, win_streak, loss_streak,
                         demotion_shield, last_match_at, decay_applied_at)
rating_history          (id, user_id, season_id, match_id, mmr_before, mmr_after,
                         lp_before, lp_after, k_factor, expected_score, actual_score,
                         reason, created_at)              -- immutable
battle_configs          (id, mode, problem_count, difficulty_curve jsonb,
                         duration_minutes, submission_limit, ban_count, pick_count,
                         tiebreak_rules jsonb, is_active)
battle_event_log        (id, match_id, user_id, event_type, payload jsonb, created_at)
                         -- ready_check_*, ban_picked, pick_locked, problem_revealed,
                         -- submission_received, verdict_emitted, state_transition,
                         -- disconnect, reconnect, forfeit, invalidate
anticheat_flags         (id, match_id, user_id, kind, severity, evidence jsonb,
                         status, reviewer_id, reviewed_at)
                         -- tab_blur, paste_burst, ai_pattern, dup_submission,
                         -- collusion_window, plagiarism_score
match_topic_pool        (match_id, topic, source)         -- ban/pick state
match_topic_actions     (match_id, user_id, action, topic, order_index)
challenge_invites       (id, sender_id, receiver_id, mode, config_id, status, ...)
                         -- supersedes battle_invites (kept for back-compat)
leaderboard_snapshots   (id, season_id, tier, captured_at, payload jsonb)
promotion_series        (id, user_id, season_id, target_tier, wins_required,
                         losses_allowed, wins, losses, status)
```

Extend existing:
- `battle_matches`: add `state` enum, `phase_started_at`, `config_id`, `season_id`, `invalidated_reason`, `judge_provider`.
- `battle_match_submissions`: add `verdict`, `verdict_payload jsonb`, `idempotency_key`, `judged_at`, `compile_log`.

Enums: `match_state`, `submission_verdict`, `anticheat_kind`, `season_status`, `tier`, `division`.

### 2. State machine

Postgres function `battle_transition(match_id, to_state, actor)` is the **only** path that mutates `battle_matches.state`. It validates allowed transitions:

```text
idle → queued → match_found → ready_check → ban_pick → active
                      ↓             ↓            ↓        ↓
                  cancelled    abandoned    abandoned  judging → completed
                                                           ↓
                                                     invalidated
```

Every transition writes a `battle_event_log` row. RLS prevents direct UPDATE.

### 3. Rating engine (`rating_engine.sql`)

Pure SQL functions, deterministic, testable:

- `re_expected_score(mmr_a, mmr_b)` — Elo expectation.
- `re_k_factor(games_played, deviation, is_placement)` — dynamic K.
- `re_apply_match(match_id)` — reads result, computes MMR delta for both sides, derives LP delta with streak modifiers + demotion shield, writes `rating_history` (immutable), updates `rank_states`, advances/closes any open `promotion_series`.
- `re_decay_inactive(season_id)` — cron-callable; applies LP decay after N days idle, never below tier floor.
- `re_seasonal_soft_reset(new_season_id, factor)` — copies snapshots forward, resets LP, leaves MMR scaled.

**MMR is hidden**, **LP is user-facing** — both stored separately in `rank_states`. `get_user_battle_stats` returns LP/tier only; MMR is admin-only.

### 4. Matchmaking service (`matchmaking.sql`)

Replace naive `join_battle_queue` with:

- `mm_enqueue(mode, format, region, config_id)` — creates `battle_queue` row keyed on hidden MMR + deviation, idempotent per user.
- `mm_tick()` — cron-callable matcher: pairs by MMR proximity with a window that **expands over time** (e.g. ±50 → ±400 over 90s), avoids opponents played in last N matches, respects region weighting hook, skips users with active dodge penalty.
- `mm_dequeue(reason)` — explicit cancel, also called on dodge.
- `mm_dodge_penalty(user_id)` — escalating cooldown when ready-check declined.

On match: creates `battle_matches` (state=`match_found`), participants, problem set via `pick_problem_set(config)`, kicks off `ready_check`.

### 5. Battle config + problem selection

- `battle_configs` seeded with defaults: `ranked_duo` (3 problems, easy/medium/hard, 30 min, 2 bans/2 picks), `casual_duo`, `quick_solo`.
- `pick_problem_set(config_id, banned_topics[])` uses `challenges` filtered by tag, avoiding banned topics, deterministic seed per match for reproducibility.
- Ban/pick recorded in `match_topic_actions`; once both sides locked, transitions to `active`.

### 6. Submission + judging architecture

Submission stays **server-authored**:
- `submit_battle_solution(match_id, problem_id, language, code, idempotency_key)` RPC inserts into `battle_match_submissions` with verdict=`pending`, returns submission id.
- Edge Function `judge-dispatcher` is invoked by the RPC (via `pg_net` or client follow-up call) — it:
  1. Validates match state = `active` and user is participant.
  2. Calls a pluggable judge provider (interface only — sandbox URL configured per env; stub returns deterministic verdict in dev so frontend stops simulating).
  3. Writes verdict back atomically via `apply_submission_verdict(submission_id, verdict, payload)`.
- `apply_submission_verdict` updates submission, increments participant score via scoring engine, emits `verdict_emitted` event, and if win condition met, transitions match to `judging` then `completed`.
- Frontend stops doing local "verdict simulation" — it polls/subscribes to the submission row.

### 7. Scoring engine (`scoring.sql`)

Pure functions:
- `score_problem(base_points, solve_time_sec, time_limit_sec, wrong_subs)` → base × speed_multiplier − penalty.
- `score_match(match_id)` → aggregates per-participant; tiebreakers: problems_solved → total_score → earliest_last_solve. Returns winner_id or draw.

Called inside `complete_duo_battle` (rewritten) which now: locks match row, calls `score_match`, calls `re_apply_match`, writes to `battle_history`, transitions state, returns final breakdown.

### 8. Realtime channels

Already-published: `battle_match_submissions`. Add to `supabase_realtime`:
- `battle_matches` (state transitions)
- `battle_event_log` (live event ticker, ban/pick, ready check)
- `battle_participants` (score updates)

Frontend `BattleSession.tsx` switches from polling to channel subscriptions for state + scores; submission verdict updates via existing channel.

### 9. Anti-cheat foundation

- Client RPC `log_anticheat_event(match_id, kind, evidence)` — append-only into `anticheat_flags` (status=`pending_review`).
- Server-side detectors as triggers/functions:
  - `ac_dup_submission_detector` on submission insert (same code hash within window).
  - `ac_solve_time_anomaly` — solve faster than humanly possible for difficulty.
- No automatic bans. Admin RPC `review_anticheat_flag(id, decision)` with `is_admin()` gate. `invalidate_match(match_id, reason)` available to admins.

### 10. API / RPC surface (clean wrappers)

```text
mm_enqueue / mm_dequeue / mm_status
ready_check_respond(match_id, ready bool)
ban_topic(match_id, topic) / pick_topic(match_id, topic)
get_match_state(match_id)               -- returns state, phase, players, problems, scores
submit_battle_solution(...)             -- returns submission_id
get_submission(submission_id)
finalize_match(match_id)                -- idempotent; can be auto-called
get_match_result(match_id)
get_match_history(user_id, limit, cursor)
get_rank_snapshot(user_id, season_id)
get_leaderboard(season_id, tier, limit, cursor)
log_anticheat_event(...)
admin_invalidate_match / admin_review_flag / admin_force_state
```

Existing `join_battle_queue`, `complete_duo_battle`, `check_battle_queue_status`, `get_user_battle_stats` are kept as **thin shims** that internally call the new functions, so the existing frontend keeps working with **zero UI changes**.

### 11. Edge functions

```text
supabase/functions/judge-dispatcher/    -- submission judging entry
supabase/functions/matchmaking-tick/    -- cron-invoked, runs mm_tick()
supabase/functions/season-cron/         -- decay + snapshot capture
```

All use `verify_jwt = false` + in-code service-role validation (matchmaking-tick / season-cron use a shared secret header).

### 12. Frontend wiring (minimal, no UI changes)

- `useMatchmaking`: swap RPC names where needed; add region/format params, surface dodge cooldown.
- `BattleSession.tsx`: replace simulated `handleSubmit` verdict with `submit_battle_solution` + subscription to that submission row; replace polling of session with realtime channel on `battle_matches`.
- `useBattleData`: add `useRankSnapshot`, `useLeaderboard`, `useMatchHistory` hooks pointing at new RPCs.
- Component contracts (`OpponentSnapshot`, `ProblemDetail`, `PlayerPerf`, `CombatantData`) **unchanged** — they continue to receive prop-shaped data, just from real RPCs.

### 13. Scalability & integrity guarantees

- All mutations through `SECURITY DEFINER` RPCs with `auth.uid()` checks; no client UPDATEs on `battle_matches` / `battle_participants` / `rating_history` / `anticheat_flags`.
- `rating_history` and `battle_event_log` are append-only (RLS denies UPDATE/DELETE).
- Idempotency keys on submissions prevent dup writes.
- State machine prevents race conditions on transition.
- Every match has `season_id` for partitioning later.
- Indexes on `(user_id, season_id)`, `(match_id, created_at)`, `(season_id, mmr DESC)` for leaderboards.

## Implementation order

1. Migration: enums, new tables, indexes, RLS, realtime publications.
2. Rating engine SQL + tests (placement, K-factor, decay).
3. Matchmaking SQL + cron edge function.
4. State machine + battle_configs seed + ban/pick RPCs.
5. Submission pipeline + judge-dispatcher edge function (stub provider).
6. Scoring + rewritten `complete_duo_battle` shim.
7. Anti-cheat tables + detectors + admin RPCs.
8. Leaderboard + season RPCs + season-cron.
9. Frontend wiring: replace simulated submit, switch to realtime channels, add new hooks.
10. Memory updates for `mem://features/battle-mode-elo-rating-system`, `battle-mode-data-integrity-v2`, `battle-arena-ux-and-scoring`.

## Assumptions

- No external code-execution sandbox is wired yet — judge-dispatcher ships with a deterministic stub that returns AC/WA based on a server-side rule; swapping in Judge0/Piston later is a one-file change.
- Region selection is stored but not used for routing yet — hook only.
- "Practice Arena" mode reuses casual matchmaking with no rating writes.
- Existing `battle_history`, `battle_invites`, `clan_members`-based stats remain untouched; new system runs alongside and shims feed into them for back-compat.

## Next backend steps (post-MVP)

- Plug a real sandbox (Judge0 self-hosted or Piston) into judge-dispatcher.
- Add plagiarism + AI-pattern detector workers.
- Add championship-season hooks into `seasons` table.
- Materialized views for top-N leaderboards + cached snapshots for tier pages.

