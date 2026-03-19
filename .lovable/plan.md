

# Plan: Replace Glyph Heatmap with New Coding Activity Heatmap from GitHub Repo

I successfully accessed your `coding-flow-viz` repo and have read all source files. Here is the integration plan.

---

## Source Files from Your Repo

The repo contains 7 key files to integrate:

| Repo File | Purpose |
|-----------|---------|
| `src/components/activity/ActivityHeatmap.tsx` | Main orchestrator (metric selector, toggles, layout) |
| `src/components/activity/GlyphGrid.tsx` | SVG-based tile grid with trend line, streak path, markers |
| `src/components/activity/ActivityTooltip.tsx` | Hover tooltip with stats |
| `src/components/activity/ActivityLegend.tsx` | Visual legend (volume, quality, markers, trend) |
| `src/components/activity/InsightLines.tsx` | Text insight lines |
| `src/components/activity/RangeSummary.tsx` | Drag-select range summary panel |
| `src/components/activity/SelectionPanel.tsx` | Selection summary panel |
| `src/lib/activity-data.ts` | Types, constants, mock data generator, helpers |
| `src/hooks/use-activity-selection.ts` | Drag-select + hover interaction hook |

---

## Step 1: Delete Old Glyph Heatmap Files

Remove these 8 files:
- `src/components/analytics/GlyphHeatmap.tsx`
- `src/components/analytics/GlyphTile.tsx`
- `src/components/analytics/GlyphTooltip.tsx`
- `src/components/analytics/GlyphSelectionPanel.tsx`
- `src/components/analytics/GlyphStoryInsights.tsx`
- `src/components/analytics/GlyphLegend.tsx`
- `src/components/analytics/index.ts`
- `src/lib/glyphHeatmapData.ts`

---

## Step 2: Create New Heatmap Files

Place the repo code into `src/components/heatmap/` and `src/lib/`:

| New File | Based On |
|----------|----------|
| `src/components/heatmap/ActivityHeatmap.tsx` | Repo's ActivityHeatmap.tsx |
| `src/components/heatmap/GlyphGrid.tsx` | Repo's GlyphGrid.tsx |
| `src/components/heatmap/ActivityTooltip.tsx` | Repo's ActivityTooltip.tsx |
| `src/components/heatmap/ActivityLegend.tsx` | Repo's ActivityLegend.tsx |
| `src/components/heatmap/InsightLines.tsx` | Repo's InsightLines.tsx |
| `src/components/heatmap/RangeSummary.tsx` | Repo's RangeSummary.tsx |
| `src/components/heatmap/SelectionPanel.tsx` | Repo's SelectionPanel.tsx |
| `src/lib/activityData.ts` | Repo's activity-data.ts |
| `src/hooks/useActivitySelection.ts` | Repo's use-activity-selection.ts |

---

## Step 3: Adapt for CodeTrackX Theme

The repo includes its own CSS variables (`--tile-empty-bg`, `--tile-border`, `--ring-hover`, `--ring-selected`, `--trend-color`) for both light and dark modes. These need to be added to `src/index.css` dark theme section to match CodeTrackX's neon cyan/dark cyber palette:

```css
--tile-empty-bg: rgba(255, 255, 255, 0.06);
--tile-border: rgba(255, 255, 255, 0.10);
--ring-hover: rgba(59, 130, 246, 0.45);
--ring-selected: rgba(59, 130, 246, 0.85);
--trend-color: #60A5FA;
```

---

## Step 4: Replace Mock Data with Real Database Queries

The repo uses `generateMockData()` which creates fake `DayData[]`. I will replace this with a `useHeatmapData` hook that queries two existing tables:

**Existing tables available:**
- `user_activity` — has `activity_date`, `problems_solved`, `user_id`
- `challenge_completions` — has `completed_at`, `challenge_id`, `user_id`, `xp_earned`
- `profiles` — has `streak`, `xp`, `division`

**Data transformation:**
- Query `user_activity` for last 52 weeks grouped by date
- Query `challenge_completions` joined with `challenges` to get difficulty per day
- Map each day to the `DayData` interface: `submissions`, `accepted`, `wrong`, `solved`, `hardSolved`, `timeSpent`, `weekIndex`, `dayIndex`
- For fields not directly in the DB (like `timeSpent`), estimate from `runtime_ms` in `challenge_completions` or default to 0

**Stats cards** in `GlyphHeatmapPage.tsx` will pull from:
- Current streak → `profiles.streak`
- Total XP → `profiles.xp`
- Longest streak → computed from consecutive active days in `user_activity`
- Peak activity day → max `problems_solved` from `user_activity`

---

## Step 5: Update Page and Routing

**`src/pages/GlyphHeatmapPage.tsx`** — Update to import from `src/components/heatmap/ActivityHeatmap` instead of old `GlyphHeatmap`. Update stats cards to use real data from the new hook. Keep the same route `/analytics/glyph-heatmap`.

**`src/components/layout/AppSidebar.tsx`** — Update label from "Glyph Heatmap" to "Activity Heatmap".

**`src/App.tsx`** — Update import path (same route stays).

---

## Step 6: Trend Line + Insights Connected to Real Data

The repo's `GlyphGrid.tsx` already has:
- `computeWeeklyTrend()` — calculates 7-day rolling average as SVG Catmull-Rom spline
- `computeLongestStreakPath()` — draws streak connection line
- Both will work automatically once real `DayData[]` is provided

`generateInsights()` computes most consistent days, best week, and longest streak — this will also work with real data once `generateMockData()` is replaced.

---

## Step 7: Performance

Already built into the repo code:
- `useMemo` on all heavy calculations (tile data, trend paths, insights)
- `memo` on individual `GlyphTile` components
- `useCallback` on all event handlers
- No additional optimization needed

---

## Summary of All File Changes

| Action | File |
|--------|------|
| **DELETE** | `src/components/analytics/GlyphHeatmap.tsx` |
| **DELETE** | `src/components/analytics/GlyphTile.tsx` |
| **DELETE** | `src/components/analytics/GlyphTooltip.tsx` |
| **DELETE** | `src/components/analytics/GlyphSelectionPanel.tsx` |
| **DELETE** | `src/components/analytics/GlyphStoryInsights.tsx` |
| **DELETE** | `src/components/analytics/GlyphLegend.tsx` |
| **DELETE** | `src/components/analytics/index.ts` |
| **DELETE** | `src/lib/glyphHeatmapData.ts` |
| **CREATE** | `src/components/heatmap/ActivityHeatmap.tsx` |
| **CREATE** | `src/components/heatmap/GlyphGrid.tsx` |
| **CREATE** | `src/components/heatmap/ActivityTooltip.tsx` |
| **CREATE** | `src/components/heatmap/ActivityLegend.tsx` |
| **CREATE** | `src/components/heatmap/InsightLines.tsx` |
| **CREATE** | `src/components/heatmap/RangeSummary.tsx` |
| **CREATE** | `src/components/heatmap/SelectionPanel.tsx` |
| **CREATE** | `src/lib/activityData.ts` |
| **CREATE** | `src/hooks/useHeatmapData.ts` |
| **CREATE** | `src/hooks/useActivitySelection.ts` |
| **UPDATE** | `src/pages/GlyphHeatmapPage.tsx` |
| **UPDATE** | `src/components/layout/AppSidebar.tsx` |
| **UPDATE** | `src/App.tsx` |
| **UPDATE** | `src/index.css` (add CSS variables) |

