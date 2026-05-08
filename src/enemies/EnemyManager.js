import Enemy from './Enemy.js';
import Pathfinder from './Pathfinder.js';
import { GRID_COLS } from '../grid/Grid.js';

const SPAWN_COL = Math.floor(GRID_COLS / 2);
const BASE_COL = Math.floor(GRID_COLS / 2);

export default class EnemyManager {
  constructor(scene, baseRow) {
    this.scene = scene;
    this.baseRow = baseRow;
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

  _assignPath(enemy) {
    if (enemy.isAerial) {
      const path = [];
      for (let r = enemy.row + 1; r <= this.baseRow; r++) {
        path.push({ col: BASE_COL, row: r });
      }
      enemy.setPath(path);
      return;
    }

    const path = this.pathfinder.findPath(enemy.col, enemy.row, BASE_COL, this.baseRow);
    if (path) {
      enemy.setPath(path);
    } else {
      this._setNearestUnitTarget(enemy);
    }
  }

  _setNearestUnitTarget(enemy) {
    const units = this.scene.unitManager.units;
    if (units.length === 0) return;
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
      if (!enemy.isAerial) this._assignPath(enemy);
    }
  }

  update(time, delta) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(time, delta);

      if (enemy.isAtDestination(BASE_COL, this.baseRow)) {
        if (this.onEnemyReachBase) this.onEnemyReachBase(enemy.atk);
        enemy.destroy();
        this.enemies.splice(i, 1);
        continue;
      }

      if (enemy.targetUnit && (!enemy.path || enemy.pathIndex >= enemy.path.length)) {
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

  getAll() {
    return this.enemies;
  }
}
