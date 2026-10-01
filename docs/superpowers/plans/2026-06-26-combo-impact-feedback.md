# PokerStrike Combo Impact Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve PokerStrike's card-combo feedback so a summon immediately tells the player what battlefield role the submitted hand created.

**Architecture:** Extend the existing `src/ui/BattleFeedback.js` pure formatter and feed it richer payload data from `src/scenes/UIScene.js`. Keep rendering in the existing `_showBattleFeedback` banner with slightly wider bounds.

**Tech Stack:** Vite, Phaser 3, Vitest, Electron Builder.

## Global Constraints

- DN is excluded from this improvement batch.
- Follow TDD: add failing Vitest coverage before production code.
- Do not add new runtime SVG assets.
- After code/UI behavior changes, update `docs/PokerStrike_기획서.md` and `docs/PokerStrike_기획서.html`, bump package patch version, run `npm run dist`, and deploy the portable exe.

---

### Task 1: Battle Feedback Copy

**Files:**
- Modify: `tests/ui/BattleFeedback.test.js`
- Modify: `src/ui/BattleFeedback.js`

**Interfaces:**
- Consumes: `getBattleFeedback(payload)`
- Produces: `getBattleFeedback({ type: 'summon', rankName, suitLabel, roleLabel, suitEffect, cost, bonusGold })`

- [ ] Step 1: Add a failing test that expects summon feedback to include role and suit effect.
- [ ] Step 2: Run `npm test -- tests/ui/BattleFeedback.test.js` and confirm the new test fails.
- [ ] Step 3: Extend `getBattleFeedback` summon copy with `roleLabel`, `suitEffect`, and optional `bonusGold`.
- [ ] Step 4: Re-run the focused test and confirm pass.

### Task 2: Runtime Payload And Banner Fit

**Files:**
- Modify: `src/scenes/UIScene.js`
- Modify: `tests/ui/BattleFeedback.test.js` if copy expectations need refinement.

**Interfaces:**
- Consumes: `HAND_RANK`, `rank`, `dominantSuit`, `rogueliteManager.getGoldOnSummon(rank)`
- Produces: `battle-feedback` event with role/effect fields.

- [ ] Step 1: Add helper maps in `UIScene.js` for hand-role and suit-effect labels.
- [ ] Step 2: Include those fields in summon feedback payload.
- [ ] Step 3: Apply bonus gold before emitting feedback so the feedback can mention it.
- [ ] Step 4: Widen banner from 420/388 to 520/488 and keep fixed text layout.

### Task 3: Docs, Build, Deployment

**Files:**
- Modify: `docs/PokerStrike_기획서.md`
- Modify: `docs/PokerStrike_기획서.html`
- Modify: `package.json`
- Modify: `package-lock.json`

**Verification:**
- Run `npm test`.
- Run `npm run build`.
- Run `npm run dist`.
- Copy `release/PokerStrike_v0.1.65_portable.exe` to root and Drive execution folder.
- Launch exe briefly and inspect log for runtime errors.
