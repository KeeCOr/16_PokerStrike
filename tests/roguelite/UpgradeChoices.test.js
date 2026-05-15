import { describe, expect, it } from 'vitest';
import { getEligibleWaveUpgrades } from '../../src/roguelite/UpgradeChoices.js';
import RogueliteManager from '../../src/roguelite/RogueliteManager.js';

describe('UpgradeChoices', () => {
  it('excludes unit upgrades when no current unit can receive them', () => {
    const manager = new RogueliteManager();
    const units = [
      { suit: 'H', handRank: 1, stats: { role: 'area' } },
    ];
    const upgrades = [
      { id: 'fire_atk', type: 'unitAtk', suit: 'H' },
      { id: 'water_atk', type: 'unitAtk', suit: 'D' },
      { id: 'draw_cheap', type: 'drawCost', bonus: -2 },
    ];

    const eligible = getEligibleWaveUpgrades(upgrades, units, manager).map(u => u.id);

    expect(eligible).toEqual(['fire_atk', 'draw_cheap']);
  });
});
