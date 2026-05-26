import { STAGES } from './StageData.js';

export const BASE_ENEMY_COUNT_MULTIPLIER = 2;
export const ENEMY_STAGE_GROWTH_RATE = 1.35;
export const FIRST_WAVE_DIFFICULTY_FACTOR = 0.55;
export const LAST_WAVE_DIFFICULTY_FACTOR = 1.6;
export const MIN_SPAWN_INTERVAL = 120;

export function getStageEnemyCountMultiplier(stageIndex) {
  return Math.round(BASE_ENEMY_COUNT_MULTIPLIER * (ENEMY_STAGE_GROWTH_RATE ** stageIndex));
}

export function getWaveEnemyCountMultiplier(stageIndex, waveIndex, totalWaves) {
  const stageMultiplier = getStageEnemyCountMultiplier(stageIndex);
  if (totalWaves <= 1) return stageMultiplier;
  const progress = waveIndex / (totalWaves - 1);
  const waveFactor = FIRST_WAVE_DIFFICULTY_FACTOR +
    (LAST_WAVE_DIFFICULTY_FACTOR - FIRST_WAVE_DIFFICULTY_FACTOR) * progress;
  return +(stageMultiplier * waveFactor).toFixed(2);
}

export default class StageManager {
  constructor(scene) {
    this.scene = scene;
    this.stageIndex = 0;
    this.waveIndex = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.waveActive = false;
    this.onWaveCleared = null;
    this.onStageCleared = null;
    this.onWaveChoiceNeeded = null; // (resumeFn) => void
  }

  startStage(stageIndex) {
    this.stageIndex = stageIndex;
    this.waveIndex = 0;
    this._startNextWave();
  }

  _startNextWave() {
    const stage = STAGES[this.stageIndex];
    if (!stage) return;
    const wave = stage.waves[this.waveIndex];
    if (!wave) return;

    this.spawnQueue = [];
    const countMultiplier = getWaveEnemyCountMultiplier(this.stageIndex, this.waveIndex, stage.waves.length);
    wave.enemies.forEach((group, groupIndex) => {
      const count = Math.max(1, Math.round(group.count * countMultiplier));
      const interval = Math.max(MIN_SPAWN_INTERVAL, Math.floor(group.interval / countMultiplier));
      for (let i = 0; i < count; i++) {
        this.spawnQueue.push({ type: group.type, delay: groupIndex * MIN_SPAWN_INTERVAL + interval * i });
      }
    });
    this.spawnQueue.sort((a, b) => a.delay - b.delay);
    this.waveTotal = this.spawnQueue.length;
    this.spawnTimer = 0;
    this.waveActive = true;
    this._lastPublishedCount = -1;
  }

  update(delta) {
    if (!this.waveActive) return;

    this.spawnTimer += delta;
    while (this.spawnQueue.length > 0 && this.spawnQueue[0].delay <= this.spawnTimer) {
      const { type } = this.spawnQueue.shift();
      this.scene.enemyManager.spawnEnemy(type);
    }

    const remaining = this.spawnQueue.length + this.scene.enemyManager.getAll().length;
    if (remaining !== this._lastPublishedCount) {
      this._lastPublishedCount = remaining;
      this.scene.registry.set('enemyCount', `${remaining} / ${this.waveTotal}`);
    }

    if (this.spawnQueue.length === 0 && this.scene.enemyManager.getAll().length === 0) {
      this.waveActive = false;
      this._onWaveCleared();
    }
  }

  _onWaveCleared() {
    if (this.onWaveCleared) this.onWaveCleared(this.waveIndex);
    this.scene.economyManager.onWaveCleared();

    const stage = STAGES[this.stageIndex];
    this.waveIndex++;

    // 웨이브 전멸 후 2초 대기
    this.scene.time.delayedCall(2000, () => {
      if (this.waveIndex >= stage.waves.length) {
        if (this.onStageCleared) this.onStageCleared(this.stageIndex);
      } else if (this.onWaveChoiceNeeded) {
        this.onWaveChoiceNeeded(() => {
          this.scene.time.delayedCall(1000, () => this._startNextWave());
        });
      } else {
        this.scene.time.delayedCall(2000, () => this._startNextWave());
      }
    });
  }
}
