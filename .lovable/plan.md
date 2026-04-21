

# Plan: Apply Blue Lock Design to 8 Remaining Dashboard Components

You've sent the final 8 reference components. I'll port each into the matching existing CodeTrackX file, preserving all real-data hooks (Supabase queries, mutations, loading/empty states) — only swapping visual class names and structure.

---

## File Mapping (Reference → Existing File)

| Reference Upload | Target File in Project |
|---|---|
| `start-solving.tsx` | `src/components/dashboard/RecommendedNextStep.tsx` *(or inline section in `Dashboard.tsx`)* |
| `recommended-step.tsx` | Inline `Recommended Next Step` block in `src/pages/Dashboard.tsx` |
| `learning-path.tsx` | `src/components/dashboard/LearningPathCard.tsx` *(new — extracts roadmap preview from Dashboard)* |
| `daily-goals.tsx` | `src/components/dashboard/TargetCard.tsx` |
| `interview-readiness.tsx` | `src/components/dashboard/InterviewReadinessCard.tsx` |
| `areas-to-improve.tsx` | `src/components/dashboard/AreasToImproveCard.tsx` |
| `revision-queue.tsx` | `src/components/dashboard/RevisionQueueCard.tsx` |
| `spaced-repetition.tsx` | `src/components/revision/RevisionSummaryCard.tsx` |
| `rivals-nearby.tsx` | `src/components/dashboard/RivalsSection.tsx` |

---

## What Changes in Each File

For every component the pattern is **identical**:

1. **Outer wrapper** → `relative bl-glass overflow-hidden` (drop `arena-card`, `rounded-xl`)
2. **Header tags** → `font-display text-[10px]–[11px] font-bold tracking-[0.28em]` w/ neon/ember icon
3. **Active badges** → bordered chips: `border border-neon/40 bg-neon/10 text-neon font-display text-[9px] tracking-[0.2em]`
4. **Numbers** → `font-display tabular-nums` + `text-glow` / `text-glow-ember` for hero values
5. **Progress bars** → `h-1.5 bl-bar-track` w/ `bg-gradient-to-r from-neon to-electric` (or ember variants)
6. **List rows** → `border border-line/60 bg-void/40` + `hover:border-neon/40 hover:bg-neon/[0.03]` w/ `font-mono` numeric prefix
7. **Buttons** → `bl-btn-primary bl-pulse` for CTAs
8. **Body text** → `text-text-dim` / `text-text-mute`
9. **Empty-state hero icons** → `bl-clip-notch` w/ `bl-pulse` / `bl-pulse-ember` halo + blurred glow

---

## Logic Preserved (Untouched)

| Component | Real-data hook kept |
|---|---|
| `TargetCard` | `useTargets()` — daily/weekly/monthly + streak + edit mode |
| `InterviewReadinessCard` | `useInterviewReadiness()` — 0–100 IRS w/ trend |
| `AreasToImproveCard` | `useWeaknessDetection()` — stuck >14d, missed revisions |
| `RevisionQueueCard` | `useRevisionQueue()` + `useCompleteRevisionItem()` — overdue/due/upcoming + complete mutation |
| `RevisionSummaryCard` | `useRevisions()` due/upcoming counts |
| `RivalsSection` | empty-state Pioneer card driven by current user |
| `LearningPathCard` *(new)* | `useRoadmap()` — currently learning topics + XP + progress |
| Dashboard "Recommended Next Step" | `useRoadmap()` first unlocked topic |

The reference designs use mock arrays — those become props/hook output in the real components. Empty states, loading skeletons, and error paths from existing code are kept and re-skinned.

---

## Special Notes

- **`TargetCard` rename**: visual title becomes `KILL COUNT` per reference, but edit-mode (`Edit2/Check/X` controls) and the `Flame` streak block are retained inline above the goals. Streak block re-skinned w/ ember tokens.
- **`LearningPathCard` (new file)**: extracted as its own component so Dashboard can mount the rich roadmap preview without bloating `Dashboard.tsx`. Fed by existing `useRoadmap()`. Lock/learning/complete states map to reference's `Topic.status`.
- **`RecommendedNextStep`**: implemented as inline JSX inside `Dashboard.tsx` (replacing current placeholder), since it's a single hero strip that links to roadmap.
- **`RivalsSection`**: keeps `hasRivals = false` Pioneer empty state. Pioneer badge uses gold + ember halo + `bl-clip-notch`. Real-rivals branch (currently `return null`) re-skinned for future use.
- **`SpacedRepetition` ↔ `RevisionSummaryCard`**: 2-card grid (DUE TODAY / UPCOMING) wired to `useRevisions()` counts; replaces existing detailed list (RevisionQueueCard already handles the list).
- **`Dashboard.tsx`**: insert `<LearningPathCard />` and `<RecommendedNextStep />` (or inline block) into existing grid; remove redundant placeholders.

---

## Files Touched

**Edited (7):**
- `src/components/dashboard/TargetCard.tsx`
- `src/components/dashboard/InterviewReadinessCard.tsx`
- `src/components/dashboard/AreasToImproveCard.tsx`
- `src/components/dashboard/RevisionQueueCard.tsx`
- `src/components/dashboard/RivalsSection.tsx`
- `src/components/revision/RevisionSummaryCard.tsx`
- `src/pages/Dashboard.tsx` *(mount new pieces, re-skin Recommended Next Step inline)*

**Created (1):**
- `src/components/dashboard/LearningPathCard.tsx`

---

## Acceptance Criteria

- All 8 dashboard cards visually match the uploaded references
- Real data still flows from existing Supabase hooks (no mock arrays)
- Loading / empty / error states re-skinned, not removed
- TypeScript compiles, no prop-shape regressions
- Light theme still functions (Blue Lock dark-only — light mode unchanged)
- No routing, RBAC, or RLS impact

