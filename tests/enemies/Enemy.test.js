import { describe, expect, it } from 'vitest';
import Enemy from '../../src/enemies/Enemy.js';
import { ENEMY_TYPE } from '../../src/enemies/EnemyData.js';

function createScene() {
  const chain = {
    active: true,
    setDepth() { return this; },
    setInteractive() { this.interactive = true; return this; },
    on(event, fn) { this.handlers = { ...(this.handlers ?? {}), [event]: fn }; return this; },
    setOrigin() { return this; },
    setPosition() { return this; },
    setFillStyle() { return this; },
    destroy() { this.active = false; },
  };
  return {
    grid: {
      cellToWorld(col, row) { return { x: col * 80 + 40, y: row * 80 + 40 }; },
    },
    add: {
      rectangle() { return { ...chain }; },
      graphics() {
        return {
          ...chain,
          clear() { return this; },
          fillStyle() { return this; },
          fillRect() { return this; },
          lineStyle() { return this; },
          strokeRect() { return this; },
        };
      },
      text() { return { ...chain }; },
    },
  };
}

describe('Enemy', () => {
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
});
