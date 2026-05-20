import { describe, expect, it } from 'vitest';
import { shouldShowUpgradeTutorialOnStageClear } from '../../src/scenes/GameSceneTutorial.js';

describe('GameScene upgrade tutorial timing', () => {
  it('shows the upgrade tutorial only on the first stage clear', () => {
    expect(shouldShowUpgradeTutorialOnStageClear(0, false)).toBe(true);
    expect(shouldShowUpgradeTutorialOnStageClear(0, true)).toBe(false);
    expect(shouldShowUpgradeTutorialOnStageClear(1, false)).toBe(false);
  });
});
