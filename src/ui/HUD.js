import { PANEL_Y } from '../grid/Grid.js';
import { THEME } from '../theme.js';

export const HUD_LAYOUT = {
  RESOURCE_PANEL: { x: 154, y: 14, w: 280, h: 30 },
  GOLD_TEXT: { x: 88, y: 14 },
  GEM_TEXT: { x: 220, y: 14 },
  WAVE_PANEL: { x: 464, y: 14, w: 248, h: 32 },
  WAVE_TEXT: { x: 420, y: 14 },
  ENEMY_COUNT_TEXT: { x: 524, y: 14 },
  RESOURCE_WAVE_GAP: 26,
};

export default class HUD {
  constructor(scene) {
    this.scene = scene;
    const panelY = PANEL_Y;

    // Bottom panel background
    scene.add.rectangle(320, panelY + 108, 640, 216, THEME.bg.base, 0.98).setDepth(10)
      .setStrokeStyle(2, 0x17496a, 0.9);
    scene.add.rectangle(320, panelY + 22, 612, 42, 0x050b14, 0.96).setDepth(10)
      .setStrokeStyle(1, THEME.ui.border, 0.75);
    scene.add.rectangle(320, panelY + 86, 612, 82, 0x0b1725, 0.92).setDepth(10)
      .setStrokeStyle(1, THEME.ui.border, 0.65);
    scene.add.rectangle(320, panelY + 170, 612, 62, 0x081522, 0.92).setDepth(10)
      .setStrokeStyle(1, THEME.ui.border, 0.75);

    this._drawResourceCluster();
    this._drawWaveBadge();

    this.goldText = scene.add.text(HUD_LAYOUT.GOLD_TEXT.x, HUD_LAYOUT.GOLD_TEXT.y, '● 골드 20', {
      fontSize: '15px', color: '#ffd766', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.gemText = scene.add.text(HUD_LAYOUT.GEM_TEXT.x, HUD_LAYOUT.GEM_TEXT.y, '◆ 보석 0', {
      fontSize: '14px', color: '#dca6ff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.waveText = scene.add.text(HUD_LAYOUT.WAVE_TEXT.x, HUD_LAYOUT.WAVE_TEXT.y, '웨이브 1', {
      fontSize: '14px', color: '#bceeff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.enemyCountText = scene.add.text(HUD_LAYOUT.ENEMY_COUNT_TEXT.x, HUD_LAYOUT.ENEMY_COUNT_TEXT.y, '', {
      fontSize: '12px', color: '#ffbd7a', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    const onGold  = (_, val) => { if (this.goldText?.active)       this.goldText.setText(`● 골드 ${val}`); };
    const onGems  = (_, val) => { if (this.gemText?.active)        this.gemText.setText(`◆ 보석 ${val}`); };
    const onWave  = (_, val) => { if (this.waveText?.active)       this.waveText.setText(`웨이브 ${val}`); };
    const onCount = (_, val) => { if (this.enemyCountText?.active) this.enemyCountText.setText(`적 ${val}`); };

    scene.registry.events.on('changedata-gold',      onGold);
    scene.registry.events.on('changedata-gems',      onGems);
    scene.registry.events.on('changedata-wave',      onWave);
    scene.registry.events.on('changedata-enemyCount', onCount);

    scene.events.once('shutdown', () => {
      scene.registry.events.off('changedata-gold',      onGold);
      scene.registry.events.off('changedata-gems',      onGems);
      scene.registry.events.off('changedata-wave',      onWave);
      scene.registry.events.off('changedata-enemyCount', onCount);
    });
  }

  _drawResourceCluster() {
    const { x, y, w, h } = HUD_LAYOUT.RESOURCE_PANEL;
    this._drawHudShell(x, y, w, h, 0x1d1b21, THEME.text.gold);
    this.scene.add.rectangle(x - 8, y, 2, h - 10, 0x6f5c35, 0.8).setDepth(11);
  }

  _drawWaveBadge() {
    const { x, y, w, h } = HUD_LAYOUT.WAVE_PANEL;
    this.scene.add.rectangle(x, y, w, h, 0x02070d, 0.78).setDepth(9);
    this.scene.add.rectangle(x, y, w - 4, h - 4, 0x0b2840, 0.92).setDepth(10)
      .setStrokeStyle(2, 0x65d9ff, 0.9);
    this.scene.add.rectangle(x - 70, y, 2, h - 10, 0x65d9ff, 0.45).setDepth(11);
  }

  _drawHudShell(x, y, w, h, fill, stroke) {
    this.scene.add.rectangle(x, y, w, h, 0x02070d, 0.72).setDepth(9);
    this.scene.add.rectangle(x, y, w - 4, h - 4, fill, 0.86).setDepth(10)
      .setStrokeStyle(1, stroke, 0.75);
  }
}
