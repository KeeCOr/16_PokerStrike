import { describe, expect, it } from 'vitest';
import { STAGE_INTRO_LAYOUT } from '../../src/scenes/StageIntroLayout.js';

function fontPx(value) {
  return Number.parseInt(value, 10);
}

describe('Stage intro layout', () => {
  it('uses a framed centered banner instead of a plain oversized text splash', () => {
    expect(STAGE_INTRO_LAYOUT.x).toBe(320);
    expect(STAGE_INTRO_LAYOUT.frame.w).toBeGreaterThanOrEqual(400);
    expect(STAGE_INTRO_LAYOUT.frame.h).toBeGreaterThanOrEqual(160);
    expect(STAGE_INTRO_LAYOUT.backdrop.alpha).toBeLessThan(0.65);
  });

  it('keeps the stage label hierarchy compact enough for the frame', () => {
    expect(fontPx(STAGE_INTRO_LAYOUT.titleFontSize)).toBeLessThanOrEqual(56);
    expect(fontPx(STAGE_INTRO_LAYOUT.eyebrowFontSize)).toBeLessThan(fontPx(STAGE_INTRO_LAYOUT.titleFontSize));
    expect(fontPx(STAGE_INTRO_LAYOUT.subtitleFontSize)).toBeLessThan(fontPx(STAGE_INTRO_LAYOUT.titleFontSize));
    expect(Math.abs(STAGE_INTRO_LAYOUT.numberY)).toBeLessThanOrEqual(4);
  });
});

