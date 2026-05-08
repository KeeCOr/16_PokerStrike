import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() { this.scene.start('MenuScene'); }
}

class MenuScene extends Phaser.Scene {
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

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  create() {
    this.add.text(240, 427, 'GameScene', { color: '#fff' }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 854,
  backgroundColor: '#0d1b2a',
  scene: [BootScene, MenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
