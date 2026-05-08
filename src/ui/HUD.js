export default class HUD {
  constructor(scene) {
    this.scene = scene;
    const y = 650;

    scene.add.rectangle(240, y + 95, 480, 190, 0x0a0f1e, 0.95).setDepth(10);

    this.hpText = scene.add.text(20, y + 10, 'HP: 100', {
      fontSize: '16px', color: '#ff6666'
    }).setDepth(11);

    this.goldText = scene.add.text(20, y + 35, 'Gold: 20', {
      fontSize: '16px', color: '#e8c97a'
    }).setDepth(11);

    this.waveText = scene.add.text(460, y + 10, 'Wave 1', {
      fontSize: '16px', color: '#88ccff'
    }).setOrigin(1, 0).setDepth(11);

    scene.registry.events.on('changedata-baseHp', (_, val) => {
      this.hpText.setText(`HP: ${val}`);
    });
    scene.registry.events.on('changedata-gold', (_, val) => {
      this.goldText.setText(`Gold: ${val}`);
    });
    scene.registry.events.on('changedata-wave', (_, val) => {
      this.waveText.setText(`Wave ${val}`);
    });
  }
}
