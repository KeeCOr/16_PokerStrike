export default class HUD {
  constructor(scene) {
    this.scene = scene;
    const panelY = 744;

    // Bottom panel background
    scene.add.rectangle(320, panelY + 108, 640, 216, 0x07111d, 0.98).setDepth(10)
      .setStrokeStyle(2, 0x17496a, 0.9);
    scene.add.rectangle(320, panelY + 22, 612, 42, 0x050b14, 0.96).setDepth(10)
      .setStrokeStyle(1, 0x2b5d78, 0.75);
    scene.add.rectangle(320, panelY + 86, 612, 82, 0x0b1725, 0.92).setDepth(10)
      .setStrokeStyle(1, 0x2b5d78, 0.65);
    scene.add.rectangle(320, panelY + 170, 612, 62, 0x081522, 0.92).setDepth(10)
      .setStrokeStyle(1, 0x2b5d78, 0.75);

    // Resources and wave are intentionally separated for readability.
    this._drawHudShell(118, 12, 196, 24, 0x342a12, 0xffcc55);
    this._drawHudShell(320, 12, 174, 24, 0x102d46, 0x55cfff);
    this._drawHudShell(526, 12, 156, 24, 0x331852, 0xc88cff);

    this.goldText = scene.add.text(118, 12, '● 골드 20', {
      fontSize: '15px', color: '#ffd766', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.waveText = scene.add.text(286, 12, '웨이브 1', {
      fontSize: '13px', color: '#a9e8ff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.enemyCountText = scene.add.text(364, 12, '', {
      fontSize: '11px', color: '#ffb36b'
    }).setOrigin(0.5).setDepth(11);
    this.gemText = scene.add.text(526, 12, '◆ 보석 0', {
      fontSize: '14px', color: '#dca6ff', fontStyle: 'bold'
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

  _drawHudShell(x, y, w, h, fill, stroke) {
    this.scene.add.rectangle(x, y, w, h, 0x02070d, 0.72).setDepth(9);
    this.scene.add.rectangle(x, y, w - 4, h - 4, fill, 0.86).setDepth(10)
      .setStrokeStyle(1, stroke, 0.75);
  }
}
