export default class HUD {
  constructor(scene) {
    this.scene = scene;
    const panelY = 744;

    // Bottom panel background
    scene.add.rectangle(320, panelY + 108, 640, 216, 0x0a0f1e, 0.95).setDepth(10);

    // Top-right: HP and Gold overlay on game area
    scene.add.rectangle(600, 26, 90, 44, 0x0a0f1e, 0.75).setDepth(10);
    this.hpText = scene.add.text(634, 12, '♥ 100', {
      fontSize: '14px', color: '#ff6666', fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(11);
    this.goldText = scene.add.text(634, 32, '● 20', {
      fontSize: '14px', color: '#e8c97a', fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(11);

    // Wave - top center
    scene.add.rectangle(320, 10, 160, 18, 0x0a0f1e, 0.7).setDepth(10);
    this.waveText = scene.add.text(260, 3, 'Wave 1', {
      fontSize: '14px', color: '#88ccff'
    }).setOrigin(0.5, 0).setDepth(11);
    this.enemyCountText = scene.add.text(360, 3, '', {
      fontSize: '12px', color: '#ff9966'
    }).setOrigin(0.5, 0).setDepth(11);

    const onHp    = (_, val) => { if (this.hpText?.active)         this.hpText.setText(`♥ ${val}`); };
    const onGold  = (_, val) => { if (this.goldText?.active)       this.goldText.setText(`● ${val}`); };
    const onWave  = (_, val) => { if (this.waveText?.active)       this.waveText.setText(`Wave ${val}`); };
    const onCount = (_, val) => { if (this.enemyCountText?.active) this.enemyCountText.setText(`적 ${val}`); };

    scene.registry.events.on('changedata-baseHp',    onHp);
    scene.registry.events.on('changedata-gold',      onGold);
    scene.registry.events.on('changedata-wave',      onWave);
    scene.registry.events.on('changedata-enemyCount', onCount);

    scene.events.once('shutdown', () => {
      scene.registry.events.off('changedata-baseHp',    onHp);
      scene.registry.events.off('changedata-gold',      onGold);
      scene.registry.events.off('changedata-wave',      onWave);
      scene.registry.events.off('changedata-enemyCount', onCount);
    });
  }
}
