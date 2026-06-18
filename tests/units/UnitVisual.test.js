import { describe, expect, it } from 'vitest';
import { HAND_RANK } from '../../src/cards/HandEvaluator.js';
import { CELL_SIZE } from '../../src/grid/Grid.js';
import Unit, { getHandRankVisual, TOWER_VISUAL_STYLE } from '../../src/units/Unit.js';

function createUnitScene() {
  let graphicsCalls = 0;
  const hpBar = {
    visible: true,
    clear() { return this; },
    fillStyle() { return this; },
    fillRect() { return this; },
    setDepth() { return this; },
    setAlpha(value) { this.alpha = value; return this; },
    setVisible(value) { this.visible = value; return this; },
    destroy() {},
  };
  return {
    grid: { cellToWorld: () => ({ x: 100, y: 100 }) },
    textures: { exists: () => false },
    add: {
      graphics: () => ({
        ...(graphicsCalls++ === 1 ? hpBar : {}),
        setPosition() { return this; },
        setDepth() { return this; },
        clear() { return this; },
        fillStyle() { return this; },
        fillPoints() { return this; },
        lineStyle() { return this; },
        strokePoints() { return this; },
        fillCircle() { return this; },
        strokeCircle() { return this; },
        fillTriangle() { return this; },
        lineBetween() { return this; },
        setFillStyle() { return this; },
        setAlpha() { return this; },
        destroy() {},
      }),
      circle: () => ({
        setDepth() { return this; },
        setStrokeStyle() { return this; },
        setAlpha() { return this; },
        destroy() {},
      }),
      text: () => ({
        setOrigin() { return this; },
        setDepth() { return this; },
        setAlpha() { return this; },
        destroy() {},
      }),
    },
    hpBar,
  };
}

describe('Unit hand-rank visuals', () => {
  it('makes better poker hands visibly more decorated without filling the tile', () => {
    const low = getHandRankVisual(HAND_RANK.HIGH_CARD);
    const mid = getHandRankVisual(HAND_RANK.STRAIGHT);
    const high = getHandRankVisual(HAND_RANK.STRAIGHT_FLUSH);

    expect(mid.size).toBeGreaterThan(low.size);
    expect(high.size).toBeGreaterThan(mid.size);
    expect(mid.ornamentTier).toBeGreaterThan(low.ornamentTier);
    expect(high.ornamentTier).toBeGreaterThan(mid.ornamentTier);
    expect(high.label).toBe('MAX');
  });

  it('gives two pair and three of a kind different tower silhouettes', () => {
    const twoPair = getHandRankVisual(HAND_RANK.TWO_PAIR);
    const triple = getHandRankVisual(HAND_RANK.THREE_OF_A_KIND);

    expect(twoPair.ornament).not.toBe(triple.ornament);
    expect(triple.ornamentTier).toBeGreaterThan(twoPair.ornamentTier);
  });

  it('keeps even the best tower comfortably inside one tile', () => {
    const high = getHandRankVisual(HAND_RANK.STRAIGHT_FLUSH);
    const displaySize = Math.floor(CELL_SIZE * high.size) + TOWER_VISUAL_STYLE.SPRITE_PADDING;

    expect(TOWER_VISUAL_STYLE.MAX_DISPLAY_RATIO).toBeLessThanOrEqual(0.48);
    expect(displaySize).toBeLessThanOrEqual(Math.floor(CELL_SIZE * TOWER_VISUAL_STYLE.MAX_DISPLAY_RATIO));
    expect(high.ring).toBeLessThanOrEqual(0.28);
  });

  it('hides the HP bar while the tower is at max health', () => {
    const scene = createUnitScene();
    const unit = new Unit(scene, 0, 0, HAND_RANK.HIGH_CARD, 'H', 1, {
      hp: 100,
      maxHp: 100,
      range: 2,
    });

    unit.hpBar = scene.hpBar;
    unit._drawHpBar();
    expect(scene.hpBar.visible).toBe(false);

    unit.takeDamage(1);
    expect(scene.hpBar.visible).toBe(true);
  });
});

