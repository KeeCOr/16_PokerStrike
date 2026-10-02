# PokerStrike release-readiness check — 2026-09-29

## Scope

- Checked the restored local `v0.4.1` source branch only. No portable package or external deployment was created.
- The configured GitHub remote is `origin` (`https://github.com/KeeCOr/16_PokerStrike.git`) and the active branch is `master`, tracking `origin/master`.

## Safe readiness fix

- Restored the summon-preview strip to `PREVIEW_Y: 887` in `src/ui/CardUI.js`.
- This gives the preview a full 4 px gap below the card row, satisfying the established `CardUILayout` release-layout contract without changing gameplay behavior.

## Validation

- `npm test`: passed — 31 files, 134 tests.
- `npm run build`: passed. The existing Vite warning about a chunk larger than 500 kB remains.

## Remaining release gates

- Manual first-five-minute playthrough and representative-screen review have not been performed in this check.
- Portable packaging (`npm run dist`), executable placement, and Drive upload were intentionally not run.
- The worktree contains pre-existing uncommitted work from other changes; this readiness fix is therefore not committed or pushed.
