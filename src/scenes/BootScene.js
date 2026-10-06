import Phaser from 'phaser';
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {
    this.load.image('title-logo', 'assets/brand/title-logo.png');
  }
  create() { this.scene.start('MenuScene'); }
}
