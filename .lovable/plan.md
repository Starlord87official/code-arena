

# Fix: Quick Match never pairs — silent 30-minute rematch cooldown blocks the only possible pair

## Root cause (real this time)

`mm_tick` IS being invoked correctly on every poll (we already verified the patched `check_battle_queue_status` calls it). The matcher even *finds* the candidate pair. But `mm_create_match` aborts every attempt:

```sql
SELECT EXISTS (
  SELECT 1 FROM battle_matches bm
  JOIN battle_participants pa ON pa.match_id = bm.id AND pa.user_id = p_user_a
  JOIN battle_participants pb ON pb.match_id = bm.id AND pb.user_id = p_user_b
  WHERE bm.ended_at IS NOT NULL
    AND bm.ended_at > now() - interval '30 minutes'
) INTO v_recent_match;

IF v_recent_match THEN RETURN NULL; END IF;
```

The two test accounts (`tonystark` a589… and 826c…) finished match `c04e83ed…` at `01:13:59`. They re-queued at `01:24:04` — only ~10 min later. The cooldown returns NULL, no match is inserted, no error surfaces, and both clients sit on `status='searching'` forever. With only **2 warriors total in the database**, this rule guarantees no pairing is ever possible during normal testing.

(Bonus: the queue table has `mm_queue` referenced nowhere — the legacy `battle_queue` IS the only queue. That part is wired correctly.)

## Fix (one migration, no client changes)

### 1. Drastically shrink the rematch cooldown — and make it tunable per env

Replace the hardcoded `30 minutes` with a much shorter window appropriate for a small/early player base, and allow ranked vs casual to differ:

- **Casual / quick mode**: cooldown reduced to `30 seconds` (just enough to stop accidental double-queues from one click). 
- **Ranked mode**: cooldown stays meaningful but drops to `2 minutes` (prevents farming, doesn't lock out tiny populations).
- **Custom duels** (`target_user_id` set): no cooldown at all — the inviter explicitly chose this opponent.

Implementation: rewrite `mm_create_match` so the cooldown branch becomes:

```sql
IF p_mode = 'custom' THEN
  -- no cooldown for direct invites
  NULL;
ELSE
  SELECT EXISTS (
    SELECT 1 FROM battle_matches bm
    JOIN battle_participants pa ON pa.match_id=bm.id AND pa.user_id=p_user_a
    JOIN battle_participants pb ON pb.match_id=bm.id AND pb.user_id=p_user_b
    WHERE bm.ended_at IS NOT NULL
      AND bm.ended_at > now() - CASE
        WHEN p_mode = 'ranked' THEN interval '2 minutes'
        ELSE interval '30 seconds'
      END
  ) INTO v_recent_match;
  IF v_recent_match THEN RETURN NULL; END IF;
END IF;
```

Everything else in `mm_create_match` stays identical.

### 2. Surface the silent NULL so we never debug this blind again

Add a `RAISE NOTICE` (debug-friendly, not an error) inside `mm_tick` when `mm_create_match` returns NULL, so future stuck-queue investigations show up in Postgres logs:

```sql
v_match := mm_create_match(v_a.user_id, v_b.user_id, v_a.mode, v_a.config_id);
IF v_match IS NULL THEN
  RAISE NOTICE 'mm_tick: pair % vs % skipped (cooldown or recent match)',
    v_a.user_id, v_b.user_id;
  CONTINUE;
END IF;
```

### 3. One-shot drain

End the migration with `SELECT public.mm_tick();` so any user currently sitting in `searching` (we already see `bea44d15…` in earlier polls) gets paired immediately under the new shorter cooldown.

## Files touched

- **New migration**: `CREATE OR REPLACE FUNCTION mm_create_match(...)` with the per-mode cooldown, `CREATE OR REPLACE FUNCTION mm_tick(...)` with the NOTICE, and a one-shot `SELECT mm_tick();`.
- **No frontend changes.** No edge function changes.

## Verification

1. Both test accounts re-queue → first poll cycle (≤2s) flips both to `status='matched'`, `useMatchmaking` redirects them into the same `/battle/session/<id>`. No 30-min wait between matches.
2. `SELECT count(*) FROM battle_queue WHERE status='searching';` after a few seconds → trends to 0.
3. Same two accounts can replay back-to-back in `quick` mode (30s gap), and back-to-back in `ranked` mode after 2 minutes.
4. Custom duel via username → pairs instantly regardless of how recently they last fought.
5. `SELECT count(*) FROM battle_matches WHERE created_at > now() - interval '5 minutes';` increments on every successful pair.
6. Postgres logs now show explicit `mm_tick: pair X vs Y skipped (cooldown…)` notices if a future stall happens, instead of silent NULLs.

