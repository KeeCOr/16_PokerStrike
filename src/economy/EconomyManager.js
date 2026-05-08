const BASE_INCOME_RATE = 1;
const INCOME_PER_WAVE = 0.5;
const DRAW_COST = 5;
const REPLACE_BASE_COST = 10;
const REPLACE_INCREMENT = 2;

export default class EconomyManager {
  constructor() {
    this.gold = 20;
    this.incomeRate = BASE_INCOME_RATE;
    this.replaceCount = 0;
    this.accumulator = 0;
    this.onGoldChanged = null;
  }

  update(delta) {
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

  getDrawCost() { return DRAW_COST; }

  getReplaceCost() {
    return REPLACE_BASE_COST + this.replaceCount * REPLACE_INCREMENT;
  }

  recordReplace() { this.replaceCount++; }

  resetReplaceCost() { this.replaceCount = 0; }

  onWaveCleared() {
    this.incomeRate += INCOME_PER_WAVE;
  }
}
