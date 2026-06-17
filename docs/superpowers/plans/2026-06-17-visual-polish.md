# PokerStrike Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce board visual noise, align HUD elements, restyle wave upgrade choices, and make tower rank progression visibly distinct.

**Architecture:** Keep the work inside existing Phaser render modules. Export small layout/style constants so Vitest can verify visual constraints without launching Phaser.

**Tech Stack:** Phaser 3, Vite, Vitest, Electron builder.

## Global Constraints

- Use existing PokerStrike UI image assets before generating new assets.
- Keep in-game board readability first: no tile sparkle, smaller towers, smaller hit impacts.
- HUD same-layer elements must not visually overlap.
- After implementation, run tests, build, package, update docs, and copy the executable to project root and Google Drive.

---

### Task 1: Add Failing Visual Contract Tests

**Files:**
- Modify: `tests/grid/GridRenderer.test.js`
- Modify: `tests/combat/CombatManager.test.js`
- Modify: `tests/units/UnitVisual.test.js`
- Modify: `tests/ui/HUDLayout.test.js`
- Modify: `tests/scenes/WaveChoiceLayout.test.js`

- [ ] Add tests that require disabled tile buildable sparkle, smaller impact VFX, tighter tower display, distinct two-pair/triple ornament tiers, right-aligned resources, centered wave badge text, and image-backed upgrade choice cards.
- [ ] Run targeted tests and confirm they fail for the expected missing constants/old values.

### Task 2: Implement Render Constant Changes

**Files:**
- Modify: `src/grid/GridRenderer.js`
- Modify: `src/combat/CombatManager.js`
- Modify: `src/units/Unit.js`
- Modify: `src/ui/HUD.js`
- Modify: `src/scenes/WaveChoiceLayout.js`
- Modify: `src/scenes/GameScene.js`

- [ ] Remove buildable sparkle drawing/tween.
- [ ] Reduce tower size/ring/glow and add rank ornament drawing.
- [ ] Reduce hit impact sizes and expansion scale only.
- [ ] Align wave and resource HUD inside their frames.
- [ ] Rebuild wave upgrade choices with existing image button assets.
- [ ] Run targeted tests and full `npm test`.

### Task 3: Build, Docs, And Release Placement

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `docs/PokerStrike_기획서.md`
- Modify: `docs/PokerStrike_기획서.html`

- [ ] Bump patch version.
- [ ] Update MD and HTML planning docs with the visual polish changes.
- [ ] Run `npm run dist`.
- [ ] Keep only the latest portable exe in root/release and upload `16_PokerStrike_v<version>_portable.exe` to `G:\내 드라이브\실행파일\`.
- [ ] Copy updated planning docs to `G:\내 드라이브\기획서\PokerStrike\`.
