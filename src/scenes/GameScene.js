import Phaser from 'phaser';
import Grid from '../grid/Grid.js';
import GridRenderer from '../grid/GridRenderer.js';
import UnitManager from '../units/UnitManager.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.grid = new Grid();
    this.gridRenderer = new GridRenderer(this, this.grid);
    this.unitManager = new UnitManager(this);
    this.scene.launch('UIScene');

    // Test: click to place ONE_PAIR H grade-1 unit
    this.input.on('pointerdown', (ptr) => {
      if (ptr.y > 650) return;
      const { col, row } = this.grid.worldToCell(ptr.x, ptr.y);
      this.unitManager.placeUnit(col, row, HAND_RANK.ONE_PAIR, 'H', 1);
    });

    this.unitManager.setupMergeInteraction();
  }

  update(time, delta) {
    this.unitManager.update(time, delta);
  }
}
