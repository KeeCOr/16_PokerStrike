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
    this.reward = stats.reward;
    this.magicImmune = stats.magicImmune;
    this.isAerial = stats.isAerial;
    this.regenRate = stats.regenRate ?? 0;
    this.freezeRadius = stats.freezeRadius ?? 0;
    this.freezeDuration = stats.freezeDuration ?? 0;

    this.path = null;
    this.pathIndex = 0;
    this.targetUnit = null;

    const pos = scene.grid.cellToWorld(col, row);
    this.x = pos.x;
    this.y = pos.y;

    const color = type === ENEMY_TYPE.BOSS ? 0xff0000 : 0xee8800;
    this.sprite = scene.add.rectangle(this.x, this.y, 32, 32, color).setDepth(2);
    this.hpBar = scene.add.graphics().setDepth(3);
    this._drawHpBar();

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
  }

  takeDamage(amount) {
    if (this.hp <= 0) return true;
    this.hp = Math.max(0, this.hp - amount);
    this._drawHpBar();
    return this.hp <= 0;
  }

  update(time, delta) {
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
    this._drawHpBar();
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
  }
}
