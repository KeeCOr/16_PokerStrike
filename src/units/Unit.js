import { ROLE } from './UnitData.js';
import { SUIT_COLORS } from '../cards/Card.js';

export default class Unit {
  constructor(scene, col, row, handRank, suit, grade, stats) {
    this.scene = scene;
    this.col = col;
    this.row = row;
    this.handRank = handRank;
    this.suit = suit;
    this.grade = grade;
    this.stats = { ...stats };
    this.hp = stats.hp;
    this.maxHp = stats.maxHp;
    this.atkCooldown = 0;
    this.target = null;
    this.frozen = false;
    this.frozenUntil = 0;

    const pos = scene.grid.cellToWorld(col, row);
    const color = SUIT_COLORS[suit] ?? 0xffffff;
    this.sprite = scene.add.rectangle(pos.x, pos.y, 36, 36, color).setDepth(2);
    this.hpBar = scene.add.graphics().setDepth(3);
    this.gradeText = scene.add.text(pos.x, pos.y - 14, `${grade}`, {
      fontSize: '10px', color: '#fff'
    }).setOrigin(0.5).setDepth(4);
    this._drawHpBar();
    this.glowCircle = null;
  }

  _drawHpBar() {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    this.hpBar.clear();
    const ratio = this.hp / this.maxHp;
    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(pos.x - 18, pos.y + 16, 36, 4);
    this.hpBar.fillStyle(ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff4444);
    this.hpBar.fillRect(pos.x - 18, pos.y + 16, Math.floor(36 * ratio), 4);
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this._drawHpBar();
    return this.hp <= 0;
  }

  freeze(duration) {
    this.frozen = true;
    this.frozenUntil = Date.now() + duration;
    this.sprite.setFillStyle(0xaaddff);
  }

  update(time) {
    if (this.frozen && Date.now() > this.frozenUntil) {
      this.frozen = false;
      this.sprite.setFillStyle(SUIT_COLORS[this.suit] ?? 0xffffff);
    }
  }

  setGlow(active) {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    if (active && !this.glowCircle) {
      this.glowCircle = this.scene.add.circle(pos.x, pos.y, 22, 0xffff00, 0.35).setDepth(1);
    } else if (!active && this.glowCircle) {
      this.glowCircle.destroy();
      this.glowCircle = null;
    }
  }

  destroy() {
    this.sprite.destroy();
    this.hpBar.destroy();
    this.gradeText.destroy();
    if (this.glowCircle) this.glowCircle.destroy();
  }
}
