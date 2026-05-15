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
      stunDuration: 0,
      stunRadius: 0,
      hpPctDamage: 0,
      auraInterval: 0,
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

  it('only applies straight flush aura to nearby allies with the same suit', () => {
    const scene = createScene();
    const auraUnit = {
      ...scene.unit,
      suit: 'H',
      stats: {
        ...scene.unit.stats,
        auraInterval: 1000,
        auraRadius: 2,
        auraBuff: 0.5,
        auraDuration: 5000,
      },
      nextAuraTick: 0,
    };
    const sameSuitAlly = {
      ...scene.unit,
      suit: 'H',
      col: 1,
      row: 0,
      stats: { ...scene.unit.stats, atkSpeed: 1, auraInterval: 0 },
      showStatusTextCalls: [],
      showStatusText(...args) { this.showStatusTextCalls.push(args); },
    };
    const otherSuitAlly = {
      ...scene.unit,
      suit: 'S',
      col: 1,
      row: 1,
      stats: { ...scene.unit.stats, atkSpeed: 1, auraInterval: 0 },
      showStatusTextCalls: [],
      showStatusText(...args) { this.showStatusTextCalls.push(args); },
    };
    scene.unitManager.units = [auraUnit, sameSuitAlly, otherSuitAlly];
    scene.enemyManager.getAll = () => [];

    const manager = new CombatManager(scene);
    manager.update(1000, 0);

    expect(sameSuitAlly.stats.atkSpeed).toBe(1.5);
    expect(otherSuitAlly.stats.atkSpeed).toBe(1);
    expect(sameSuitAlly.showStatusTextCalls[0]).toEqual(['강화', 5000, 0xffee44]);
    expect(otherSuitAlly.showStatusTextCalls).toHaveLength(0);
  });

  it('lets sniper attacks be reduced by monster armor', () => {
    const scene = createScene();
    const manager = new CombatManager(scene);
    const sniper = {
      ...scene.unit,
      stats: {
        ...scene.unit.stats,
        role: ROLE.SNIPER,
        atk: 40,
        hpPctDamage: 0,
      },
    };
    const target = {
      ...scene.enemy,
      takeDamage(amount, bypassArmor) {
        this.lastDamage = amount;
        this.lastBypassArmor = bypassArmor;
        return false;
      },
    };

    manager._applyAttack(sniper, target, [target]);

    expect(target.lastDamage).toBe(40);
    expect(target.lastBypassArmor).not.toBe(true);
  });

  it('applies armor break from C-suit attackers before damage', () => {
    const scene = createScene();
    const manager = new CombatManager(scene);
    const earthUnit = {
      ...scene.unit,
      suit: 'C',
      stats: {
        ...scene.unit.stats,
        role: ROLE.ATTACK,
        atk: 12,
        stunChance: 0.4,
        armorBreakAmount: 0.25,
        armorBreakDuration: 5000,
      },
    };
    const target = {
      ...scene.enemy,
      applyArmorBreak(amount, duration) {
        this.lastArmorBreak = { amount, duration };
      },
      applyFreeze() {},
    };

    manager._applyAttack(earthUnit, target, [target]);

    expect(target.lastArmorBreak).toEqual({ amount: 0.25, duration: 5000 });
    expect(target.lastDamage).toBe(12);
  });
});
