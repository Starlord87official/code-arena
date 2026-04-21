

# Step 5 — Rating Engine + Match Completion

## Goal
Server-authoritative match completion: when an active match ends (all problems solved, time expired, forfeit, or both inactive), compute final scores, apply ELO/MMR deltas, persist to `battle_history`, award XP, log events, and transition state to `completed`. No client involvement in scoring.

## Backend changes

### 1. Migration: rating + completion

**New table `rank_states`** (per-user, per-season MMR ledger; created if not present):
- `user_id uuid`, `season_id uuid null`, `mmr int default 1000`, `peak_mmr int default 1000`, `wins int`, `losses int`, `draws int`, `games_played int`, `placement_remaining int default 5`, `updated_at timestamptz`
- PK `(user_id, coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid))`
- RLS: read own row + admins; no direct writes.

**Helper functions:**
- `compute_elo_delta(rating_a, rating_b, score_a, k_factor)` → standard ELO formula. `k = 40` during placement (`placement_remaining > 0`), `k = 24` casual, `k = 32` ranked.
- `score_match(match_id)` → recomputes per-participant `score`, `problems_solved`, `total_solve_time_sec`, `wrong_submissions` from `battle_match_submissions` using config tiebreak rules. Internal only.

### 2. Core RPCs

- **`finalize_match(p_match_id uuid, p_reason text)`** — `SECURITY DEFINER`, internal-callable.
  - Guards: match must be `active` or `judging`; idempotent (no-op if already `completed`).
  - Steps:
    1. `battle_transition(match_id, 'judging', reason)`.
    2. Run `score_match(match_id)`.
    3. Determine winner via tiebreak ladder from `battle_configs.tiebreak_rules` (`solved` → `score` → `earliest_last_solve`). Set `is_draw=true` if all keys tied.
    4. If `is_rated`: read both participants' current `mmr` from `rank_states`, compute deltas via `compute_elo_delta`, write `elo_before/elo_after/elo_change` on `battle_participants`, upsert new mmr + win/loss/draw counters into `rank_states`, decrement `placement_remaining`.
    5. Award XP per participant: `base + (problems_solved * 25) + (winner ? 100 : 0)` capped at config max.
    6. Insert one row into `battle_history` (legacy compatibility) + one `match_completed` event into `battle_event_log` with full payload.
    7. `battle_transition(match_id, 'completed', reason)`, set `winner_id`, `is_draw`, `ended_at = now()`.
  - Returns `jsonb { success, winner_id, is_draw, deltas: [{user_id, mmr_before, mmr_after, xp}] }`.

- **`forfeit_match(p_match_id uuid)`** — caller-facing.
  - Verifies caller is participant; marks them `is_forfeit=true`, sets opponent as winner, calls `finalize_match(p_match_id, 'forfeit')`.

- **`tick_active_matches()`** — `SECURITY DEFINER`, cron-callable.
  - For each `active` match where `phase_started_at + duration_minutes < now()`, calls `finalize_match(id, 'time_expired')`.
  - For each `active` match where all problems have an `accepted` submission from one participant AND the config's first-to-finish rule holds, calls `finalize_match(id, 'all_solved')`.
  - Returns `int` (count finalized).

### 3. Auto-completion hook

Update `apply_submission_verdict` (from Step 2):
- After awarding score on `accepted`, if every problem in the match has at least one accepted submission from the caller, call `finalize_match(match_id, 'all_solved')` inline. This makes solo-finish instant without waiting for cron.

### 4. Shim rewrite

`complete_duo_battle(p_session_id)` (legacy):
- If `p_session_id` matches a row in `battle_matches`, route to `finalize_match(p_session_id, 'manual_complete')` and return legacy `{success, winner_id, ...}` shape.
- Else fall through to existing legacy path on `battle_sessions`.

### 5. Edge function: `match-ticker`

`supabase/functions/match-ticker/index.ts`
- Validates shared secret header `x-mm-cron-secret`.
- Calls `tick_active_matches()` and `mm_tick()` in sequence (single cron entry can drive both).
- Returns `{matches_finalized, matches_created}`.

## Frontend wiring (minimal)

`src/pages/BattleSession.tsx`:
- The auto-redirect on `session?.status === 'completed'` already exists — no change needed.
- `handleForfeit` switches from `complete_duo_battle` to `forfeit_match(p_match_id)` (kept as a fallback chain: try new RPC, fall back to legacy on error).
- Polling interval already pulls `battle_matches` via the `getLiveMatch` adapter from Step 4 — completion will surface automatically.

`src/hooks/useBattleData.ts` (post-battle data):
- No code change required; `battle_history` continues to be the source for results pages.

## Files touched

- `supabase/migrations/<new>.sql` — `rank_states`, ELO helpers, `finalize_match`, `forfeit_match`, `tick_active_matches`, `apply_submission_verdict` patch, `complete_duo_battle` shim.
- `supabase/functions/match-ticker/index.ts` — cron entry.
- `src/pages/BattleSession.tsx` — `handleForfeit` swap.

## Verification

1. Two test users matched via Step 4 → both submit accepted on all problems → match auto-finalizes → `battle_matches.state='completed'`, winner set, `battle_history` row appears, `rank_states` updated.
2. `tick_active_matches()` manually invoked on a stalled match → finalizes with `time_expired`.
3. Forfeit from one participant → opponent wins, `is_forfeit=true` on forfeiter, ELO penalty applied.

## Out of scope (deferred)

- Season rollover automation.
- Anti-cheat-driven match invalidation (hook present via `invalidated_reason`, no worker yet).
- Per-tier reward chests / cosmetic unlocks.

