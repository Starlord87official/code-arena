

## Make `/challenges` Feel Native to the Dashboard

Bring the Challenge Arena's visual language in line with the Dashboard by adopting the same Blue Lock glass surfaces, sector header, and tile rhythm that already exist in `globals.css` / `index.css` and shared `bl/*` components.

### Scope

Only visual/structural alignment of `/challenges` (and the cards it renders). No changes to challenge data, routing, unlock logic, or beta-status gating.

### Changes

1. **`src/pages/Challenges.tsx` — adopt dashboard shell**
   - Wrap the page in the same outer container the Dashboard uses (max width, padding, vertical rhythm).
   - Replace the current ad-hoc title block with `PageHeader` from `src/components/bl/PageHeader.tsx`:
     - `sector="002"` (Dashboard is `001`), `tag="ARENA"`, display title "Challenge Arena", subtitle matching current copy.
     - Move any right-side actions (filters, search, view toggle) into the `right` slot for parity with Dashboard.
   - Group sections (Daily Challenge, Packs, Companies, All Problems, etc.) using `SectionHeader` from `src/components/bl/SectionHeader.tsx` so spacing and type scale match the Dashboard.
   - Convert section wrappers from raw `div`s / legacy `arena-card` to `GlassPanel` (`src/components/bl/GlassPanel.tsx`) with `corners` on hero-level panels and `sideStripe` on key call-out blocks (Daily Challenge, Pack of the Day) — same pattern Dashboard uses for `StatTile` rows.
   - Use the existing `grid-pattern` background already provided by `Layout` — no new background work.

2. **`src/components/cards/ChallengeCard.tsx` — align with Dashboard tile language**
   - Replace `arena-card p-5 rounded-xl` with `GlassPanel` (`padding="md"`, optional `corners` on hover state).
   - Tighten internal spacing to match `StatTile` rhythm (header row, body, footer separator).
   - Keep all current content: difficulty pill, solved check, title, description, tag chips, company badges, revision button, XP, solved count, success rate.
   - Update difficulty pill, tag chips, and meta row to use the dashboard's token classes (`text-text`, `text-text-dim`, `text-text-mute`, `text-neon`, `text-electric`) instead of `text-muted-foreground` / `text-primary` so it visually matches Dashboard tiles.
   - Hover state: subtle neon edge + chevron translate, consistent with Dashboard cards.

3. **Sub-cards used on `/challenges`**
   - `src/components/challenge/DailyChallengeBanner.tsx`: re-skin to `GlassPanel strong corners sideStripe` with the same hero treatment as the Dashboard's top "today" tile.
   - `src/components/cards/ContestCard.tsx` (if rendered on this page) and any "pack" tiles: switch outer wrapper to `GlassPanel` and align typography tokens. No content/logic changes.

4. **Typography + tokens**
   - Section titles: `font-display` with the same size/tracking as Dashboard `SectionHeader`.
   - Body and meta text: dashboard's `text-text-dim` / `text-text-mute` instead of `text-muted-foreground`.
   - Numerics (XP, solve count, success rate): `font-mono` like Dashboard stat values.

5. **No changes**
   - Do not touch `globals.css` / `index.css` (utilities already exist).
   - Do not change routing, unlock rules, beta-status badges, mock data, or any hooks.
   - Keep all existing accessibility (links, focus states) intact.

### Files to Update

- `src/pages/Challenges.tsx`
- `src/components/cards/ChallengeCard.tsx`
- `src/components/challenge/DailyChallengeBanner.tsx`
- `src/components/cards/ContestCard.tsx` *(only if it renders on `/challenges`; otherwise skip)*

### Expected Result

`/challenges` reads as a sibling page of `/dashboard`: same sector header, same glass panels with neon corners and side stripes, same type scale and color tokens, same tile rhythm — without any change to challenge logic, data, or gating.

### Acceptance

- `/challenges` header matches Dashboard's `PageHeader` style (`SECTOR // 002_ARENA`).
- Sections use `SectionHeader` and `GlassPanel`, not legacy `arena-card`.
- Challenge tiles use the same surface, typography tokens, and hover treatment as Dashboard tiles.
- Daily Challenge banner reads as a hero glass panel consistent with Dashboard's hero tile.
- No regression to challenge navigation, revision marking, company badges, or beta-locked arenas.

