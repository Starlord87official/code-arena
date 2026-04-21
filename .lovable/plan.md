

## Make `/companies` Feel Native to the Dashboard

Align the Companies index page with the Dashboard / Challenge Arena / Championship visual language using the shared Blue Lock primitives (`PageHeader`, `SectionHeader`, `GlassPanel`) and dashboard token classes — without changing data, routing, or company definitions.

### Scope

Visual/structural only on `/companies`. No edits to `useCompanyChallenges.ts`, `CompanyBadge`, or the per-company detail page.

### Changes

1. **`src/pages/Companies.tsx` — adopt dashboard shell**
   - Keep existing `PageHeader` (`SECTOR // 013_COMPANIES`) but tighten the outer container to match the `max-w-7xl` rhythm used by Dashboard / `/challenges` / `/championship` (currently `max-w-6xl`).
   - Convert the four stat tiles (Companies / Top Tech / Tier 2 / Total Problems) from legacy `arena-card` blocks into `GlassPanel padding="md" corners` tiles, matching the Dashboard `StatTile` rhythm:
     - Icon row, large numeric in `font-mono`, label in `text-text-mute uppercase tracking-wide text-[10px]`.
     - Tier 1 tile carries `sideStripe="ember"` to mirror the Elite Path treatment.
   - Replace the in-page tier banner (`<div class="flex items-center gap-3 mb-6 p-4 ...">`) with the shared `SectionHeader` tag above each tier group:
     - `[ TIER 01 // TOP TECH GIANTS ]`
     - `[ TIER 02 // HIGH-GROWTH TECH ]`
     - `[ TIER 03 // STARTUPS & PRODUCT ]`
     - Right slot of each `SectionHeader` shows the company count badge.
   - Replace the bottom info note (`💡 Problems are mapped...`) with a `GlassPanel padding="md"` using `text-text-dim` copy and a neon accent dot — no emoji.

2. **`CompanyCard` (inside `Companies.tsx`) — align with Dashboard tile language**
   - Replace `arena-card p-5 rounded-xl` wrapper with `GlassPanel padding="md" corners`.
   - Hover: `-translate-y-0.5` + neon edge + chevron translate, consistent with `/challenges` track tiles.
   - Apply `sideStripe="ember"` only on Tier 1 cards to reinforce elite tier (mirrors System Design / Clan track).
   - Keep all current content: icon tile, name, problem count, "Top Tech" badge, description, tag chips, chevron.
   - Swap typography tokens:
     - Title → `font-display` + `text-text` (already bold), hover `text-neon`.
     - Problem count + meta → `text-text-mute`, count value `font-mono`.
     - Description → `text-text-dim`.
     - Tag chips keep `Badge variant="outline"` but normalize to `text-text-dim`.
   - Icon tile background: keep gradient but shift to `from-neon/15 to-electric/10` so it matches dashboard tile icons; icon color `text-neon`.

3. **`CompanyCardSkeleton`**
   - Wrap in `GlassPanel padding="md"` instead of `arena-card` so the loading state matches the loaded surface exactly.

4. **`TierSection`**
   - Drop the gradient banner; render `SectionHeader` (with right-side count badge) above the grid.
   - Keep grid breakpoints unchanged (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`).
   - Tier-specific accent now lives only on cards (via `sideStripe` for Tier 1) and on the count badge color, not on a full-width banner.

5. **Typography + tokens (page-wide)**
   - All numerics (stat values, problem counts, company counts) → `font-mono`.
   - All `text-muted-foreground` on this page → `text-text-dim` / `text-text-mute`.
   - Neon accents → `text-neon`; gold accents reserved for Tier 1 / `rank-legend` markers (kept).

6. **No changes**
   - No edits to `globals.css` / `index.css`, `useCompanyChallenges.ts`, or `companyDefinitions`.
   - No edits to `CompanyBadge` or the per-company detail page (`CompanyDetail.tsx`).
   - No change to data flow, loading behavior, or stat math.
   - Routing (`/companies/:slug` links) and accessibility behavior unchanged.

### Files to Update

- `src/pages/Companies.tsx` (only)

### Acceptance

- `/companies` reads as a sibling of `/dashboard`, `/challenges`, and `/championship`: same `PageHeader`, same `SectionHeader` rhythm, same `GlassPanel` surfaces with neon corners, same `font-mono` numerics.
- Tier 1 tiles and the Tier 1 stat carry an ember side-stripe; other tiers stay neutral neon.
- Loading skeletons sit in `GlassPanel` to match loaded cards.
- No regression to company links, counts, or tier grouping.

