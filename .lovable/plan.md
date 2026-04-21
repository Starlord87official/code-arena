

# Remove Demo Mode bar from Battle entry

The "DEMO MODE // switch states to preview the full battle lifecycle" strip with ENTRY / LOBBY / LIVE / RESULT chips is the dev-only `PhaseToggle` component. It was meant for previewing battle lifecycle states during development but is showing up in preview and confusing the real flow.

## Change

- **`src/pages/Battle.tsx`**: remove both `PhaseToggle` mounts (the inline one above `<EntryHero />` and the floating bottom-right one), plus the now-unused import. Phase switching will continue to be driven by real backend state (entry → searching → pre_battle → live → post_battle), not manual dev chips.

## Files touched

- `src/pages/Battle.tsx` (remove 2 `<PhaseToggle .../>` usages + import)
- `src/components/battle-v2/PhaseToggle.tsx` left in place (already self-gates on `import.meta.env.DEV`, harmless and reusable for local dev if needed)

## Verification

1. Reload `/battle` → no "DEMO MODE" strip above the "ENTER THE ARENA" hero.
2. No floating phase-switcher in the bottom-right during lobby/live/result.
3. Real matchmaking still transitions phases automatically.

