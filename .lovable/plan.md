

# Plan: Apply Blue Lock "Egoist Command Center" Design System Site-Wide

The uploaded files give me the full design language. I'll port it into the existing CodeTrackX codebase **without** breaking any data flow, routes, RBAC, RLS, or component contracts. Pure visual / utility-class refactor.

---

## What "Blue Lock" Brings In

| Pillar | Detail |
|---|---|
| **Palette** | Pitch black `#020410` / `#030611`, panel navy `#0a1028`, neon cyan `#00f0ff`, electric blue `#0066ff`, ember `#ff6b1a`, gold `#fbbf24`, blood `#ff3355` |
| **Fonts** | Space Grotesk (display), Inter (body), JetBrains Mono (HUD) |
| **Signature utilities** | `.bl-glass`, `.bl-glass-strong`, `.bl-corners`, `.bl-side-stripe`, `.bl-clip-notch`, `.bl-clip-chevron`, `.bl-grid`, `.bl-dots`, `.bl-stripes`, `.bl-bar-track`, `.bl-shimmer`, `.bl-scan`, `.bl-flicker`, `.bl-glitch`, `.bl-float-slow`, `.bl-pulse`, `.bl-nav-item`, `.bl-btn-primary`, `.bl-btn-ghost`, `.text-glow`, `.text-glow-ember` |
| **Body bg** | Layered radial gradients (electric + neon + blue) over pitch black, fixed attachment |
| **Page header pattern** | `[ SECTOR // 001_PAGENAME ]` mono tag + display title, ambient orbs behind hero |

---

## Step 1 — Foundation (`src/index.css` + `tailwind.config.ts` + `index.html`)

**`src/index.css`** — additive, non-breaking:
1. Update `:root` dark theme tokens to the Blue Lock palette (background pitch-black, primary stays HSL-compatible neon cyan). Keep light theme intact (Blue Lock is dark-only — light mode untouched).
2. Add new CSS vars: `--void`, `--deep`, `--panel`, `--panel-2`, `--line`, `--line-bright`, `--neon`, `--neon-soft`, `--electric`, `--blue-mid`, `--blue-deep`, `--ember`, `--ember-soft`, `--blood`, `--gold`, `--text`, `--text-dim`, `--text-mute`.
3. Update body background to layered radial gradients.
4. Append the **entire `/* Blue Lock Utilities */` block** from globals.css (lines 158–571): `.bl-glass`, `.bl-corners`, `.bl-side-stripe`, `.bl-clip-notch`, `.bl-clip-chevron`, `.bl-clip-slant-l/r`, `.bl-grid`, `.bl-dots`, `.bl-stripes`, `.bl-bar-track`, `.bl-shimmer`, `.bl-scan`, `.bl-flicker`, `.bl-glitch`, `.bl-float-slow/slower`, `.bl-pulse`, `.bl-pulse-ember`, `.bl-nav-item`, `.bl-btn-primary`, `.bl-btn-ghost`, `.text-glow`, `.text-glow-ember`, `.glow-neon`, `.glow-ember`, scrollbar + selection.
5. Keep all existing utilities (`arena-card`, `xp-bar-intense`, rank auras, etc.) for backward compatibility.

**`tailwind.config.ts`** — add color tokens so Tailwind recognizes `bg-void`, `bg-panel`, `text-neon`, `border-line`, `text-ember`, `text-text-dim`, etc.:
```ts
colors: {
  void: 'var(--void)', deep: 'var(--deep)', panel: 'var(--panel)', 
  'panel-2': 'var(--panel-2)', line: 'var(--line)', 'line-bright': 'var(--line-bright)',
  neon: 'var(--neon)', 'neon-soft': 'var(--neon-soft)', electric: 'var(--electric)',
  'blue-mid': 'var(--blue-mid)', 'blue-deep': 'var(--blue-deep)',
  ember: 'var(--ember)', 'ember-soft': 'var(--ember-soft)',
  blood: 'var(--blood)', gold: 'var(--gold)',
  text: 'var(--text)', 'text-dim': 'var(--text-dim)', 'text-mute': 'var(--text-mute)',
}
```

**`index.html`** — replace the existing Google Fonts link to load `Space Grotesk + Inter + JetBrains Mono` (drop Orbitron/Rajdhani; keep them only as fallback by leaving the existing fonts mapped where needed). Update `<meta name="theme-color">` to `#030611`.

**`tailwind.config.ts`** font mapping:
- `font-display` → Space Grotesk
- `font-sans` → Inter
- `font-mono` → JetBrains Mono
- `font-heading` kept = Space Grotesk (back-compat alias)

---

## Step 2 — Layout Shell (sidebar + topbar)

These two files set the tone for **every authenticated page**.

**`src/components/layout/AppSidebar.tsx`** — refactor visuals only:
- Background: `bg-void/70 backdrop-blur-xl` with `bl-grid` overlay + right-edge neon gradient.
- Brand block: `bl-clip-notch` square w/ `Code2` icon + neon blur halo. Title: `Code` + `<span className="text-neon text-glow">TrackX</span>`. Beta tag: flickering dot + `PRIVATE BETA` micro caps.
- Section labels: `MAIN` / `MORE` in `font-display text-[10px] tracking-[0.28em] text-text-mute`.
- Nav items: use `bl-nav-item` class (left neon stripe on hover + active). Active state already styled via `[data-active='true']`. NEW badges → `bl-clip-chevron` chevron pill, ember vs neon variant per item.
- Collapse button: same chevron + `COLLAPSE` caption.
- Keep all logic: existing `useSidebar`, `Link`, `isActive`, `handleNavClick`, `useAuth` gate, route map.

**`src/components/layout/TopBar.tsx`** — refactor visuals only:
- `sticky top-0 border-b border-line/60 bg-void/70 backdrop-blur-xl` + bottom neon gradient hairline.
- Page title block: `SECTOR` micro caps + mono `// 00X_PAGENAME` + `font-display text-2xl` title (drives off existing `pageTitles` map; add SECTOR numbers per route).
- Streak chip: ember-bordered, ember flame, ember caps.
- Notification bell: `border border-line bg-panel/60 hover:border-neon/60` with red blood-glow badge.
- User chip: `border border-line bg-panel/60`, avatar uses `bg-gradient-to-br from-neon to-electric` w/ blur halo, division shown in ember caps.
- Notification dropdown + profile dropdown: re-skin to `bl-glass-strong` with `bl-corners`. Keep all existing logic (notifications array, friend requests, logout, links).

**`src/components/layout/Layout.tsx`** — no logic changes; ensure outer wrapper has `bg-void` (foundation handles bg).

---

## Step 3 — Reusable Building Blocks (used everywhere)

Create these new components to enforce consistent visual language without rewriting every page:

| New file | Purpose |
|---|---|
| `src/components/bl/PageHeader.tsx` | `<PageHeader sector="001" title="Dashboard" subtitle="...">` — used by every page in place of ad-hoc `<h1>` blocks |
| `src/components/bl/StatTile.tsx` | The 4 athlete-style stat tiles with `bl-glass + bl-corners + accent bar`. Props: `label, value, sub, icon, accent ('neon'|'ember'|'gold'|'electric')`, `index` |
| `src/components/bl/GlassPanel.tsx` | Generic `bl-glass` wrapper with optional `corners`, `sideStripe`, `clipNotch` props |
| `src/components/bl/SectionHeader.tsx` | Mono tag `[ EGOIST PROTOCOL ACTIVE ]` + gradient hairline (used above hero sections) |
| `src/components/bl/PrimaryButton.tsx` | Wrapper around `<Button>` applying `bl-btn-primary` class (preserves existing `Button` API) |

This keeps refactor surface small — pages just swap their card wrapper for `<GlassPanel>` and stat blocks for `<StatTile>`.

Also: extend `src/components/ui/button.tsx` with two new `cva` variants:
- `egoist`: `bl-btn-primary` styling
- `egoistGhost`: `bl-btn-ghost` styling

So existing `<Button variant="arena">` callers can be migrated by changing one prop.

---

## Step 4 — Page Refactor Pass (visuals only, no logic)

For each page below the pattern is identical:
1. Replace top-of-page heading with `<PageHeader sector="0XX" title=... />`.
2. Wrap hero/intro section with ambient orbs (`bl-float-slow`/`-slower` divs).
3. Convert top stat row → `<StatTile>` grid.
4. Convert any `arena-card` / `glass-card` → `<GlassPanel>` (or just swap class to `bl-glass bl-corners`).
5. Replace primary CTAs with `<Button variant="egoist">` (text auto-uppercases).
6. Body text classes → `text-text-dim` / `text-text-mute`.
7. Section dividers → mono caps + neon hairline gradient.

**Pages to update (full list — same pattern each):**

| Sector # | File |
|---|---|
| 001 | `src/pages/Dashboard.tsx` |
| 002 | `src/pages/Challenges.tsx` |
| 003 | `src/pages/ChallengesList.tsx` |
| 004 | `src/pages/Roadmap.tsx` |
| 005 | `src/pages/Battle.tsx` |
| 006 | `src/pages/BattleHistory.tsx` |
| 007 | `src/pages/Contests.tsx` + `ContestsHome.tsx` |
| 008 | `src/pages/ContestDetail.tsx`, `ContestLobby.tsx`, `ContestLeaderboard.tsx`, `ContestReport.tsx`, `ContestHistory.tsx` |
| 009 | `src/pages/Leaderboard.tsx` |
| 010 | `src/pages/Championship.tsx`, `ChampionshipProgress.tsx`, `ChampionshipStandings.tsx`, `HallOfChampions.tsx` |
| 011 | `src/pages/ClansHome.tsx`, `ClanDashboard.tsx`, `ClansCreate.tsx`, `JoinClan.tsx`, `ClanHome.tsx` |
| 012 | `src/pages/OAArena.tsx`, `OAPacks.tsx`, `OAPackDetail.tsx`, `OAHistory.tsx`, `OAReport.tsx` (skip in-test routes — focus mode kept clean) |
| 013 | `src/pages/Companies.tsx`, `CompanyDetail.tsx` |
| 014 | `src/pages/Doubts.tsx` |
| 015 | `src/pages/Planner.tsx` |
| 016 | `src/pages/Notifications.tsx` |
| 017 | `src/pages/Profile.tsx`, `PublicProfile.tsx`, `Settings.tsx` |
| 018 | `src/pages/PartnerLanding.tsx`, `PartnerMatches.tsx`, `PartnerProfile.tsx`, `PartnerContract.tsx`, `PartnerTrials.tsx`, `PartnerReport.tsx`, `DuoDashboard.tsx`, `TrainingCardBuilder.tsx` |
| 019 | `src/pages/MentorDashboard.tsx`, `Mentors.tsx`, `MentorProfile.tsx` |
| 020 | `src/pages/GlyphHeatmapPage.tsx` (heatmap visuals untouched per prior memory; only header/stat tiles/wrapper) |

**Excluded from refactor (Focus Mode pages — must stay clean per `route-layout-exclusions` memory):**
- `src/pages/Auth.tsx`, `Login.tsx`, `Register.tsx` (already have premium split-screen — retheme palette only)
- `src/pages/Landing.tsx` (marketing page — retheme palette only, keep parallax)
- `src/pages/Onboarding.tsx` (retheme tokens only)
- `src/pages/Solve.tsx`, `BattleSession.tsx`, `BattleResults.tsx`, `ContestArena.tsx`, `OARoom.tsx`, `OASubmit.tsx`, `OAInstructions.tsx`, `ClanVsClanBattle.tsx` — competitive arena pages, retheme background tokens only, no visual chrome added

**Admin pages** (`src/pages/admin/*` + `AdminLayout.tsx`, `AdminSidebar.tsx`): retheme to Blue Lock palette but keep dense data-table layout intact.

---

## Step 5 — Shared Components Pass

Re-skin reusable cards so the entire site benefits without per-page edits:
- `src/components/dashboard/*` — InterviewReadinessCard, TargetCard, RevisionSummaryCard, AreasToImproveCard, RevisionQueueCard, DivisionProgress, RivalsSection, LiveActivityFeed, ActivityHeatmap → all use `bl-glass + bl-corners` wrapper
- `src/components/cards/PlayerCard.tsx`, `ChallengeCard.tsx`, `ContestCard.tsx` → Blue Lock card treatment
- `src/components/profile/*` premium cards → keep structure, swap surfaces to `bl-glass-strong` + use `bl-side-stripe`
- `src/components/clans/ClanCard.tsx`, `src/components/clan/*` cards → same
- `src/components/contests/ContestCardNew.tsx`, `src/components/oa/OAPackCard.tsx`, `src/components/oa/OAHeroSection.tsx` → same
- `src/components/championship/AvatarWithFrame.tsx` — keep crown asset (per `procedural-asset-fidelity` memory) but reframe with `bl-clip-notch`
- `src/components/roadmap/MissionMapHero.tsx`, `RoadmapCard.tsx`, `TodaysPlanCard.tsx` → Blue Lock surfaces (mission map visual structure unchanged per memory)
- `src/components/battle/BattleHeader.tsx`, `BattleScoreboard.tsx`, `BattleResultBanner.tsx` → re-skin only (battle scoring/timer logic untouched)

`src/components/heatmap/*` — **untouched** (recently rebuilt, real-data wired).

---

## What Stays Identical

- All routes in `App.tsx`
- All Supabase queries, hooks, RPCs, RLS
- Auth, RBAC, mentor invite-only, clan cooldown, championship 2026, battle ELO, OA integrity tracking
- Activity Heatmap component internals (already shipped real-data version)
- Light theme behavior
- Crown SVG asset (`procedural-asset-fidelity` memory)
- Focus Mode boundary (`route-layout-exclusions` memory)

---

## Files Touched (Summary)

**Foundation (3):** `src/index.css`, `tailwind.config.ts`, `index.html`

**New shared building blocks (5):** `src/components/bl/PageHeader.tsx`, `StatTile.tsx`, `GlassPanel.tsx`, `SectionHeader.tsx`, `PrimaryButton.tsx`

**Layout (3):** `AppSidebar.tsx`, `TopBar.tsx`, `Layout.tsx`

**Button (1):** `src/components/ui/button.tsx` — add `egoist` + `egoistGhost` variants

**Pages (~45):** all listed above (visual class swaps + PageHeader/StatTile/GlassPanel adoption)

**Shared component re-skins (~25):** dashboard / cards / profile / clan / contest / roadmap / battle chrome

**Total scope:** large but mechanical — the heavy lifting is the foundation + 5 new building blocks, then propagation is mostly class-swap work. Zero data/logic changes.

---

## Acceptance Criteria

- Every authenticated page shows the Blue Lock sidebar + topbar
- Every page hero uses `<PageHeader>` with sector ID
- All stat rows use `<StatTile>` (4-column athlete tiles)
- All cards use `bl-glass` family
- Primary CTAs use `bl-btn-primary` (via `Button variant="egoist"`)
- Fonts: display = Space Grotesk, body = Inter, mono = JetBrains
- Body shows layered radial neon gradients on pitch black
- Focus Mode arena pages remain distraction-free (palette only)
- Light theme still functions
- No regressions in routing, auth, data, or RBAC

