

# Fix Battle Entry: replace fake stats with real backend data

## What's wrong

The Battle Entry "COMBATANT PROFILE" card (and a couple of nearby panels) compute display values from formulas that have nothing to do with your real account, so a brand-new account looks like a level-10 Silver veteran:

| Field shown | Source today | Real source |
|---|---|---|
| `LVL 10` | `floor(elo/100)` where `elo` defaults to `1000` | `floor(profile.xp / 500) + 1` (you have `xp=485` → real level **1**) |
| `Silver` rank, `LP 1000 / 1200`, `LP TO SILVER` | hardcoded fallback `summary.elo ?? 1000`, `+200` | `rank_states.tier / division / lp` (you have no row yet → show `Unranked / Placement`) |
| `STREAK W0`, `MVPs 0`, `WIN% 0`, `W-L 0-0` | already real (`get_user_battle_summary`) | keep |
| `Daily Objective Win 3 Ranked duels 0/3` | hardcoded string + `0` | derive from real targets / accepted-today (or hide until wired) |
| Region pings `28ms / 142ms / 218ms / 96ms` | hardcoded constants in `RegionSelector` | no real source today → relabel as static reference, no fake "live" pings |

Everything else on the page (Online warriors, Recent battles, Global stats strip) already pulls from RPCs — those are fine after the earlier `p.email` fixes.

## Fix

### 1. `src/pages/Battle.tsx` — feed real level + real rank into `combatant`

- Add `useRankState()` and a tiny new `useUserLevel()` hook (calls existing `get_user_level` RPC; we already use it in `useChallengePacks`).
- Replace the `combatant` object so:
  - `level` = real XP-derived level (RPC).
  - `rank` = capitalised `rank_states.tier` + division (e.g. `BRONZE IV`); if no `rank_states` row → `"UNRANKED"`.
  - `lpCurrent` = `rank.lp ?? 0`; `lpTarget` = `100` (LP to next division) if ranked, otherwise the count of placement matches remaining (`placements_remaining ?? 5`).
  - `nextRank` = next division/tier label, or `"PLACEMENT"` if unranked.
  - Drop the `elo / 100` math and the `+200` fallbacks entirely.
- `dailyDone` / `dailyTotal` / `dailyLabel`: pull from `useTargets()` (already exists, used by Dashboard). Show `Solve N problems today` with real progress; if targets hook returns nothing, hide the daily-objective row instead of inventing `0/3`.

### 2. `src/components/battle-v2/entry/CombatantProfile.tsx` — handle "unranked" gracefully

- When `data.lpTarget === 0` or `data.rank === "UNRANKED"`, render `PLACEMENT · {placements_remaining} matches left` instead of the LP bar, so we never show `1000 / 1200` to someone who has never queued.
- Hide `topPercent` block (already conditional, just confirming).

### 3. `src/components/battle-v2/entry/RegionSelector.tsx` — stop faking pings

- Remove the hardcoded `ping: 28 / 142 / 218 / 96` numbers from `DEFAULT_REGIONS`.
- Show the region label only; replace the ping pill with a neutral `// SERVER_NODE` chip. (Real ping measurement isn't wired and we don't want fake green/amber/red dots.)

### 4. New tiny hook `src/hooks/useUserLevel.ts`

```ts
export function useUserLevel() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-level", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_level", { p_user_id: user!.id });
      if (error) throw error;
      return (data as number) ?? 1;
    },
    staleTime: 60_000,
  });
}
```

## Files touched

- `src/pages/Battle.tsx` — wire `useRankState`, `useUserLevel`, `useTargets` into the `combatant` object; remove ELO-derived level math.
- `src/components/battle-v2/entry/CombatantProfile.tsx` — render "PLACEMENT" state when no rank row.
- `src/components/battle-v2/entry/RegionSelector.tsx` — drop fake ping numbers.
- `src/hooks/useUserLevel.ts` — new (calls existing `get_user_level` RPC).
- No DB migration. No backend changes.

## Verification

1. Reload `/battle` on `tonystark`: header shows **LVL 1**, rank reads **UNRANKED · PLACEMENT 5 matches left**, no fake `1000/1200` bar.
2. Stat tiles still show real `0-0 / 0% / W0 / 0 MVPs`.
3. Region cards no longer show coloured ping dots (just `AP-S Asia · Mumbai`, etc.).
4. After playing 5 placements and getting a `rank_states` row, the same card shows real `BRONZE IV · LP 24 / 100`.
5. Daily objective row shows real "Solve N today" or is hidden — never the static `0/3`.

