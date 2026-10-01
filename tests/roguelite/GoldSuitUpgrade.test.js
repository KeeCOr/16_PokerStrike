import { describe, expect, it } from 'vitest';
import { applyGoldSuitUpgradeToUnits, createGoldSuitUpgrade, GOLD_SUIT_UPGRADE_COST } from '../../src/roguelite/GoldSuitUpgrade.js';

describe('Gold suit upgrades', () => {
  it('creates an inefficient gold upgrade for one card suit using icon-only labels', () => {
    const upgrade = createGoldSuitUpgrade('H');

    expect(GOLD_SUIT_UPGRADE_COST).toBeGreaterThanOrEqual(40);
    expect(upgrade).toMatchObject({
      type: 'unitAtk',
      suit: 'H',
      mult: 1.1,
    });
    expect(upgrade.label).toMatch(/^♥/);
    expect(upgrade.label).not.toMatch(/불|물|땅|바람|속성/);
  });

  it('applies the gold upgrade only to existing units with the matching suit', () => {
    const units = [
      { suit: 'H', stats: { atk: 100 } },
      { suit: 'D', stats: { atk: 100 } },
    ];

    applyGoldSuitUpgradeToUnits(units, createGoldSuitUpgrade('H'));

    expect(units[0].stats.atk).toBe(110);
    expect(units[1].stats.atk).toBe(100);
  });
});
