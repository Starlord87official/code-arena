

# Step 10 — Competitive Framework: Bring the Blueprint Online

The blueprint defines a tournament-grade ladder (9 tiers, LP, promos, decay, streaks, dynamic K, anti-cheat, seasons, leaderboards). Step 9 finished the duo battle plumbing. **Most of the deeper competitive systems are either missing or only stubbed.** This step closes the gap in five sub-phases — each one shippable on its own so we can verify before moving on.

## What's already built (skip)

- DB schema: `rank_states` (mmr / lp / tier / division / streaks / shield / decay), `seasons`, `promotion_series`, `rank_tier` + `rank_division` enums.
- Helpers: `current_season_id`, `ensure_rank_state`, `re_tier_from_lp`, `re_apply_match`, `re_decay_inactive`, `get_rank_snapshot`, `get_leaderboard`.
- Duo battle pipeline (queue → lobby → workspace → post-battle → judge worker → integrity scan).
- ELO base formula + finalize_match + season-aware rank state writes.

## What's missing (this step builds)

### Phase A — Rating engine v2 (server)
1. **Dynamic K-factor**: rewrite `re_apply_match` to pick K from `(games_played, mmr)` per blueprint table (48 / 32 / 24 / 16 / 12).
2. **Rating Deviation (RD)**: add `mmr_deviation` decay on play (toward 50) and growth on idle (+5/day, max 150). Effective K = K × clamp(RD/50, 0.5, 2.0).
3. **Performance bonus**: at finalize, compute speed bonus (% time remaining), first-attempt bonus, hard-problem bonus → cap at +25% of base ELO change.
4. **Streak modifiers**: read `win_streak`/`loss_streak`, apply LP bonuses (+2/+5/+8/+12) and loss-protection (-15/-25/-35%) per blueprint.
5. **Tilt cooldown**: insert a `queue_lockouts` row when 5 losses occur in 2 hours; matchmaking RPC honors it.
6. **LP smoothing**: derive LP delta from ELO delta with banked/deflated multipliers (hidden MMR vs displayed tier).

### Phase B — Promotion series + demotion shield
1. New table `promotion_attempts` (per-game record inside an open series).
2. RPC `start_promotion_series(user_id)` triggered when LP hits 100; Bo3 for division, Bo5 for tier.
3. RPC `record_promotion_result(match_id, won)` updates wins/losses, closes series with promote/fail (retain 50–75 LP).
4. Demotion shield: 5-game counter on tier entry; block tier demotion while > 0.
5. Iron IV floor: clamp LP at 0 when tier=iron AND division=IV.

### Phase C — Matchmaking widening + anti-snipe
1. Expand `mm_enqueue` to record start time and a `search_window_elo` field that widens by tier (50→100→150→250→400) on each `matchmaking-tick` pass.
2. **Repeat opponent prevention**: skip pairings where the same two users played within 30 minutes (query `battle_participants`).
3. **Dodge penalty**: if user declines an accepted match, apply -3 LP and a 5-min `queue_lockouts` row, escalating on repeats.
4. **Queue ghosting**: in `get_online_warriors`, mask handle when caller MMR ≥ Master tier.

### Phase D — Decay + season jobs
1. Cron edge function `rank-decay-tick` (every 6h) → calls `re_decay_inactive` with blueprint-correct grace periods (Plat 21d, Diamond 14d, Master 10d, GM 7d) and weekly LP loss (-25 / -35 / -50 / -75).
2. **Bank system**: `decay_bank_days` int on `rank_states`; +1 per ranked game played (capped per tier), consumed before LP loss starts.
3. New edge function `season-reset` (admin-triggered) → applies soft reset `(elo + 1200) / 2`, resets placements_remaining=5, demotion_shield=5, archives prior season into `season_history` (new table).
4. Add cron entry to `supabase/config.toml` for the decay tick.

### Phase E — Frontend surfaces
1. **`useRankState` hook** → wraps `get_rank_snapshot` with realtime subscription on `rank_states` changes.
2. **`RankBadge` component** → shows tier color + roman division + LP bar; reused everywhere `division` chips currently appear.
3. **Replace mock `DivisionProgress`** in dashboard with the real rank state. Remove dependence on `mockData.getDivisionColor`.
4. **Battle entry `StatsPanel`** → show real rank, LP toward next division, demotion shield count, streak indicator (🔥 / 🛡️), placement progress bar when `placements_remaining > 0`.
5. **Post-battle `LpSummary`** → swap the fake `Math.floor(elo/200)*200` math for the real LP delta and tier-up/down visualization. Add cinematic for promotion-series win and tier-up.
6. **`ReadyRoster` & lobby** → topic ban/pick phase UI (server-tracked picks via `battle_event_log` payload `topic_ban` / `topic_pick`, 30s timer, auto-skip). Backend filter applies bans when generating `battle_match_problems` (currently random — patch `mm_create_match`).
7. **Global Leaderboard page** (`/leaderboard/ranked`) wired to `get_leaderboard`: tabs for Global / Friends / Tier / Regional; rank distribution chart; daily movers list. Reuse existing `Leaderboard` page shell.
8. **Penalty toasts** for tilt cooldown, dodge penalty, decay warnings.

## Files touched (high-level)

- **New migrations** (one per phase): rating engine v2, promotion series, matchmaking guards, decay/season, supporting indexes.
- **New edge functions**: `rank-decay-tick`, `season-reset`.
- **New hooks**: `useRankState`, `usePromotionSeries`, `useTopicBanPick`.
- **New components**: `RankBadge`, `PromoSeriesTracker`, `TopicBanPickPanel`, `RankDistributionChart`.
- **Updated**: `mm_enqueue`, `mm_create_match`, `re_apply_match`, `finalize_match`, `LpSummary`, `StatsPanel`, `ReadyRoster`, `DivisionProgress`, `Leaderboard.tsx`, `BattleSession.tsx` (mounts ban/pick during `ban_pick` state).
- **Removed**: `getDivisionColor` mock import sites — replaced by `RankBadge`.

## Execution order & verification

1. **Phase A merges first** — verify by playing a duo match: K should be 48 for placement, ELO delta should match formula, LP should now be derived (not raw ELO), streak bonus should appear in `LpSummary`.
2. **Phase B** — hit 100 LP, see promo series modal, win 2/3, observe tier bump on the badge in real time.
3. **Phase C** — second match with the same opponent within 30m should not repeat-pair; cancelling an accepted match should produce the dodge toast.
4. **Phase D** — run `rank-decay-tick` manually, confirm a Platinum+ user with `last_match_at > grace` loses LP; admin runs `season-reset`, all rank states recalibrate.
5. **Phase E** — entry page shows live tier/LP/streak; `/leaderboard/ranked` shows the live `get_leaderboard` payload with no mock fallbacks.

## Out of scope (deferred to Step 11+)

- AI-generated code detection (needs an ML model).
- Behavioral biometrics / multi-account fingerprinting (privacy review needed).
- Cosmetic unlocks (borders, emotes, themes) — not gameplay-critical.
- Achievement engine — depends on cosmetics + season retrospective.
- Replay/timeline scrubber and spectator entry (still deferred from Step 9).
- Regional / country leaderboards (need user country capture in profile).

