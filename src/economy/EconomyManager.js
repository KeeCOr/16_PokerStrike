const STARTING_GOLD = 15;
const BASE_INCOME_RATE = 0.5;
const INCOME_PER_WAVE = 0.25;
const DRAW_BASE_COST = 2;
const DRAW_INCREMENT = 2;
const DRAW_DISCOUNT_PER_REPLACE = 1; // 교체 1회당 소환 비용 1G 할인
const REPLACE_BASE_COST = 2;
const REPLACE_INCREMENT = 2;

export default class EconomyManager {
  constructor() {
    this.gold = STARTING_GOLD;
    this.incomeRate = BASE_INCOME_RATE;
    this.replaceCount = 0;
    this.summonCount = 0;
    this.accumulator = 0;
    this.onGoldChanged = null;
    this.roguelite = null;
    this.paused = false;
  }

  update(delta) {
    if (this.paused) return;
    this.accumulator += this.incomeRate * (delta / 1000);
    if (this.accumulator >= 1) {
      const earned = Math.floor(this.accumulator);
      this.gold += earned;
      this.accumulator -= earned;
      if (this.onGoldChanged) this.onGoldChanged(this.gold);
    }
  }

  addGold(amount) {
    this.gold += amount;
    if (this.onGoldChanged) this.onGoldChanged(this.gold);
  }

  spend(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    if (this.onGoldChanged) this.onGoldChanged(this.gold);
    return true;
  }

  getDrawCost() {
    const bonus = this.roguelite ? this.roguelite.getDrawCostBonus() : 0;
    return Math.max(1, DRAW_BASE_COST + this.summonCount * DRAW_INCREMENT - this.replaceCount * DRAW_DISCOUNT_PER_REPLACE + bonus);
  }

  getReplaceCost() {
    const bonus = this.roguelite ? this.roguelite.getReplaceCostBonus() : 0;
    return Math.max(1, REPLACE_BASE_COST + bonus + this.replaceCount * REPLACE_INCREMENT);
  }

  recordSummon() { this.summonCount++; this.replaceCount = 0; }

  recordReplace() { this.replaceCount++; }

  resetReplaceCost() { this.replaceCount = 0; }

  onWaveCleared() {
    this.incomeRate += INCOME_PER_WAVE;
  }

  resetForNewStage(stageIndex = 0) {
    this.gold = STARTING_GOLD + stageIndex * 5;
    this.incomeRate = BASE_INCOME_RATE;
    this.replaceCount = 0;
    this.summonCount = 0;
    this.accumulator = 0;
    if (this.onGoldChanged) this.onGoldChanged(this.gold);
  }
}
