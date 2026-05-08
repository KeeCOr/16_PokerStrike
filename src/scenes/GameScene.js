import Phaser from 'phaser';
import Grid from '../grid/Grid.js';
import GridRenderer from '../grid/GridRenderer.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.grid = new Grid();
    this.gridRenderer = new GridRenderer(this, this.grid);
    this.scene.launch('UIScene');
  }

  update(time, delta) {}
}
