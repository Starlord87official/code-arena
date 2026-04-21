

# Step 9 — Wire Battle V2 Frontend to Backend (End-to-End)

## Goal
Replace remaining mock/static data across all four battle V2 component groups (`entry/`, `pre-battle/`, `workspace/`, `post-battle/`) with live backend data via the RPCs and realtime channels built in Steps 1–8. Result: every screen the user touches in a duo battle reflects real database state — no hardcoded names, scores, problems, or stats.

## Audit (current wiring gaps)

After reading every file in `src/components/battle-v2/**`, here is what is still mock-driven vs. already live:

### `entry/` — Battle landing screen
- `EntryHero.tsx` ✅ prop-driven (no change).
- `GlobalStatsStrip.tsx` ❌ accepts props but `Battle.tsx` doesn't pass real numbers.
- `ModeGrid.tsx` / `ModeSelector.tsx` ✅ static config, fine.
- `OnlineWarriorsList.tsx` ❌ currently uses `useBattleData` mock seed.
- `RecentBattlesList.tsx` ❌ uses mock seed; should pull from `battle_history` for the user.
- `StatsPanel.tsx` ❌ shows stubbed ELO / win rate.
- `LoadoutBar.tsx`, `FormatSelector.tsx`, `RegionSelector.tsx`, `CombatantProfile.tsx` ✅ presentational.
- `QueueButton.tsx` ✅ already wired to `useMatchmaking`.

### `pre-battle/` — Lobby + countdown
- `LobbyHeader.tsx` ❌ hardcoded match ID/format strings.
- `ReadyRoster.tsx` ❌ static two-player mock.
- `MatchBriefing.tsx` ❌ static problem list.
- `CountdownLauncher.tsx` ✅ countdown-only, prop-driven.

### `workspace/` — Live battle UI
- `WorkspaceHud.tsx` ❌ shows hardcoded scores & timer.
- `OpponentTicker.tsx` ✅ wired (Step 6) but `BattleSession.tsx` doesn't pass opponent name/avatar from real participant.
- `ProblemPanel.tsx` ❌ accepts props but `BattleSession.tsx` passes only the first problem; needs full list with switching.
- `EditorToolbar.tsx` ✅ language + run/submit handlers; needs real submit wiring.
- `CodeEditor.tsx` ✅ wired (Steps 7 & 8).
- `ConsolePanel.tsx` ❌ shows mock stdout; should render `latestSubmission.verdict_payload`.
- `VerdictOverlay.tsx` ✅ wired (Step 7).
- `StatusBar.tsx` ✅ wired (Step 8).

### `post-battle/` — Results screen
- `ResultBanner.tsx` ❌ hardcoded "VICTORY" string.
- `FinalScoreboard.tsx` ❌ static rounds array.
- `LpSummary.tsx` ❌ hardcoded LP delta.
- `PlayerStatsTable.tsx` ❌ mock player stats.
- `PostActions.tsx` ✅ pure handlers.

## Backend changes

### 1. New RPCs (read-side aggregations)

- **`get_user_battle_summary(p_user_id uuid)`** — returns `{ elo, rank_label, total_matches, wins, losses, win_rate, current_streak, mvp_count }` for the entry stats panel. Reads `battle_history` + `rank_states`.
- **`get_recent_battles(p_user_id uuid, p_limit int default 5)`** — returns rows joined from `battle_matches` + `battle_participants` for the user's last N matches: `{ match_id, mode, ended_at, opponent_handle, result, score_self, score_opp, elo_change }`.
- **`get_online_warriors(p_limit int default 12)`** — returns recent active queue/match participants: `{ user_id, handle, elo, rank_label, status }` (status ∈ `queueing` / `in_match`). Excludes caller.
- **`get_global_battle_stats()`** — returns `{ live_matches, players_online, matches_today }` for the GlobalStatsStrip.
- **`get_match_briefing(p_match_id uuid)`** — returns full match config + participants + problem list for pre-battle/lobby and workspace: `{ match: {…}, participants: [{user_id, handle, avatar, elo, rank_label}], problems: [{id, title, difficulty, points, order_index}] }`. Caller-only (must be a participant).
- **`get_match_result(p_match_id uuid)`** — post-battle aggregation: `{ winner_id, is_draw, duration_sec, players: [{user_id, handle, score, problems_solved, wrong_submissions, total_solve_time_sec, elo_before, elo_after, elo_change, xp_earned, integrity_score}], rounds: [{problem_id, title, difficulty, winner_user_id, time_a, time_b}] }`.

All `SECURITY DEFINER`, RLS-safe, return JSON.

## Frontend changes

### 1. New hooks

- **`src/hooks/useBattleEntryData.ts`** — wraps `get_user_battle_summary`, `get_recent_battles`, `get_online_warriors`, `get_global_battle_stats`. Auto-refetches every 30s. Returns `{ summary, recent, online, global, isLoading }`.
- **`src/hooks/useBattleBriefing.ts`** — calls `get_match_briefing(matchId)`; stable across pre-battle and workspace mounts.
- **`src/hooks/useBattleResult.ts`** — calls `get_match_result(matchId)` once match state is `completed`.

### 2. `src/pages/Battle.tsx` (entry)
- Mount `useBattleEntryData()`.
- Replace `useBattleData` mock pipeline. Pass real props into:
  - `GlobalStatsStrip` → `global`.
  - `StatsPanel` → `summary`.
  - `RecentBattlesList` → `recent` (rename mock fields to match RPC shape; show empty state when zero).
  - `OnlineWarriorsList` → `online` (empty state when none).
- `CombatantProfile` → reads `summary` for caller's ELO/rank.

### 3. `src/pages/BattleSession.tsx` (pre-battle + workspace)
- Mount `useBattleBriefing(matchId)` once participant load completes.
- During `state ∈ {ready_check, ban_pick}`:
  - `LobbyHeader` ← `{ matchId, mode, format }` from briefing.
  - `ReadyRoster` ← `briefing.participants` with ready-state from `battle_event_log` last `participant_ready` event.
  - `MatchBriefing` ← `briefing.problems`.
- During `state === 'active'`:
  - `WorkspaceHud` ← live `participants` from `useBattleRealtime` (scores, problems_solved, time remaining via `match.started_at + duration_minutes`).
  - `ProblemPanel` ← `briefing.problems`, with current selection in local state, switching updates the editor's `time_since_problem_open_sec` baseline (existing Step 8 wiring).
  - `OpponentTicker` ← opponent participant + handle from `briefing.participants`.
  - `ConsolePanel` ← parses `latestSubmission.verdict_payload` (`{ stdout, stderr, runtime_ms, testcases }`).

### 4. `src/pages/BattleSession.tsx` post-battle redirect
- Already redirects on `state === 'completed'` (Step 6). On the post-battle page (separate route), mount `useBattleResult(matchId)` and feed:
  - `ResultBanner` ← `{ outcome: win/loss/draw, winnerName, callerWon }`.
  - `FinalScoreboard` ← `result.players`.
  - `LpSummary` ← `players[caller].elo_change` + `xp_earned`.
  - `PlayerStatsTable` ← `result.players`.
  - `PostActions` `onRematch` → re-enqueues caller with same config; `onShare` → existing share dialog.

### 5. Empty states
- All four sections must render empty placeholders (no fake data) when backend returns zero rows. Reuse `bl-glass` panels with a single line of `// no data yet` styling consistent with the BL aesthetic.

## Files touched

- `supabase/migrations/<new>.sql` — six new RPCs above.
- `src/hooks/useBattleEntryData.ts` — new.
- `src/hooks/useBattleBriefing.ts` — new.
- `src/hooks/useBattleResult.ts` — new.
- `src/pages/Battle.tsx` — swap mock pipeline → real hook.
- `src/pages/BattleSession.tsx` — wire briefing + workspace props.
- `src/components/battle-v2/pre-battle/LobbyHeader.tsx` — accept real props.
- `src/components/battle-v2/pre-battle/ReadyRoster.tsx` — accept participants.
- `src/components/battle-v2/pre-battle/MatchBriefing.tsx` — accept problems.
- `src/components/battle-v2/workspace/WorkspaceHud.tsx` — read live participants/timer.
- `src/components/battle-v2/workspace/ProblemPanel.tsx` — list of problems + switching.
- `src/components/battle-v2/workspace/ConsolePanel.tsx` — render verdict payload.
- `src/components/battle-v2/post-battle/ResultBanner.tsx` — derive from result.
- `src/components/battle-v2/post-battle/FinalScoreboard.tsx` — render players.
- `src/components/battle-v2/post-battle/LpSummary.tsx` — read elo/xp delta.
- `src/components/battle-v2/post-battle/PlayerStatsTable.tsx` — render players.
- `src/components/battle-v2/entry/StatsPanel.tsx`, `GlobalStatsStrip.tsx`, `RecentBattlesList.tsx`, `OnlineWarriorsList.tsx` — accept real RPC shapes; render empty states.

## Verification

1. New user with zero history → entry page shows empty states for "Recent Battles" and "Online Warriors", real `0` stats — no fabricated numbers.
2. Two test users queue → on match found, lobby shows real handles + selected problem list pulled from `battle_match_problems`.
3. During active match → opponent score in `OpponentTicker` and HUD updates within ~200ms of opponent's accepted submission (uses Step 6 realtime).
4. After completion → post-battle page shows real ELO delta, MVP from result, integrity score per player, rematch button re-enters queue with same config.

## Out of scope (deferred)

- Spectator entry to in-progress matches.
- Replay/timeline scrubber on the post-battle screen.
- Friend/clan-aware "Online Warriors" prioritization.
- Animated transitions between phases (cosmetic-only, separate pass).

