import { PANEL_Y } from '../grid/Grid.js';
import { UI_TEXTURES } from '../assets/art/AssetKeys.js';
import { THEME } from '../theme.js';

export const HUD_LAYOUT = {
  RESOURCE_PANEL: { x: 536, y: 26, w: 176, h: 32, paddingX: 14 },
  GOLD_ICON: { x: 472, y: 26, size: 22 },
  GOLD_TEXT: { x: 522, y: 26, originX: 1, maxWidth: 42 },
  GEM_ICON: { x: 552, y: 26, size: 22 },
  GEM_TEXT: { x: 608, y: 26, originX: 1, maxWidth: 42 },
  WAVE_PANEL: { x: 320, y: 26, w: 188, h: 32 },
  WAVE_BADGE_DISPLAY: { w: 192, h: 42 },
  WAVE_TEXT: { x: 320, y: 26, offsetY: 0 },
  ENEMY_COUNT_TEXT: { x: 386, y: 26 },
  RESOURCE_WAVE_GAP: 10,
};

export default class HUD {
  constructor(scene) {
    this.scene = scene;
    const panelY = PANEL_Y;

    scene.add.rectangle(320, panelY + 104, 640, 208, THEME.bg.base, 0.98).setDepth(10)
      .setStrokeStyle(2, 0x17496a, 0.9);
    scene.add.rectangle(320, panelY + 22, 612, 42, 0x050b14, 0.96).setDepth(10)
      .setStrokeStyle(1, THEME.ui.border, 0.75);
    scene.add.rectangle(320, panelY + 86, 612, 82, 0x0b1725, 0.92).setDepth(10)
      .setStrokeStyle(1, THEME.ui.border, 0.65);
    scene.add.rectangle(320, panelY + 170, 612, 62, 0x081522, 0.92).setDepth(10)
      .setStrokeStyle(1, THEME.ui.border, 0.75);

    this._drawResourceCluster();
    this._drawWaveBadge();
    this._drawResourceIcon(UI_TEXTURES.RESOURCE_GOLD, HUD_LAYOUT.GOLD_ICON, 0xffc247);
    this._drawResourceIcon(UI_TEXTURES.RESOURCE_GEM, HUD_LAYOUT.GEM_ICON, 0xc677ff);

    this.goldText = scene.add.text(HUD_LAYOUT.GOLD_TEXT.x, HUD_LAYOUT.GOLD_TEXT.y, '20', {
      fontSize: '17px', color: '#ffd766', fontStyle: 'bold'
    }).setOrigin(HUD_LAYOUT.GOLD_TEXT.originX, 0.5).setDepth(11);
    this.gemText = scene.add.text(HUD_LAYOUT.GEM_TEXT.x, HUD_LAYOUT.GEM_TEXT.y, '0', {
      fontSize: '16px', color: '#dca6ff', fontStyle: 'bold'
    }).setOrigin(HUD_LAYOUT.GEM_TEXT.originX, 0.5).setDepth(11);
    this.waveText = scene.add.text(HUD_LAYOUT.WAVE_TEXT.x, HUD_LAYOUT.WAVE_TEXT.y, 'Wave 1', {
      fontSize: '15px', color: '#bceeff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.enemyCountText = scene.add.text(HUD_LAYOUT.ENEMY_COUNT_TEXT.x, HUD_LAYOUT.ENEMY_COUNT_TEXT.y, '', {
      fontSize: '11px', color: '#ffbd7a', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    const onGold = (_, val) => { if (this.goldText?.active) this.goldText.setText(`${val}`); };
    const onGems = (_, val) => { if (this.gemText?.active) this.gemText.setText(`${val}`); };
    const onWave = (_, val) => { if (this.waveText?.active) this.waveText.setText(`Wave ${val}`); };
    const onCount = (_, val) => { if (this.enemyCountText?.active) this.enemyCountText.setText(`${val}`); };

    scene.registry.events.on('changedata-gold', onGold);
    scene.registry.events.on('changedata-gems', onGems);
    scene.registry.events.on('changedata-wave', onWave);
    scene.registry.events.on('changedata-enemyCount', onCount);

    scene.events.once('shutdown', () => {
      scene.registry.events.off('changedata-gold', onGold);
      scene.registry.events.off('changedata-gems', onGems);
      scene.registry.events.off('changedata-wave', onWave);
      scene.registry.events.off('changedata-enemyCount', onCount);
    });
  }

  _drawResourceCluster() {
    const { x, y, w, h } = HUD_LAYOUT.RESOURCE_PANEL;
    if (this.scene.textures?.exists?.(UI_TEXTURES.PANEL_RESOURCE) && this.scene.add.image) {
      this.scene.add.image(x, y, UI_TEXTURES.PANEL_RESOURCE)
        .setDepth(10)
        .setDisplaySize(w + 12, h + 18)
        .setAlpha(0.96);
    } else {
      this._drawHudShell(x, y, w, h, 0x1d1b21, THEME.text.gold);
      this.scene.add.rectangle(x - 8, y, 2, h - 10, 0x6f5c35, 0.8).setDepth(11);
    }
  }

  _drawWaveBadge() {
    const { x, y, w, h } = HUD_LAYOUT.WAVE_PANEL;
    const display = HUD_LAYOUT.WAVE_BADGE_DISPLAY;
    if (this.scene.textures?.exists?.(UI_TEXTURES.BADGE_WAVE) && this.scene.add.image) {
      this.scene.add.image(x, y, UI_TEXTURES.BADGE_WAVE)
        .setDepth(10)
        .setDisplaySize(display.w, display.h)
        .setAlpha(0.96);
    } else {
      this.scene.add.rectangle(x, y, w, h, 0x02070d, 0.78).setDepth(9);
      this.scene.add.rectangle(x, y, w - 4, h - 4, 0x0b2840, 0.92).setDepth(10)
        .setStrokeStyle(2, 0x65d9ff, 0.9);
      this.scene.add.rectangle(x - 70, y, 2, h - 10, 0x65d9ff, 0.45).setDepth(11);
    }
  }

  _drawResourceIcon(textureKey, layout, fallbackColor) {
    const { x, y, size } = layout;
    if (this.scene.textures?.exists?.(textureKey) && this.scene.add.image) {
      this.scene.add.image(x, y, textureKey)
        .setDepth(11)
        .setDisplaySize(size, size);
      return;
    }
    this.scene.add.circle(x, y, size / 2, fallbackColor, 0.92).setDepth(11)
      .setStrokeStyle(1, 0xffffff, 0.55);
  }

  _drawHudShell(x, y, w, h, fill, stroke) {
    this.scene.add.rectangle(x, y, w, h, 0x02070d, 0.72).setDepth(9);
    this.scene.add.rectangle(x, y, w - 4, h - 4, fill, 0.86).setDepth(10)
      .setStrokeStyle(1, stroke, 0.75);
  }
}






