

# Plan: Fix Battle Match Redirect — Both Players Land in Session

## The Bug

When two players match, only **one** gets routed to `/battle/session/:id`. The other stays on `/battle`.

## Root Cause

In `useMatchmaking.ts`, the `activeSession` query is **gated** by:
```ts
enabled: !!user && (matchmakingState.status === 'matched' || matchmakingState.status === 'in_battle')
```

And `Battle.tsx` waits for **both** conditions before navigating:
```ts
if (isMatched && matchmakingState.sessionId && activeSession?.status === 'active') navigate(...)
```

**Player A** (joins queue first): polls every 2s via `check_battle_queue_status` → state flips to `matched` → `activeSession` query enables → fetches session → redirects ✅

**Player B** (joins second, gets matched immediately by `join_battle_queue` RPC): the `joinQueue.onSuccess` sets `status: 'matched'` with `sessionId`. But then `checkInitialState` (mount effect) and other timing can reset state, OR `activeSession` query races and returns stale/empty before the session row is committed-visible to this client → redirect condition never satisfied → user stuck on `/battle`.

Also: requiring `activeSession?.status === 'active'` is **redundant** — the RPC already returns `session_id` only after inserting a row with `status='active'`. The extra round-trip introduces the race.

## The Fix

### File: `src/pages/Battle.tsx` (lines 72–77)

Remove the `activeSession?.status === 'active'` gate. Trust the RPC response — if we have a `sessionId` from a `matched` or `in_battle` state, navigate immediately.

```ts
useEffect(() => {
  if ((isMatched || matchmakingState.status === 'in_battle') && matchmakingState.sessionId) {
    navigate(`/battle/session/${matchmakingState.sessionId}`, { replace: true });
  }
}, [isMatched, matchmakingState.status, matchmakingState.sessionId, navigate]);
```

### File: `src/hooks/useMatchmaking.ts`

**Change 1 — `joinQueue.onSuccess` (lines 179–186):** when the RPC returns `matched: true`, the session is already created in DB. Set state to `matched` (already done) — no change needed here, this is correct.

**Change 2 — `checkInitialState` mount effect (lines 132–151):** currently overwrites state from RPC even right after a successful match. Add a guard to skip if we already have a `sessionId` in state, preventing the just-set match from being clobbered:

```ts
useEffect(() => {
  const checkInitialState = async () => {
    if (!user) return;
    // Skip if we already have a fresh match in local state
    if (matchmakingState.sessionId) return;
    const result = await checkQueueStatus();
    if (result?.success && result.status !== 'idle') {
      setMatchmakingState({
        status: result.status,
        queueId: result.queue_id,
        sessionId: result.session_id,
        battleId: result.battle_id,
        opponentId: result.opponent_id,
        waitTime: result.wait_time,
        mode: result.mode,
      });
    }
  };
  checkInitialState();
}, [user]); // remove checkQueueStatus from deps to avoid re-running
```

**Change 3 — Polling effect (lines 90–104):** when poll detects `matched` or `in_battle`, it currently sets state correctly. Confirmed fine — no change.

**Change 4 — Remove now-unused `activeSession` query gating dependency from `Battle.tsx`:** since we no longer read `activeSession.status` for redirect, can leave the query (still useful for `BattleSession.tsx`) but don't destructure it in Battle.tsx.

## Why This Works

- **Player A** (waiting in queue): poll detects match → `setMatchmakingState({status:'matched', sessionId})` → effect fires → navigates ✅
- **Player B** (joins and matches instantly): `joinQueue.onSuccess` sets `{status:'matched', sessionId}` → effect fires → navigates ✅
- Mount-effect race eliminated by sessionId guard
- DB session row is guaranteed to exist (RPC inserts before returning) — no need to re-verify via separate query
- `replace: true` prevents back-button bounce to `/battle`

## Files Touched

- `src/pages/Battle.tsx` — simplify redirect effect (5 lines)
- `src/hooks/useMatchmaking.ts` — guard mount effect against clobbering fresh match (3 lines)

## Acceptance

- Two clients joining quick match → both auto-navigate to the same `/battle/session/:id`
- No regressions to cancel/timeout/in-battle reconnect flows
- Existing `BattleSession.tsx` lifecycle (memory: `battle-result-routing-split`, `battle-state-lifecycle-cleanup`) untouched

