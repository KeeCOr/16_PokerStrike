import { describe, expect, it } from 'vitest';
import { SUMMON_PREVIEW_STYLE } from '../../src/units/UnitManager.js';

describe('Summon preview style', () => {
  it('marks random summon candidates with a weak outline instead of a filled tile', () => {
    expect(SUMMON_PREVIEW_STYLE.FILL_ALPHA).toBe(0);
    expect(SUMMON_PREVIEW_STYLE.LINE_ALPHA).toBeGreaterThan(0);
    expect(SUMMON_PREVIEW_STYLE.LINE_ALPHA).toBeLessThanOrEqual(0.22);
    expect(SUMMON_PREVIEW_STYLE.LINE_WIDTH).toBeLessThanOrEqual(2);
  });
});
