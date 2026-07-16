# PokerStrike Next Improvement Instruction

Date: 2026-06-24

## Goal
Turn the current biggest project issue into a small, executable improvement batch. This file is intentionally scoped so the next worker can start without rereading the whole workspace audit.

## Instructions
1. Strengthen one complete card-to-attack action: hand selection, commit, strike impact, and result panel.
2. Add tests or deterministic examples for at least three hand outcomes and their combat effects.
3. Keep release docs aligned with the latest portable exe name after any gameplay code change.

## Completion Rules
- Do not include discarded projects in this batch.
- If gameplay, UI, systems, content, controls, build behavior, or project scope changes, update the project planning document and update log before build/release.
- If runtime source changes, run the nearest available validation and then perform the required build/package step from the project instructions.
- If a folder or asset looks ambiguous, document the decision instead of deleting it.
## Completed 2026-06-30 v0.2.0

- Completed the card-to-attack feedback loop for summon impact copy: hand selection result, unit role, rank impact, suit effect, combat hint, cost, and bonus economy are summarized in one result banner.
- Added deterministic feedback coverage for three hand outcomes: Straight frontline impact, Flush multi-target impact, and Four Kind piercing/armor-break impact.
- Verified latest release docs reference `PokerStrike_v0.2.0_portable.exe`.
- Validation: `npm test` passed 26 files / 112 tests; `npm run build` passed; `npm run dist` rebuilt `release/PokerStrike_v0.2.0_portable.exe`.
