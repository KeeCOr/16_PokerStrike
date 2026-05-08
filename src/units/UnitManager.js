import Unit from './Unit.js';
import { getUnitStats, ROLE } from './UnitData.js';
import { CELL_UNIT, CELL_EMPTY } from '../grid/Grid.js';

export default class UnitManager {
  constructor(scene) {
    this.scene = scene;
    this.units = [];
  }

  placeUnit(col, row, handRank, suit, grade) {
    if (!this.scene.grid.isWalkable(col, row)) return null;
    const stats = getUnitStats(handRank, suit, grade);
    const unit = new Unit(this.scene, col, row, handRank, suit, grade, stats);
    this.units.push(unit);
    this.scene.grid.setCell(col, row, CELL_UNIT);
    this._checkMerge(unit);
    return unit;
  }

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
      return Math.sqrt(dx * dx + dy * dy) <= range * 44;
    });
  }

  setupMergeInteraction() {
    const scene = this.scene;
    let dragUnit = null;

    scene.input.on('pointerdown', (ptr) => {
      if (ptr.y > 650) return;
      const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
      const unit = this.units.find(u => u.col === col && u.row === row);
      if (unit && unit.glowCircle) {
        dragUnit = unit;
        dragUnit.sprite.setDepth(10);
      }
    });

    scene.input.on('pointermove', (ptr) => {
      if (!dragUnit) return;
      dragUnit.sprite.setPosition(ptr.x, ptr.y);
      dragUnit.hpBar.clear();
    });

    scene.input.on('pointerup', (ptr) => {
      if (!dragUnit) return;
      const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
      const target = this.units.find(u =>
        u !== dragUnit && u.col === col && u.row === row &&
        u.handRank === dragUnit.handRank && u.grade === dragUnit.grade
      );
      if (target) {
        this.merge(dragUnit, target);
        if (scene.enemyManager) scene.enemyManager.recalculateAllPaths();
      } else {
        const pos = scene.grid.cellToWorld(dragUnit.col, dragUnit.row);
        dragUnit.sprite.setPosition(pos.x, pos.y);
        dragUnit.sprite.setDepth(2);
        dragUnit._drawHpBar();
      }
      dragUnit = null;
    });
  }

  update(time, delta) {
    this.units.forEach(u => u.update(time));
  }
}
