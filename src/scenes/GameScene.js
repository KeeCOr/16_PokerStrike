import Phaser from 'phaser';
import Grid, { GRID_ROWS } from '../grid/Grid.js';
import GridRenderer from '../grid/GridRenderer.js';
import UnitManager from '../units/UnitManager.js';
import EnemyManager from '../enemies/EnemyManager.js';
import CombatManager from '../combat/CombatManager.js';
import EconomyManager from '../economy/EconomyManager.js';
import StageManager from '../stages/StageManager.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';

const BASE_HP = 100;

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.grid = new Grid();
    this.gridRenderer = new GridRenderer(this, this.grid);
    this.unitManager = new UnitManager(this);
    this.enemyManager = new EnemyManager(this, GRID_ROWS - 1);
    this.combatManager = new CombatManager(this);
    this.economyManager = new EconomyManager();
    this.stageManager = new StageManager(this);

    this.baseHp = BASE_HP;
    this.gameOver = false;

    this.enemyManager.onEnemyReachBase = (dmg) => {
      this.baseHp -= dmg;
      this.registry.set('baseHp', this.baseHp);
      if (this.baseHp <= 0) this._gameOver();
    };

    this.stageManager.onWaveCleared = (waveIndex) => {
      this.registry.set('wave', waveIndex + 2);
    };

    this.stageManager.onStageCleared = () => {
      this._stageCleared();
    };

    this.economyManager.onGoldChanged = (gold) => {
      this.registry.set('gold', gold);
    };

    this.registry.set('baseHp', this.baseHp);
    this.registry.set('gold', this.economyManager.gold);
    this.registry.set('wave', 1);

    this.scene.launch('UIScene');

    this.stageManager.startStage(0);

    this.input.on('pointerdown', (ptr) => {
      if (ptr.y > 650) return;
      const { col, row } = this.grid.worldToCell(ptr.x, ptr.y);
      this.unitManager.placeUnit(col, row, HAND_RANK.ONE_PAIR, 'H', 1);
      this.enemyManager.recalculateAllPaths();
    });

    this.unitManager.setupMergeInteraction();
  }

  _gameOver() {
    this.gameOver = true;
    this.scene.pause('GameScene');
    this.add.rectangle(240, 427, 480, 854, 0x000000, 0.7).setDepth(10);
    this.add.text(240, 380, 'GAME OVER', {
      fontSize: '48px', color: '#ff4444', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.add.text(240, 460, '클릭하여 재시작', {
      fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(11);
    this.input.once('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.restart();
    });
  }

  _stageCleared() {
    this.add.text(240, 300, 'STAGE CLEAR!', {
      fontSize: '36px', color: '#ffdd44', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  update(time, delta) {
    if (this.gameOver) return;
    this.unitManager.update(time, delta);
    this.enemyManager.update(time, delta);
    this.combatManager.update(time, delta);
    this.economyManager.update(delta);
    this.stageManager.update(delta);
  }
}
