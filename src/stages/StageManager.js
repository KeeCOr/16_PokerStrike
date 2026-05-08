import { STAGES } from './StageData.js';

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
    for (const group of wave.enemies) {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({ type: group.type, delay: group.interval * i });
      }
    }
    this.spawnQueue.sort((a, b) => a.delay - b.delay);
    this.spawnTimer = 0;
    this.waveActive = true;
  }

  update(delta) {
    if (!this.waveActive) return;

    this.spawnTimer += delta;
    while (this.spawnQueue.length > 0 && this.spawnQueue[0].delay <= this.spawnTimer) {
      const { type } = this.spawnQueue.shift();
      this.scene.enemyManager.spawnEnemy(type);
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
    if (this.waveIndex >= stage.waves.length) {
      if (this.onStageCleared) this.onStageCleared(this.stageIndex);
    } else {
      this.scene.time.delayedCall(3000, () => this._startNextWave());
    }
  }
}
