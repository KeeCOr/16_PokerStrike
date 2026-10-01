import { describe, expect, it } from 'vitest';
import { HAND_RANK } from '../../src/cards/HandEvaluator.js';
import { SKILLS } from '../../src/data/skills.js';
import MagicManager from '../../src/magic/MagicManager.js';

function createScene() {
  return {
    enemyManager: {
      getAll() { return []; },
      removeEnemy() {},
    },
    economyManager: {
      summonCount: 3,
      replaceCount: 4,
      resetReplaceCostCalls: 0,
      resetReplaceCost() {
        this.replaceCount = 0;
        this.resetReplaceCostCalls++;
      },
    },
    unitManager: { units: [], placeUnit() {} },
    grid: { isWalkable() { return false; } },
    registry: { set() {} },
    events: { emit() {} },
    time: { delayedCall() {} },
  };
}

describe('MagicManager', () => {
  it('changes one-pair magic into replace-cost reset', () => {
    expect(SKILLS[HAND_RANK.ONE_PAIR]).toMatchObject({
      name: '교체 비용 초기화',
      effect: 'resetReplaceCost',
    });
  });

  it('resets replace cost without resetting summon cost', () => {
    const scene = createScene();
    const manager = new MagicManager(scene);

    manager.cast(HAND_RANK.ONE_PAIR, 'H');

    expect(scene.economyManager.replaceCount).toBe(0);
    expect(scene.economyManager.summonCount).toBe(3);
    expect(scene.economyManager.resetReplaceCostCalls).toBe(1);
  });

  it('does not restore a timed buff to a unit removed before the callback fires', () => {
    const scene = createScene();
    let restore;
    scene.time.delayedCall = (_, callback) => { restore = callback; };
    const unit = { suit: 'H', stats: { atk: 10 } };
    scene.unitManager.units = [unit];
    const manager = new MagicManager(scene);

    manager.cast(HAND_RANK.FLUSH, 'H');
    scene.unitManager.units = [];
    expect(() => restore()).not.toThrow();
    expect(unit.stats.atk).toBe(15);
  });
});
