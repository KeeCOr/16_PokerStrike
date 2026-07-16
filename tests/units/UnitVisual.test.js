import { describe, expect, it } from 'vitest';
import { HAND_RANK } from '../../src/cards/HandEvaluator.js';
import { CELL_SIZE } from '../../src/grid/Grid.js';
import Unit, { getHandRankVisual, TOWER_VISUAL_STYLE } from '../../src/units/Unit.js';
import UnitManager, { SUMMON_EFFECT_STYLE } from '../../src/units/UnitManager.js';

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

    expect(TOWER_VISUAL_STYLE.MAX_DISPLAY_RATIO).toBeLessThanOrEqual(1);
    expect(displaySize).toBeLessThanOrEqual(Math.floor(CELL_SIZE * TOWER_VISUAL_STYLE.MAX_DISPLAY_RATIO));
    expect(high.ring).toBeLessThanOrEqual(0.21);
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
  it('preserves image tower display scale during the summon animation', () => {
    const tweenConfigs = [];
    const scene = {
      grid: { cellToWorld: () => ({ x: 100, y: 100 }) },
      add: {
        circle: () => ({
          setDepth() { return this; },
          destroy() {},
        }),
      },
      tweens: { add(config) { tweenConfigs.push(config); } },
    };
    const manager = new UnitManager(scene);
    const sprite = {
      scaleX: 0.094,
      scaleY: 0.094,
      setAlpha(value) { this.alpha = value; return this; },
      setScale(x, y = x) { this.scaleX = x; this.scaleY = y; return this; },
    };

    manager._playSpawnEffect(0, 0, { sprite });

    const spriteTween = tweenConfigs.find(config => config.targets === sprite);
    expect(sprite.scaleX).toBeCloseTo(0.094 * 0.15, 5);
    expect(sprite.scaleY).toBeCloseTo(0.094 * 0.15, 5);
    expect(spriteTween.scaleX).toBeCloseTo(0.094, 5);
    expect(spriteTween.scaleY).toBeCloseTo(0.094, 5);
  });
  it('creates a bounded card-gate summon effect without losing sprite scale', () => {
    const tweenConfigs = [];
    const circles = [];
    const scene = {
      grid: { cellToWorld: () => ({ x: 100, y: 100 }) },
      add: {
        circle(x, y, radius, color, alpha) {
          const circle = {
            x, y, radius, color, alpha,
            setDepth(value) { this.depth = value; return this; },
            setStrokeStyle(width, strokeColor, strokeAlpha) { this.stroke = { width, strokeColor, strokeAlpha }; return this; },
            destroy() { this.destroyed = true; },
          };
          circles.push(circle);
          return circle;
        },
      },
      tweens: { add(config) { tweenConfigs.push(config); } },
    };
    const manager = new UnitManager(scene);
    const sprite = {
      scaleX: 0.28,
      scaleY: 0.28,
      setAlpha(value) { this.alpha = value; return this; },
      setScale(x, y = x) { this.scaleX = x; this.scaleY = y; return this; },
    };

    manager._playSpawnEffect(0, 0, { sprite, _baseColor: 0xff3333 });

    expect(SUMMON_EFFECT_STYLE.SPARK_COUNT).toBeLessThanOrEqual(10);
    expect(SUMMON_EFFECT_STYLE.DURATION).toBeLessThanOrEqual(450);
    expect(circles.length).toBeGreaterThanOrEqual(2 + SUMMON_EFFECT_STYLE.SPARK_COUNT);
    expect(circles.filter(circle => circle.stroke).length).toBeGreaterThanOrEqual(2);
    expect(tweenConfigs.filter(config => config.targets === sprite)[0].scaleX).toBeCloseTo(0.28, 5);
  });
  it('uses readable tower body sizes after summon scaling is fixed', () => {
    const low = getHandRankVisual(HAND_RANK.HIGH_CARD);
    const high = getHandRankVisual(HAND_RANK.STRAIGHT_FLUSH);
    const lowDisplaySize = Math.floor(CELL_SIZE * low.size) + TOWER_VISUAL_STYLE.SPRITE_PADDING;
    const highDisplaySize = Math.floor(CELL_SIZE * high.size) + TOWER_VISUAL_STYLE.SPRITE_PADDING;

    expect(lowDisplaySize).toBeGreaterThanOrEqual(68);
    expect(highDisplaySize).toBeGreaterThanOrEqual(74);
    expect(highDisplaySize).toBeLessThanOrEqual(Math.floor(CELL_SIZE * TOWER_VISUAL_STYLE.MAX_DISPLAY_RATIO));
  });

  it('moves rank ornaments, rings, halo, and highlight with the unit', () => {
    const scene = {
      grid: {
        cells: [[0, 0], [0, 0]],
        setCell(col, row, value) { this.cells[row][col] = value; },
        isWalkable() { return true; },
        cellToWorld(col, row) { return { x: 100 + col * CELL_SIZE, y: 100 + row * CELL_SIZE }; },
      },
      enemyManager: { recalculateAllPaths() {}, isEnemyAt() { return false; } },
    };
    const manager = new UnitManager(scene);
    const moved = [];
    const movable = name => ({ name, setPosition(x, y) { moved.push({ name, x, y }); return this; } });
    const unit = {
      col: 0,
      row: 0,
      sprite: movable('sprite'),
      gradeText: movable('gradeText'),
      glowCircle: movable('glowCircle'),
      rankHalo: movable('rankHalo'),
      rankRing: movable('rankRing'),
      rankOrnament: movable('rankOrnament'),
      highlightCircle: movable('highlightCircle'),
      _drawHpBar() {},
      updateStatusPosition() {},
      setSelected() {},
    };

    manager._moveUnit(unit, 1, 1);

    const names = moved.map(item => item.name);
    expect(names).toContain('rankHalo');
    expect(names).toContain('rankRing');
    expect(names).toContain('rankOrnament');
    expect(names).toContain('highlightCircle');
  });

  it('destroys the drag range decal when pointerup finishes a drag', () => {
    const destroyed = [];
    const events = {};
    const scene = {
      grid: {
        isWalkable() { return true; },
        worldToCell() { return { col: 1, row: 1 }; },
        setCell() {},
        cellToWorld() { return { x: 100, y: 100 }; },
      },
      enemyManager: { isEnemyAt() { return false; }, recalculateAllPaths() {} },
      input: { on(type, handler) { events[type] = handler; } },
    };
    const manager = new UnitManager(scene);
    const unit = {
      col: 0,
      row: 0,
      sprite: { setPosition() {} },
      gradeText: { setPosition() {} },
      _drawHpBar() {},
      updateStatusPosition() {},
      setSelected() {},
      setDim() {},
    };
    manager.units = [unit];
    manager.setupMergeInteraction();
    manager._pointerDownActive = true;
    manager._pointerDownUnit = unit;
    manager._isDragging = true;
    manager._dragIndicator = { destroy() { destroyed.push('indicator'); } };
    manager._dragRangeDecal = { destroy() { destroyed.push('decal'); } };

    events.pointerup({ x: 176, y: 176 });

    expect(destroyed).toContain('indicator');
    expect(destroyed).toContain('decal');
    expect(manager._dragRangeDecal).toBe(null);
  });
});





