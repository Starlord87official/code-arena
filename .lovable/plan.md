

# Step 10 — Phase E: Rank Surfaces + Leaderboard + Topic Picks

Final phase of Step 10. Phases A–D built the engine (rating, promo, matchmaking, decay, seasons). Phase E exposes it everywhere in the UI, replaces the last mock data, and ships the topic ban/pick lobby flow.

## 0. Hotfix: "Rendered more hooks than during the previous render"

Runtime error currently in preview. Most likely culprit is `StatsPanel.tsx` after Phase D — `useDecayWarning` was added alongside `usePromotionSeries`, and one of them is being called conditionally or after an early return. Audit `StatsPanel.tsx` and any component touched in B/D, move every `useX()` call above any `if (...) return` branch.

## 1. Unified rank state hook + badge

- **`src/hooks/useRankState.ts`** — single source of truth. Reads `rank_states` for current user (and accepts optional `userId` for other players). Subscribes to realtime updates. Returns `{ tier, division, lp, mmr, peak, demotionShield, placementsRemaining, decayBankDays, isLoading }`.
- **`src/components/rank/RankBadge.tsx`** — visual badge (tier crest + division roman numeral + LP). Three sizes: `sm` (inline chip), `md` (cards), `lg` (profile hero). Uses existing premium esports gradients per tier.
- **`src/components/rank/RankProgressBar.tsx`** — LP bar with tier color, peak marker, and shield/decay indicators. Replaces the inline LP bar in `StatsPanel`.

## 2. Replace mocks across the app

- **`src/components/dashboard/DivisionProgress.tsx`** — currently mock. Wire to `useRankState`; show real tier, LP bar, next-division target, decay/promo state.
- **`src/components/profile/premium/ProfileHeroBanner.tsx`** — add `RankBadge` (lg) next to username for own + public profiles.
- **`src/components/cards/PlayerCard.tsx`** — add `RankBadge` (sm) to player chips used in friends list, online warriors, recent battles.
- **`src/components/battle-v2/post-battle/FinalScoreboard.tsx`** — show each player's `RankBadge` next to their name.

## 3. Ranked leaderboard page

- **New RPC `get_ranked_leaderboard(p_tier_filter, p_limit, p_offset)`** — SECURITY DEFINER, returns top N from `rank_states` joined to `profiles` (username, avatar) for the active season, ordered by `(tier desc, division asc, lp desc, mmr desc)`. Includes caller's own row + rank position even if outside the page.
- **New page `src/pages/RankedLeaderboard.tsx`** at `/leaderboard/ranked`:
  - Top 3 podium (Challenger crowns)
  - Tier filter chips (All / Iron / … / Challenger)
  - Paginated table: rank, badge, username, LP, MMR, W/L
  - Sticky "Your rank" row at bottom
  - Empty state when season has no ranked games yet
- **Route**: add to `App.tsx`. Link from existing `/leaderboard` page header ("Ranked Ladder" tab).

## 4. Topic ban/pick (lobby pre-battle)

Blueprint calls for both players to ban 1 topic and pick 1 topic before the match locks problems.

- **Schema**: extend `battle_matches` with `banned_topics text[]` and `picked_topics text[]` (default `'{}'`).
- **New RPC `mm_submit_topic_choice(p_match_id, p_kind, p_topic)`** — `kind` in `('ban','pick')`. Validates caller is participant, append-only, max 1 ban + 1 pick per user. When all participants have submitted, triggers problem selection that excludes banned topics and biases toward picked ones.
- **`src/components/battle-v2/pre-battle/TopicDraftPanel.tsx`** — appears in lobby after both players ready. Two-step UI:
  1. **Ban phase** (15s timer): each player picks one topic from a chip cloud (Arrays, DP, Graphs, Trees, Strings, Greedy, Math, BitMagic). Auto-pick random if timer expires.
  2. **Pick phase** (15s timer): same UI, opposite intent.
- **`src/components/battle-v2/pre-battle/MatchBriefing.tsx`** — show resolved bans (red strike) + picks (green glow) before countdown.

## 5. Penalty/promotion toast system unification

Several toasts are scattered across phases. Consolidate into:

- **`src/hooks/useRankToasts.ts`** — subscribes to `rank_states` + `promotion_series` realtime. Diffs against last-seen state in localStorage and fires deduped toasts: tier up/down, promo started/passed/failed, decay applied, demotion shield consumed, placement match X/5.
- Mounted once in `App.tsx` so toasts fire from any page.

## Files touched

- **New migration**: `banned_topics`/`picked_topics` columns, `mm_submit_topic_choice` RPC, `get_ranked_leaderboard` RPC.
- **New hook/components**: `useRankState`, `useRankToasts`, `RankBadge`, `RankProgressBar`, `TopicDraftPanel`, `RankedLeaderboard` page.
- **Updated**: `StatsPanel.tsx` (hotfix + use new components), `DivisionProgress.tsx`, `ProfileHeroBanner.tsx`, `PlayerCard.tsx`, `FinalScoreboard.tsx`, `MatchBriefing.tsx`, `App.tsx` (route + toasts mount).

## Verification

1. Preview loads with no "Rendered more hooks" error.
2. Dashboard `DivisionProgress` shows real tier/LP from `rank_states`, updates after a match.
3. Profile hero shows `RankBadge`; public profiles show opponent badges.
4. `/leaderboard/ranked` lists real users sorted by tier+LP; own row pinned at bottom; tier filter works.
5. Lobby: both players see ban/pick draft after ready; resolved choices appear in briefing; problems exclude banned topics.
6. Tier up after a win → toast `Promoted to Gold IV` fires once across any page.

## Out of scope (Step 11)

- AI-generated code detection, behavioral biometrics.
- Cosmetics (borders, emotes, themes) + achievement engine.
- Replay/timeline scrubber, spectator entry.
- Regional / country leaderboards.

