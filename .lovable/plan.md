

# Step 10 — Phase B: Promotion Series + Demotion Shield

Build the tournament-grade promotion/demotion logic on top of the Phase A rating engine. After Phase A, LP is correctly derived from ELO with streak modifiers, but hitting 100 LP currently just clamps — there's no promo series, and the `demotion_shield` granted in Phase A isn't actually consulted on tier loss.

## What Phase B builds

### 1. New table: `promotion_attempts`
Per-game record inside an open `promotion_series`:
- `series_id` (fk → promotion_series)
- `match_id` (fk → battle_matches)
- `won` (bool)
- `created_at`
- Unique on `(series_id, match_id)`
- RLS: user reads own rows; admins read all

### 2. New SECURITY DEFINER RPCs

- **`re_start_promotion_series(p_user_id, p_kind)`** — opens a Bo3 (`division`) or Bo5 (`tier`) series. Idempotent — returns existing open series if one exists. Sets `target_division` / `target_tier` based on current rank.

- **`re_record_promotion_result(p_user_id, p_match_id, p_won)`** — appends to `promotion_attempts`, updates `wins`/`losses` on the series. Closes with:
  - **Success**: bump tier/division, retain 50–75 LP (50 for division, 75 for tier), reset `demotion_shield = 5`, mark series `passed`.
  - **Failure**: clamp LP to 75 (one game away), mark series `failed`.

- **`get_active_promotion_series(p_user_id)`** — returns the open series (if any) for the entry/lobby UI.

### 3. Rewire `re_apply_match` (Phase A)

Patch the LP application step at the bottom of `re_apply_match`:

1. **On match completion**: if user has an `in_progress` series, call `re_record_promotion_result(user, match, won)` instead of normal LP write. The series RPC handles tier movement.
2. **On reaching 100 LP** (no active series): auto-call `re_start_promotion_series`. Determine kind: `tier` if at division I, else `division`.
3. **Demotion guard**: when computed `new_lp < 0`:
   - If `demotion_shield > 0`: clamp LP to 0, decrement shield by 1, no tier change.
   - Else: drop to next division/tier with LP = 25 (cushion), reset `demotion_shield = 5` on new tier entry.
4. **Iron IV floor**: clamp LP at 0 when `tier=iron AND division=IV`, no further demotion.
5. **Shield decay on play**: every ranked match decrements shield by 1 (min 0), so it expires over 5 games regardless of result.

### 4. Frontend surfaces

- **`src/hooks/usePromotionSeries.ts`** — wraps `get_active_promotion_series`, subscribes to `promotion_series` realtime channel, returns `{ series, isLoading }`.

- **`src/components/battle-v2/PromoSeriesTracker.tsx`** — compact widget showing W/L pips (●○○ for Bo3, ●●○○○ for Bo5), kind label ("PROMO TO PLATINUM IV"), and result needed ("WIN 2 MORE TO PROMOTE"). Reused in StatsPanel + LobbyHeader.

- **`StatsPanel.tsx`** (entry) — when active series exists, replace LP bar with `PromoSeriesTracker`.

- **`LpSummary.tsx`** (post-battle) — when the just-finished match was part of a series:
  - Show series result chip (`PROMO GAME 2/3 — WIN`)
  - On series close, render tier-up/down cinematic (large badge swap with glow + "PROMOTED TO PLATINUM IV" caption)

- **Penalty/promotion toasts** — fire from post-battle page on series start, win, loss, fail, and demotion.

## Files touched

- **New migration**: `promotion_attempts` table + 3 RPCs + rewrite of `re_apply_match` LP/tier section.
- **New hook**: `src/hooks/usePromotionSeries.ts`.
- **New component**: `src/components/battle-v2/PromoSeriesTracker.tsx`.
- **Updated**: `src/components/battle-v2/entry/StatsPanel.tsx`, `src/components/battle-v2/post-battle/LpSummary.tsx`, `src/components/battle-v2/pre-battle/LobbyHeader.tsx`.

## Verification

1. User reaches 100 LP → next match auto-opens series; `PromoSeriesTracker` appears in entry StatsPanel.
2. Win 2/3 (division) → tier badge updates in realtime, LP lands at 50, success toast fires, cinematic shows on post-battle.
3. Lose 2/3 → series closes failed, LP clamps to 75, no tier change.
4. User at 0 LP loses again with `demotion_shield > 0` → no demotion, shield decrements (visible in entry StatsPanel chip from Phase A).
5. Iron IV user at 0 LP loses → LP stays at 0, no further demotion.

## Out of scope (Phase C+)

- Topic ban/pick UI (Phase E).
- Matchmaking widening + dodge penalty (Phase C).
- Decay + season jobs (Phase D).

