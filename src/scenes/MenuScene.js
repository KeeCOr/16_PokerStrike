import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = 640, H = 960;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0f1e);

    // Top decorative stripe
    this.add.rectangle(W / 2, 0, W, 4, 0xe8c97a);

    // Suit decorations (top)
    const suits = [
      { s: '♥', color: '#e05555', x: 80 },
      { s: '♦', color: '#5b9bd5', x: 240 },
      { s: '♣', color: '#66bb6a', x: 400 },
      { s: '♠', color: '#b197fc', x: 560 },
    ];
    suits.forEach(({ s, color, x }) => {
      this.add.text(x, 60, s, { fontSize: '36px', color, alpha: 0.25 }).setOrigin(0.5).setAlpha(0.3);
    });

    // Card decoration (background cards, tilted)
    const cardPositions = [
      { x: 80, y: 240, angle: -18 },
      { x: 560, y: 240, angle: 18 },
      { x: 100, y: 680, angle: -12 },
      { x: 540, y: 680, angle: 12 },
    ];
    cardPositions.forEach(({ x, y, angle }) => {
      const g = this.add.graphics().setAlpha(0.07);
      g.fillStyle(0xffffff);
      g.fillRoundedRect(x - 26, y - 38, 52, 76, 6);
      g.setAngle(angle);
    });

    // ── Title ──
    this.add.text(W / 2, 200, 'CARD', {
      fontSize: '56px', color: '#e8c97a', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W / 2, 258, 'DEFENSE', {
      fontSize: '56px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W / 2, 310, '포커 패 기반 타워 디펜스', {
      fontSize: '15px', color: '#8ab4d4',
    }).setOrigin(0.5);

    // ── Info box ──
    const boxY = 400;
    const boxH = 130;
    this.add.rectangle(W / 2, boxY, 360, boxH, 0x161b22).setStrokeStyle(1, 0x30363d);
    const lines = [
      { icon: '♥♦♣♠', text: '포커 패로 유닛을 소환하라' },
      { icon: '⚡',    text: '웨이브를 막고 강화를 선택하라' },
      { icon: '🏰',    text: '본진이 무너지면 게임 오버' },
    ];
    lines.forEach(({ icon, text }, i) => {
      const y = boxY - 36 + i * 38;
      this.add.text(W / 2 - 150, y, icon, { fontSize: '13px', color: '#e8c97a' }).setOrigin(0, 0.5);
      this.add.text(W / 2 - 110, y, text, { fontSize: '13px', color: '#8b949e' }).setOrigin(0, 0.5);
    });

    // ── Start button ──
    const btnBg = this.add.rectangle(W / 2, 560, 220, 52, 0x1a5e2a)
      .setStrokeStyle(2, 0x3fb950).setInteractive({ useHandCursor: true });
    const btnText = this.add.text(W / 2, 560, '▶  게임 시작', {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x238636);
      btnText.setStyle({ color: '#ffdd44' });
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x1a5e2a);
      btnText.setStyle({ color: '#ffffff' });
    });
    btnBg.on('pointerdown', () => this.scene.start('GameScene'));

    // ── Controls hint ──
    const controlsY = 760;
    this.add.text(W / 2, controlsY, '— 조작법 —', {
      fontSize: '11px', color: '#444c56'
    }).setOrigin(0.5);

    const controls = [
      '소환 버튼 → 패 평가 후 자동 배치',
      '유닛 클릭 → 선택 / 드래그 → 이동',
      '같은 패+등급 유닛 클릭 → 합성',
      '마법 버튼 → 강력한 스킬 발동',
    ];
    controls.forEach((line, i) => {
      this.add.text(W / 2, controlsY + 22 + i * 22, line, {
        fontSize: '12px', color: '#555d6b',
      }).setOrigin(0.5);
    });

    // ── Bottom decoration ──
    this.add.rectangle(W / 2, H - 4, W, 4, 0xe8c97a).setAlpha(0.4);
    this.add.text(W / 2, H - 20, 'v0.2  Card Defense', {
      fontSize: '10px', color: '#2d333b'
    }).setOrigin(0.5);

    // Subtle pulse on title
    this.tweens.add({
      targets: btnBg,
      scaleX: 1.04, scaleY: 1.04,
      yoyo: true,
      repeat: -1,
      duration: 1200,
      ease: 'Sine.easeInOut',
    });
  }
}
