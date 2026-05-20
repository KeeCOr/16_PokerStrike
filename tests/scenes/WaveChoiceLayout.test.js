import { describe, expect, it } from 'vitest';
import { WAVE_CHOICE_LAYOUT } from '../../src/scenes/WaveChoiceLayout.js';

describe('Wave choice layout', () => {
  it('uses larger readable fonts for upgrade choices', () => {
    expect(WAVE_CHOICE_LAYOUT.LABEL_FONT).toBeGreaterThanOrEqual(19);
    expect(WAVE_CHOICE_LAYOUT.TYPE_FONT).toBeGreaterThanOrEqual(14);
  });
});
