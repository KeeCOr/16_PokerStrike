import { ROLE } from './UnitData.js';
import { SUIT_COLORS } from '../cards/Card.js';
import { CELL_SIZE } from '../grid/Grid.js';

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
    const sz = Math.floor(CELL_SIZE * 0.55);
    this.sprite = scene.add.rectangle(pos.x, pos.y, sz, sz, color).setDepth(2);
    this.hpBar = scene.add.graphics().setDepth(3);
    this.gradeText = scene.add.text(pos.x, pos.y - Math.floor(CELL_SIZE * 0.22), `${grade}`, {
      fontSize: '11px', color: '#fff'
    }).setOrigin(0.5).setDepth(4);
    this._drawHpBar();
    this.glowCircle = null;
    this.selectCircle = null;
    this.rangeCircle = null;
  }

  _drawHpBar() {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    const hw = Math.floor(CELL_SIZE * 0.28); // half-width of bar
    const by = Math.floor(CELL_SIZE * 0.25); // y offset from center
    this.hpBar.clear();
    const ratio = this.hp / this.maxHp;
    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(pos.x - hw, pos.y + by, hw * 2, 4);
    this.hpBar.fillStyle(ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff4444);
    this.hpBar.fillRect(pos.x - hw, pos.y + by, Math.floor(hw * 2 * ratio), 4);
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

  setHighlight(active) {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    if (active && !this.highlightCircle) {
      this.highlightCircle = this.scene.add.circle(pos.x, pos.y, Math.floor(CELL_SIZE * 0.38), 0xffffff, 0.35).setDepth(1);
    } else if (!active && this.highlightCircle) {
      this.highlightCircle.destroy();
      this.highlightCircle = null;
    }
  }

  setSelected(active) {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    if (active && !this.selectCircle) {
      this.selectCircle = this.scene.add.circle(pos.x, pos.y, Math.floor(CELL_SIZE * 0.35), 0x00ffff, 0.45).setDepth(1);
      const rangeInPx = this.stats.range * CELL_SIZE;
      this.rangeCircle = this.scene.add.circle(pos.x, pos.y, rangeInPx, 0xffffff, 0.06)
        .setStrokeStyle(1, 0xffffff, 0.45).setDepth(1);
    } else if (!active && this.selectCircle) {
      this.selectCircle.destroy();
      this.selectCircle = null;
      if (this.rangeCircle) { this.rangeCircle.destroy(); this.rangeCircle = null; }
    }
  }

  setGlow(active) {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    if (active && !this.glowCircle) {
      this.glowCircle = this.scene.add.circle(pos.x, pos.y, Math.floor(CELL_SIZE * 0.32), 0xffff00, 0.35).setDepth(1);
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
    if (this.selectCircle) this.selectCircle.destroy();
    if (this.rangeCircle) this.rangeCircle.destroy();
    if (this.highlightCircle) this.highlightCircle.destroy();
  }
}
