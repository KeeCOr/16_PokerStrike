import { describe, expect, it } from 'vitest';
import CombatManager, { COMBAT_VFX_STYLE, ROLE_VFX } from '../../src/combat/CombatManager.js';
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
      image(x, y, key) {
        return {
          x,
          y,
          key,
          setDepth() { return this; },
          setDisplaySize(width, height) { this.displayWidth = width; this.displayHeight = height; this.scaleX = width / 256; this.scaleY = height / 256; return this; },
          setRotation(angle) { this.rotation = angle; return this; },
          setPosition(nx, ny) { this.x = nx; this.y = ny; return this; },
          setAlpha(value) { this.alpha = value; return this; },
          destroy() {},
        };
      },
      circle() {
        return {
          setDepth() { return this; },
          setPosition() { return this; },
          destroy() {},
        };
      },
    },
    time: { delayedCall() {} },
    tweens: { add(config) { this.lastConfig = config; } },
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

  it('uses VFX image projectile when texture is loaded', () => {
    const scene = createScene();
    scene.textures = { exists: key => key === 'vfx-club-projectile' };
    const manager = new CombatManager(scene);

    manager._spawnProjectile({ x: 0, y: 0 }, { x: 40, y: 0 }, ROLE.ATTACK);

    expect(manager.projectiles[0].sprite.key).toBe('vfx-club-projectile');
    expect(manager.projectiles[0].sprite.displayWidth).toBe(28);
  });


  it('aligns diagonal projectile PNGs with their travel direction using a rotation offset', () => {
    const scene = createScene();
    scene.textures = { exists: key => key === 'vfx-club-projectile' };
    const manager = new CombatManager(scene);

    manager._spawnProjectile({ x: 0, y: 0 }, { x: 40, y: 0 }, ROLE.ATTACK);

    expect(ROLE_VFX[ROLE.ATTACK].projectileRotationOffset).toBeCloseTo(-Math.PI / 4, 5);
    expect(manager.projectiles[0].sprite.rotation).toBeCloseTo(-Math.PI / 4, 5);
  });
  it('keeps hit impact VFX smaller than a tile and avoids large expansion', () => {
    const maxImpact = Math.max(...Object.values(ROLE_VFX).map(vfx => vfx.impactSize));

    expect(maxImpact).toBeLessThanOrEqual(COMBAT_VFX_STYLE.MAX_IMPACT_SIZE);
    expect(COMBAT_VFX_STYLE.MAX_IMPACT_SIZE).toBeLessThanOrEqual(38);
    expect(COMBAT_VFX_STYLE.IMPACT_EXPAND_SCALE).toBeLessThanOrEqual(1.16);
  });


  it('preserves impact image display scale while expanding attack VFX', () => {
    const scene = createScene();
    scene.textures = { exists: key => key === 'vfx-armor-break-impact' };
    const manager = new CombatManager(scene);

    manager._spawnImpact(40, 0, ROLE.ATTACK);

    const impact = scene.tweens.lastConfig.targets;
    expect(impact.displayWidth).toBe(ROLE_VFX[ROLE.ATTACK].impactSize);
    expect(scene.tweens.lastConfig.scaleX).toBeCloseTo((ROLE_VFX[ROLE.ATTACK].impactSize / 256) * COMBAT_VFX_STYLE.IMPACT_EXPAND_SCALE, 5);
    expect(scene.tweens.lastConfig.scaleY).toBeCloseTo((ROLE_VFX[ROLE.ATTACK].impactSize / 256) * COMBAT_VFX_STYLE.IMPACT_EXPAND_SCALE, 5);
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

  it('applies slow through enemy timed slow effect', () => {
    const scene = createScene();
    const manager = new CombatManager(scene);
    const waterUnit = {
      ...scene.unit,
      stats: {
        ...scene.unit.stats,
        role: ROLE.SUPPORT_SLOW,
        atk: 8,
        slowChance: 1,
        slowAmount: 0.4,
        slowRadius: 0,
        slowDuration: 3000,
      },
    };
    const target = {
      ...scene.enemy,
      slowImmune: false,
      applySlow(amount, duration) {
        this.lastSlow = { amount, duration };
      },
    };

    manager._applyAttack(waterUnit, target, [target]);

    expect(target.lastSlow).toEqual({ amount: 0.4, duration: 3000 });
  });
  it('emits attack feedback with damage and target position for a basic hit', () => {
    const scene = createScene();
    scene.events = { emitted: [], emit(type, payload) { this.emitted.push({ type, payload }); } };
    const manager = new CombatManager(scene);

    manager._applyAttack(scene.unit, scene.enemy, [scene.enemy]);

    expect(scene.events.emitted).toContainEqual({
      type: 'attack-feedback',
      payload: expect.objectContaining({
        kind: 'damage',
        damage: 10,
        x: 40,
        y: 0,
        role: ROLE.ATTACK,
      }),
    });
  });

  it('marks lethal attack feedback when the target dies', () => {
    const scene = createScene();
    scene.events = { emitted: [], emit(type, payload) { this.emitted.push({ type, payload }); } };
    scene.enemy.takeDamage = function takeDamage(amount) {
      this.lastDamage = amount;
      return true;
    };
    const manager = new CombatManager(scene);

    manager._applyAttack(scene.unit, scene.enemy, [scene.enemy]);

    expect(scene.events.emitted).toContainEqual({
      type: 'attack-feedback',
      payload: expect.objectContaining({
        kind: 'kill',
        damage: 10,
        x: 40,
        y: 0,
      }),
    });
  });

  it('emits status feedback when slow is applied', () => {
    const scene = createScene();
    scene.events = { emitted: [], emit(type, payload) { this.emitted.push({ type, payload }); } };
    const manager = new CombatManager(scene);
    const waterUnit = {
      ...scene.unit,
      stats: {
        ...scene.unit.stats,
        role: ROLE.SUPPORT_SLOW,
        atk: 8,
        slowChance: 1,
        slowAmount: 0.4,
        slowRadius: 0,
        slowDuration: 3000,
      },
    };
    const target = {
      ...scene.enemy,
      slowImmune: false,
      applySlow(amount, duration) {
        this.lastSlow = { amount, duration };
      },
    };

    manager._applyAttack(waterUnit, target, [target]);

    expect(scene.events.emitted).toContainEqual({
      type: 'attack-feedback',
      payload: expect.objectContaining({
        kind: 'status',
        status: 'slow',
        damage: 8,
        x: 40,
        y: 0,
      }),
    });
  });
});



