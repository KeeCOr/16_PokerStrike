import { ROLE } from './UnitData.js';
import { SUIT_COLORS } from '../cards/Card.js';
import { CELL_SIZE } from '../grid/Grid.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';
import { getTowerTextureKey } from '../assets/art/AssetKeys.js';

// n媛곹삎 ??諛곗뿴 ({x,y} ?뺤떇, ?꾩そ 瑗?쭞??湲곗?, 濡쒖뺄 ?먯젏 以묒떖)
export function _ngon(n, r) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i * 360 / n - 90) * Math.PI / 180;
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
  });
}

// m媛?蹂???諛곗뿴
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

export const HAND_RANK_VISUAL = {
  [HAND_RANK.HIGH_CARD]:       { size: 0.29,  ring: 0,     glow: 0,     stroke: 0x5f6b78, label: 'I',   ornament: 'base',        ornamentTier: 0 },
  [HAND_RANK.ONE_PAIR]:        { size: 0.31,  ring: 0,     glow: 0,     stroke: 0x77889a, label: 'II',  ornament: 'side-pips',   ornamentTier: 1 },
  [HAND_RANK.TWO_PAIR]:        { size: 0.33,  ring: 0.09,  glow: 0.018, stroke: 0x8aa2b8, label: 'III', ornament: 'dual-guard',  ornamentTier: 2 },
  [HAND_RANK.THREE_OF_A_KIND]: { size: 0.35, ring: 0.105, glow: 0.024, stroke: 0x9fd0ff, label: 'IV',  ornament: 'tri-spire',   ornamentTier: 3 },
  [HAND_RANK.STRAIGHT]:        { size: 0.37,  ring: 0.13,  glow: 0.032, stroke: 0xffd166, label: 'V',   ornament: 'blade-crown', ornamentTier: 4 },
  [HAND_RANK.FLUSH]:           { size: 0.39, ring: 0.15,  glow: 0.040, stroke: 0x7af6ff, label: 'VI',  ornament: 'halo-crown',  ornamentTier: 5 },
  [HAND_RANK.FULL_HOUSE]:      { size: 0.42,  ring: 0.17,  glow: 0.048, stroke: 0xff9f43, label: 'VII', ornament: 'royal-core',  ornamentTier: 6 },
  [HAND_RANK.FOUR_OF_A_KIND]:  { size: 0.45, ring: 0.19,  glow: 0.056, stroke: 0xffef7a, label: 'VIII', ornament: 'quad-spire', ornamentTier: 7 },
  [HAND_RANK.STRAIGHT_FLUSH]:  { size: 0.48,  ring: 0.21,  glow: 0.064, stroke: 0xffffff, label: 'MAX', ornament: 'max-crown',   ornamentTier: 8 },
};

export const TOWER_VISUAL_STYLE = {
  SPRITE_PADDING: 1,
  MAX_DISPLAY_RATIO: 0.52,
};

export function getHandRankVisual(handRank) {
  return HAND_RANK_VISUAL[handRank] ?? HAND_RANK_VISUAL[HAND_RANK.HIGH_CARD];
}

// Graphics瑜??ъ슜??濡쒖뺄 (0,0) = ?붾뱶 (x,y)濡??뺥솗??以묒븰 諛곗튂
function _makeShape(scene, x, y, handRank, sz, color) {
  const r = Math.floor(sz / 2);
  const def = SHAPE_DEF[handRank] ?? SHAPE_DEF[HAND_RANK.ONE_PAIR];
  const pts = def.pts(r);

  const gfx = scene.add.graphics();
  gfx.setPosition(x, y);

  // ?됱긽/?ㅽ듃濡쒗겕 ?뺣낫 蹂닿?
  gfx._shapePts = pts;
  gfx._fillColor = color;
  gfx._sw = def.sw;
  gfx._sc = def.sc;
  gfx._sa = def.sa;

  // Shape ?ㅻ툕?앺듃? ?숈씪???명꽣?섏씠???쒓났
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

function _makeRankOrnament(scene, x, y, visual, color) {
  if (!visual?.ornamentTier || !scene.add.graphics) return null;
  const tier = visual.ornamentTier;
  const accent = visual.stroke ?? color;
  const top = y - Math.floor(CELL_SIZE * (0.10 + Math.min(tier, 5) * 0.004));
  const side = Math.floor(CELL_SIZE * (0.07 + Math.min(tier, 4) * 0.004));
  const gfx = scene.add.graphics().setDepth(3);

  gfx.lineStyle(1, 0x000000, 0.45);
  gfx.fillStyle(accent, tier >= 5 ? 0.92 : 0.78);

  if (visual.ornament === 'side-pips') {
    gfx.fillCircle(x - side, y - 2, 1.8);
    gfx.fillCircle(x + side, y - 2, 1.8);
  } else if (visual.ornament === 'dual-guard') {
    gfx.fillCircle(x - side, top + 7, 2.1);
    gfx.fillCircle(x + side, top + 7, 2.1);
    gfx.lineBetween(x - side, top + 11, x - side, top + 18);
    gfx.lineBetween(x + side, top + 11, x + side, top + 18);
  } else if (visual.ornament === 'tri-spire') {
    gfx.fillTriangle(x, top - 4, x - 4, top + 7, x + 4, top + 7);
    gfx.fillTriangle(x - side, top + 3, x - side - 3, top + 11, x - side + 3, top + 11);
    gfx.fillTriangle(x + side, top + 3, x + side - 3, top + 11, x + side + 3, top + 11);
  } else if (visual.ornament === 'blade-crown') {
    gfx.fillTriangle(x, top - 5, x - 5, top + 8, x + 5, top + 8);
    gfx.lineBetween(x - side, y + 10, x + side, y + 10);
  } else if (visual.ornament === 'halo-crown') {
    gfx.strokeCircle(x, y, Math.floor(CELL_SIZE * 0.14));
    gfx.fillTriangle(x, top - 5, x - 5, top + 8, x + 5, top + 8);
  } else if (visual.ornament === 'royal-core') {
    gfx.fillCircle(x, y, 3.2);
    gfx.strokeCircle(x, y, Math.floor(CELL_SIZE * 0.15));
    gfx.fillTriangle(x, top - 6, x - 6, top + 9, x + 6, top + 9);
  } else if (visual.ornament === 'quad-spire') {
    gfx.strokeCircle(x, y, Math.floor(CELL_SIZE * 0.16));
    [-1, 1].forEach(dir => {
      gfx.fillTriangle(x + dir * side, top, x + dir * (side - 4), top + 11, x + dir * (side + 4), top + 11);
    });
    gfx.fillTriangle(x, top - 7, x - 5, top + 9, x + 5, top + 9);
  } else if (visual.ornament === 'max-crown') {
    gfx.strokeCircle(x, y, Math.floor(CELL_SIZE * 0.17));
    gfx.fillCircle(x, y, 3.6);
    [-1, 0, 1].forEach(dir => {
      const px = x + dir * Math.floor(side * 0.75);
      gfx.fillTriangle(px, top - (dir === 0 ? 8 : 2), px - 5, top + 10, px + 5, top + 10);
    });
  }

  return gfx;
}
function _makeTowerSprite(scene, x, y, handRank, suit, sz, color) {
  const textureKey = getTowerTextureKey(suit);
  if (scene.textures?.exists?.(textureKey) && scene.add.image) {
    const image = scene.add.image(x, y, textureKey)
      .setDisplaySize(sz + TOWER_VISUAL_STYLE.SPRITE_PADDING, sz + TOWER_VISUAL_STYLE.SPRITE_PADDING);
    image._baseColor = color;
    image.setFillStyle = function (c) {
      if (c === this._baseColor && this.clearTint) {
        this.clearTint();
      } else if (this.setTint) {
        this.setTint(c);
      }
      return this;
    };
    return image;
  }
  return _makeShape(scene, x, y, handRank, sz, color);
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
    const visual = getHandRankVisual(handRank);
    this._visual = visual;
    if (visual.glow > 0) {
      this.rankHalo = scene.add.circle(pos.x, pos.y, Math.floor(CELL_SIZE * (visual.ring + 0.04)), color, visual.glow)
        .setDepth(1);
    }
    if (visual.ring > 0) {
      this.rankRing = scene.add.circle(pos.x, pos.y, Math.floor(CELL_SIZE * visual.ring), 0xffffff, 0)
        .setStrokeStyle(handRank >= HAND_RANK.FULL_HOUSE ? 3 : 2, visual.stroke, handRank >= HAND_RANK.STRAIGHT ? 0.95 : 0.72)
        .setDepth(1);
    }
    const sz = Math.floor(CELL_SIZE * visual.size);
    this.sprite = _makeTowerSprite(scene, pos.x, pos.y, handRank, suit, sz, color).setDepth(2);
    this.rankOrnament = _makeRankOrnament(scene, pos.x, pos.y, visual, color);
    this.hpBar = scene.add.graphics().setDepth(3);
    this.gradeText = scene.add.text(pos.x, pos.y - Math.floor(CELL_SIZE * 0.18), `${visual.label}-${grade}`, {
      fontSize: handRank >= HAND_RANK.FULL_HOUSE ? '11px' : '9px',
      color: handRank >= HAND_RANK.STRAIGHT ? '#ffef9a' : '#dcecff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(4);
    this._drawHpBar();
    this.glowCircle = null;
    this.selectCircle = null;
    this.rangeCircle = null;
    this.statusText = null;
    this.statusTimer = null;
  }

  updateBoardPosition() {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    this.sprite.setPosition(pos.x, pos.y);
    this.gradeText.setPosition(pos.x, pos.y - Math.floor(CELL_SIZE * 0.18));
    if (this.glowCircle) this.glowCircle.setPosition(pos.x, pos.y);
    if (this.highlightCircle) this.highlightCircle.setPosition(pos.x, pos.y);
    if (this.selectCircle) this.selectCircle.setPosition(pos.x, pos.y);
    if (this.rangeCircle) this.rangeCircle.setPosition(pos.x, pos.y);
    if (this.rankHalo) this.rankHalo.setPosition(pos.x, pos.y);
    if (this.rankRing) this.rankRing.setPosition(pos.x, pos.y);
    if (this.rankOrnament) {
      this.rankOrnament.destroy();
      this.rankOrnament = _makeRankOrnament(this.scene, pos.x, pos.y, this._visual, this._baseColor);
    }
    this.updateStatusPosition?.();
    this._drawHpBar();
  }
  _drawHpBar() {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    const hw = Math.floor(CELL_SIZE * 0.28); // half-width of bar
    const by = Math.floor(CELL_SIZE * 0.25); // y offset from center
    this.hpBar.clear();
    const ratio = this.hp / this.maxHp;
    if (ratio >= 1) {
      this.hpBar.setVisible?.(false);
      return;
    }
    this.hpBar.setVisible?.(true);
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
    if (newUntil <= this.frozenUntil) return; // ?대? ??湲멸쾶 ?쇱뼱?덉쑝硫?臾댁떆
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
    if (this.rankRing) this.rankRing.setAlpha(active ? 0.2 : 1);
    if (this.rankHalo) this.rankHalo.setAlpha(active ? 0.05 : 1);
    if (this.rankOrnament) this.rankOrnament.setAlpha(active ? 0.24 : 1);
  }

  updateStatusPosition() {
    if (!this.statusText) return;
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    this.statusText.setPosition(pos.x, pos.y - Math.floor(CELL_SIZE * 0.5));
  }

  showStatusText(text, duration, color = 0xffee44) {
    if (typeof this.scene.showBattleMessage === 'function') {
      const colorHex = `#${color.toString(16).padStart(6, '0')}`;
      this.scene.showBattleMessage(text, colorHex, Math.min(duration, 1400));
      return;
    }
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
    if (this.rankRing) this.rankRing.destroy();
    if (this.rankHalo) this.rankHalo.destroy();
    if (this.rankOrnament) this.rankOrnament.destroy();
    if (this.selectCircle) this.selectCircle.destroy();
    if (this.rangeCircle) this.rangeCircle.destroy();
    if (this.highlightCircle) this.highlightCircle.destroy();
    if (this.dimOverlay) this.dimOverlay.destroy();
  }
}




