import { ROLE } from './UnitData.js';
import { SUIT_COLORS } from '../cards/Card.js';
import { CELL_SIZE } from '../grid/Grid.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';

// n각형 점 배열 ({x,y} 형식, 위쪽 꼭짓점 기준, 로컬 원점 중심)
export function _ngon(n, r) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i * 360 / n - 90) * Math.PI / 180;
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
  });
}

// m각 별 점 배열
function _star(m, r, innerRatio) {
  return Array.from({ length: m * 2 }, (_, i) => {
    const a = (i * 180 / m - 90) * Math.PI / 180;
    const rad = i % 2 === 0 ? r : Math.round(r * innerRatio);
    return { x: rad * Math.cos(a), y: rad * Math.sin(a) };
  });
}

export const SHAPE_DEF = {
  [HAND_RANK.HIGH_CARD]:       { pts: r => _ngon(3, r), sw: 1.5, sc: 0x000000, sa: 0.55 },
  [HAND_RANK.ONE_PAIR]:        { pts: r => _ngon(4, r), sw: 1.5, sc: 0x000000, sa: 0.55 },
  [HAND_RANK.TWO_PAIR]:        { pts: r => _ngon(5, r), sw: 1.5, sc: 0x000000, sa: 0.55 },
  [HAND_RANK.THREE_OF_A_KIND]: { pts: r => _ngon(6, r), sw: 1.5, sc: 0x000000, sa: 0.55 },
  [HAND_RANK.STRAIGHT]:        { pts: r => _ngon(7, r), sw: 1.5, sc: 0x000000, sa: 0.55 },
  [HAND_RANK.FLUSH]:           { pts: r => _ngon(8, r), sw: 1.5, sc: 0x000000, sa: 0.55 },
  [HAND_RANK.FULL_HOUSE]:      { pts: r => _star(5, r, 0.45), sw: 2.0, sc: 0xffffff, sa: 0.5  },
  [HAND_RANK.FOUR_OF_A_KIND]:  { pts: r => _star(6, r, 0.45), sw: 2.0, sc: 0xffffff, sa: 0.6  },
  [HAND_RANK.STRAIGHT_FLUSH]:  { pts: r => _star(8, r, 0.48), sw: 2.5, sc: 0xffffff, sa: 0.75 },
};

// Graphics를 사용해 로컬 (0,0) = 월드 (x,y)로 정확히 중앙 배치
function _makeShape(scene, x, y, handRank, sz, color) {
  const r = Math.floor(sz / 2);
  const def = SHAPE_DEF[handRank] ?? SHAPE_DEF[HAND_RANK.ONE_PAIR];
  const pts = def.pts(r);

  const gfx = scene.add.graphics();
  gfx.setPosition(x, y);

  // 색상/스트로크 정보 보관
  gfx._shapePts = pts;
  gfx._fillColor = color;
  gfx._sw = def.sw;
  gfx._sc = def.sc;
  gfx._sa = def.sa;

  // Shape 오브젝트와 동일한 인터페이스 제공
  gfx.setFillStyle = function (c) {
    this._fillColor = c;
    this._redraw();
    return this;
  };

  gfx._redraw = function () {
    this.clear();
    this.fillStyle(this._fillColor, 1);
    this.fillPoints(this._shapePts, true, true);
    this.lineStyle(this._sw, this._sc, this._sa);
    this.strokePoints(this._shapePts, true, true);
  };

  gfx._redraw();
  return gfx;
}

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
    this._baseColor = color;
    const sz = Math.floor(CELL_SIZE * 0.55);
    this.sprite = _makeShape(scene, pos.x, pos.y, handRank, sz, color).setDepth(2);
    this.hpBar = scene.add.graphics().setDepth(3);
    this.gradeText = scene.add.text(pos.x, pos.y - Math.floor(CELL_SIZE * 0.22), `${grade}`, {
      fontSize: '11px', color: '#fff'
    }).setOrigin(0.5).setDepth(4);
    this._drawHpBar();
    this.glowCircle = null;
    this.selectCircle = null;
    this.rangeCircle = null;
    this.statusText = null;
    this.statusTimer = null;
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
    const newUntil = Date.now() + duration;
    if (newUntil <= this.frozenUntil) return; // 이미 더 길게 얼어있으면 무시
    this.frozen = true;
    this.frozenUntil = newUntil;
    this.sprite.setFillStyle(0xaaddff);
  }

  update(time) {
    if (this.frozen && Date.now() > this.frozenUntil) {
      this.frozen = false;
      this.sprite.setFillStyle(this._baseColor);
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
      this.glowCircle = this.scene.add.circle(pos.x, pos.y, Math.floor(CELL_SIZE * 0.38), 0xffdd00, 0.55).setDepth(1)
        .setStrokeStyle(2, 0xffff88, 0.9);
    } else if (!active && this.glowCircle) {
      this.glowCircle.destroy();
      this.glowCircle = null;
    }
  }

  setDim(active) {
    const alpha = active ? 0.28 : 1.0;
    this.sprite.setAlpha(alpha);
    this.gradeText.setAlpha(alpha);
    this.hpBar.setAlpha(alpha);
    if (this.glowCircle) this.glowCircle.setAlpha(active ? 0 : 1);
  }

  updateStatusPosition() {
    if (!this.statusText) return;
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    this.statusText.setPosition(pos.x, pos.y - Math.floor(CELL_SIZE * 0.5));
  }

  showStatusText(text, duration, color = 0xffee44) {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    if (this.statusText) this.statusText.destroy();
    if (this.statusTimer?.remove) this.statusTimer.remove(false);
    this.statusText = this.scene.add.text(pos.x, pos.y - Math.floor(CELL_SIZE * 0.5), text, {
      fontSize: '12px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(6);
    this.statusTimer = this.scene.time.delayedCall(duration, () => {
      if (this.statusText) {
        this.statusText.destroy();
        this.statusText = null;
      }
      this.statusTimer = null;
    });
  }

  destroy() {
    this.sprite.destroy();
    this.hpBar.destroy();
    this.gradeText.destroy();
    if (this.statusTimer?.remove) this.statusTimer.remove(false);
    if (this.statusText) this.statusText.destroy();
    if (this.glowCircle) this.glowCircle.destroy();
    if (this.selectCircle) this.selectCircle.destroy();
    if (this.rangeCircle) this.rangeCircle.destroy();
    if (this.highlightCircle) this.highlightCircle.destroy();
    if (this.dimOverlay) this.dimOverlay.destroy();
  }
}
