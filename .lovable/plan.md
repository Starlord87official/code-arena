

# Step 4 — Matchmaking Engine Rewrite

## Goal
Replace naive single-shot matchmaker with a real engine: expanding MMR window, repeat-opponent guard, dodge penalty, and proper match creation that flows into the new `battle_matches` state machine.

## Backend changes

### 1. Migration: matchmaking core

Extend `battle_queue` (additive, non-breaking):
- `mmr int not null default 1000` — snapshot at enqueue
- `region text` — hook only
- `config_id uuid references battle_configs`
- `dodge_until timestamptz` — penalty cooldown
- `last_search_expansion_at timestamptz default now()`
- index on `(status, mmr)` and `(user_id)` unique-where-searching

New table `mm_recent_opponents`:
- `(user_id, opponent_id, last_match_at)` — used to skip rematches within N minutes.

### 2. SQL functions

- **`mm_enqueue(p_mode text, p_config_key text default 'casual_duo', p_target_user uuid default null) returns uuid`**  
  - Resolves config, reads MMR from `rank_states` (creates row if missing for current season), writes a single `battle_queue` row (idempotent — returns existing if already searching), respects `dodge_until`. Returns `queue_id`.

- **`mm_tick() returns int`** (cron-safe, `SECURITY DEFINER`)  
  - Pairs `searching` rows by `mode`, MMR proximity window that expands with wait time:  
    `window = least(50 + floor(extract(epoch from now()-created_at)/10)*30, 400)`  
  - Excludes pairs in `mm_recent_opponents` (last 30 min).  
  - On match: calls internal `mm_create_match(a,b,config_id)` — inserts `battle_matches` with `state='match_found'`, two `battle_participants`, `battle_match_problems` via `pick_problem_set(config_id, '{}'::text[])`, marks both queue rows `matched_at=now(), status='matched'`, logs `match_found` event, transitions to `ready_check`.  
  - Returns count of matches created. Direct-target invites (`p_target_user`) handled first.

- **`mm_dequeue(p_reason text default 'user_cancel') returns int`**  
  - Deletes the user's searching row; if reason='dodge', sets `dodge_until = now() + escalating cooldown` from a small `mm_dodge_state` table.

- **`mm_status() returns jsonb`**  
  - Replaces/feeds `check_battle_queue_status`: returns `{status, queue_id, match_id, opponent_id, wait_time, mode, dodge_remaining}`.  
  - **Critical**: when caller is in a non-terminal active match, returns `status='in_battle'` with `match_id` so the existing `useMatchmaking` polling promotes them to the battle session.

### 3. Shim rewrites (zero-frontend-change guarantee)

- `join_battle_queue(p_mode, p_target_user_id)` → calls `mm_enqueue` then runs `mm_tick()` once for instant pairing; returns `queue_id` (existing shim shape preserved).  
- `cancel_battle_queue()` → calls `mm_dequeue('user_cancel')`; returns deleted count.  
- `check_battle_queue_status()` → returns `mm_status()` reshaped to legacy keys (`session_id` aliased from `match_id`, `battle_id` aliased from `match_id::text`).

### 4. Edge function: `matchmaking-tick`

`supabase/functions/matchmaking-tick/index.ts`
- Validates shared secret header `x-mm-cron-secret`.
- Calls `mm_tick()` via service-role Supabase client.
- Returns `{matched: n}`.
- Designed for periodic cron invocation; also safe to invoke ad-hoc from client right after enqueue (without secret it skips and returns 401, so client never calls it directly — `join_battle_queue` already runs one tick inline).

### 5. Recent-opponent + dodge bookkeeping

- On match creation, insert two rows into `mm_recent_opponents`.
- On `ready_check_respond(false)` (Step 3): call `mm_dequeue('dodge')` for the decliner so cooldown is applied.

## Frontend wiring

`src/hooks/useMatchmaking.ts` — minimal updates only:

- `checkQueueStatus`: when result returns `status='in_battle'` with `match_id` (no legacy `session_id`), map it: `sessionId = result.match_id ?? result.session_id`, `battleId = result.match_id ?? result.battle_id`. The existing `getLiveSession` query path is replaced by a small `getLiveMatch(matchId)` helper that reads from `battle_matches` (state ∈ `match_found|ready_check|ban_pick|active`) instead of `battle_sessions`. Falls back to legacy table for in-flight rows.
- Surface `dodge_remaining` from `mm_status` as a toast when `findOpponent` is blocked.
- No UI/component changes; `BattleSession.tsx` continues to receive `sessionId` (now a `match_id`).

## Files touched

- `supabase/migrations/<new>.sql` — schema additions, `mm_*` functions, shim rewrites.
- `supabase/functions/matchmaking-tick/index.ts` — new cron entry.
- `src/hooks/useMatchmaking.ts` — `checkQueueStatus` + `getLiveSession` adapted; dodge toast.

## Verification

After deploy:
1. `supabase--read_query` → confirm `mm_enqueue` creates one row, second call is idempotent.
2. Two test users → `join_battle_queue` from each → `mm_tick` pairs them → `battle_matches` row appears in `match_found`/`ready_check`.
3. Frontend: clicking FIND OPPONENT moves through SCANNING → match found without UI changes.

## Out of scope (deferred)

- Region-based routing (column captured, unused).
- Repeat-opponent window tuning UI.
- Real cron scheduling (manual + inline tick covers MVP).

