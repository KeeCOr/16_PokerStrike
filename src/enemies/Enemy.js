import { ENEMY_STATS, ENEMY_TYPE } from './EnemyData.js';

export default class Enemy {
  constructor(scene, col, row, type) {
    this.scene = scene;
    this.col = col;
    this.row = row;
    this.type = type;
    const stats = { ...ENEMY_STATS[type] };
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.atk = stats.atk;
    this.speed = stats.speed;
    this.baseSpeed = stats.speed; // 슬로우 중첩 방지용 원본 속도
    this.reward = stats.reward;
    this.magicImmune = stats.magicImmune;
    this.isAerial = stats.isAerial;
    this.regenRate = stats.regenRate ?? 0;
    this.freezeRadius = stats.freezeRadius ?? 0;
    this.freezeDuration = stats.freezeDuration ?? 0;

    this.baseArmor  = stats.armor      ?? 0;
    this.armor      = this.baseArmor;
    this.armorBreakAmount = 0;
    this.armorBreakUntil = 0;
    this.armorBreakLabel = null;
    this.shield     = stats.shield     ?? 0;
    this.maxShield  = stats.shield     ?? 0;
    this.slowImmune = stats.slowImmune ?? false;

    this.path = null;
    this.pathIndex = 0;
    this.targetUnit = null;

    const pos = scene.grid.cellToWorld(col, row);
    this.x = pos.x;
    this.y = pos.y;

    const COLOR_MAP = {
      [ENEMY_TYPE.BOSS]:      0xff0000,
      [ENEMY_TYPE.ARMORED]:   0x999999,
      [ENEMY_TYPE.SWARM]:     0xdd44bb,
      [ENEMY_TYPE.BERSERKER]: 0xff5500,
      [ENEMY_TYPE.SHIELDED]:  0x4499ff,
    };
    const color = COLOR_MAP[type] ?? 0xee8800;
    this.sprite = scene.add.rectangle(this.x, this.y, 32, 32, color).setDepth(2);

    // 공중 유닛 표시: 다이아몬드 윤곽 + 'AIR' 텍스트
    if (this.isAerial) {
      this._aerialMarker = scene.add.graphics().setDepth(3);
      this._aerialMarker.lineStyle(2, 0x88eeff, 1);
      this._aerialMarker.strokeRect(this.x - 20, this.y - 20, 40, 40);
      this._aerialLabel = scene.add.text(this.x, this.y - 24, '✈', {
        fontSize: '11px', color: '#88eeff'
      }).setOrigin(0.5).setDepth(4);
    }

    this.hpBar = scene.add.graphics().setDepth(3);
    this._drawHpBar();

    this.atkRange = stats.atkRange ?? 1.5; // 공격 사정거리 (셀 단위)
    this.atkCooldown = 0;
    this.regenAccum = 0;
    this.frozenUntil = 0;
    this.attackingBase = false;
    this.baseAtkCooldown = 0;
  }

  _drawHpBar() {
    this.hpBar.clear();
    const ratio = this.hp / this.maxHp;
    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(this.x - 16, this.y - 22, 32, 4);
    this.hpBar.fillStyle(0xff3333);
    this.hpBar.fillRect(this.x - 16, this.y - 22, Math.floor(32 * ratio), 4);
    // 방어막 바 (하늘색, HP바 위)
    if (this.maxShield > 0) {
      const sr = this.shield / this.maxShield;
      this.hpBar.fillStyle(0x224466);
      this.hpBar.fillRect(this.x - 16, this.y - 28, 32, 4);
      this.hpBar.fillStyle(0x44ccff);
      this.hpBar.fillRect(this.x - 16, this.y - 28, Math.floor(32 * sr), 4);
    }
  }

  takeDamage(amount, bypassArmor = false) {
    if (this.hp <= 0) return true;
    let dmg = amount;
    // 방어력 (HP% 딜은 관통)
    if (this.armor > 0 && !bypassArmor) {
      dmg = Math.max(1, Math.floor(dmg * (1 - this.armor)));
    }
    // 방어막 흡수
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, dmg);
      this.shield -= absorbed;
      dmg -= absorbed;
    }
    this.hp = Math.max(0, this.hp - dmg);
    this._drawHpBar();
    return this.hp <= 0;
  }

  applyArmorBreak(amount, duration) {
    if (amount <= 0 || duration <= 0) return;
    this.armorBreakAmount = Math.max(this.armorBreakAmount, amount);
    this.armorBreakUntil = Math.max(this.armorBreakUntil, Date.now() + duration);
    this.armor = Math.max(0, +(this.baseArmor - this.armorBreakAmount).toFixed(3));
    this._showArmorBreakLabel();
  }

  _showArmorBreakLabel() {
    if (!this.scene?.add?.text) return;
    if (!this.armorBreakLabel) {
      this.armorBreakLabel = this.scene.add.text(this.x, this.y - 34, '방깎', {
        fontSize: '11px',
        color: '#ffd166',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(4);
    }
    this.armorBreakLabel.setPosition(this.x, this.y - 34);
  }

  _refreshArmorBreak() {
    if (!this.armorBreakUntil || Date.now() <= this.armorBreakUntil) return;
    this.armorBreakAmount = 0;
    this.armorBreakUntil = 0;
    this.armor = this.baseArmor;
    if (this.armorBreakLabel) {
      this.armorBreakLabel.destroy();
      this.armorBreakLabel = null;
    }
  }

  update(time, delta) {
    this._refreshArmorBreak();
    if (Date.now() < this.frozenUntil) return;

    const dtSec = delta / 1000;

    if (this.regenRate > 0) {
      this.regenAccum += this.regenRate * dtSec;
      if (this.regenAccum >= 1) {
        this.hp = Math.min(this.maxHp, this.hp + Math.floor(this.regenAccum));
        this.regenAccum = 0;
        this._drawHpBar();
      }
    }

    this._moveAlongPath(dtSec);
  }

  _moveAlongPath(dtSec) {
    if (!this.path || this.pathIndex >= this.path.length) return;

    const target = this.path[this.pathIndex];
    const targetPos = this.scene.grid.cellToWorld(target.col, target.row);
    const dx = targetPos.x - this.x;
    const dy = targetPos.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveAmount = this.speed * dtSec;

    if (dist <= moveAmount) {
      this.x = targetPos.x;
      this.y = targetPos.y;
      this.col = target.col;
      this.row = target.row;
      this.pathIndex++;
    } else {
      this.x += (dx / dist) * moveAmount;
      this.y += (dy / dist) * moveAmount;
    }

    this.sprite.setPosition(this.x, this.y);
    if (this._aerialMarker) {
      this._aerialMarker.clear();
      this._aerialMarker.lineStyle(2, 0x88eeff, 1);
      this._aerialMarker.strokeRect(this.x - 20, this.y - 20, 40, 40);
      this._aerialLabel.setPosition(this.x, this.y - 24);
    }
    if (this.armorBreakLabel) this.armorBreakLabel.setPosition(this.x, this.y - 34);
    this._drawHpBar();
  }

  // 재생/버프 등 패시브 처리 (이동 없음)
  updatePassive(delta) {
    this._refreshArmorBreak();
    const dtSec = delta / 1000;
    if (this.regenRate > 0) {
      this.regenAccum += this.regenRate * dtSec;
      if (this.regenAccum >= 1) {
        this.hp = Math.min(this.maxHp, this.hp + Math.floor(this.regenAccum));
        this.regenAccum = 0;
        this._drawHpBar();
      }
    }
  }

  // 이동만 처리
  move(delta) {
    this._moveAlongPath(delta / 1000);
  }

  applyFreeze(duration) {
    this.frozenUntil = Date.now() + duration;
    this.sprite.setFillStyle(0xaaddff);
  }

  setPath(path) {
    this.path = path;
    this.pathIndex = 0;
  }

  isAtDestination(destCol, destRow) {
    return this.col === destCol && this.row === destRow;
  }

  destroy() {
    this.sprite.destroy();
    this.hpBar.destroy();
    if (this.armorBreakLabel) this.armorBreakLabel.destroy();
    if (this._aerialMarker) { this._aerialMarker.destroy(); this._aerialLabel.destroy(); }
  }
}
