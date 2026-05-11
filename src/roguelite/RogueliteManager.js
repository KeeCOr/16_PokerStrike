export default class RogueliteManager {
  constructor() {
    this.upgrades = [];
  }

  addUpgrade(upgrade) {
    this.upgrades.push({ ...upgrade });
  }

  // 새로 배치되는 유닛에 누적 업그레이드 적용
  applyToUnit(unit) {
    for (const u of this.upgrades) {
      if (!this.matches(u, unit)) continue;
      switch (u.type) {
        case 'unitAtk':
          unit.stats.atk = Math.floor(unit.stats.atk * u.mult);
          break;
        case 'unitHp':
          unit.stats.hp = Math.floor(unit.stats.hp * u.mult);
          unit.stats.maxHp = unit.stats.hp;
          unit.hp = unit.stats.hp;
          unit.maxHp = unit.stats.maxHp;
          break;
        case 'unitRange':
          unit.stats.range += u.bonus;
          break;
        case 'unitAtkSpeed':
          unit.stats.atkSpeed *= u.mult;
          break;
        case 'unitBuffRadius':
          unit.stats.buffRadius += u.bonus;
          break;
        case 'unitSlow':
          unit.stats.slowAmount = Math.min(0.9, (unit.stats.slowAmount || 0) + u.bonus);
          break;
      }
    }
  }

  matches(upgrade, unit) {
    if (upgrade.handRank !== undefined && upgrade.handRank !== unit.handRank) return false;
    if (upgrade.suit !== undefined && upgrade.suit !== unit.suit) return false;
    if (upgrade.role !== undefined && upgrade.role !== unit.stats.role) return false;
    return true;
  }

  getDrawCostBonus() {
    return this.upgrades
      .filter(u => u.type === 'drawCost')
      .reduce((s, u) => s + u.bonus, 0);
  }

  getReplaceCostBonus() {
    return this.upgrades
      .filter(u => u.type === 'replaceCost')
      .reduce((s, u) => s + u.bonus, 0);
  }

  getGoldOnSummon(handRank) {
    return this.upgrades
      .filter(u => u.type === 'goldOnSummon' && u.handRank === handRank)
      .reduce((s, u) => s + u.amount, 0);
  }
}
