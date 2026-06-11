import { describe, expect, it } from 'vitest';
import { HUD_LAYOUT } from '../../src/ui/HUD.js';

describe('HUD layout', () => {
  it('places wave info at top center and resources at top right', () => {
    const resourceLeft = HUD_LAYOUT.RESOURCE_PANEL.x - HUD_LAYOUT.RESOURCE_PANEL.w / 2;
    const resourceRight = HUD_LAYOUT.RESOURCE_PANEL.x + HUD_LAYOUT.RESOURCE_PANEL.w / 2;
    const waveCenter = HUD_LAYOUT.WAVE_PANEL.x;
    const waveRight = HUD_LAYOUT.WAVE_PANEL.x + HUD_LAYOUT.WAVE_PANEL.w / 2;
    const waveLeft = HUD_LAYOUT.WAVE_PANEL.x - HUD_LAYOUT.WAVE_PANEL.w / 2;

    expect(HUD_LAYOUT.GOLD_TEXT.x).toBeGreaterThan(resourceLeft);
    expect(HUD_LAYOUT.GOLD_TEXT.x).toBeLessThan(resourceRight);
    expect(HUD_LAYOUT.GEM_TEXT.x).toBeGreaterThan(resourceLeft);
    expect(HUD_LAYOUT.GEM_TEXT.x).toBeLessThan(resourceRight);
    expect(waveCenter).toBe(320);
    expect(resourceLeft).toBeGreaterThanOrEqual(waveRight + HUD_LAYOUT.RESOURCE_WAVE_GAP);
    expect(waveLeft).toBeLessThan(320);
    expect(waveRight).toBeGreaterThan(320);
  });
});
