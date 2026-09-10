import Phaser from 'phaser';
import { preloadArtAssets } from '../assets/art/AssetKeys.js';
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() { preloadArtAssets(this); }
  create() { this.scene.start('MenuScene'); }
}
