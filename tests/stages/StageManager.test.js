import { describe, expect, it } from 'vitest';
import StageManager, {
  BASE_ENEMY_COUNT_MULTIPLIER,
  getStageEnemyCountMultiplier,
} from '../../src/stages/StageManager.js';
import { STAGES } from '../../src/stages/StageData.js';

function createScene() {
  return {
    enemyManager: {
      getAll() { return []; },
      spawnEnemy() {},
    },
    registry: {
      set() {},
    },
    economyManager: {
      onWaveCleared() {},
    },
    time: {
      delayedCall() {},
    },
  };
}

describe('StageManager', () => {
  it('keeps stage 1 spawn queue at the baseline double count', () => {
    const manager = new StageManager(createScene());
    manager.startStage(0);

    const baseCount = STAGES[0].waves[0].enemies.reduce((sum, group) => sum + group.count, 0);

    expect(BASE_ENEMY_COUNT_MULTIPLIER).toBe(2);
    expect(manager.waveTotal).toBe(baseCount * BASE_ENEMY_COUNT_MULTIPLIER);
    expect(manager.spawnQueue).toHaveLength(baseCount * BASE_ENEMY_COUNT_MULTIPLIER);
  });

  it('scales enemy count exponentially by stage', () => {
    expect(getStageEnemyCountMultiplier(0)).toBe(2);
    expect(getStageEnemyCountMultiplier(4)).toBe(7);
    expect(getStageEnemyCountMultiplier(9)).toBe(30);

    const manager = new StageManager(createScene());
    manager.startStage(4);

    const baseCount = STAGES[4].waves[0].enemies.reduce((sum, group) => sum + group.count, 0);

    expect(manager.waveTotal).toBe(baseCount * getStageEnemyCountMultiplier(4));
  });
});
