

# Fix: Battle page stuck at `?completed=858e60ed…`

## Root cause

Two real problems, only one of them was guessed in earlier rounds:

1. **`get_match_result` references a non-existent column.** Line 25 of the function does:
   ```sql
   COALESCE(p.username, p.email, 'warrior') AS handle
   ```
   The `profiles` table has no `email` column (it lives on `auth.users`). Every call to `get_match_result` throws `column p.email does not exist`. Postgres logs confirm this error is firing **continuously** (dozens of times per second from React Query retries). The post-battle page calls this RPC via `useBattleResult`, gets an error, never renders → page sits there.

2. **The orphan match `858e60ed…` was only half-finalized.** `battle_sessions.status = 'completed'` (legacy fallback ran) but `battle_matches.state = 'match_found'`, `status = 'pending'`, `winner_id = NULL`, `ended_at = NULL`. Even after fixing #1, `get_match_result` will return zeros and a blank scoreboard for this match.

## Fix

### Migration

**A. Patch `get_match_result(uuid)`** — replace `p.email` with the auth email lookup or just drop it:
```sql
COALESCE(p.username, 'warrior') AS handle
```
(Username is already required at signup; the `email` fallback was dead code.)

**B. Finalize the orphan match `858e60ed-7cba-4964-8136-8e8738ce25b9`.** Both participants have `score=0, problems_solved=0, is_forfeit=false`, so the rules pick a draw. Run inline:
```sql
UPDATE battle_matches
   SET state='completed', status='completed',
       is_draw=true, winner_id=NULL,
       ended_at = COALESCE(ended_at, now())
 WHERE id='858e60ed-7cba-4964-8136-8e8738ce25b9';
```
(No need to touch `battle_sessions` — it's already `completed`. No ELO/XP since `mode='quick'`, not rated, and both forfeited cleanly.)

**C. Defensive cleanup** for any other matches in the same half-finalized state (legacy session completed but battle_matches still pending):
```sql
UPDATE battle_matches bm
   SET state='completed', status='completed',
       is_draw=true,
       ended_at=COALESCE(bm.ended_at, bs.end_time, now())
  FROM battle_sessions bs
 WHERE bs.id = bm.id
   AND bs.status='completed'
   AND bm.state <> 'completed';
```

### Frontend

No changes needed. Once `get_match_result` stops throwing and the match is finalized, `useBattleResult` returns valid data and the `PostBattleView` renders.

## Files touched

- **New migration**: patch `get_match_result` (drop `p.email`); finalize orphan match `858e60ed…`; one-shot cleanup of any other half-finalized matches.

## Verification

1. Reload `/battle?completed=858e60ed-7cba-4964-8136-8e8738ce25b9` → post-battle screen renders with "DRAW", both players at 0–0, no spinner.
2. `SELECT public.get_match_result('858e60ed-7cba-4964-8136-8e8738ce25b9')` (with auth) → returns full JSON, no `column p.email does not exist` error in logs.
3. `SELECT count(*) FROM battle_matches bm JOIN battle_sessions bs USING (id) WHERE bs.status='completed' AND bm.state <> 'completed'` → `0`.
4. New match → forfeit → results page loads correctly with real scores.

