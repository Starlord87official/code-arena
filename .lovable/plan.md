

## Make `/championship` Feel Native to the Dashboard

Bring the Championship page in line with the Dashboard / Challenge Arena visual language using the shared Blue Lock primitives (`PageHeader`, `SectionHeader`, `GlassPanel`) and dashboard token classes — without changing championship logic, data, registration flow, or routing.

### Scope

Visual/structural only. No edits to `championshipData.ts`, routing, or stage logic.

### Changes

1. **`src/pages/Championship.tsx` — adopt dashboard shell**
   - Keep existing `PageHeader` (`SECTOR // 010_CHAMPIONSHIP_<year>`) but tighten container to match Dashboard width/padding rhythm.
   - Replace the secondary hero `<section>` (countdown + CTAs) with a single `GlassPanel strong corners sideStripe` block placed directly under the header — same hero treatment used by Dashboard's top tile and the Daily Challenge banner on `/challenges`.
     - Keep `CountdownTimer`, "next phase" copy, and the two CTAs (My Progress / View Standings) intact.
     - Re-skin countdown unit boxes with `bl-glass` surface, `font-mono` digits, `text-neon` accent.
   - Wrap each grouped block with `SectionHeader`:
     - `[ TRACKS ]` above the three track cards.
     - `[ SELECTION PATH ]` above the timeline.
     - `[ MY STATUS ]` and `[ LIVE STANDINGS ]` above the right-rail cards.
     - `[ HALL OF CHAMPIONS ]` above that CTA block.
   - Convert `StageTimeline`, `LiveStandingsPreview`, `UserStatusPanel`, and the Hall of Champions CTA wrappers from `Card` → `GlassPanel` (`corners` on hero-level, `padding="md"`).

2. **`TrackCard` (inside `Championship.tsx`) — align with Dashboard tile language**
   - Replace the `Card` wrapper with `GlassPanel padding="md" corners`, with `sideStripe="ember"` only on the Clan track to reinforce its "Elite Path" status (mirrors the System Design treatment on `/challenges`).
   - Keep all current content: track icon tile, title, description, prize, status row, partner row, next-stage row, CTA.
   - Swap typography tokens:
     - Titles → `font-display` + `text-text`.
     - Helper copy → `text-text-dim` / `text-text-mute` instead of `text-muted-foreground`.
     - Status accent uses `text-neon` for active, keep semantic colors for `qualified` / `eliminated` / `champion`.
   - Hover: `-translate-y-0.5` + neon edge, consistent with Dashboard cards.
   - Keep top accent bar (uses `trackInfo.accentColor`) but render as a subtle 1px line so it doesn't fight the `GlassPanel` corners.

3. **`StageTimeline` — dashboard rhythm**
   - Outer wrapper → `GlassPanel padding="md"`.
   - Section title row uses the same `SectionHeader` (above the panel), not a `CardHeader` inside.
   - Active node keeps neon ring + pulse; completed uses success token; date row uses `font-mono text-text-mute`.

4. **`UserStatusPanel` + `LiveStandingsPreview` + Hall of Champions CTA**
   - Convert each to `GlassPanel padding="md"` with their `SectionHeader` above.
   - "Open Lane" / "Pending" badge tokens kept as-is.
   - Empty state in `LiveStandingsPreview`: keep copy, restyle icon and text with dashboard tokens.

5. **Typography + tokens**
   - Numerics (countdown digits, ranks, dates) → `font-mono`.
   - All `text-muted-foreground` on this page → `text-text-dim` / `text-text-mute`.
   - Neon accents → `text-neon`; gold accents (Clan, Hall of Champions) keep `text-gold`.

6. **No changes**
   - No edits to `globals.css` / `index.css`.
   - No edits to `championshipData.ts`, `AvatarWithFrame`, `Standings`, `MyProgress`, `Register`, or `HallOfChampions` pages.
   - No change to countdown logic, track CTAs, or registration routing.
   - Mobile/responsive behavior unchanged (same grid breakpoints).

### Files to Update

- `src/pages/Championship.tsx` (only)

### Acceptance

- `/championship` reads as a sibling of `/dashboard` and `/challenges`: same `PageHeader`, same `SectionHeader` rhythm, same `GlassPanel` surfaces with neon corners and side stripes.
- Hero countdown sits in a single glass panel with mono digits and neon accent, not the legacy gradient `<section>`.
- Track cards use `GlassPanel`; Clan card carries the ember side-stripe to mark Elite Path.
- All right-rail cards (My Status, Live Standings, Hall of Champions CTA) use glass surfaces and dashboard typography tokens.
- No regression to countdown, registration CTAs, stage timeline, or empty-state copy.

