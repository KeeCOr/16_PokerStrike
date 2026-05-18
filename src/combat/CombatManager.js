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
    this._rewardAccum = 0; // 소수점 보상 누산기
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
      const s         = unit.stats;
      const role      = s.role;

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

      // ── 플러시: 다중 타깃 공격 ──
      if (s.multiTarget > 1) {
        const targets = inRange.slice(0, s.multiTarget);
        for (const t of targets) {
          this._spawnProjectile(unitPos, { x: t.x, y: t.y }, role);
          this._applyAttack(unit, t, enemies);
        }
      // ── 포카인드: 직선 관통 공격 ──
      } else if (s.piercing) {
        const dx0 = target.x - unitPos.x;
        const dy0 = target.y - unitPos.y;
        const len = Math.sqrt(dx0 * dx0 + dy0 * dy0) || 1;
        const nx = dx0 / len;
        const ny = dy0 / len;
        const pierceCells = rangeInPx + CELL_SIZE;
        const pierceTargets = inRange.filter(e => {
          const dx = e.x - unitPos.x;
          const dy = e.y - unitPos.y;
          const dot = dx * nx + dy * ny;
          if (dot <= 0) return false;
          const perp = Math.abs(dx * ny - dy * nx);
          return perp <= CELL_SIZE * 0.55 && dot <= pierceCells;
        });
        for (const t of pierceTargets) {
          this._applyAttack(unit, t, enemies);
        }
        this._spawnProjectile(unitPos, { x: target.x, y: target.y }, role);
      // ── 기본 단일 공격 ──
      } else {
        this._spawnProjectile(unitPos, { x: target.x, y: target.y }, role);
        this._applyAttack(unit, target, enemies);
      }

      unit.atkCooldown = Math.floor(1000 / unit.stats.atkSpeed);
    }

    // ── 스트레이트플러시: 주기 버프 오라 ──
    for (const unit of units) {
      if (!unit.stats.auraInterval) continue;
      if (unit.nextAuraTick === undefined) unit.nextAuraTick = time + unit.stats.auraInterval;
      if (time < unit.nextAuraTick) continue;
      unit.nextAuraTick = time + unit.stats.auraInterval;

      const pos = this.scene.grid.cellToWorld(unit.col, unit.row);
      const radiusPx = unit.stats.auraRadius * CELL_SIZE;
      const buffMult = 1 + unit.stats.auraBuff;

      for (const u of units) {
        if (u === unit) continue;
        if (u.suit !== unit.suit) continue;
        const uPos = this.scene.grid.cellToWorld(u.col, u.row);
        const dx = uPos.x - pos.x;
        const dy = uPos.y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) > radiusPx) continue;
        u.stats.atkSpeed = +(u.stats.atkSpeed * buffMult).toFixed(3);
        if (typeof u.showStatusText === 'function') {
          u.showStatusText('강화', unit.stats.auraDuration, 0xffee44);
        }
        this.scene.time.delayedCall(unit.stats.auraDuration, () => {
          u.stats.atkSpeed = +(u.stats.atkSpeed / buffMult).toFixed(3);
        });
      }
      // 오라 발동 시각 효과
      const gfx = this.scene.add.circle(pos.x, pos.y, radiusPx, 0xffee44, 0.18).setDepth(5);
      this.scene.tweens.add({
        targets: gfx, alpha: 0, scaleX: 1.4, scaleY: 1.4,
        duration: 600, ease: 'Quad.easeOut',
        onComplete: () => gfx.destroy(),
      });
    }

    // Freezer enemies: no longer freeze towers (removed mechanic)
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
      // 물: 대미지 후 확률 슬로우 (등급에 따라 범위, slowImmune 적 제외)
      const dead = target.takeDamage(s.atk);
      if (dead) { this._onEnemyDied(target); return; }
      if (s.slowChance > 0 && Math.random() < s.slowChance) {
        if (s.slowRadius > 0) {
          const radiusPx = s.slowRadius * CELL_SIZE;
          for (const e of enemies) {
            if (e.slowImmune) continue;
            const dx = e.x - target.x;
            const dy = e.y - target.y;
            if (Math.sqrt(dx * dx + dy * dy) <= radiusPx) {
              if (typeof e.applySlow === 'function') e.applySlow(s.slowAmount, s.slowDuration);
            }
          }
        } else if (!target.slowImmune) {
          if (typeof target.applySlow === 'function') target.applySlow(s.slowAmount, s.slowDuration);
        }
      }

    } else if (s.stunChance > 0) {
      // 땅(C속성): 대미지 후 확률 스턴 (등급에 따라 범위·지속)
      if (s.armorBreakAmount > 0 && typeof target.applyArmorBreak === 'function') {
        target.applyArmorBreak(s.armorBreakAmount, s.armorBreakDuration);
      }
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
      // 바람: 기본 대미지 + 적 최대HP% 추가 대미지 (방어력 관통, 단일)
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
      this._rewardAccum += enemy.reward;
      const toAdd = Math.floor(this._rewardAccum);
      if (toAdd > 0) {
        this.scene.economyManager.addGold(toAdd);
        this._rewardAccum -= toAdd;
      }
    }
    // 낮은 확률로 특수 재화(젬) 드랍
    if (Math.random() < 0.06) {
      this.scene.gems = (this.scene.gems ?? 0) + 1;
      this.scene.registry.set('gems', this.scene.gems);
    }
    this.scene.enemyManager.removeEnemy(enemy);
    if (enemy.type === 'splitter') {
      this.scene.enemyManager.spawnEnemy('basic', enemy.col, enemy.row);
      this.scene.enemyManager.spawnEnemy('basic', enemy.col, enemy.row);
    }
  }
}
