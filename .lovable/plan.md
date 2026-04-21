

# Fix: Stuck `/battle/session/...` page (zombie session, no participants)

## What's actually wrong

1. **Zombie session**: `battle_sessions` row `fb55f841-...` is `status='active'` but has no matching `battle_matches`/`battle_participants` rows. Started 2026-04-21 14:11 UTC (~4 hours ago) and is way past its 30-min window.
2. **Page never gives up**: `BattleSession.tsx` only shows "Battle Not Found" when the `battle_sessions` row is missing. It does **not** check whether a `battle_matches` row exists, whether the user is a participant, or whether the session has expired — so it renders the workspace UI against a dead match while heartbeat/submit RPCs keep returning `not_participant`.
3. **Heartbeat is silent on failure**: `useBattleHeartbeat` swallows all errors. When `heartbeat_match` returns `{ success: false, error: 'not_participant' }`, the page should auto-eject — instead it just keeps polling forever.

## Fixes

### A. Defensive guard in `BattleSession.tsx`

After the session loads, add a one-shot validation query that calls a new RPC `validate_battle_session(p_session_id)`. The RPC returns:
```
{ valid: boolean, reason: 'ok' | 'no_match' | 'not_participant' | 'expired' | 'completed' }
```
- If `valid === false`: show the existing "Battle Not Found" panel with a tailored message ("This battle has expired", "You're not a participant", etc.) and a `RETURN TO LOBBY` button. Do NOT mount the workspace, heartbeat, or integrity hooks.
- If `valid === true`: proceed as today.

### B. Auto-eject on heartbeat rejection

`useBattleHeartbeat` currently catches errors silently. Change it so when the RPC response is `{ success: false }` (any reason), it fires a single toast (`Battle session no longer valid`) and calls an `onInvalid` callback passed by the page, which navigates to `/battle`.

### C. Server-side cleanup of the zombie session

Run a one-off migration that closes any `battle_sessions` rows where `status='active'` AND `start_time < now() - (duration_minutes + 5) * interval '1 minute'` AND no participants exist — set `status='cancelled'`, `end_time=now()`. This unsticks the current user immediately and prevents the same class of orphan sessions from haunting the UI.

### D. Stop new orphans at the source

Search for any code path that still inserts into `battle_sessions` without inserting matching `battle_matches` + `battle_participants` (legacy `useMatchmaking` join flow is the suspect). For each, either:
- Stop using `battle_sessions` (V2 is `battle_matches`-only), or
- Wrap inserts in a transaction that always creates both, or
- Add a deferred FK / trigger that prevents an `active` `battle_sessions` row without participants.

I'll inspect `useMatchmaking.ts` and the `mm_*` RPCs to identify the exact path and pick the minimal fix.

## Files touched

- **New migration**: `validate_battle_session` RPC + one-off cleanup of expired/orphan `battle_sessions`.
- **Updated**: `src/pages/BattleSession.tsx` (validation gate before rendering workspace), `src/hooks/useBattleHeartbeat.ts` (surface invalid response, accept `onInvalid` callback).
- **Possibly updated**: `src/hooks/useMatchmaking.ts` or a `mm_*` migration if the legacy orphan path is still live.

## Verification

1. Reload `/battle/session/fb55f841-...` → page shows "Battle session expired — return to lobby" instead of the zombie workspace.
2. Manually mark a `battle_sessions` row `active` with no participants → reload → same eject screen, no `not_participant` toasts in network logs.
3. Quick-queue a fresh match end-to-end → still works (validation passes, heartbeats succeed).
4. After fix deploys, no `battle_sessions` row stays in `active` past `start_time + duration + 5 min` without participants.

