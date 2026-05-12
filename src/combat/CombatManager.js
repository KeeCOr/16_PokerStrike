import { ROLE } from '../units/UnitData.js';
import { CELL_SIZE } from '../grid/Grid.js';

// Projectile color by unit role
const PROJ_COLOR = {
  [ROLE.AREA]:          0xff6622,
  [ROLE.SNIPER]:        0xccff44,
  [ROLE.SUPPORT_SLOW]:  0x44ddff,
  earth:                0xaaaaff, // 땅 속성 (C suit)
  [ROLE.ATTACK]:        0xffffff,
  [ROLE.SUPPORT_SPEED]: 0x44ff88,
};
const PROJ_SPEED = 380; // px/sec

export default class CombatManager {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
  }

  update(time, delta) {
    const units   = this.scene.unitManager.units;
    const enemies = this.scene.enemyManager.getAll();

    // Move active projectiles
    const dtSec = delta / 1000;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const move = PROJ_SPEED * dtSec;
      if (dist <= move) {
        p.sprite.destroy();
        this.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * move;
        p.y += (dy / dist) * move;
        p.sprite.setPosition(p.x, p.y);
      }
    }

    // Units attack enemies
    for (const unit of units) {
      if (unit.frozen) continue;
      unit.atkCooldown -= delta;
      if (unit.atkCooldown > 0) continue;

      const unitPos   = this.scene.grid.cellToWorld(unit.col, unit.row);
      const rangeInPx = unit.stats.range * CELL_SIZE;
      const role      = unit.stats.role;

      const canHitAerial = role === ROLE.SNIPER || role === ROLE.AREA;
      const inRange = enemies.filter(e => {
        if (e.isAerial && !canHitAerial) return false;
        const dx = e.x - unitPos.x;
        const dy = e.y - unitPos.y;
        return Math.sqrt(dx * dx + dy * dy) <= rangeInPx;
      });

      if (inRange.length === 0) continue;

      inRange.sort((a, b) => b.row - a.row);
      const target = inRange[0];

      this._spawnProjectile(unitPos, { x: target.x, y: target.y }, role);
      this._applyAttack(unit, target, enemies);

      unit.atkCooldown = Math.floor(1000 / unit.stats.atkSpeed);
    }

    // Freezer enemies freeze nearby units
    for (const enemy of enemies) {
      if (enemy.freezeRadius > 0) {
        const areaInPx = enemy.freezeRadius * CELL_SIZE;
        for (const unit of units) {
          const pos = this.scene.grid.cellToWorld(unit.col, unit.row);
          const dx  = enemy.x - pos.x;
          const dy  = enemy.y - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) <= areaInPx) {
            unit.freeze(enemy.freezeDuration);
          }
        }
      }
    }
  }

  _applyAttack(unit, target, enemies) {
    const s    = unit.stats;
    const role = s.role;

    if (role === ROLE.AREA) {
      // 불: 확률로 스플래시, 아니면 단일
      if (s.splashChance > 0 && Math.random() < s.splashChance) {
        const areaInPx = s.areaRadius * CELL_SIZE;
        for (const e of [...enemies]) {
          const dx = e.x - target.x;
          const dy = e.y - target.y;
          if (Math.sqrt(dx * dx + dy * dy) <= areaInPx) {
            const dead = e.takeDamage(s.atk);
            if (dead) this._onEnemyDied(e);
          }
        }
      } else {
        const dead = target.takeDamage(s.atk);
        if (dead) this._onEnemyDied(target);
      }

    } else if (role === ROLE.SUPPORT_SLOW) {
      // 물: 대미지 후 확률 슬로우 (등급에 따라 범위)
      const dead = target.takeDamage(s.atk);
      if (dead) { this._onEnemyDied(target); return; }
      if (s.slowChance > 0 && Math.random() < s.slowChance) {
        if (s.slowRadius > 0) {
          const radiusPx = s.slowRadius * CELL_SIZE;
          for (const e of enemies) {
            const dx = e.x - target.x;
            const dy = e.y - target.y;
            if (Math.sqrt(dx * dx + dy * dy) <= radiusPx) {
              const slowedSpeed = Math.max(e.baseSpeed * (1 - s.slowAmount), 10);
              e.speed = Math.min(e.speed, slowedSpeed);
            }
          }
        } else {
          const slowedSpeed = Math.max(target.baseSpeed * (1 - s.slowAmount), 10);
          target.speed = Math.min(target.speed, slowedSpeed);
        }
      }

    } else if (s.stunChance > 0) {
      // 땅(C속성): 대미지 후 확률 스턴 (등급에 따라 범위·지속)
      const dead = target.takeDamage(s.atk);
      if (dead) { this._onEnemyDied(target); return; }
      if (s.stunChance > 0 && Math.random() < s.stunChance) {
        if (s.stunRadius > 0) {
          const radiusPx = s.stunRadius * CELL_SIZE;
          for (const e of enemies) {
            const dx = e.x - target.x;
            const dy = e.y - target.y;
            if (Math.sqrt(dx * dx + dy * dy) <= radiusPx) {
              e.applyFreeze(s.stunDuration);
            }
          }
        } else {
          target.applyFreeze(s.stunDuration);
        }
      }

    } else if (role === ROLE.SNIPER) {
      // 바람: 기본 대미지 + 적 최대HP% 추가 대미지 (단일)
      const bonusDmg = s.hpPctDamage > 0 ? Math.floor(target.maxHp * s.hpPctDamage) : 0;
      const dead = target.takeDamage(s.atk + bonusDmg);
      if (dead) this._onEnemyDied(target);

    } else {
      // 기본 단일 공격
      const dead = target.takeDamage(s.atk);
      if (dead) this._onEnemyDied(target);
    }
  }

  _spawnProjectile(from, to, role) {
    const color = PROJ_COLOR[role] ?? 0xffffff;
    const size  = role === ROLE.SNIPER ? 5 : role === ROLE.AREA ? 6 : 4;
    const sprite = this.scene.add.circle(from.x, from.y, size, color).setDepth(6);
    this.projectiles.push({ x: from.x, y: from.y, tx: to.x, ty: to.y, sprite });
  }

  _onEnemyDied(enemy) {
    if (this.scene.economyManager) {
      this.scene.economyManager.addGold(enemy.reward);
    }
    this.scene.enemyManager.removeEnemy(enemy);
    if (enemy.type === 'splitter') {
      this.scene.enemyManager.spawnEnemy('basic', enemy.col, enemy.row);
      this.scene.enemyManager.spawnEnemy('basic', enemy.col, enemy.row);
    }
  }
}
