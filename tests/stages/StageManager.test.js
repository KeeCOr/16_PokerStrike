import { describe, expect, it } from 'vitest';
import StageManager, {
  BASE_ENEMY_COUNT_MULTIPLIER,
  MIN_SPAWN_INTERVAL,
  getStageEnemyCountMultiplier,
  getWaveEnemyCountMultiplier,
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
  it('makes the first wave easier than the stage baseline', () => {
    const manager = new StageManager(createScene());
    manager.startStage(0);

    const baseCount = STAGES[0].waves[0].enemies.reduce((sum, group) => sum + group.count, 0);

    expect(BASE_ENEMY_COUNT_MULTIPLIER).toBe(3);
    expect(getWaveEnemyCountMultiplier(0, 0, STAGES[0].waves.length)).toBeCloseTo(1.65);
    expect(manager.waveTotal).toBeLessThan(baseCount * BASE_ENEMY_COUNT_MULTIPLIER);
    expect(manager.spawnQueue).toHaveLength(manager.waveTotal);
  });

  it('scales enemy count exponentially by stage', () => {
    expect(getStageEnemyCountMultiplier(0)).toBe(3);
    expect(getStageEnemyCountMultiplier(4)).toBe(10);
    expect(getStageEnemyCountMultiplier(9)).toBe(45);
  });

  it('makes later waves harder than the stage baseline', () => {
    const manager = new StageManager(createScene());
    const stageIndex = 0;
    const waveIndex = STAGES[stageIndex].waves.length - 1;
    manager.stageIndex = stageIndex;
    manager.waveIndex = waveIndex;
    manager._startNextWave();

    const baseCount = STAGES[stageIndex].waves[waveIndex].enemies.reduce((sum, group) => sum + group.count, 0);
    const stageBaseline = baseCount * getStageEnemyCountMultiplier(stageIndex);

    expect(getWaveEnemyCountMultiplier(stageIndex, waveIndex, STAGES[stageIndex].waves.length)).toBeCloseTo(4.8);
    expect(manager.waveTotal).toBeGreaterThan(stageBaseline);
  });

  it('keeps dense waves from spawning too many enemies at once', () => {
    const manager = new StageManager(createScene());
    const stageIndex = 9;
    const waveIndex = STAGES[stageIndex].waves.length - 1;
    manager.stageIndex = stageIndex;
    manager.waveIndex = waveIndex;
    manager._startNextWave();

    expect(MIN_SPAWN_INTERVAL).toBe(120);
    expect(manager.spawnQueue[1].delay - manager.spawnQueue[0].delay).toBeGreaterThanOrEqual(MIN_SPAWN_INTERVAL);
  });
});
