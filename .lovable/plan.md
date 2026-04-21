

# Fix: "Failed to start matchmaking" — NULL elo on queue insert

## Root cause

`mm_enqueue` (called by `join_battle_queue`) does:

```sql
SELECT COALESCE(mmr,1000) INTO v_mmr FROM rank_states
  WHERE user_id = v_uid AND season_id = v_season_id;
```

When the user has **no `rank_states` row for the active season** (true for everyone who hasn't played a ranked match in the new season, including the current account), the `SELECT INTO` returns **zero rows** and overwrites `v_mmr` with `NULL`. The `COALESCE` never fires because there's no row to apply it to. That `NULL` is then inserted into `battle_queue.elo` (NOT NULL) → `23502` → toast `Failed to start matchmaking`.

A second latent issue in the same path: if `seasons` has no `status='active'` row, `v_season_id` is `NULL`, the SELECT still returns nothing, and the same crash happens.

## Fix

Migration: replace `mm_enqueue` so the MMR lookup defends against missing rows:

```sql
-- Inside mm_enqueue, replace the single SELECT with:
SELECT COALESCE(rs.mmr, 1000) INTO v_mmr
  FROM rank_states rs
 WHERE rs.user_id = v_uid
   AND (v_season_id IS NULL OR rs.season_id = v_season_id)
 LIMIT 1;

IF v_mmr IS NULL THEN
  v_mmr := 1000;          -- final hard floor when no rank_states row exists yet
END IF;
```

Also harden the INSERT itself by wrapping `v_mmr` in `COALESCE(v_mmr, 1000)` for both `elo` and `mmr` columns — defense in depth so this class of bug can never reach the table again.

## One-shot cleanup

The same migration cancels the orphan `searching` rows already piling up from failed retries:

```sql
UPDATE battle_queue
   SET status = 'cancelled'
 WHERE status = 'searching'
   AND created_at < now() - interval '10 minutes';
```

## Files touched

- **New migration**: redefine `public.mm_enqueue` with the null-safe MMR lookup + COALESCE on insert; cleanup of stale `searching` rows.

No frontend changes needed — `useMatchmaking.joinQueue` already surfaces the toast correctly; once the RPC stops throwing, "FIND MATCH" works.

## Verification

1. Click `FIND MATCH` on the `tonystark` account → no `23502` error, queue row inserted with `elo=1000, mmr=1000`, toast shows `Searching for opponent...`.
2. New user who has never played → same flow works.
3. Existing ranked player with a `rank_states` row → `v_mmr` reads their real MMR (regression check).
4. `select count(*) from battle_queue where status='searching' and created_at < now() - interval '10 minutes'` → `0` after migration.

