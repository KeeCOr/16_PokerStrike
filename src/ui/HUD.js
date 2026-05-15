export default class HUD {
  constructor(scene) {
    this.scene = scene;
    const panelY = 744;

    // Bottom panel background
    scene.add.rectangle(320, panelY + 108, 640, 216, 0x07111d, 0.98).setDepth(10)
      .setStrokeStyle(2, 0x17496a, 0.9);
    scene.add.rectangle(320, panelY + 31, 612, 92, 0x0b1725, 0.92).setDepth(10)
      .setStrokeStyle(1, 0x2b5d78, 0.65);
    scene.add.rectangle(320, panelY + 139, 612, 56, 0x081522, 0.92).setDepth(10)
      .setStrokeStyle(1, 0x2b5d78, 0.65);
    scene.add.rectangle(320, panelY + 193, 612, 44, 0x050b14, 0.96).setDepth(10)
      .setStrokeStyle(1, 0x2b5d78, 0.75);

    // Compact top HUD, kept above the grid cells to avoid covering play space.
    this._drawHudShell(74, 10, 128, 20, 0x1e3a44, 0x66e0ff);
    this._drawHudShell(218, 10, 128, 20, 0x342a12, 0xffcc55);
    this._drawHudShell(382, 10, 160, 20, 0x102d46, 0x55cfff);
    this._drawHudShell(556, 10, 128, 20, 0x331852, 0xc88cff);

    this.hpText = scene.add.text(74, 10, '♥ 체력 100', {
      fontSize: '12px', color: '#ff7777', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.goldText = scene.add.text(218, 10, '● 골드 20', {
      fontSize: '12px', color: '#f0ca65', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.waveText = scene.add.text(350, 10, '웨이브 1', {
      fontSize: '12px', color: '#88ddff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.enemyCountText = scene.add.text(424, 10, '', {
      fontSize: '11px', color: '#ffb36b'
    }).setOrigin(0.5).setDepth(11);
    this.gemText = scene.add.text(556, 10, '◆ 보석 0', {
      fontSize: '12px', color: '#d08cff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    const onHp    = (_, val) => { if (this.hpText?.active)         this.hpText.setText(`♥ 체력 ${val}`); };
    const onGold  = (_, val) => { if (this.goldText?.active)       this.goldText.setText(`● 골드 ${val}`); };
    const onGems  = (_, val) => { if (this.gemText?.active)        this.gemText.setText(`◆ 보석 ${val}`); };
    const onWave  = (_, val) => { if (this.waveText?.active)       this.waveText.setText(`웨이브 ${val}`); };
    const onCount = (_, val) => { if (this.enemyCountText?.active) this.enemyCountText.setText(`적 ${val}`); };

    scene.registry.events.on('changedata-baseHp',    onHp);
    scene.registry.events.on('changedata-gold',      onGold);
    scene.registry.events.on('changedata-gems',      onGems);
    scene.registry.events.on('changedata-wave',      onWave);
    scene.registry.events.on('changedata-enemyCount', onCount);

    scene.events.once('shutdown', () => {
      scene.registry.events.off('changedata-baseHp',    onHp);
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
