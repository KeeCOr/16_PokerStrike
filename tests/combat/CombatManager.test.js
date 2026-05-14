import { describe, expect, it } from 'vitest';
import CombatManager from '../../src/combat/CombatManager.js';
import { ROLE } from '../../src/units/UnitData.js';

function createScene() {
  const unit = {
    col: 0,
    row: 0,
    frozen: false,
    atkCooldown: 0,
    stats: {
      role: ROLE.ATTACK,
      range: 3,
      atk: 10,
      atkSpeed: 1,
      multiTarget: 0,
      piercing: false,
      stunChance: 0,
      hpPctDamage: 0,
    },
  };

  const enemy = {
    x: 40,
    y: 0,
    row: 0,
    isAerial: false,
    maxHp: 20,
    reward: 0,
    type: 'basic',
    takeDamage(amount) {
      this.lastDamage = amount;
      return false;
    },
  };

  return {
    unit,
    enemy,
    grid: {
      cellToWorld(col, row) {
        return { x: col * 80, y: row * 80 };
      },
    },
    unitManager: { units: [unit] },
    enemyManager: {
      getAll() { return [enemy]; },
      removeEnemy() {},
    },
    economyManager: { addGold() {} },
    add: {
      circle() {
        return {
          setDepth() { return this; },
          destroy() {},
        };
      },
    },
    time: { delayedCall() {} },
    tweens: { add() {} },
    registry: { set() {} },
  };
}

describe('CombatManager', () => {
  it('updates a basic attacking unit without throwing', () => {
    const scene = createScene();
    const manager = new CombatManager(scene);

    expect(() => manager.update(0, 100)).not.toThrow();
    expect(scene.enemy.lastDamage).toBe(10);
  });
});
