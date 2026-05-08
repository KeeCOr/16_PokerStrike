import { ROLE } from '../units/UnitData.js';
import { CELL_SIZE } from '../grid/Grid.js';

export default class CombatManager {
  constructor(scene) {
    this.scene = scene;
  }

  update(time, delta) {
    const units = this.scene.unitManager.units;
    const enemies = this.scene.enemyManager.getAll();

    // Units attack enemies
    for (const unit of units) {
      if (unit.frozen) continue;
      unit.atkCooldown -= delta;
      if (unit.atkCooldown > 0) continue;

      const unitPos = this.scene.grid.cellToWorld(unit.col, unit.row);
      const rangeInPx = unit.stats.range * CELL_SIZE;

      // Filter enemies in range (aerial units only hit by SNIPER or AREA)
      const inRange = enemies.filter(e => {
        if (e.isAerial && unit.stats.role !== ROLE.SNIPER && unit.stats.role !== ROLE.AREA) return false;
        const dx = e.x - unitPos.x;
        const dy = e.y - unitPos.y;
        return Math.sqrt(dx * dx + dy * dy) <= rangeInPx;
      });

      if (inRange.length === 0) continue;

      // Target the enemy furthest along the path (highest row index)
      inRange.sort((a, b) => b.row - a.row);
      const target = inRange[0];

      if (unit.stats.areaRadius > 0) {
        // Area attack: damage all enemies within areaRadius of target
        const areaInPx = unit.stats.areaRadius * CELL_SIZE;
        for (const e of [...enemies]) {
          const dx = e.x - target.x;
          const dy = e.y - target.y;
          if (Math.sqrt(dx * dx + dy * dy) <= areaInPx) {
            const dead = e.takeDamage(unit.stats.atk);
            if (dead) this._onEnemyDied(e);
          }
        }
      } else {
        // Single target attack
        const dead = target.takeDamage(unit.stats.atk);
        if (dead) this._onEnemyDied(target);
      }

      // Apply slow on hit (fixed: was `!target.hp <= 0` which is always true)
      if (unit.stats.slowAmount > 0 && target.hp > 0) {
        target.speed = Math.max(target.speed * (1 - unit.stats.slowAmount), 10);
      }

      unit.atkCooldown = Math.floor(1000 / unit.stats.atkSpeed);
    }

    // Freezer enemies freeze nearby units
    for (const enemy of enemies) {
      if (enemy.freezeRadius > 0) {
        const areaInPx = enemy.freezeRadius * CELL_SIZE;
        for (const unit of units) {
          const pos = this.scene.grid.cellToWorld(unit.col, unit.row);
          const dx = enemy.x - pos.x;
          const dy = enemy.y - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) <= areaInPx) {
            unit.freeze(enemy.freezeDuration);
          }
        }
      }
    }
  }

  _onEnemyDied(enemy) {
    // Award gold
    if (this.scene.economyManager) {
      this.scene.economyManager.addGold(enemy.reward);
    }
    // Remove enemy
    this.scene.enemyManager.removeEnemy(enemy);
    // Splitter: spawn 2 basic enemies at death location
    if (enemy.type === 'splitter') {
      this.scene.enemyManager.spawnEnemy('basic', enemy.col, enemy.row);
      this.scene.enemyManager.spawnEnemy('basic', enemy.col, enemy.row);
    }
  }
}
