import Unit from './Unit.js';
import { getUnitStats, ROLE } from './UnitData.js';
import { CELL_UNIT, CELL_EMPTY, GRID_COLS, GRID_ROWS, CELL_SIZE, PANEL_Y } from '../grid/Grid.js';

export default class UnitManager {
  constructor(scene) {
    this.scene = scene;
    this.units = [];
    this.onUnitSelected = null;
    this.onUnitDeselected = null;
    this._summonPreviewGfx = null;
  }

  placeUnitRandom(handRank, suit, grade) {
    const emptyCells = [];
    for (let r = 1; r < GRID_ROWS - 1; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.scene.grid.isWalkable(c, r)) emptyCells.push({ col: c, row: r });
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
    const unit = new Unit(this.scene, col, row, handRank, suit, grade, stats);
    if (this.scene.rogueliteManager) this.scene.rogueliteManager.applyToUnit(unit);
    unit.upgradeHp = false;
    unit.upgradeAtk = false;
    this.units.push(unit);
    this.scene.grid.setCell(col, row, CELL_UNIT);
    this._checkMerge(unit);
    return unit;
  }

  // ── Summon placement preview ──────────────────────────────────
  showSummonPreview() {
    this.hideSummonPreview();
    const emptyCells = [];
    for (let r = 1; r < GRID_ROWS - 1; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.scene.grid.isWalkable(c, r)) emptyCells.push({ col: c, row: r });
      }
    }
    emptyCells.sort((a, b) => b.row - a.row);
    const pool = emptyCells.slice(0, Math.min(10, emptyCells.length));

    this._summonPreviewGfx = this.scene.add.graphics().setDepth(1);
    this._summonPreviewGfx.fillStyle(0x2244cc, 0.3);
    this._summonPreviewGfx.lineStyle(1, 0x4488ff, 0.6);
    pool.forEach(({ col, row }) => {
      const pos = this.scene.grid.cellToWorld(col, row);
      const half = CELL_SIZE / 2 - 2;
      this._summonPreviewGfx.fillRect(pos.x - half, pos.y - half, half * 2, half * 2);
      this._summonPreviewGfx.strokeRect(pos.x - half, pos.y - half, half * 2, half * 2);
    });
  }

  hideSummonPreview() {
    if (this._summonPreviewGfx) {
      this._summonPreviewGfx.destroy();
      this._summonPreviewGfx = null;
    }
  }

  // ── Merge / interaction ───────────────────────────────────────
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

  // ── Input setup ───────────────────────────────────────────────
  setupMergeInteraction() {
    const scene = this.scene;
    this.selectedUnit = null;
    this._pointerDownActive = false;
    this._pointerDownUnit = null;
    this._dragStartX = 0;
    this._dragStartY = 0;
    this._isDragging = false;
    this._dragIndicator = null;
    this._dragRangeCircle = null;

    scene.input.on('pointerdown', (ptr) => {
      this._pointerDownActive = false;
      if (ptr.y > PANEL_Y) return;
      this._pointerDownActive = true;
      const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
      this._pointerDownUnit = this.units.find(u => u.col === col && u.row === row) ?? null;
      this._dragStartX = ptr.x;
      this._dragStartY = ptr.y;
      this._isDragging = false;
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
        this._dragRangeCircle = scene.add.circle(pos.x, pos.y, rangeInPx, 0xffffff, 0.07)
          .setStrokeStyle(1, 0xffffff, 0.45).setDepth(1);
        this._dragIndicator = scene.add.rectangle(pos.x, pos.y, 38, 38, 0x00ffff, 0.55).setDepth(5);
      }
      if (this._isDragging) {
        this._dragIndicator?.setPosition(ptr.x, ptr.y);
        this._dragRangeCircle?.setPosition(ptr.x, ptr.y);
        const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
        const canDrop = scene.grid.isWalkable(col, row) && ptr.y < 650;
        this._dragIndicator?.setFillStyle(canDrop ? 0x00ffff : 0xff4444, 0.55);
      }
    });

    scene.input.on('pointerup', (ptr) => {
      if (!this._pointerDownActive) return;

      if (this._isDragging && this._pointerDownUnit) {
        const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
        if (scene.grid.isWalkable(col, row) && ptr.y < 650) {
          // Deselect if the dragged unit was selected
          if (this.selectedUnit === this._pointerDownUnit) {
            this._pointerDownUnit.setSelected(false);
            this.selectedUnit = null;
            if (this.onUnitDeselected) this.onUnitDeselected();
          }
          this._moveUnit(this._pointerDownUnit, col, row);
          if (scene.enemyManager) scene.enemyManager.recalculateAllPaths();
        }
        this._dragIndicator?.destroy(); this._dragIndicator = null;
        this._dragRangeCircle?.destroy(); this._dragRangeCircle = null;
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
        if (this.onUnitDeselected) this.onUnitDeselected();
        this.merge(sel, clicked);
        if (scene.enemyManager) scene.enemyManager.recalculateAllPaths();
      } else if (sel === clicked) {
        // Deselect
        sel.setSelected(false);
        this.selectedUnit = null;
        if (this.onUnitDeselected) this.onUnitDeselected();
      } else {
        // Select new unit
        if (sel) sel.setSelected(false);
        this.selectedUnit = clicked;
        clicked.setSelected(true);
        if (this.onUnitSelected) this.onUnitSelected(clicked);
      }
    } else {
      // Click on empty cell — move selected unit
      if (this.selectedUnit && scene.grid.isWalkable(col, row)) {
        this._moveUnit(this.selectedUnit, col, row);
        this.selectedUnit = null;
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
    unit.sprite.setPosition(pos.x, pos.y);
    unit.gradeText.setPosition(pos.x, pos.y - 14);
    if (unit.glowCircle) unit.glowCircle.setPosition(pos.x, pos.y);
    unit.setSelected(false);
    unit._drawHpBar();
  }

  update(time, delta) {
    this.units.forEach(u => u.update(time));
  }
}
