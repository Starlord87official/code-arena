
Fix the Duo Battle redirect by making matchmaking recovery-driven instead of trusting a single state transition.

1. Harden `useMatchmaking.ts` against stale async overwrites
- Add a small state machine rule: once a user has a `sessionId` or is in `matched` / `in_battle`, ignore later `idle` / `searching` results unless the user explicitly cancels or the battle is completed.
- Replace the current one-time `checkInitialState` logic with a guarded sync that checks state again after the async RPC returns, so an older request cannot overwrite a fresh match result.
- Use a ref for the latest matchmaking state so polling and mount-time checks compare against current state before calling `setMatchmakingState`.

2. Add self-healing active-session detection
- Change the `activeSession` query in `useMatchmaking.ts` to run whenever the user is logged in, not only when local matchmaking state already says `matched` / `in_battle`.
- If an active `battle_sessions` row exists for the current user, immediately sync local state to:
  - `status: 'in_battle'`
  - `sessionId: activeSession.id`
  - `battleId`, `opponentId`
- This lets a player recover even if they missed the original redirect moment and are stuck on `/battle`.

3. Prevent polling from downgrading a real match
- In the search polling effect, ignore `searching` / `idle` responses if local state already has a valid `sessionId`.
- Only stop polling with timeout behavior when the user is genuinely still in `searching` and has no active session.
- Keep the success path the same for `matched` / `in_battle`, but prefer syncing to `in_battle` once the session row is detected.

4. Make `Battle.tsx` redirect from recovered session state too
- Keep the existing immediate redirect from `matchmakingState.sessionId`.
- Also redirect when the unconditional `activeSession` query returns a live session, even if matchmaking state was stale.
- Use `replace: true` so the stuck player does not bounce back into `/battle`.

5. Keep battle cleanup intact
- Do not change `BattleSession.tsx` scoring/lifecycle.
- Keep `BattleResults.tsx` reset behavior, since it correctly clears matchmaking state when returning to the lobby.

Files to update
- `src/hooks/useMatchmaking.ts`
- `src/pages/Battle.tsx`

Expected result
- If Player A and Player B match, both land on `/battle/session/:id`.
- If one client misses the initial state update, the next active-session sync automatically recovers and redirects them.
- No regressions to cancel, timeout, reconnect, or results-page cleanup flows.
