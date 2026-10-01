# PokerStrike Combo Impact Feedback Design

Date: 2026-06-26

## Goal
Make a card submission immediately explain its battlefield impact: poker hand, suit role, expected tower behavior, and cost/bonus context should appear in one compact battle-feedback banner.

## Approved Direction
Use the existing `battle-feedback` event and `BattleFeedback.js` copy formatter. This keeps the change small, testable, and consistent with the current UI instead of adding a separate overlay.

## Scope
- Add summon-impact copy for rank role and suit role.
- Keep magic and kill feedback behavior unchanged.
- Widen the existing banner only enough for the longer line and keep text fixed-width to prevent overlap.
- Update PokerStrike planning docs and patch version after implementation.

## Out Of Scope
- No new bitmap/VFX assets in this pass.
- No tower balance changes.
- No card rule changes.

## Acceptance Criteria
- `getBattleFeedback({ type: 'summon', ... })` includes rank name, suit role, tower role, and cost.
- Missing optional fields still produce a readable fallback line.
- Existing BattleFeedback tests continue to pass.
- `npm test`, `npm run build`, and `npm run dist` complete successfully.
- New portable exe is copied to project root and Google Drive execution folder.
