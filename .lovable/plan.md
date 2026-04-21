

# Blue Lock Battle Module — Full Frontend Rebuild

Replace the entire `/battle` experience with the uploaded Blue Lock design system. The flow spans four phases (Entry → Pre-Battle → Live Workspace → Post-Battle) plus a dev-only phase switcher for previewing each screen without real backend state.

## What gets built

### 1. Design tokens & CSS utilities
Add Blue Lock primitives to `src/index.css` and `tailwind.config.ts`:
- **Colors**: `void` (#040811), `panel`, `line`, `neon` (#00f0ff), `ember` (#ff6b00), `gold` (#ffc85a), `blood` (#ff3355), `text`, `text-dim`, `text-mute`
- **Utilities**: `bl-glass`, `bl-glass-strong`, `bl-grid`, `bl-scanline`, `bl-clip-chevron`, `bl-clip-notch`, `bl-corners`, `bl-side-stripe`, `bl-pulse`, `bl-flicker`, `bl-result-in`, `glow-neon/ember/gold/blood`
- **Fonts**: `font-display` (already wired)

### 2. Folder structure
```text
src/
  pages/Battle.tsx                    ← phase orchestrator (rewritten)
  pages/BattleSession.tsx             ← REPLACED with workspace
  components/battle-v2/
    types.ts                          ← shared contracts
    PhaseToggle.tsx                   ← dev-only switcher
    entry/                            ← 11 components ported
    pre-battle/                       ← 4 components ported
    workspace/                        ← 9 components ported
    post-battle/                      ← 5 components ported
```

### 3. Phase orchestration
`src/pages/Battle.tsx` becomes a state machine:
- `entry` → matchmaking lobby (mode/format/region/CTA)
- `searching` → queue status panel
- `pre_battle` → lobby header + roster + briefing + countdown
- `live` → routes to `/battle/session/:id` (workspace shell)
- `post_battle` → result banner + scoreboard + LP summary + actions

In production, phase is driven by `useMatchmaking` + `useBattleData` real state. In `import.meta.env.DEV`, `PhaseToggle` floats bottom-right to jump phases freely.

### 4. Workspace (live battle)
`/battle/session/:id` mounts:
```
WorkspaceHud (timer, exit, live ID)
OpponentTicker (teammate + opponents)
ProblemPanel | CodeEditor + EditorToolbar + ConsolePanel
StatusBar
VerdictOverlay (modal on submit)
```
Wired to existing `useBattleData(sessionId)` hook for real session data; `workspace-data.ts` mock constants are converted to props with empty-state fallbacks.

### 5. Framework porting (applied to all 30+ files)
- Strip `"use client"` directives (Vite, not Next.js)
- `next/link` → `react-router-dom` `Link`
- `next/navigation` `useRouter` → `useNavigate`
- Hardcoded mock arrays (`BLUE_TEAM`, `ROUNDS`, `STATS`, `OPPONENTS`, `TEAMMATE`) become props with empty-state defaults — no fake data ships
- Tailwind class compatibility verified (all classes used are v3-safe)

### 6. Data integrity
- Entry views read real online warriors / pending challenges / recent battles from `useBattleData`
- Live workspace pulls problem, test cases, submissions from `useBattleData(sessionId)` — falls back to "No active match" empty state
- Post-battle reads from `complete_duo_battle` RPC result (existing flow preserved)
- Scoring/ELO logic untouched — `complete_duo_battle` SECURITY DEFINER RPC still authoritative

### 7. Cleanup
Delete legacy battle UI files (kept hooks intact):
- `src/components/battle/BattleArena.tsx`, `BattleHeader.tsx`, `BattleProblemStatement.tsx`, `BattleProblemsPanel.tsx`, `BattleScoreboard.tsx`, `BattleResultBanner.tsx`, `BattleCodeEditor.tsx`, `BattleChatPanel.tsx`, `PostBattleResults.tsx`, `PostBattleCTAs.tsx`, `BattleShareDialog.tsx`, `ShareableBattleCard.tsx`, `ClanBattlePanel.tsx`
- `src/pages/BattleResults.tsx` merged into post-battle phase

Routes preserved: `/battle`, `/battle/session/:id`, `/battle/history`.

### 8. Memory updates
Update `mem://features/battle-arena-ux-and-scoring` and `mem://features/battle-mode-data-integrity-v2` to reflect the new component structure.

## Implementation order
1. CSS tokens + utilities + Tailwind config
2. `types.ts` shared contracts + `PhaseToggle`
3. Port `entry/` (11 files) — wire `useBattleData`, `useMatchmaking`
4. Port `pre-battle/` (4 files) — wire countdown to session creation
5. Port `workspace/` (9 files) — wire to `useBattleData(sessionId)`, submission RPCs, `VerdictOverlay`
6. Port `post-battle/` (5 files) — wire to battle result data
7. Rewrite `Battle.tsx` orchestrator + new `BattleSession.tsx` shell
8. Delete legacy files, update routes in `App.tsx`
9. Visual QA at 1106px and mobile viewports

