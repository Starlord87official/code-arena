
Fix the duo battle issue in two coordinated parts: reliable session entry for both players, and reliable opponent identity display once inside the arena.

1. Stabilize matchmaking handoff in `src/hooks/useMatchmaking.ts`
- Remove the fragile “validate session immediately or do nothing” behavior after `join_battle_queue` and queue polling.
- When the backend returns `matched` with a `session_id`, lock local state to that session immediately instead of dropping the update if the follow-up read races the database commit.
- Keep the existing stale-response protection, but refine it so older `idle/searching` results can never overwrite a newer `matched/in_battle` state.
- Add a short recovery path: if the direct session validation misses once, continue syncing from the active-session query instead of leaving the second player stranded on `/battle`.

2. Make recovery state strong enough to redirect the stuck player
- Keep `activeSession` as the self-healing source of truth for authenticated users.
- Ensure `Battle.tsx` redirects when local matchmaking state contains a session, and also after recovery has promoted the user into `in_battle`.
- Preserve the no-loop rule from previous fixes: never redirect from stale completed-session data.

3. Fix opponent name lookups in live and results pages
- In `src/pages/BattleSession.tsx` and `src/pages/BattleResults.tsx`, stop querying `profiles` directly for the opponent name.
- Use `public_profiles` instead, because profile RLS is owner-only and that is why the UI falls back to “Opponent” even when the session row correctly contains the other user.
- Keep the same fields (`username`, `avatar_url`, `division`, `xp` where needed), just read them from the public-safe surface already used elsewhere in the app.

4. Tighten live session UI fallbacks
- In `BattleSession.tsx`, keep a graceful fallback label, but prefer the recovered public opponent profile whenever available.
- Make sure the scoreboard, top bar, and result card all use the same resolved opponent identity source so one area does not show a username while another still shows “Opponent”.

5. Verify against the actual failing flow
- Test the exact two-user quick match flow:
  - both users click Find Opponent
  - both should land on the same `/battle/session/:id`
  - the delayed/stuck client should recover automatically if the first transition is missed
  - the opponent name should display as the real username, not “Opponent”
- Re-test the completed-battle return path to confirm this recovery improvement does not reintroduce the old `/battle` ↔ `/battle/results/:id` loop.

Files to update
- `src/hooks/useMatchmaking.ts`
- `src/pages/Battle.tsx`
- `src/pages/BattleSession.tsx`
- `src/pages/BattleResults.tsx`

Expected result
- When a duo battle starts, both players enter the session reliably.
- If one client misses the initial redirect, it self-recovers within the next sync cycle.
- Manually opening the session URL no longer shows a generic “Opponent” label when the other player exists.
- Previous battle-results loop protection remains intact.
