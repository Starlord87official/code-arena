

# OA Arena Module -- Implementation Plan

## Overview

This plan adds a complete **OA Arena (Online Assessment Simulator)** module to CodeTrackX. The module provides a real-OA simulation experience with timed, sectioned assessments, integrity monitoring, scoring, and detailed review reports. It integrates into the existing left sidebar navigation and follows the established dark cyber-glass aesthetic.

Due to the scale of this feature, it is structured into **4 implementation phases**, each delivering a usable increment.

---

## Phase 1: Database Schema + Sidebar + OA Home Page

### 1.1 Database Migration

Create the following tables with RLS policies:

**`oa_packs`** -- Assessment pack definitions (SDE Intern, SDE-1, etc.)
- `id` (uuid, PK), `title` (text), `description` (text), `role_track` (text), `difficulty` (text), `duration_minutes` (int), `tags` (text[]), `icon` (text), `is_featured` (bool), `order_index` (int), `created_at` (timestamptz)
- RLS: SELECT for authenticated users (read-only for students)

**`oa_assessments`** -- Individual assessments within a pack
- `id` (uuid, PK), `pack_id` (uuid, FK to oa_packs), `title` (text), `duration_minutes` (int), `rules_json` (jsonb), `sections_json` (jsonb), `order_index` (int), `created_at` (timestamptz)
- RLS: SELECT for authenticated users

**`oa_questions`** -- Question bank (coding, MCQ, debug, SQL)
- `id` (uuid, PK), `assessment_id` (uuid, FK), `section_index` (int), `question_order` (int), `type` (text: coding/mcq/debug/sql), `statement` (text), `difficulty` (text), `tags` (text[]), `config_json` (jsonb -- holds MCQ options, code template, test cases, SQL schema, etc.), `points` (int), `created_at` (timestamptz)
- RLS: SELECT for authenticated users (questions visible only during/after attempt)

**`oa_attempts`** -- User attempt records
- `id` (uuid, PK), `user_id` (uuid, FK), `assessment_id` (uuid, FK), `started_at` (timestamptz), `submitted_at` (timestamptz), `score` (int), `max_score` (int), `integrity_json` (jsonb), `status` (text: active/submitted/abandoned), `created_at` (timestamptz)
- RLS: Users can SELECT/INSERT/UPDATE their own attempts

**`oa_attempt_answers`** -- Per-question answers within an attempt
- `id` (uuid, PK), `attempt_id` (uuid, FK), `question_id` (uuid, FK), `answer` (text), `status` (text: unseen/seen/attempted/solved/marked), `time_spent_sec` (int), `score` (int), `created_at` (timestamptz), `updated_at` (timestamptz)
- RLS: Users can CRUD their own answers (via attempt ownership)

**`oa_readiness`** -- User OA readiness tracking
- `id` (uuid, PK), `user_id` (uuid, FK), `readiness_score` (int, 0-100), `oa_streak` (int), `total_attempts` (int), `best_score` (int), `weak_topics` (text[]), `updated_at` (timestamptz)
- RLS: Users can SELECT/UPDATE their own readiness

Seed data: 2 packs (SDE Intern 60min, SDE-1 90min), each with 4 questions (mix of MCQ, coding, debug, SQL). All questions are original.

### 1.2 Sidebar Navigation Update

In `AppSidebar.tsx`, add a new primary nav item:

```text
primaryNavItems:
  ...existing items...
  { path: '/oa', label: 'OA Arena', icon: ClipboardCheck, highlight: true }
```

Placed after "Battle" and before "Leaderboard". Uses the same icon style, spacing, hover glow, and active state as existing items. The `highlight: true` flag shows a "NEW" badge.

Active state detection: matches `/oa` and `/oa/*` paths.

### 1.3 Routes

Add to `App.tsx`:

```text
/oa                        -- OA Arena Home
/oa/packs                  -- All Packs (filterable grid)
/oa/pack/:packId           -- Pack Detail
/oa/start/:assessmentId    -- Instructions Screen
/oa/attempt/:attemptId     -- OA Room (exam interface)
/oa/submit/:attemptId      -- Final Submit confirmation
/oa/report/:attemptId      -- Post-OA Review Report
/oa/history                -- OA History
```

### 1.4 OA Arena Home Page (`/oa`)

Layout matches existing page patterns (Challenges, Championship):

- **Hero Section**: Headline "Train for Real OAs. Timed. Scored. Reviewed." with primary CTA "Start a Mock OA"
- **Company-Style Packs**: Horizontal scrollable cards (glassmorphism, gradient border)
- **Role Tracks**: SDE Intern, SDE-1, Backend, Frontend filter chips
- **Readiness Snapshot**: Card showing latest OA score, weak topics, OA streak (pulled from `oa_readiness` table)

Visual style: Uses `arena-card`, `font-display`, neon-blue accents, `bg-primary/10` badge backgrounds -- identical to Challenges and Championship pages.

---

## Phase 2: Pack Browsing + Assessment Instructions

### 2.1 All Packs Page (`/oa/packs`)

- Filterable grid with chips: Role, Difficulty, Duration (30/60/90), Topics
- Each pack card shows: assessment count, avg duration, skills tested, difficulty badge, "Preview Format" and "Start" buttons
- Uses the same `ChallengePathCard`-like glassmorphism cards

### 2.2 Pack Detail Page (`/oa/pack/:packId`)

- Overview section with description, skills covered, OA rules summary
- List of assessments inside the pack (Mock 1, Mock 2, etc.)
- CTA: "Start Assessment" for each mock

### 2.3 Instructions Screen (`/oa/start/:assessmentId`)

Real OA-style pre-exam page:

- Rules display: fullscreen recommended, tab switching logged, timer info, navigation policy, scoring rules
- System checklist: internet stability, keyboard shortcuts awareness
- Buttons: "Enter Fullscreen & Begin" (creates attempt record, navigates to OA Room) and "Cancel"

---

## Phase 3: OA Room (Core Exam Experience) + Submit

### 3.1 OA Room (`/oa/attempt/:attemptId`)

This is a **full-width exam layout** (no sidebar needed since it uses the existing Layout but content fills available space):

**Top Bar** (inside content area):
- Countdown timer, section name, progress indicator (X/Y questions), Submit button

**Left Panel** (question navigator):
- Section tabs (A, B, C)
- Question grid with status indicators (color-coded: unseen/seen/attempted/solved/marked)

**Center Panel** (problem display):
- Renders based on question type:
  - **Coding**: Problem statement + code textarea (syntax-highlighted) + console output area
  - **MCQ**: Statement + radio/checkbox options (single/multi correct)
  - **Debug**: Broken code display + editable fix area
  - **SQL**: Schema display + query editor + results preview

**Right Panel** (for coding questions: test output; for MCQ: answer summary)

**Features**:
- Auto-save answers every 5 seconds (upsert to `oa_attempt_answers`)
- Tab visibility change detection (`document.visibilitychange`) -- logged to `integrity_json`
- Fullscreen exit detection -- logged but not enforced (realism only)
- Mark-for-review toggle per question
- Section-wise or free navigation (configurable per assessment via `rules_json`)

### 3.2 Final Submit (`/oa/submit/:attemptId`)

- Warning: "You cannot re-enter after submission"
- Checklist: unanswered count, marked-for-review count
- Confirm Submit button (updates attempt status to 'submitted', records `submitted_at`)

---

## Phase 4: Report + History + Readiness

### 4.1 OA Review Report (`/oa/report/:attemptId`)

Detailed post-OA analysis page:

- **Score Breakdown**: Total score, section scores, time used, score bar
- **Time Analysis**: Time per question bar chart, reading vs coding vs debugging breakdown
- **Mistake Patterns**: Edge cases missed, complexity issues, off-by-one errors (derived from answer status + question tags)
- **Skill Gap Heatmap**: Visual grid showing strength/weakness per tag (Arrays, Hashing, DP, Graphs, SQL, etc.)
- **Retry Mode**: Button to retry only failed questions (creates new attempt with subset)
- **Explain Mode**: Hints first, full approach after retry or cooldown timer

### 4.2 OA History (`/oa/history`)

- Table/card list of all past attempts
- Filters: pack, date range, score range
- Best score highlight
- Improvement trend line chart (using recharts, already installed)

### 4.3 Readiness Score

- Computed from: latest scores, attempt frequency, weak topic coverage
- Updated after each submission
- Displayed on OA Home and Dashboard

---

## File Structure

```text
src/
  pages/
    OAArena.tsx              -- Home page
    OAPacks.tsx              -- All packs grid
    OAPackDetail.tsx         -- Single pack detail
    OAInstructions.tsx       -- Pre-exam instructions
    OARoom.tsx               -- Core exam experience
    OASubmit.tsx             -- Final submit confirmation
    OAReport.tsx             -- Post-OA review report
    OAHistory.tsx            -- Attempt history

  components/oa/
    OAHeroSection.tsx        -- Home page hero
    OAPackCard.tsx           -- Pack display card
    OAReadinessSnapshot.tsx  -- Readiness stats card
    OAQuestionNavigator.tsx  -- Left panel question grid
    OATimerBar.tsx           -- Top bar with countdown
    OACodingPanel.tsx        -- Coding question renderer
    OAMCQPanel.tsx           -- MCQ question renderer
    OADebugPanel.tsx         -- Debug question renderer
    OASQLPanel.tsx           -- SQL question renderer
    OAScoreBreakdown.tsx     -- Report score section
    OASkillGapHeatmap.tsx    -- Report skill gap visual
    OAIntegrityBadge.tsx     -- Integrity summary display

  hooks/
    useOAPacks.ts            -- Fetch packs and assessments
    useOAAttempt.ts          -- Attempt lifecycle (create, update, submit)
    useOAQuestions.ts        -- Fetch questions for an assessment
    useOAReadiness.ts        -- Readiness score management
    useOAHistory.ts          -- Fetch user's attempt history
    useOAIntegrity.ts        -- Tab switch / fullscreen monitoring

  lib/
    oaMockData.ts            -- Seed data constants for MVP
    oaScoring.ts             -- Score calculation utilities
```

---

## Technical Details

### Patterns Followed
- **Auth guard**: Same `useAuth()` + `<Navigate to="/auth">` pattern as Dashboard, Challenges, Roadmap
- **Query hooks**: TanStack React Query with `queryKey` conventions matching existing hooks
- **Styling**: `arena-card`, `font-display`, `font-heading`, glassmorphism borders, neon-blue accents, `bg-primary/10` badges
- **Card radius**: `rounded-xl` / `rounded-2xl` matching Roadmap and Championship
- **Spacing**: `container mx-auto px-4 max-w-6xl` matching GlyphHeatmap/Dashboard
- **State management**: React Query for server state, local useState for UI state
- **No external dependencies added** -- uses existing recharts, framer-motion, lucide-react

### Integrity Monitoring (Non-Punitive)
- `document.addEventListener('visibilitychange')` to count tab switches
- `document.addEventListener('fullscreenchange')` to detect fullscreen exits
- Copy/paste event listeners on the code editor
- All logged to `integrity_json` on the attempt record, shown in report

### Auto-Save
- `setInterval` every 5 seconds during attempt
- Upserts current answer to `oa_attempt_answers` via Supabase
- Debounced to avoid excessive writes

### Scoring
- Coding: partial score based on test cases passed (public + hidden, defined in `config_json`)
- MCQ: full marks for correct, 0 for incorrect (no negative marking in MVP)
- Debug: binary pass/fail
- SQL: validated against expected output schema

### Question Data Model (`config_json` examples)

For **Coding**:
```json
{
  "starterCode": { "javascript": "function solve(arr) { ... }" },
  "testCases": [
    { "input": "[1,2,3]", "output": "6", "isHidden": false, "weight": 10 },
    { "input": "[0]", "output": "0", "isHidden": true, "weight": 20 }
  ]
}
```

For **MCQ**:
```json
{
  "options": ["O(n)", "O(n log n)", "O(n^2)", "O(1)"],
  "correctIndices": [1],
  "multiSelect": false
}
```

For **Debug**:
```json
{
  "brokenCode": "function sort(arr) { ... }",
  "language": "javascript",
  "hint": "Check the comparison operator"
}
```

For **SQL**:
```json
{
  "schema": "CREATE TABLE users (id INT, name TEXT, age INT);",
  "sampleData": "INSERT INTO users VALUES (1, 'Alice', 25);",
  "expectedOutput": "Alice"
}
```

---

## Scope Control

This plan covers the **full MVP**. Implementation will proceed phase by phase. Each phase produces a functional increment:

- **Phase 1**: Users can see the OA Arena in the sidebar, browse the home page, and see pack cards
- **Phase 2**: Users can drill into packs and read instructions before starting
- **Phase 3**: Users can take a full timed assessment with auto-save and integrity tracking
- **Phase 4**: Users can review detailed reports, track history, and see their readiness score

