import { describe, expect, it } from 'vitest';
import { HAND_RANK } from '../../src/cards/HandEvaluator.js';
import { getHandRankVisual } from '../../src/units/Unit.js';

describe('Unit hand-rank visuals', () => {
  it('makes better poker hands visibly larger and brighter', () => {
    const low = getHandRankVisual(HAND_RANK.HIGH_CARD);
    const mid = getHandRankVisual(HAND_RANK.STRAIGHT);
    const high = getHandRankVisual(HAND_RANK.STRAIGHT_FLUSH);

    expect(mid.size).toBeGreaterThan(low.size);
    expect(high.size).toBeGreaterThan(mid.size);
    expect(mid.ring).toBeGreaterThan(low.ring);
    expect(high.glow).toBeGreaterThan(mid.glow);
    expect(high.label).toBe('MAX');
  });
});
