

## Fix: Opponent Name Shows as "Opponent" in Battle

### Root Cause

The `public_profiles` view is created with `security_invoker=on`, which means it enforces the RLS of the underlying `profiles` table. The only SELECT policy on `profiles` is `profiles_strict_owner_only` (`id = auth.uid()`) — so users can **only read their own profile row** through this view.

When Player A queries `public_profiles` for Player B's row, RLS silently returns no rows → the UI falls back to the literal string `"Opponent"`. The same happens for Player B looking up Player A. Any time it "works", it's because the row was hydrated from another cached source.

This affects both `BattleSession.tsx` and `BattleResults.tsx`.

### Fix

1. **Create a SECURITY DEFINER RPC** `get_battle_opponent_profile(p_session_id uuid)`
   - Verifies `auth.uid()` is one of `player_a_id` / `player_b_id` of the given `battle_sessions` row
   - Returns the opponent's safe public fields: `id, username, avatar_url, division, xp`
   - Returns `null` if the caller is not a participant (no info leak)
   - This is the same authorization pattern used by `complete_duo_battle`

2. **Update `src/pages/BattleSession.tsx`**
   - Replace the direct `public_profiles` query with `supabase.rpc('get_battle_opponent_profile', { p_session_id: sessionId })`
   - Keep the same query key shape but key by `sessionId` instead of `opponentId` to avoid the stale `undefined` first render
   - Keep "Opponent" only as a true loading fallback

3. **Update `src/pages/BattleResults.tsx`**
   - Same RPC swap so the post-match results screen shows the real opponent username, avatar, and division

4. **No regression to other flows**
   - Public profile pages keep using `get_public_profile(p_username)` (already SECURITY DEFINER, already works)
   - Leaderboard / friends / etc. use `get_public_profiles(...)` which is already SECURITY DEFINER and unaffected
   - Battle matchmaking, scoring, results loop fixes all stay intact

### Files Touched

- `supabase/migrations/<new>.sql` — add `get_battle_opponent_profile` RPC
- `src/pages/BattleSession.tsx` — swap opponent fetch to RPC
- `src/pages/BattleResults.tsx` — swap opponent fetch to RPC

### Acceptance

- Both players in `/battle/session/:id` see each other's real username, avatar, and division (not "Opponent")
- Both players on `/battle/results/:id` see the real opponent identity
- A non-participant calling the RPC with someone else's session ID gets `null`
- No change to redirect/loop behavior fixed in previous turns

