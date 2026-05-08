import Phaser from 'phaser';
import Grid, { GRID_ROWS } from '../grid/Grid.js';
import GridRenderer from '../grid/GridRenderer.js';
import UnitManager from '../units/UnitManager.js';
import EnemyManager from '../enemies/EnemyManager.js';
import CombatManager from '../combat/CombatManager.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';
import { ENEMY_TYPE } from '../enemies/EnemyData.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.grid = new Grid();
    this.gridRenderer = new GridRenderer(this, this.grid);
    this.unitManager = new UnitManager(this);
    this.enemyManager = new EnemyManager(this, GRID_ROWS - 1);
    this.combatManager = new CombatManager(this);
    this.scene.launch('UIScene');

    this.input.on('pointerdown', (ptr) => {
      if (ptr.y > 650) return;
      const { col, row } = this.grid.worldToCell(ptr.x, ptr.y);
      this.unitManager.placeUnit(col, row, HAND_RANK.ONE_PAIR, 'H', 1);
      this.enemyManager.recalculateAllPaths();
    });

    this.unitManager.setupMergeInteraction();

    this.input.keyboard.on('keydown-SPACE', () => {
      this.enemyManager.spawnEnemy(ENEMY_TYPE.BASIC);
    });
  }

  update(time, delta) {
    this.unitManager.update(time, delta);
    this.enemyManager.update(time, delta);
    this.combatManager.update(time, delta);
  }
}
