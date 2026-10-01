import { describe, expect, it } from 'vitest';
import { RANGE_DECAL_STYLE } from '../../src/units/UnitManager.js';

describe('Range decal style', () => {
  it('uses a low-opacity floor decal while moving towers', () => {
    expect(RANGE_DECAL_STYLE.FILL_ALPHA).toBeGreaterThan(0);
    expect(RANGE_DECAL_STYLE.FILL_ALPHA).toBeLessThanOrEqual(0.035);
    expect(RANGE_DECAL_STYLE.RING_ALPHA).toBeLessThanOrEqual(0.18);
    expect(RANGE_DECAL_STYLE.DEPTH).toBeLessThan(1);
    expect(RANGE_DECAL_STYLE.TICK_COUNT).toBeGreaterThanOrEqual(12);
  });
});
