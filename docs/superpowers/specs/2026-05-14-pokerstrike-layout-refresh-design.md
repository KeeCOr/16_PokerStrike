# PokerStrike Layout Refresh Design

## Goal

Refresh the current PokerStrike play screen layout without changing core game rules, grid dimensions, or stage flow. The work should make the existing 640x960 portrait UI feel clearer and more finished while keeping implementation risk low.

## Approved Direction

Use the "current structure cleanup" approach.

- Keep the 640x960 Phaser canvas.
- Keep the 7x9 grid, 80px cell size, and current grid offsets.
- Keep the current bottom panel model with tabs for cards, upgrades, and roguelite bonuses.
- Improve readability, spacing, visual hierarchy, and modal consistency.
- Do not add new gameplay systems in this pass.

## Layout Scope

### Top HUD

Convert the scattered top overlays into a cleaner status strip that is easy to scan during combat.

The strip should show:

- Base HP
- Gold
- Gems
- Wave
- Enemy count when available

The HUD should avoid overlapping with the grid, use consistent padding, and reserve stable dimensions so changing numbers do not shift the layout.

### Game Board

Keep the board as the dominant visual area. Avoid moving the grid or changing pathfinding-related constants.

Polish should focus on:

- Spawn and base labels with readable Korean text.
- Base HP bar alignment and contrast.
- Countdown, stage intro, magic effect, and stage clear text placement.
- Consistent depth ordering for overlays.

### Bottom Panel

Keep the bottom panel in the same general area, but improve the hierarchy inside it:

- A compact tab row at the top of the panel.
- A clear hand-card area and shared-card area.
- A fixed action row for Magic, Summon, and Replace.
- Better preview text placement for summon and magic results.

The card tab should make the current hand and shared cards easy to distinguish at a glance.

### Upgrade And Roguelite Tabs

Keep these as alternate panel contents, not separate screens.

The upgrade tab should:

- Separate permanent upgrades, base recovery, and selected-unit upgrades.
- Use consistent button sizing and spacing.
- Clearly show empty or unavailable states.

The roguelite tab should:

- Show earned bonuses in a clean list.
- Avoid overflowing past the panel.

### Modals And Overlays

Unify the style for tutorial, wave-choice rewards, stage clear, and game-over overlays.

Shared rules:

- Dim the background.
- Use a consistent centered panel width.
- Use one clear title area.
- Put primary and secondary actions in predictable positions.
- Keep text inside bounds for Korean strings.

## Non-Goals

- No new enemies, units, skills, stages, or economy changes.
- No change to grid size, canvas size, pathfinding, or placement rules.
- No permanent progression redesign.
- No full visual rebrand.

## Documentation Updates

After implementation, update the planning docs required by the project instructions:

- `docs/PokerStrike_기획서.md`
- `docs/PokerStrike_기획서.html`

If those files do not exist yet, create them from the current GDD content and align names with the project rule.

## Verification

Implementation should be verified with:

- `npm test`
- `npm run build` during iteration if needed
- Final required `npm run dist`

Before final delivery, bump the patch version in `package.json`, build the portable executable, copy it from `release/` to the project root, and remove older root portable executables as required by `AGENTS.md`.
