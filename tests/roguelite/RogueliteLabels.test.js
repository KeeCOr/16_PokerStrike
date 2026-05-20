import { describe, expect, it } from 'vitest';
import { UPGRADE_POOL } from '../../src/data/roguelite.js';

describe('Roguelite upgrade labels', () => {
  it('shows suit-specific upgrades with card suit icons instead of Korean attribute names', () => {
    const suitUpgrades = UPGRADE_POOL.filter(upgrade => upgrade.suit);

    expect(suitUpgrades.length).toBeGreaterThan(0);
    for (const upgrade of suitUpgrades) {
      expect(upgrade.label).toMatch(/^[♥♦♣♠]/);
      expect(upgrade.label).not.toMatch(/불 속성|물 속성|땅 속성|바람 속성/);
    }
  });
});
