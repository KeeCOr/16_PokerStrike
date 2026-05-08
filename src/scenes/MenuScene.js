import Phaser from 'phaser';
export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }
  create() {
    this.add.rectangle(240, 427, 480, 854, 0x0d1b2a);
    this.add.text(240, 360, 'CARD DEFENSE', {
      fontSize: '36px', color: '#e8c97a', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(240, 420, '항해와 패의 시대', {
      fontSize: '18px', color: '#8ab4d4'
    }).setOrigin(0.5);
    const btn = this.add.text(240, 500, '[ 게임 시작 ]', {
      fontSize: '22px', color: '#ffffff'
    }).setOrigin(0.5).setInteractive();
    btn.on('pointerover', () => btn.setColor('#e8c97a'));
    btn.on('pointerout', () => btn.setColor('#ffffff'));
    btn.on('pointerdown', () => this.scene.start('GameScene'));
  }
}
