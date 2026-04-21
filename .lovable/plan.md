

# Fix: Quick Match never pairs (queue grows forever)

## Root cause

1. **Nothing ever calls `mm_tick`.** The matchmaking engine is purely pull-based — `mm_tick` scans the queue and creates matches — but there is no cron, no trigger, no client invoker. Both accounts insert into `battle_queue` with `status='searching'` and stay there. Logs confirm zero invocations of `matchmaking-tick` / `match-ticker` while the user has been queueing.
2. **`get_recent_battles` and `get_online_warriors` still reference `profiles.email`** (same bug class as `get_match_result` we fixed earlier), throwing 400 on every Battle entry render. Doesn't block matchmaking but pollutes the entry page.

## Fix (two parts)

### Part 1 — Make matchmaking actually tick

Pick the simplest reliable trigger that doesn't require a cron we can't schedule from migrations: **kick `mm_tick` from inside `mm_enqueue` itself, and again from `check_battle_queue_status` while the caller is searching.** This guarantees that whenever any client either joins the queue or polls its status, the matcher runs against the current queue. With both accounts polling every 2s, pairing happens within one poll cycle.

New migration:

- **Patch `mm_enqueue(...)`**: at the end, right before `RETURN`, call `PERFORM public.mm_tick();` inside an exception-swallowing block so a tick failure can't roll back the enqueue.
- **Patch `check_battle_queue_status()`**: when it finds the caller in `status='searching'`, also `PERFORM public.mm_tick();` (same defensive wrapper) before returning. This makes the existing 2s client poll double as a matcher heartbeat. No new infra, no cron secret, no edge function changes.
- **Defensive backstop**: also schedule `mm_tick` via `pg_cron` every 5 seconds *if* the `pg_cron` extension is already enabled in this project. Wrap in `DO $$ ... IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN ... END IF; END $$;` so the migration is safe either way.
- **One-shot drain**: `SELECT public.mm_tick();` at the end of the migration to immediately pair the two accounts currently stuck in queue (`tonystark` queue id `d0f45de4…` + the other account).

### Part 2 — Kill the remaining `p.email` references

- **Patch `get_recent_battles(p_limit int)`**: replace `COALESCE(p.username, p.email, …)` with `COALESCE(p.username, 'warrior')`. Same shape as the earlier `get_match_result` fix.
- **Patch `get_online_warriors(p_limit int)`**: same replacement.

(Both functions exist; we just rewrite them with `CREATE OR REPLACE FUNCTION` keeping the existing signature/return type.)

## Files touched

- **New migration**: patch `mm_enqueue` and `check_battle_queue_status` to call `mm_tick`; conditionally add a 5s `pg_cron` job; rewrite `get_recent_battles` and `get_online_warriors` to drop `p.email`; one-shot `SELECT mm_tick()` to flush the current stuck queue.
- **No frontend changes.** The existing `useMatchmaking` poll already triggers the new in-RPC tick path.

## Verification

1. Both stuck accounts: within ~2s of the next `check_battle_queue_status` poll → status flips to `matched`, `useMatchmaking` redirects to `/battle/session/<id>`, workspace loads.
2. Fresh test: log out, queue both accounts again from a clean state → pairing happens within 4s, both navigate to the same session id.
3. `select count(*) from battle_queue where status='searching' and created_at < now() - interval '30 seconds'` → trends to 0 instead of growing.
4. Battle entry page: `get_recent_battles` and `get_online_warriors` return 200, no more `column p.email does not exist` in network tab.
5. `select count(*) from battle_matches where created_at > now() - interval '5 minutes'` increments after every successful pairing.

