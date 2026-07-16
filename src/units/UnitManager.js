import Unit, { SHAPE_DEF } from './Unit.js';
import { getUnitStats, ROLE } from './UnitData.js';
import { CELL_UNIT, CELL_EMPTY, GRID_COLS, GRID_ROWS, CELL_SIZE, PANEL_Y } from '../grid/Grid.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';

const BASE_COL = Math.floor(GRID_COLS / 2);

export const SUMMON_PREVIEW_STYLE = {
  FILL_COLOR: 0x2f86ff,
  FILL_ALPHA: 0,
  LINE_COLOR: 0x72b9ff,
  LINE_ALPHA: 0.18,
  LINE_WIDTH: 1,
  CELL_PADDING: 9,
};

export const RANGE_DECAL_STYLE = {
  FILL_COLOR: 0x7fd7ff,
  FILL_ALPHA: 0.028,
  RING_COLOR: 0xbfefff,
  RING_ALPHA: 0.16,
  INNER_RING_ALPHA: 0.08,
  TICK_ALPHA: 0.18,
  TICK_COUNT: 16,
  TICK_LENGTH: 8,
  DEPTH: 0.65,
};
export const SUMMON_EFFECT_STYLE = {
  DURATION: 420,
  SPARK_COUNT: 8,
  OUTER_RING_COLOR: 0xffd36a,
  INNER_RING_COLOR: 0x72e9ff,
  RING_DEPTH: 5,
  SPARK_DEPTH: 6,
};

export default class UnitManager {
  constructor(scene) {
    this.scene = scene;
    this.units = [];
    this.onUnitSelected = null;
    this.onUnitDeselected = null;
    this._summonPreviewGfx = null;
  }

  _isValidPlacement(col, row) {
    if (row <= 0 || row >= GRID_ROWS) return false;
    if (row === GRID_ROWS - 1 && col === BASE_COL) return false;
    return true;
  }

  placeUnitRandom(handRank, suit, grade) {
    const em = this.scene.enemyManager;
    const emptyCells = [];
    for (let r = 1; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this._isValidPlacement(c, r) && this.scene.grid.isWalkable(c, r) && !(em && em.isEnemyAt(c, r)))
          emptyCells.push({ col: c, row: r });
      }
    }
    if (emptyCells.length === 0) return null;
    emptyCells.sort((a, b) => b.row - a.row);
    const pool = emptyCells.slice(0, Math.min(10, emptyCells.length));
    const cell = pool[Math.floor(Math.random() * pool.length)];
    const unit = this.placeUnit(cell.col, cell.row, handRank, suit, grade);
    if (unit && this.scene.enemyManager) this.scene.enemyManager.recalculateAllPaths();
    return unit;
  }

  placeUnit(col, row, handRank, suit, grade) {
    if (!this.scene.grid.isWalkable(col, row)) return null;
    const stats = getUnitStats(handRank, suit, grade);
    // ?곴뎄 媛뺥솕 蹂대꼫???곸슜
    const gs = this.scene;
    if (gs.permHpLevel > 0) {
      const bonus = 1 + gs.permHpLevel * 0.03;
      stats.hp = Math.floor(stats.hp * bonus);
      stats.maxHp = Math.floor(stats.maxHp * bonus);
    }
    if (gs.permAtkLevel > 0) {
      stats.atk = Math.floor(stats.atk * (1 + gs.permAtkLevel * 0.03));
    }
    const unit = new Unit(this.scene, col, row, handRank, suit, grade, stats);
    if (this.scene.rogueliteManager) this.scene.rogueliteManager.applyToUnit(unit);
    unit.upgradeHp = false;
    unit.upgradeAtk = false;
    this.units.push(unit);
    this.scene.grid.setCell(col, row, CELL_UNIT);
    this._checkMerge(unit);
    this._playSpawnEffect(col, row, unit);
    return unit;
  }

  _playSpawnEffect(col, row, unit) {
    const pos = this.scene.grid.cellToWorld(col, row);
    const style = SUMMON_EFFECT_STYLE;
    const suitColor = unit?._baseColor ?? 0xffffff;

    const outerRing = this.scene.add.circle(pos.x, pos.y, CELL_SIZE * 0.24, style.OUTER_RING_COLOR, 0.05).setDepth(style.RING_DEPTH);
    outerRing.setStrokeStyle?.(2, style.OUTER_RING_COLOR, 0.78);
    this.scene.tweens.add({
      targets: outerRing, alpha: 0, scaleX: 1.85, scaleY: 1.85,
      duration: style.DURATION, ease: 'Quad.easeOut',
      onComplete: () => outerRing.destroy(),
    });

    const innerRing = this.scene.add.circle(pos.x, pos.y, CELL_SIZE * 0.15, style.INNER_RING_COLOR, 0.08).setDepth(style.RING_DEPTH + 0.1);
    innerRing.setStrokeStyle?.(2, style.INNER_RING_COLOR, 0.9);
    this.scene.tweens.add({
      targets: innerRing, alpha: 0, scaleX: 1.35, scaleY: 1.35,
      duration: Math.floor(style.DURATION * 0.75), ease: 'Quad.easeOut',
      onComplete: () => innerRing.destroy(),
    });

    for (let i = 0; i < style.SPARK_COUNT; i++) {
      const angle = (i / style.SPARK_COUNT) * Math.PI * 2 - Math.PI / 2;
      const distance = CELL_SIZE * (0.24 + (i % 3) * 0.035);
      const spark = this.scene.add.circle(pos.x, pos.y, i % 2 === 0 ? 2.4 : 1.8, suitColor, 0.72).setDepth(style.SPARK_DEPTH);
      this.scene.tweens.add({
        targets: spark,
        x: pos.x + Math.cos(angle) * distance,
        y: pos.y + Math.sin(angle) * distance - CELL_SIZE * 0.08,
        alpha: 0,
        scaleX: 0.28,
        scaleY: 0.28,
        delay: i * 12,
        duration: Math.floor(style.DURATION * 0.72),
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }

    // Preserve setDisplaySize() image scale; tweening to 1 would restore the 256px source size.
    const targetScaleX = Number.isFinite(unit.sprite.scaleX) ? unit.sprite.scaleX : 1;
    const targetScaleY = Number.isFinite(unit.sprite.scaleY) ? unit.sprite.scaleY : targetScaleX;
    unit.sprite.setAlpha(0).setScale(targetScaleX * 0.15, targetScaleY * 0.15);
    this.scene.tweens.add({
      targets: unit.sprite, alpha: 1, scaleX: targetScaleX, scaleY: targetScaleY,
      duration: Math.floor(style.DURATION * 0.72), ease: 'Back.easeOut',
    });
  }

  // ?? Summon placement preview ??????????????????????????????????
  showSummonPreview() {
    this.hideSummonPreview();
    const emptyCells = [];
    for (let r = 1; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this._isValidPlacement(c, r) && this.scene.grid.isWalkable(c, r)) emptyCells.push({ col: c, row: r });
      }
    }
    emptyCells.sort((a, b) => b.row - a.row);
    const pool = emptyCells.slice(0, Math.min(10, emptyCells.length));

    this._summonPreviewGfx = this.scene.add.graphics().setDepth(1);
    this._summonPreviewGfx.fillStyle(SUMMON_PREVIEW_STYLE.FILL_COLOR, SUMMON_PREVIEW_STYLE.FILL_ALPHA);
    this._summonPreviewGfx.lineStyle(SUMMON_PREVIEW_STYLE.LINE_WIDTH, SUMMON_PREVIEW_STYLE.LINE_COLOR, SUMMON_PREVIEW_STYLE.LINE_ALPHA);
    pool.forEach(({ col, row }) => {
      const pos = this.scene.grid.cellToWorld(col, row);
      const half = CELL_SIZE / 2 - SUMMON_PREVIEW_STYLE.CELL_PADDING;
      if (SUMMON_PREVIEW_STYLE.FILL_ALPHA > 0) {
        this._summonPreviewGfx.fillRect(pos.x - half, pos.y - half, half * 2, half * 2);
      }
      this._summonPreviewGfx.strokeRect(pos.x - half, pos.y - half, half * 2, half * 2);
    });
  }

  hideSummonPreview() {
    if (this._summonPreviewGfx) {
      this._summonPreviewGfx.destroy();
      this._summonPreviewGfx = null;
    }
  }

  // ?? Merge / interaction ???????????????????????????????????????
  _checkMerge(newUnit) {
    const matches = this.units.filter(u =>
      u !== newUnit &&
      u.handRank === newUnit.handRank &&
      u.grade === newUnit.grade
    );
    if (matches.length >= 1) {
      newUnit.setGlow(true);
      matches[0].setGlow(true);
    }
  }

  merge(sourceUnit, targetUnit) {
    if (sourceUnit.handRank !== targetUnit.handRank) return null;
    if (sourceUnit.grade !== targetUnit.grade) return null;
    if (sourceUnit.grade >= 3) return null;

    const { col, row } = targetUnit;
    const newGrade = sourceUnit.grade + 1;
    const { handRank, suit } = targetUnit;

    this.removeUnit(sourceUnit);
    this.removeUnit(targetUnit);

    const merged = this.placeUnit(col, row, handRank, suit, newGrade);
    return merged;
  }

  clearAll() {
    [...this.units].forEach(u => this.removeUnit(u));
    if (this.selectedUnit) this.selectedUnit = null;
  }

  removeUnit(unit) {
    this.scene.grid.setCell(unit.col, unit.row, CELL_EMPTY);
    unit.destroy();
    this.units = this.units.filter(u => u !== unit);
    this._refreshAllGlows();
    this._clearDim();
    // ?좊떅 ?쒓굅 ??寃쎈줈 ?ш퀎??(留됲? ?덈뜕 ?곷뱾???ㅼ떆 ?대룞?????덈룄濡?
    if (this.scene.enemyManager) this.scene.enemyManager.recalculateAllPaths();
  }

  _createRangeDecal(scene, x, y, radius) {
    const style = RANGE_DECAL_STYLE;
    const gfx = scene.add.graphics().setDepth(style.DEPTH).setPosition(x, y);
    gfx.fillStyle(style.FILL_COLOR, style.FILL_ALPHA);
    gfx.fillCircle(0, 0, radius);
    gfx.lineStyle(1, style.RING_COLOR, style.RING_ALPHA);
    gfx.strokeCircle(0, 0, radius);
    gfx.lineStyle(1, style.RING_COLOR, style.INNER_RING_ALPHA);
    gfx.strokeCircle(0, 0, radius * 0.62);
    gfx.lineStyle(1, style.RING_COLOR, style.TICK_ALPHA);
    for (let i = 0; i < style.TICK_COUNT; i++) {
      const angle = (i / style.TICK_COUNT) * Math.PI * 2;
      const inner = Math.max(0, radius - style.TICK_LENGTH);
      gfx.lineBetween(
        Math.cos(angle) * inner,
        Math.sin(angle) * inner,
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    }
    return gfx;
  }

  _createDragGfx(scene, x, y, handRank, color) {
    const r = Math.floor(CELL_SIZE * 0.55 / 2);
    const def = SHAPE_DEF[handRank] ?? SHAPE_DEF[HAND_RANK.ONE_PAIR];
    const pts = def.pts(r);
    const gfx = scene.add.graphics().setDepth(5).setPosition(x, y);
    gfx._pts = pts;
    gfx._lastColor = color;
    gfx._setColor = function (c) {
      this.clear();
      this.fillStyle(c, 0.65);
      this.fillPoints(this._pts, true, true);
      this.lineStyle(2, 0xffffff, 0.7);
      this.strokePoints(this._pts, true, true);
    };
    gfx._setColor(color);
    return gfx;
  }

  _applyDimForUnit(sourceUnit) {
    for (const u of this.units) {
      if (u === sourceUnit) { u.setDim(false); continue; }
      const canMerge = u.handRank === sourceUnit.handRank && u.grade === sourceUnit.grade && sourceUnit.grade < 3;
      u.setDim(!canMerge);
    }
  }

  _clearDim() {
    this.units.forEach(u => u.setDim(false));
  }

  _refreshAllGlows() {
    this.units.forEach(u => u.setGlow(false));
    for (let i = 0; i < this.units.length; i++) {
      for (let j = i + 1; j < this.units.length; j++) {
        const a = this.units[i];
        const b = this.units[j];
        if (a.handRank === b.handRank && a.grade === b.grade) {
          a.setGlow(true);
          b.setGlow(true);
        }
      }
    }
  }

  getUnitsInRange(x, y, range) {
    return this.units.filter(u => {
      const pos = this.scene.grid.cellToWorld(u.col, u.row);
      const dx = pos.x - x;
      const dy = pos.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= range * CELL_SIZE;
    });
  }

  // ?? Input setup ???????????????????????????????????????????????
  setupMergeInteraction() {
    const scene = this.scene;
    this.selectedUnit = null;
    this._pointerDownActive = false;
    this._pointerDownUnit = null;
    this._dragStartX = 0;
    this._dragStartY = 0;
    this._isDragging = false;
    this._dragIndicator = null;
    this._dragRangeDecal = null;

    scene.input.on('pointerdown', (ptr) => {
      this._pointerDownActive = false;
      if (ptr.y > PANEL_Y) return;
      this._pointerDownActive = true;
      const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
      this._pointerDownUnit = this.units.find(u => u.col === col && u.row === row) ?? null;
      this._dragStartX = ptr.x;
      this._dragStartY = ptr.y;
      this._isDragging = false;
      this._dimApplied = false;
    });

    scene.input.on('pointermove', (ptr) => {
      if (!this._pointerDownActive || !this._pointerDownUnit) return;
      const dx = ptr.x - this._dragStartX;
      const dy = ptr.y - this._dragStartY;
      if (!this._isDragging && Math.sqrt(dx * dx + dy * dy) > 10) {
        this._isDragging = true;
        const u = this._pointerDownUnit;
        const pos = scene.grid.cellToWorld(u.col, u.row);
        const rangeInPx = u.stats.range * CELL_SIZE;
        this._dragRangeDecal = this._createRangeDecal(scene, pos.x, pos.y, rangeInPx);
        this._dragIndicator = this._createDragGfx(scene, pos.x, pos.y, u.handRank, 0x00ffff);
      }
      if (this._isDragging && !this._dimApplied) {
        this._dimApplied = true;
        this._applyDimForUnit(this._pointerDownUnit);
      }
      if (this._isDragging) {
        this._dragIndicator?.setPosition(ptr.x, ptr.y);
        this._dragRangeDecal?.setPosition(ptr.x, ptr.y);
        const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
        const canDrop = this._isValidPlacement(col, row) && scene.grid.isWalkable(col, row) &&
          !(scene.enemyManager && scene.enemyManager.isEnemyAt(col, row));
        if (this._dragIndicator) {
          const u = this._pointerDownUnit;
          const tgt = this.units.find(v => v.col === col && v.row === row && v !== u);
          const canMerge = tgt &&
            tgt.handRank === u.handRank && tgt.grade === u.grade && u.grade < 3;
          const newColor = canMerge ? 0xffdd00 : canDrop ? 0x00ffff : 0xff4444;
          if (this._dragIndicator._lastColor !== newColor) {
            this._dragIndicator._lastColor = newColor;
            this._dragIndicator._setColor(newColor);
          }
        }
      }
    });

    scene.input.on('pointerup', (ptr) => {
      if (!this._pointerDownActive) return;

      if (this._isDragging && this._pointerDownUnit) {
        const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
        const dragUnit = this._pointerDownUnit;
        const dropTarget = this.units.find(u => u.col === col && u.row === row && u !== dragUnit);

        if (dropTarget &&
            dropTarget.handRank === dragUnit.handRank &&
            dropTarget.grade === dragUnit.grade &&
            dragUnit.grade < 3) {
          // ?쒕옒洹?癒몄?: 媛숈? 議깅낫쨌?깃툒 ?좊떅 ?꾩뿉 ?쒕∼
          if (this.selectedUnit === dragUnit) {
            dragUnit.setSelected(false);
            this.selectedUnit = null;
            if (this.onUnitDeselected) this.onUnitDeselected();
          }
          this.merge(dragUnit, dropTarget);
          if (scene.enemyManager) scene.enemyManager.recalculateAllPaths();
        } else if (this._isValidPlacement(col, row) && scene.grid.isWalkable(col, row) &&
            !(scene.enemyManager && scene.enemyManager.isEnemyAt(col, row))) {
          // ?쇰컲 ?쒕옒洹??대룞
          if (this.selectedUnit === dragUnit) {
            dragUnit.setSelected(false);
            this.selectedUnit = null;
            if (this.onUnitDeselected) this.onUnitDeselected();
          }
          this._moveUnit(dragUnit, col, row);
          if (scene.enemyManager) scene.enemyManager.recalculateAllPaths();
        }
        this._clearDim();
        this._dimApplied = false;
        this._dragIndicator?.destroy(); this._dragIndicator = null;
        this._dragRangeDecal?.destroy(); this._dragRangeDecal = null;
      } else if (!this._isDragging) {
        this._handleClick(ptr);
      }

      this._pointerDownActive = false;
      this._pointerDownUnit = null;
      this._isDragging = false;
    });
  }

  _handleClick(ptr) {
    if (ptr.y > PANEL_Y) return;
    const scene = this.scene;
    const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
    const clicked = this.units.find(u => u.col === col && u.row === row);

    if (clicked) {
      const sel = this.selectedUnit;
      if (sel && sel !== clicked && sel.handRank === clicked.handRank && sel.grade === clicked.grade) {
        // Merge
        sel.setSelected(false);
        this.selectedUnit = null;
        this._clearDim();
        if (this.onUnitDeselected) this.onUnitDeselected();
        this.merge(sel, clicked);
        if (scene.enemyManager) scene.enemyManager.recalculateAllPaths();
      } else if (sel === clicked) {
        // Deselect
        sel.setSelected(false);
        this.selectedUnit = null;
        this._clearDim();
        if (this.onUnitDeselected) this.onUnitDeselected();
      } else {
        // Select new unit
        if (sel) sel.setSelected(false);
        this.selectedUnit = clicked;
        clicked.setSelected(true);
        this._applyDimForUnit(clicked);
        if (this.onUnitSelected) this.onUnitSelected(clicked);
      }
    } else {
      // Click on empty cell ??move selected unit
      if (this.selectedUnit && this._isValidPlacement(col, row) && scene.grid.isWalkable(col, row) &&
          !(scene.enemyManager && scene.enemyManager.isEnemyAt(col, row))) {
        this._moveUnit(this.selectedUnit, col, row);
        this.selectedUnit = null;
        this._clearDim();
        if (this.onUnitDeselected) this.onUnitDeselected();
        if (scene.enemyManager) scene.enemyManager.recalculateAllPaths();
      }
    }
  }

  _moveUnit(unit, col, row) {
    this.scene.grid.setCell(unit.col, unit.row, CELL_EMPTY);
    unit.col = col;
    unit.row = row;
    this.scene.grid.setCell(col, row, CELL_UNIT);
    const pos = this.scene.grid.cellToWorld(col, row);
    if (typeof unit.updateBoardPosition === 'function') {
      unit.updateBoardPosition();
    } else {
      unit.sprite.setPosition(pos.x, pos.y);
      unit.gradeText.setPosition(pos.x, pos.y - Math.floor(CELL_SIZE * 0.18));
      if (unit.glowCircle) unit.glowCircle.setPosition(pos.x, pos.y);
      if (unit.rankHalo) unit.rankHalo.setPosition(pos.x, pos.y);
      if (unit.rankRing) unit.rankRing.setPosition(pos.x, pos.y);
      if (unit.rankOrnament) unit.rankOrnament.setPosition(pos.x, pos.y);
      if (unit.highlightCircle) unit.highlightCircle.setPosition(pos.x, pos.y);
      if (unit.selectCircle) unit.selectCircle.setPosition(pos.x, pos.y);
      if (unit.rangeCircle) unit.rangeCircle.setPosition(pos.x, pos.y);
      unit.updateStatusPosition?.();
      unit._drawHpBar();
    }
    unit.setSelected(false);
  }

  update(time, delta) {
    this.units.forEach(u => u.update(time));
  }
}






