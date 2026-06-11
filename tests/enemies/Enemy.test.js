import { describe, expect, it } from 'vitest';
import Enemy from '../../src/enemies/Enemy.js';
import { ENEMY_SPEED_MULTIPLIER, ENEMY_STATS, ENEMY_TYPE } from '../../src/enemies/EnemyData.js';

function createScene() {
  const calls = [];
  const chain = {
    active: true,
    setDepth() { return this; },
    setInteractive() { this.interactive = true; return this; },
    on(event, fn) { this.handlers = { ...(this.handlers ?? {}), [event]: fn }; return this; },
    setOrigin() { return this; },
    setPosition() { return this; },
    setFillStyle() { return this; },
    setSize() { return this; },
    destroy() { this.active = false; },
  };
  const scene = {
    calls,
    grid: {
      cellToWorld(col, row) { return { x: col * 80 + 40, y: row * 80 + 40 }; },
    },
    add: {
      rectangle() { calls.push('rectangle'); return { ...chain }; },
      image(x, y, key) {
        calls.push(`image:${key}`);
        return {
          ...chain,
          x,
          y,
          key,
          setDisplaySize(width, height) {
            this.displayWidth = width;
            this.displayHeight = height;
            return this;
          },
        };
      },
      container(x, y) {
        calls.push('container');
        return {
          ...chain,
          x,
          y,
          list: [],
          add(child) { this.list.push(child); return this; },
        };
      },
      graphics() {
        return {
          ...chain,
          clear() { return this; },
          fillStyle() { return this; },
          fillRect() { return this; },
          fillCircle() { return this; },
          fillTriangle() { return this; },
          beginPath() { return this; },
          moveTo() { return this; },
          lineTo() { return this; },
          closePath() { return this; },
          fillPath() { return this; },
          lineStyle() { return this; },
          strokeRect() { return this; },
          strokeCircle() { return this; },
          strokePath() { return this; },
        };
      },
      text() { return { ...chain }; },
    },
  };
  return scene;
}

describe('Enemy', () => {
  it('applies the global 30% movement speed downgrade', () => {
    expect(ENEMY_SPEED_MULTIPLIER).toBe(0.7);
    expect(ENEMY_STATS[ENEMY_TYPE.BASIC].speed).toBe(34);
    expect(ENEMY_STATS[ENEMY_TYPE.RUNNER].speed).toBe(67);
  });

  it('exposes hp and armor info without numeric armor-break details', () => {
    const enemy = new Enemy(createScene(), 0, 0, ENEMY_TYPE.ARMORED);

    enemy.takeDamage(20);
    enemy.applyArmorBreak(0.2, 5000);

    expect(enemy.getInfoLines()).toEqual([
      'HP 171 / 180',
      '방어력 35%',
      '방어력 감소 중',
    ]);
  });

  it('restores movement speed after slow duration ends', () => {
    const enemy = new Enemy(createScene(), 0, 0, ENEMY_TYPE.RUNNER);

    enemy.applySlow(0.5, 5000);
    expect(enemy.speed).toBeCloseTo(ENEMY_STATS[ENEMY_TYPE.RUNNER].speed * 0.5);

    enemy._slowEffects[0].until = Date.now() - 1;
    enemy.updatePassive(16);

    expect(enemy.speed).toBe(enemy.baseSpeed);
  });

  it('uses a graphic monster container instead of a rectangle primitive', () => {
    const scene = createScene();

    const enemy = new Enemy(scene, 0, 0, ENEMY_TYPE.BERSERKER);

    expect(scene.calls).toContain('container');
    expect(scene.calls).not.toContain('rectangle');
    expect(enemy.sprite.list.length).toBeGreaterThan(0);
  });

  it('creates graphic sprites for every enemy type', () => {
    for (const type of Object.values(ENEMY_TYPE)) {
      const enemy = new Enemy(createScene(), 0, 0, type);
      expect(enemy.sprite.list.length).toBeGreaterThan(0);
    }
  });

  it('uses loaded monster image texture when available', () => {
    const scene = createScene();
    scene.textures = { exists: key => key === 'enemy-boss' };

    const enemy = new Enemy(scene, 0, 0, ENEMY_TYPE.BOSS);

    expect(scene.calls).toContain('image:enemy-boss');
    expect(enemy.sprite.list[0].key).toBe('enemy-boss');
    expect(enemy.sprite.list[0].displayWidth).toBe(56);
  });
});
