

# Step 6 — Real-Time Sync + Reconnect Policy

## Goal
Wire the duo battle frontend into Supabase Realtime so both participants see live state without polling, enforce the 60-second reconnect grace, and auto-forfeit disconnected players. Match completion already pushes through `battle_matches.state='completed'` (Step 5) — this step makes that change *instant* on the opponent's screen.

## Backend changes

### 1. Migration: realtime + presence

- Set `REPLICA IDENTITY FULL` on `battle_matches`, `battle_participants`, `battle_match_submissions`, `battle_event_log`.
- Add all four tables to `supabase_realtime` publication.
- Add columns on `battle_participants` (already has `disconnected_at`, `reconnected_at` — no schema change needed).

### 2. RPCs

- **`heartbeat_match(p_match_id uuid)`** — caller-only. Updates `battle_participants.reconnected_at = now()` and clears `disconnected_at` if set. Cheap; called every 15s by client.
- **`mark_participant_disconnected(p_match_id uuid, p_user_id uuid)`** — `SECURITY DEFINER`, internal. Sets `disconnected_at = now()` if null. Logs `participant_disconnected` event.
- **`reconnect_sweep()`** — `SECURITY DEFINER`, cron-callable.
  - For each `active`/`ready_check`/`ban_pick` match, find participants where `disconnected_at < now() - interval '60 seconds'` AND `reconnected_at < disconnected_at` (or null).
  - Marks them `is_forfeit = true` and calls `finalize_match(match_id, 'reconnect_timeout')`.
  - Returns count of forfeits processed.
- **`detect_stale_participants()`** — internal helper called by `reconnect_sweep`: any participant whose last heartbeat (`reconnected_at`) is older than 30s in an active match is auto-marked disconnected via `mark_participant_disconnected`.

### 3. Edge function update

`supabase/functions/match-ticker/index.ts` — extend the existing cron entry:
- Add `reconnect_sweep()` to the sequence after `tick_active_matches()`.
- Returns `{ matches_finalized, matches_created, forfeits_processed }`.

## Frontend changes

### 1. New hook: `src/hooks/useBattleRealtime.ts`
- Subscribes to three Postgres-changes channels scoped to `match_id`:
  - `battle_matches:id=eq.{matchId}` → state/winner/ended_at updates.
  - `battle_participants:match_id=eq.{matchId}` → score/solved/forfeit/disconnect.
  - `battle_match_submissions:match_id=eq.{matchId}` → new verdicts (for opponent ticker).
- Returns `{ match, participants, latestSubmission, isConnected }`.
- Cleans up on unmount; reconnects with exponential backoff on `CHANNEL_ERROR`.

### 2. New hook: `src/hooks/useBattleHeartbeat.ts`
- `setInterval(15s)` calling `supabase.rpc('heartbeat_match', { p_match_id })`.
- Pauses on `document.visibilitychange === 'hidden'` for >60s → triggers local "Disconnected" toast and stops heartbeat (server will sweep).
- Resumes immediately on visibility restore + sends heartbeat.

### 3. `src/pages/BattleSession.tsx` wiring
- Replace the existing 2-second polling interval inside the page with `useBattleRealtime(matchId)`.
- Mount `useBattleHeartbeat(matchId)` once participant is loaded.
- Listen for `match.state === 'completed'` from realtime → trigger existing post-battle navigation immediately (no waiting for next poll tick).
- Surface `participant.disconnected_at` for the opponent slot as a "RECONNECTING… (Xs)" badge with a 60s countdown driven by `Date.now() - disconnected_at`.

### 4. `src/components/battle-v2/workspace/OpponentTicker.tsx`
- Accept new props `opponentDisconnected: boolean`, `secondsRemaining: number`.
- Render an ember-toned "RECONNECTING" pill replacing live score when disconnected.
- No layout change to other components.

### 5. `src/hooks/useMatchmaking.ts`
- Drop the 2s polling once a `match_id` is known and a realtime subscription is active. Polling is still used pre-match (queue → match_found transition) since `battle_queue` is not on realtime by design.

## Files touched

- `supabase/migrations/<new>.sql` — publication + heartbeat/sweep RPCs.
- `supabase/functions/match-ticker/index.ts` — adds `reconnect_sweep()` call.
- `src/hooks/useBattleRealtime.ts` — new.
- `src/hooks/useBattleHeartbeat.ts` — new.
- `src/pages/BattleSession.tsx` — swap polling for realtime + heartbeat mount.
- `src/components/battle-v2/workspace/OpponentTicker.tsx` — disconnect badge.
- `src/hooks/useMatchmaking.ts` — stop polling post-match.

## Verification

1. Two browsers in same match → user A submits accepted → user B's score updates within ~200ms (no 2s poll lag).
2. User A closes tab → after 60s, user B's screen shows match completed with A as forfeiter.
3. User A closes tab and reopens within 50s → heartbeat resumes, no forfeit applied, `disconnected_at` cleared.
4. `reconnect_sweep()` manual call cleans up any stale matches from prior sessions.

## Out of scope (deferred)

- Spectator realtime channels (read-only viewers).
- Cross-region realtime fanout tuning.
- Toast UX for "Opponent reconnected" event (event is logged; UI in next pass).

