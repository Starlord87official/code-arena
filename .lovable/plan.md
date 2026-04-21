

# Step 10 — Phase C: Matchmaking Widening + Anti-Snipe (with hotfix)

## 0. Hotfix first: `battle_participants` RLS recursion

Live preview is throwing `42P17 infinite recursion detected in policy for relation "battle_participants"` on every match read (visible in network logs at `/battle/session/...`). A recent policy on `battle_participants` references itself (or references `battle_matches` whose policy references `battle_participants` back). Fix before adding any new policies in this phase.

**Action:** rewrite the offending policies to use a `SECURITY DEFINER` helper (`is_match_participant(match_id, user_id)`) that bypasses RLS, and reference that helper from policies on `battle_matches`, `battle_participants`, and `battle_match_problems`. Standard pattern.

## 1. Matchmaking widening

Patch `mm_enqueue` + `matchmaking-tick`:

- Add `search_window_elo INT` and `enqueued_at TIMESTAMPTZ` columns to `battle_queue`.
- Initial window from blueprint by tier band:
  - Iron–Silver: 50 → 100 → 150 → 250 → 400
  - Gold–Plat:   75 → 125 → 200 → 300 → 500
  - Diamond+:    100 → 150 → 250 → 400 → 600
- `matchmaking-tick` widens the window every 10s; pair the first opponent within `|ΔMMR| ≤ window`.
- After 60s with no match, fall back to "loose" pairing (window × 2).

## 2. Repeat-opponent prevention

In `mm_create_match` (the pairing function), before locking a pair:
- Query `battle_participants` joined to `battle_matches` for any match between the two users with `ended_at > now() - interval '30 minutes'`.
- If found, skip this pair and keep both players in queue (matchmaking-tick will retry next pass).

## 3. Dodge penalty

When a user declines / lets the ready-check timer expire on an accepted match:

- New RPC `re_apply_dodge_penalty(p_user_id)`:
  - Reads recent dodges from `queue_lockouts` (kind=`dodge`) in last 24h.
  - Escalation: 1st = -3 LP + 5 min lockout; 2nd = -10 LP + 15 min; 3rd+ = -15 LP + 30 min + temporary MMR ghosting flag.
  - Inserts a `queue_lockouts` row with `expires_at` and increments a `dodge_count_24h` counter on `rank_states`.
- Hook into the existing match-cancel path (where ready-check fails): if cancellation came from one specific user, call the RPC for that user only.
- `mm_enqueue` already honors `queue_lockouts` (Phase A). Surface the penalty via toast on the entry screen ("Dodge penalty: -3 LP, queue locked 5m").

## 4. Queue ghosting for high-elo players

In `get_online_warriors` (entry-screen RPC):
- If caller's `mmr >= 2400` (Master+), randomize/mask handles of other high-MMR players (e.g., `Challenger #4821`) and omit avatar to prevent queue sniping.
- Lower-MMR callers see real handles as today.

## 5. Frontend surfaces

- **`src/hooks/useMatchmaking.ts`** — already shows a generic "dodge_cooldown_active" toast (line ~262). Extend to read `lockout_until` from the join error and display countdown (`Try again in 4m 12s`).
- **`src/components/battle-v2/entry/QueueButton.tsx`** — when `queue_lockouts` row is active, show disabled state with countdown chip ("Locked 4:12").
- **`src/components/battle-v2/entry/StatsPanel.tsx`** — small "Wait time widening: ±150 LP" hint when `enqueued_at > 30s ago`, derived from the queue row.
- **Penalty toasts**: tilt cooldown (Phase A), dodge penalty (this phase), repeat-opponent skip (silent — just feels like longer wait).

## Files touched

- **New migration**:
  - Hotfix `battle_participants` RLS via `is_match_participant()` helper.
  - Add `search_window_elo`, `enqueued_at` to `battle_queue`.
  - Add `dodge_count_24h` to `rank_states`.
  - Rewrite `mm_enqueue`, `mm_create_match`, `matchmaking-tick` body.
  - New RPC `re_apply_dodge_penalty`.
  - Patch `get_online_warriors` for ghosting.
- **Updated edge function**: `supabase/functions/matchmaking-tick/index.ts` (call widening, repeat guard).
- **Updated**: `src/hooks/useMatchmaking.ts`, `src/components/battle-v2/entry/QueueButton.tsx`, `src/components/battle-v2/entry/StatsPanel.tsx`.

## Verification

1. Open `/battle/session/...` — match reads now return 200 (recursion gone).
2. Two test accounts at very different MMR enter quick queue → no instant pairing; after ~30s window widens and they match.
3. Same two accounts immediately re-queue after a match → matchmaking-tick skips them; they only pair after 30 min OR with a third player.
4. Accept a match, then let ready-check expire → dodge toast (-3 LP, 5 min lockout); QueueButton shows countdown.
5. Master-tier account sees ghosted handles in Online Warriors list.

## Out of scope (Phase D+)

- Rank decay cron + season reset (Phase D).
- `useRankState` hook + `RankBadge` component + leaderboard wiring (Phase E).
- Topic ban/pick UI (Phase E).

