import { SUIT_ICONS } from '../cards/Card.js';

export const GOLD_SUIT_UPGRADE_COST = 45;
export const GOLD_SUIT_UPGRADE_MULT = 1.1;

export function createGoldSuitUpgrade(suit) {
  const icon = SUIT_ICONS[suit] ?? suit;
  return {
    id: `gold_suit_atk_${suit}_${Date.now()}`,
    label: `${icon} 공격력 +10%`,
    type: 'unitAtk',
    suit,
    mult: GOLD_SUIT_UPGRADE_MULT,
    source: 'goldSuitUpgrade',
  };
}

export function applyGoldSuitUpgradeToUnits(units, upgrade) {
  for (const unit of units) {
    if (unit.suit !== upgrade.suit) continue;
    unit.stats.atk = Math.floor(unit.stats.atk * upgrade.mult);
  }
}
