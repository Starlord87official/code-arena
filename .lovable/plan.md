

# Step 8 — Anti-Cheat + Integrity Layer

## Goal
Detect and act on suspicious behavior during ranked battles: tab switches, paste storms, impossible solve times, code similarity across opponents, and submission flooding. Flags surface to admins via `anticheat_flags` (table already exists) and can auto-invalidate matches when severity is high.

## Backend changes

### 1. Migration: integrity tracking + similarity hashing

**Extend `battle_participants`** (additive):
- `tab_switches int not null default 0`
- `paste_count int not null default 0`
- `paste_chars_total int not null default 0`
- `focus_lost_ms bigint not null default 0`
- `integrity_score int not null default 100` (drops as flags accumulate)

**Extend `battle_match_submissions`** (additive):
- `code_normalized_hash text` (whitespace/identifier-stripped hash for cross-user similarity)
- `paste_ratio numeric(4,3)` (pasted chars / total chars at submit time)
- `time_since_problem_open_sec int` (suspiciously low → flag)

**New table `submission_similarity`** (pairs of suspicious matches):
- `id uuid pk`, `match_id uuid`, `submission_a uuid`, `submission_b uuid`
- `similarity numeric(4,3)`, `algorithm text default 'token-jaccard'`
- `created_at timestamptz default now()`
- RLS: admin read only.

### 2. RPCs

- **`record_integrity_event(p_match_id uuid, p_kind text, p_payload jsonb)`** — caller-only, throttled (max 30/min/user via in-function check). Updates the participant counters atomically based on `p_kind`:
  - `tab_switch` → increments `tab_switches`, accumulates `focus_lost_ms`.
  - `paste` → increments `paste_count`, adds chars to `paste_chars_total`.
  - `devtools_open`, `fullscreen_exit` → counters + immediate `anticheat_flags` insert at severity 2.
  - Recomputes `integrity_score = greatest(0, 100 - tab_switches*5 - paste_count*2 - (focus_lost_ms/60000)*3)`.
  - When score crosses 50, inserts a `pending_review` flag of kind `behavioral`. When ≤ 20, inserts severity-4 flag and notifies via `pg_notify('anticheat', match_id)`.

- **`scan_submission_integrity(p_submission_id uuid)`** — `SECURITY DEFINER`, called by `finalize_judge_job` after a verdict is written.
  - Computes normalized code hash (strip comments/whitespace, lowercase identifiers via simple regex pass).
  - Compares against opponent submissions in same match for same problem; if Jaccard token similarity ≥ 0.85, inserts row in `submission_similarity` and a severity-3 `code_similarity` flag for both users.
  - Checks `time_since_problem_open_sec`: if `verdict='accepted'` AND `< 20` for medium, `< 60` for hard → severity-2 `impossible_solve_time` flag.
  - Checks paste-driven solves: `paste_ratio > 0.7` AND `verdict='accepted'` → severity-3 `paste_solution` flag.

- **`apply_integrity_review(p_flag_id uuid, p_action text)`** — admin-only.
  - `p_action` ∈ `dismiss` | `warn` | `invalidate_match` | `forfeit_user`.
  - On `invalidate_match` → sets `battle_matches.invalidated_reason`, calls `finalize_match(match_id, 'integrity_invalidated')` with no rating change (skips ELO step via flag).
  - On `forfeit_user` → marks participant `is_forfeit=true`, calls `finalize_match(match_id, 'integrity_forfeit')`.
  - Logs decision into `battle_event_log` and updates flag `status='actioned'/'dismissed'`.

### 3. `finalize_match` patch

- Accept new internal arg `p_skip_rating boolean default false`. When true (integrity invalidation), skip ELO updates and XP, still write `battle_history` row marked `winner='invalidated'`.

### 4. Edge function: `match-ticker` extension

- After `tick_active_matches`, run `auto_action_critical_flags()` (new helper): for any `pending_review` flag with `severity >= 4` older than 60s with no admin action, auto-invalidate the match. Returns count actioned.

## Frontend changes

### 1. New hook: `src/hooks/useBattleIntegrity.ts`
- Mounted in `BattleSession.tsx` for active matches only.
- Listens to:
  - `document.visibilitychange` → on hidden, start timer; on visible, post `tab_switch` with `focus_lost_ms`.
  - `paste` event on the editor container → captures pasted char count, posts `paste`.
  - `fullscreenchange` (when match config requires fullscreen) → posts `fullscreen_exit`.
  - Heuristic devtools detection via `window` size delta (best-effort).
- Calls `record_integrity_event` (debounced 500ms per event kind).
- Surfaces local toast warnings at `integrity_score` thresholds (80, 50, 20) so the user sees the consequence before being flagged.

### 2. `src/components/battle-v2/workspace/CodeEditor.tsx`
- Wire `onPaste` → forwards `{chars, source}` to `useBattleIntegrity`.
- Track `time_since_problem_open_sec` per problem (timestamp on first focus) and pass into `submit_match_solution` payload (added param).

### 3. `src/components/battle-v2/workspace/StatusBar.tsx`
- Add a small "INTEGRITY: 100" indicator that turns ember below 50 and crimson below 20. Read from `participants` returned by `useBattleRealtime` (already streams the new column).

### 4. Admin: `src/pages/admin/AdminBattles.tsx`
- New tab "Integrity Flags" listing `anticheat_flags` joined with match + user. Per-row actions: Dismiss / Warn / Invalidate / Forfeit, calling `apply_integrity_review`.
- Read-only table for `submission_similarity` showing the two side-by-side code blobs.

### 5. `submit_match_solution` signature
- Add params `p_paste_ratio numeric`, `p_time_since_open_sec int`. CodeEditor passes them; server stores into the new submission columns and uses them in `scan_submission_integrity`.

## Files touched

- `supabase/migrations/<new>.sql` — column adds, `submission_similarity`, `record_integrity_event`, `scan_submission_integrity`, `apply_integrity_review`, `auto_action_critical_flags`, `finalize_match` patch, `submit_match_solution` patch.
- `supabase/functions/match-ticker/index.ts` — call `auto_action_critical_flags`.
- `supabase/functions/judge-worker/index.ts` — invoke `scan_submission_integrity` after `finalize_judge_job`.
- `src/hooks/useBattleIntegrity.ts` — new.
- `src/pages/BattleSession.tsx` — mount hook, pass timing/paste metadata to submit.
- `src/components/battle-v2/workspace/CodeEditor.tsx` — paste capture + open-timestamp.
- `src/components/battle-v2/workspace/StatusBar.tsx` — integrity indicator.
- `src/pages/admin/AdminBattles.tsx` — integrity tab + actions.

## Verification

1. Switch tabs 11+ times during a battle → `tab_switches` rises, integrity score drops below 50, severity-2 flag appears in admin panel.
2. Paste a full solution → `paste_count` rises, on accept a `paste_solution` flag fires.
3. Two test users submit near-identical code → `submission_similarity` row + `code_similarity` flags for both.
4. Admin clicks "Invalidate" → match transitions to `completed` with `invalidated_reason` set, no ELO change applied.
5. Severity-4 flag with no admin action for >60s → ticker auto-invalidates the match.

## Out of scope (deferred)

- Webcam/proctoring stream.
- Network-level VPN or multi-account detection.
- ML-based stylometry (token Jaccard only in MVP).
- User-facing appeal workflow for invalidations.

