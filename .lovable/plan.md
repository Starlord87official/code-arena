

# Step 10 — Phase D: Decay + Season Jobs

With Phases A–C live (rating engine, promo series, matchmaking guards), the ladder still has no anti-camping pressure and no season lifecycle. Phase D adds the cron-driven decay system and the admin-triggered season reset.

## 1. Schema additions

- **`rank_states.decay_bank_days`** `INT NOT NULL DEFAULT 0` — protected days that absorb decay before LP is touched.
- **`rank_states.last_decay_at`** `TIMESTAMPTZ` — last time decay ran for this user (so we don't double-charge).
- **New table `season_history`**:
  - `id uuid pk`
  - `season_id uuid → seasons`
  - `user_id uuid → auth.users`
  - `final_tier rank_tier`, `final_division rank_division`, `final_lp int`, `final_mmr int`
  - `peak_tier`, `peak_division`, `peak_lp`, `peak_mmr`
  - `total_matches`, `wins`, `losses`
  - `archived_at timestamptz default now()`
  - Unique on `(season_id, user_id)`. RLS: user reads own; admin reads all.
- **`rank_states.peak_*`** columns (peak_tier/peak_division/peak_lp/peak_mmr) updated by `re_apply_match` whenever current exceeds peak.

## 2. Decay logic — `re_apply_decay()`

SECURITY DEFINER function, returns `int` (rows affected). For each `rank_states` row in the current season where `tier >= platinum`:

1. Compute grace period by tier: Plat 21d, Diamond 14d, Master 10d, GM/Challenger 7d.
2. If `last_match_at > now() - grace`: skip.
3. Compute `days_inactive = floor(extract(epoch from now() - last_match_at) / 86400) - grace_days`.
4. If `decay_bank_days > 0`: consume `min(bank, days_inactive)`, decrement bank, update `last_decay_at`, skip LP loss.
5. Else, apply weekly LP loss prorated per `last_decay_at` cycle: Plat -25/wk, Diamond -35/wk, Master -50/wk, GM -75/wk.
6. If `lp < 0`: cascade demotion using existing tier/division step-down logic (no shield — decay bypasses shield by design, per blueprint).
7. Update `last_decay_at = now()`.

In `re_apply_match` (Phase A), grant `+1 decay_bank_days` per ranked match played, capped at: Plat 14, Diamond 10, Master 7, GM 5.

## 3. Cron edge function — `rank-decay-tick`

- New function at `supabase/functions/rank-decay-tick/index.ts`.
- Header-secured via `MM_CRON_SECRET` (reuse existing secret pattern from `match-ticker`).
- Calls `re_apply_decay()` once, returns `{ users_decayed }`.
- `supabase/config.toml`: add `[functions.rank-decay-tick]` with `verify_jwt = false`.
- **Cron registration** runs as a separate `INSERT` (not migration) using `pg_cron`+`pg_net`, every 6 hours: `0 */6 * * *`.

## 4. Season reset — `rank-season-reset`

- New function at `supabase/functions/rank-season-reset/index.ts`.
- Admin-only: requires authenticated user with `has_role(auth.uid(), 'admin')`.
- Body: `{ new_season_name, new_season_starts_at, new_season_ends_at }`.
- Calls SECURITY DEFINER RPC `re_close_and_open_season(...)`:
  1. For each row in current `rank_states`: insert into `season_history` (final + peak snapshot).
  2. Mark current `seasons` row `is_active = false`, set `ended_at = now()`.
  3. Insert new `seasons` row, mark active.
  4. For each user: soft reset `mmr = (mmr + 1200) / 2`, `mmr_deviation = 100`, `lp = 0`, `tier`/`division` recomputed from new MMR via existing `re_tier_from_lp` analogue, `placements_remaining = 5`, `demotion_shield = 5`, `decay_bank_days = 0`, `last_decay_at = null`, peak fields cleared, streaks reset.
  5. Returns `{ users_archived, new_season_id }`.

## 5. Frontend surfaces

- **`src/hooks/useDecayWarning.ts`** — reads `rank_states.last_match_at` + tier; if user is Plat+ and within 3 days of grace expiry, returns `{ daysUntilDecay, weeklyLoss }`.
- **`StatsPanel.tsx`** — when warning active, show amber chip: `DECAY IN 2D · -35 LP/WK` (above the LP bar).
- **Decay applied toast** — on entry-screen mount, if `last_decay_at > last visit timestamp` (stored in localStorage), fire toast: `Rank decay: -35 LP (Diamond grace expired)`.
- **`AdminSystem.tsx`** — add "Season Management" card with current season info + "Start New Season" button that opens a confirm dialog (name + start/end dates) and calls `rank-season-reset`.

## Files touched

- **New migration**: schema additions + `re_apply_decay()` + `re_close_and_open_season()` + decay-bank grant inside patched `re_apply_match`.
- **New edge functions**: `supabase/functions/rank-decay-tick/index.ts`, `supabase/functions/rank-season-reset/index.ts`.
- **Updated**: `supabase/config.toml` (function blocks).
- **Cron registration**: separate INSERT (pg_cron) — not a migration.
- **New hook**: `src/hooks/useDecayWarning.ts`.
- **Updated**: `src/components/battle-v2/entry/StatsPanel.tsx`, `src/pages/admin/AdminSystem.tsx`.

## Verification

1. Manually invoke `rank-decay-tick` with the cron secret → Diamond test account inactive >14d loses 35 LP; bank consumed first if any.
2. Active player who plays 5 ranked matches → `decay_bank_days` increments to 5 (visible via direct query).
3. Admin opens System page → sees current season; clicking "Start New Season" archives all users into `season_history` and soft-resets MMR.
4. Plat+ user 19 days inactive sees amber `DECAY IN 2D` chip on entry screen.
5. After decay run, returning user sees the `-25 LP` toast once.

## Out of scope (Phase E)

- `useRankState` hook + `RankBadge` component everywhere.
- Replace `DivisionProgress` mock in dashboard.
- Topic ban/pick UI in lobby.
- `/leaderboard/ranked` wired to `get_leaderboard` RPC.

