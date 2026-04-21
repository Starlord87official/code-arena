

# Fix: Match created but page shows "Battle Unavailable"

## What actually happened to your two accounts

Both accounts paired successfully. A `battle_matches` row (`858e60ed...`) was created in state `match_found`, the queue cleared, and both clients navigated to `/battle/session/858e60ed...`. The page then shows **Battle Unavailable** because:

1. `BattleSession.tsx` calls an RPC `validate_battle_session` that **does not exist** in the database → validation returns `{ valid: false }` → eject screen.
2. The page also tries to load the session from the legacy `battle_sessions` table, but the new matchmaking pipeline (`mm_create_match`) only writes to `battle_matches` / `battle_participants`. There is no `battle_sessions` row, ever.
3. `heartbeat_match` is called against `match_id`, which is fine — but it never gets a chance because validation fails first.

So the matchmaking engine is healthy. The post-match page is reading from the wrong table and depending on a missing function.

## Fix (two parts)

### Part 1 — Database: bridge `battle_matches` to the legacy session shape

New migration:

- **Create `validate_battle_session(p_session_id uuid)`** RPC. Returns `{ valid: true }` when:
  - a `battle_matches` row exists with `state IN ('match_found','ready_check','ban_pick','active','judging')` AND the caller is in `battle_participants` for it; OR
  - a legacy `battle_sessions` row exists with `status='active'` and the caller is `player_a_id`/`player_b_id`.
  - Otherwise `{ valid:false, reason:'no_match' | 'not_participant' | 'expired' }`.
- **Update `mm_create_match`** to also INSERT a mirror row into `battle_sessions` (`id = match.id`, `battle_id = match.id`, `player_a_id`, `player_b_id`, `mode`, `status='active'`, `start_time = now()`, `duration_minutes = 30`, scores 0). This keeps `BattleSession.tsx`, `useMatchmaking.activeSession`, and `useBattleHeartbeat` (which already falls back to `battle_sessions`) all working without rewriting the workspace.
- **Backfill** the orphan match `858e60ed...` so the user can re-enter it for testing (insert the missing `battle_sessions` row from the existing `battle_matches` + `battle_participants` data).
- **Cancel** any leftover `searching` rows older than 10 minutes (defensive cleanup).

### Part 2 — Frontend: graceful fallback if validation RPC is ever missing again

- **`src/pages/BattleSession.tsx`**: when the validate RPC errors with "function does not exist" (PGRST202 / 404), fall back to checking participant membership directly via `battle_matches` + `battle_participants` instead of immediately ejecting. Prevents this exact "everyone gets kicked out" failure mode if a future migration drift removes the RPC.

## Files touched

- **New migration**: create `validate_battle_session` RPC; patch `mm_create_match` to mirror into `battle_sessions`; backfill the existing orphan match; cancel stale queue rows.
- **`src/pages/BattleSession.tsx`**: defensive fallback in the validation `queryFn` when the RPC is missing.

## Verification

1. Re-queue both accounts → both navigate to `/battle/session/<id>` and see the workspace (not the eject screen).
2. `select count(*) from battle_sessions where id = '858e60ed-7cba-4964-8136-8e8738ce25b9'` returns 1 after backfill, and reloading that URL on `tonystark` now shows the workspace.
3. `select * from validate_battle_session('<some_match_id>')` returns `{ valid: true }` for participants and `{ valid: false, reason: 'not_participant' }` for non-participants.
4. After a future match completes, both `battle_sessions.status` and `battle_matches.state` flip together; the post-battle results page still loads correctly.

