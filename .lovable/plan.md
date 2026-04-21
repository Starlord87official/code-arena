
Fix the battle return loop by separating “recover active match” behavior from the results page and preventing `/battle` from trusting stale cached active-session data.

## Root Cause

The loop happens because:

1. `BattleResults.tsx` calls `useMatchmaking()`.
2. `useMatchmaking()` always runs the `activeSession` query while the user is logged in.
3. React Query can immediately reuse cached `['active-battle-session', user.id]` data from the just-finished match.
4. After clicking “Return to Battle Lobby”, `Battle.tsx` redirects as soon as `activeSession?.id` exists:
   ```ts
   const sessionId =
     ((isMatched || matchmakingState.status === 'in_battle') && matchmakingState.sessionId) ||
     activeSession?.id;
   ```
5. Since the cached active session still exists briefly, `/battle` sends the user right back into the match flow, which resolves again to `/battle/results/:id`.

This is a cache/recovery timing bug, not a route-config problem.

## Changes to Make

### 1) Stop `BattleResults.tsx` from subscribing to matchmaking recovery
`BattleResults.tsx` only needs a local reset action; it should not mount the full `useMatchmaking()` hook.

Replace:
```ts
const { resetState } = useMatchmaking();
```

With a lightweight cleanup strategy inside the page:
- remove all battle-related React Query caches
- then navigate to `/battle`
- do not create a matchmaking subscription from the results screen

Implementation options:
- preferred: extract a tiny shared helper/hook like `useBattleStateCleanup()`
- simpler: inline the cleanup logic directly in `BattleResults.tsx`

### 2) Make `/battle` redirect only from confirmed live state
In `src/pages/Battle.tsx`, do not redirect from `activeSession?.id` alone.

Change redirect logic to require one of these:
- local matchmaking state says `matched` or `in_battle` with a `sessionId`
- or an active session has been freshly confirmed as truly active

Recommended rule:
```ts
if ((isMatched || matchmakingState.status === 'in_battle') && matchmakingState.sessionId) {
  navigate(`/battle/session/${matchmakingState.sessionId}`, { replace: true });
}
```

Do not use `activeSession?.id` as an unconditional fallback on the lobby page.

### 3) Keep active-session recovery, but make it safe
In `useMatchmaking.ts`, keep the self-healing recovery for real stuck players, but tighten it:

- only sync local state to `in_battle` when `activeSession.status === 'active'`
- expose `isFetchingActiveSession` / `activeSessionFetchedAt` if needed
- avoid treating old cached data as immediate truth during a route transition from results → lobby

A practical approach:
- keep the query
- but in `Battle.tsx`, only use it for UI/state sync after refetch confirmation, not for instant redirect
- alternatively, set `staleTime: 0` on `activeSession` so it refetches immediately and cached data is not trusted as fresh

### 4) Strengthen results-page cleanup
In `BattleResults.tsx`, update the return handler so it fully clears battle cache before navigation.

Current cleanup removes:
- `['battle-session', sessionId]`
- `['battle-result', sessionId]`
- `['battle-problems', sessionId]`
- `['active-battle-session']`

Tighten this to remove/invalidate the full family:
- `['active-battle-session']` with exact: false
- `['battle-session']` with exact: false
- `['battle-result']` with exact: false
- `['battle-problems']` with exact: false
- optionally `['recent-duo-battles']`

This ensures no stale session snapshot survives the transition.

### 5) Move navigation side effect out of render in `BattleSession.tsx`
`BattleSession.tsx` currently does:
```ts
if (session.status === 'completed') {
  navigate(`/battle/results/${sessionId}`, { replace: true });
  return <Loader2 ... />
}
```

Move this into a `useEffect`. It is not the main loop bug, but it reduces repeated side effects during render and makes route transitions more stable.

## Files to Update

- `src/pages/BattleResults.tsx`
- `src/pages/Battle.tsx`
- `src/hooks/useMatchmaking.ts`
- `src/pages/BattleSession.tsx`

## Expected Result

After the fix:
- clicking “Return to Battle Lobby” from `/battle/results/:id` lands on `/battle` and stays there
- no automatic bounce back to the completed results page
- active-session recovery still works for genuinely stuck players during live matches
- no regression to battle completion, reconnect, or results routing

## Acceptance Criteria

- Finish a duel and land on `/battle/results/:id`
- Click “Return to Battle Lobby”
- User stays on `/battle` without loop
- Refresh on `/battle` after returning does not reopen the finished match
- Two-player matchmaking recovery still redirects only for actually active sessions
