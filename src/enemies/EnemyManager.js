import Enemy from './Enemy.js';
import Pathfinder from './Pathfinder.js';
import { GRID_COLS, CELL_SIZE } from '../grid/Grid.js';

const SPAWN_COL = Math.floor(GRID_COLS / 2);
const BASE_COL  = Math.floor(GRID_COLS / 2);

export default class EnemyManager {
  constructor(scene, baseRow) {
    this.scene = scene;
    this.baseRow = baseRow;
    this.baseCol = BASE_COL;
    this.enemies = [];
    this.pathfinder = new Pathfinder(scene.grid);
    this.onEnemyReachBase = null;
    this.onEnemyDied = null;
  }

  spawnEnemy(type, col = SPAWN_COL, row = 0) {
    const enemy = new Enemy(this.scene, col, row, type);
    this._assignPath(enemy);
    this.enemies.push(enemy);
    return enemy;
  }

  _assignPath(enemy, skipCurrentCell = false) {
    if (enemy.isAerial) {
      const path = [];
      for (let r = enemy.row + 1; r <= this.baseRow; r++) {
        path.push({ col: BASE_COL, row: r });
      }
      enemy.setPath(path);
      return;
    }

    // 물리적 현재 위치 기반으로 출발 셀 계산
    const cell = this.scene.grid.worldToCell(enemy.x, enemy.y);
    let startCol = this.scene.grid.isInBounds(cell.col, cell.row) ? cell.col : enemy.col;
    let startRow = this.scene.grid.isInBounds(cell.col, cell.row) ? cell.row : enemy.row;
    // worldToCell이 막힌 셀(유닛이 방금 배치된 셀)을 가리키면 마지막으로 도달한 셀로 후퇴
    if (!this.scene.grid.isWalkable(startCol, startRow) && startRow !== this.baseRow) {
      startCol = enemy.col;
      startRow = enemy.row;
    }
    enemy.col = startCol;
    enemy.row = startRow;

    const path = this.pathfinder.findPath(startCol, startRow, this.baseRow, this.baseCol);
    if (path) {
      enemy.path = path;
      enemy.pathIndex = (skipCurrentCell && path.length > 1) ? 1 : 0;
    } else {
      this._setNearestUnitTarget(enemy);
    }
  }

  _isRemainingPathBlocked(enemy) {
    if (!enemy.path || enemy.path.length === 0) return true;
    // 현재 서 있는 셀에 타워가 놓인 경우 감지
    if (enemy.row !== this.baseRow && !this.scene.grid.isWalkable(enemy.col, enemy.row)) {
      return true;
    }
    for (let i = enemy.pathIndex; i < enemy.path.length; i++) {
      const { col, row } = enemy.path[i];
      if (!this.scene.grid.isWalkable(col, row) && row !== this.baseRow) {
        return true;
      }
    }
    return false;
  }

  _setNearestUnitTarget(enemy) {
    const units = this.scene.unitManager.units;
    if (units.length === 0) {
      enemy.targetUnit = null; // 유닛 없으면 죽은 참조 제거
      return;
    }
    let nearest = null;
    let nearestDist = Infinity;
    for (const unit of units) {
      const pos = this.scene.grid.cellToWorld(unit.col, unit.row);
      const dx = pos.x - enemy.x;
      const dy = pos.y - enemy.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < nearestDist) { nearestDist = d; nearest = unit; }
    }
    enemy.targetUnit = nearest;
  }

  recalculateAllPaths() {
    for (const enemy of this.enemies) {
      if (!enemy.isAerial && !enemy.attackingBase) {
        if (this._isRemainingPathBlocked(enemy)) {
          this._assignPath(enemy, true); // skipCurrentCell=true to avoid backward step
        }
      }
    }
  }

  _findUnitInRange(enemy) {
    const rangePx = enemy.atkRange * CELL_SIZE;
    for (const unit of this.scene.unitManager.units) {
      const pos = this.scene.grid.cellToWorld(unit.col, unit.row);
      const dx = pos.x - enemy.x;
      const dy = pos.y - enemy.y;
      if (Math.sqrt(dx * dx + dy * dy) <= rangePx) return unit;
    }
    return null;
  }

  _isBaseInRange(enemy) {
    const rangePx = enemy.atkRange * CELL_SIZE;
    const basePos = this.scene.grid.cellToWorld(this.baseCol, this.baseRow);
    const dx = basePos.x - enemy.x;
    const dy = basePos.y - enemy.y;
    return Math.sqrt(dx * dx + dy * dy) <= rangePx;
  }

  update(time, delta) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      enemy.updatePassive(delta);
      if (Date.now() < enemy.frozenUntil) continue;

      // 본진 사정거리 내 진입 시 공격 (최우선)
      if (this._isBaseInRange(enemy)) {
        if (!enemy.attackingBase) {
          enemy.attackingBase = true;
          enemy.baseAtkCooldown = 0;
        }
        enemy.baseAtkCooldown -= delta;
        if (enemy.baseAtkCooldown <= 0) {
          if (this.onEnemyReachBase) this.onEnemyReachBase(enemy.atk);
          enemy.baseAtkCooldown = 1500;
        }
        continue;
      }

      enemy.attackingBase = false;

      // 경로가 있으면 이동 — 단, 다음 셀이 막혀 있으면 즉시 재계산
      if (enemy.path && enemy.pathIndex < enemy.path.length) {
        const next = enemy.path[enemy.pathIndex];
        if (!this.scene.grid.isWalkable(next.col, next.row) && next.row !== this.baseRow) {
          this._assignPath(enemy, true);
        } else {
          enemy.move(delta);
        }
        continue;
      }

      // 경로 없음: 사정거리 내 유닛 공격
      const nearUnit = this._findUnitInRange(enemy);
      if (nearUnit) {
        enemy.atkCooldown -= delta;
        if (enemy.atkCooldown <= 0) {
          const dead = nearUnit.takeDamage(enemy.atk);
          if (dead) {
            this.scene.unitManager.removeUnit(nearUnit);
            this._assignPath(enemy, true);
          }
          enemy.atkCooldown = 1500;
        }
        continue;
      }

      // 경로도 없고 유닛도 없음: no-path fallback
      if (enemy.targetUnit) {
        this._handleNoPathEnemy(enemy, time, delta);
      }
    }
  }

  _handleNoPathEnemy(enemy, time, delta) {
    if (!enemy.targetUnit || enemy.targetUnit.hp <= 0) {
      this._setNearestUnitTarget(enemy);
      return;
    }
    const pos = this.scene.grid.cellToWorld(enemy.targetUnit.col, enemy.targetUnit.row);
    const dx = pos.x - enemy.x;
    const dy = pos.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 40) {
      const dtSec = delta / 1000;
      enemy.x += (dx / dist) * enemy.speed * dtSec;
      enemy.y += (dy / dist) * enemy.speed * dtSec;
      enemy.sprite.setPosition(enemy.x, enemy.y);
    } else {
      enemy.atkCooldown -= delta;
      if (enemy.atkCooldown <= 0) {
        const dead = enemy.targetUnit.takeDamage(enemy.atk);
        if (dead) {
          this.scene.unitManager.removeUnit(enemy.targetUnit);
          enemy.targetUnit = null;
          this._assignPath(enemy);
        }
        enemy.atkCooldown = 1500;
      }
    }
  }

  removeEnemy(enemy) {
    enemy.destroy();
    this.enemies = this.enemies.filter(e => e !== enemy);
  }

  isEnemyAt(col, row) {
    for (const e of this.enemies) {
      const cell = this.scene.grid.worldToCell(e.x, e.y);
      if (cell.col === col && cell.row === row) return true;
    }
    return false;
  }

  getAll() {
    return this.enemies;
  }
}
