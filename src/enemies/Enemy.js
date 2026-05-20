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
    this.shield     = stats.shield     ?? 0;
    this.maxShield  = stats.shield     ?? 0;
    this.slowImmune = stats.slowImmune ?? false;
    this._slowEffects = [];

    this.path = null;
    this.pathIndex = 0;
    this.targetUnit = null;

    const pos = scene.grid.cellToWorld(col, row);
    this.x = pos.x;
    this.y = pos.y;

    this.sprite = this._createMonsterSprite();
    this.sprite.on('pointerdown', () => {
      if (typeof this.scene.showEnemyInfo === 'function') this.scene.showEnemyInfo(this);
    });

    this.hpBar = scene.add.graphics().setDepth(3);
    this._drawHpBar();

    this.atkRange = stats.atkRange ?? 1.5; // 공격 사정거리 (셀 단위)
    this.atkCooldown = 0;
    this.regenAccum = 0;
    this.frozenUntil = 0;
    this.attackingBase = false;
    this.baseAtkCooldown = 0;
  }

  _createMonsterSprite() {
    const sprite = this.scene.add.container(this.x, this.y)
      .setDepth(2)
      .setSize(46, 46)
      .setInteractive({ useHandCursor: true });
    const gfx = this.scene.add.graphics();
    const p = this._getMonsterPalette();

    if (this.isAerial) this._drawWings(gfx, p);

    gfx.fillStyle(0x07111d, 0.55);
    gfx.fillCircle(0, 6, 20);

    this._drawTypeSilhouette(gfx, p);

    gfx.fillStyle(p.body, 1);
    gfx.fillCircle(0, 0, p.size);
    gfx.fillCircle(-10, -5, Math.floor(p.size * 0.47));
    gfx.fillCircle(10, -5, Math.floor(p.size * 0.47));

    gfx.fillStyle(p.accent, 1);
    gfx.fillTriangle(-13, -12, -8, -23, -2, -11);
    gfx.fillTriangle(13, -12, 8, -23, 2, -11);

    gfx.fillStyle(0xf8fbff, 1);
    gfx.fillCircle(-6, -3, 4);
    gfx.fillCircle(6, -3, 4);
    gfx.fillStyle(0x0b1018, 1);
    gfx.fillCircle(-5, -3, 2);
    gfx.fillCircle(7, -3, 2);

    gfx.fillStyle(p.mouth, 1);
    gfx.fillRect(-7, 8, 14, 3);

    this._drawTypeBadge(gfx, p);
    sprite.add(gfx);

    if (this.isAerial) {
      const label = this.scene.add.text(0, -28, '✦', {
        fontSize: '12px',
        color: '#9eeeff',
      }).setOrigin(0.5);
      sprite.add(label);
    }

    return sprite;
  }

  _getMonsterPalette() {
    const palettes = {
      [ENEMY_TYPE.TANK]:         { body: 0x65717f, accent: 0xb8c1cc, mouth: 0x26313c, size: 17 },
      [ENEMY_TYPE.RUNNER]:       { body: 0xf4a340, accent: 0xffdf7a, mouth: 0x7d2e16, size: 14 },
      [ENEMY_TYPE.AERIAL]:       { body: 0x3eb8e5, accent: 0x9eeeff, mouth: 0x0d506d, size: 15 },
      [ENEMY_TYPE.MAGIC_IMMUNE]: { body: 0x8e5bff, accent: 0xffd66b, mouth: 0x30185c, size: 15 },
      [ENEMY_TYPE.SPLITTER]:     { body: 0xd16fcb, accent: 0xffa3ee, mouth: 0x611858, size: 15 },
      [ENEMY_TYPE.REGEN]:        { body: 0x55bd6a, accent: 0xa8f0a2, mouth: 0x174f24, size: 16 },
      [ENEMY_TYPE.FREEZER]:      { body: 0x78d5f0, accent: 0xd6fbff, mouth: 0x145d78, size: 15 },
      [ENEMY_TYPE.BOSS]:         { body: 0xb6292f, accent: 0xffcc55, mouth: 0x3a090c, size: 20 },
      [ENEMY_TYPE.ARMORED]:      { body: 0x88919b, accent: 0xe1e6eb, mouth: 0x242c33, size: 17 },
      [ENEMY_TYPE.SWARM]:        { body: 0xee62c0, accent: 0xffc5ef, mouth: 0x73194f, size: 12 },
      [ENEMY_TYPE.BERSERKER]:    { body: 0xf05b28, accent: 0xffd24d, mouth: 0x7b1707, size: 15 },
      [ENEMY_TYPE.SHIELDED]:     { body: 0x3d91f2, accent: 0x96f0ff, mouth: 0x123c73, size: 16 },
    };
    return palettes[this.type] ?? { body: 0xe99535, accent: 0xffd26a, mouth: 0x5c2a0d, size: 15 };
  }

  _drawWings(gfx, p) {
    gfx.fillStyle(0x9eeeff, 0.8);
    gfx.fillTriangle(-11, -2, -30, -14, -22, 9);
    gfx.fillTriangle(11, -2, 30, -14, 22, 9);
    gfx.fillStyle(p.body, 0.55);
    gfx.fillTriangle(-12, 2, -26, 2, -18, 13);
    gfx.fillTriangle(12, 2, 26, 2, 18, 13);
  }

  _drawTypeSilhouette(gfx, p) {
    if (this.type === ENEMY_TYPE.BOSS) {
      gfx.fillStyle(0xffcc55, 1);
      gfx.fillTriangle(-15, -17, -10, -32, -5, -17);
      gfx.fillTriangle(0, -18, 0, -35, 7, -18);
      gfx.fillTriangle(15, -17, 10, -32, 5, -17);
    }
    if (this.type === ENEMY_TYPE.BERSERKER || this.type === ENEMY_TYPE.RUNNER) {
      gfx.fillStyle(p.accent, 1);
      gfx.fillTriangle(-19, 7, -31, 11, -18, 16);
      gfx.fillTriangle(19, 7, 31, 11, 18, 16);
    }
    if (this.type === ENEMY_TYPE.SPLITTER || this.type === ENEMY_TYPE.SWARM) {
      gfx.fillStyle(p.body, 0.75);
      gfx.fillCircle(-22, 7, 8);
      gfx.fillCircle(22, 7, 8);
    }
  }

  _drawTypeBadge(gfx, p) {
    if (this.type === ENEMY_TYPE.ARMORED || this.type === ENEMY_TYPE.TANK) {
      gfx.lineStyle(3, p.accent, 0.9);
      gfx.strokeCircle(0, 1, 19);
      gfx.lineStyle(2, 0x2b333d, 0.8);
      gfx.strokeCircle(0, 1, 13);
    }
    if (this.type === ENEMY_TYPE.SHIELDED) {
      gfx.lineStyle(3, 0x96f0ff, 0.85);
      gfx.strokeCircle(0, 0, 23);
    }
    if (this.type === ENEMY_TYPE.MAGIC_IMMUNE) {
      gfx.fillStyle(0xffd66b, 1);
      gfx.fillCircle(0, -18, 3);
      gfx.fillCircle(-18, 1, 3);
      gfx.fillCircle(18, 1, 3);
      gfx.fillCircle(0, 18, 3);
    }
    if (this.type === ENEMY_TYPE.REGEN) {
      gfx.fillStyle(0xd6ffd1, 1);
      gfx.fillRect(-3, 12, 6, 14);
      gfx.fillRect(-7, 16, 14, 6);
    }
    if (this.type === ENEMY_TYPE.FREEZER) {
      gfx.lineStyle(2, 0xd6fbff, 1);
      gfx.beginPath();
      gfx.moveTo(0, -20);
      gfx.lineTo(0, -10);
      gfx.moveTo(-8, -18);
      gfx.lineTo(8, -12);
      gfx.moveTo(8, -18);
      gfx.lineTo(-8, -12);
      gfx.closePath();
      gfx.strokePath();
    }
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

  getInfoLines() {
    const lines = [
      `HP ${Math.ceil(this.hp)} / ${this.maxHp}`,
      `방어력 ${Math.round(this.armor * 100)}%`,
    ];
    if (this.armorBreakAmount > 0) lines.push('방어력 감소 중');
    return lines;
  }

  applySlow(amount, duration) {
    if (this.slowImmune || amount <= 0 || duration <= 0) return;
    this._slowEffects.push({ amount, until: Date.now() + duration });
    this._refreshSlow();
  }

  _refreshSlow() {
    const now = Date.now();
    this._slowEffects = this._slowEffects.filter(effect => effect.until > now);
    if (this._slowEffects.length === 0) {
      this.speed = this.baseSpeed;
      return;
    }
    const strongest = Math.max(...this._slowEffects.map(effect => effect.amount));
    this.speed = Math.max(this.baseSpeed * (1 - strongest), 10);
  }

  applyArmorBreak(amount, duration) {
    if (amount <= 0 || duration <= 0) return;
    this.armorBreakAmount = Math.max(this.armorBreakAmount, amount);
    this.armorBreakUntil = Math.max(this.armorBreakUntil, Date.now() + duration);
    this.armor = Math.max(0, +(this.baseArmor - this.armorBreakAmount).toFixed(3));
    if (typeof this.scene.showBattleMessage === 'function') {
      this.scene.showBattleMessage('방어력 감소 중', '#ffd166', Math.min(duration, 1400));
    }
  }

  _refreshArmorBreak() {
    if (!this.armorBreakUntil || Date.now() <= this.armorBreakUntil) return;
    this.armorBreakAmount = 0;
    this.armorBreakUntil = 0;
    this.armor = this.baseArmor;
  }

  _clearFreezeTint() {
    if (!this._freezeTint) return;
    this._freezeTint.destroy();
    this._freezeTint = null;
  }

  update(time, delta) {
    this._refreshArmorBreak();
    this._refreshSlow();
    if (Date.now() < this.frozenUntil) return;
    this._clearFreezeTint();

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
    this._drawHpBar();
  }

  // 재생/버프 등 패시브 처리 (이동 없음)
  updatePassive(delta) {
    this._refreshArmorBreak();
    this._refreshSlow();
    if (Date.now() >= this.frozenUntil) this._clearFreezeTint();
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
    if (this._freezeTint) this._freezeTint.destroy();
    this._freezeTint = this.scene.add.graphics();
    this._freezeTint.fillStyle(0xaaddff, 0.42);
    this._freezeTint.fillCircle(0, 0, 23);
    this.sprite.add(this._freezeTint);
  }

  setPath(path) {
    this.path = path;
    this.pathIndex = 0;
  }

  isAtDestination(destCol, destRow) {
    return this.col === destCol && this.row === destRow;
  }

  destroy() {
    if (this.scene?.selectedEnemy === this && typeof this.scene.clearEnemyInfo === 'function') {
      this.scene.clearEnemyInfo();
    }
    this._clearFreezeTint();
    this.sprite.destroy();
    this.hpBar.destroy();
  }
}
