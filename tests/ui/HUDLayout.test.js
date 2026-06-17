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
    expect(HUD_LAYOUT.GOLD_ICON.x).toBeGreaterThan(resourceLeft);
    expect(HUD_LAYOUT.GEM_ICON.x).toBeGreaterThan(HUD_LAYOUT.GOLD_TEXT.x);
    expect(HUD_LAYOUT.GOLD_ICON.size).toBeGreaterThanOrEqual(22);
    expect(HUD_LAYOUT.GEM_ICON.size).toBeGreaterThanOrEqual(22);
    expect(waveCenter).toBe(320);
    expect(HUD_LAYOUT.WAVE_TEXT.x).toBe(HUD_LAYOUT.WAVE_PANEL.x);
    expect(resourceLeft).toBeGreaterThanOrEqual(waveRight + HUD_LAYOUT.RESOURCE_WAVE_GAP);
    expect(waveLeft).toBeLessThan(320);
    expect(waveRight).toBeGreaterThan(320);
  });

  it('right-aligns currency values inside the resource frame', () => {
    const resourceRight = HUD_LAYOUT.RESOURCE_PANEL.x + HUD_LAYOUT.RESOURCE_PANEL.w / 2;

    expect(HUD_LAYOUT.GOLD_TEXT.originX).toBe(1);
    expect(HUD_LAYOUT.GEM_TEXT.originX).toBe(1);
    expect(HUD_LAYOUT.GEM_TEXT.x).toBeLessThanOrEqual(resourceRight - HUD_LAYOUT.RESOURCE_PANEL.paddingX);
    expect(HUD_LAYOUT.GOLD_TEXT.x).toBeLessThan(HUD_LAYOUT.GEM_ICON.x);
    expect(HUD_LAYOUT.GOLD_TEXT.maxWidth).toBeGreaterThanOrEqual(42);
    expect(HUD_LAYOUT.GEM_TEXT.maxWidth).toBeGreaterThanOrEqual(42);
  });

  it('keeps wave text centered inside the visual badge frame', () => {
    expect(HUD_LAYOUT.WAVE_BADGE_DISPLAY.w).toBeLessThanOrEqual(HUD_LAYOUT.WAVE_PANEL.w + 8);
    expect(HUD_LAYOUT.WAVE_TEXT.y).toBe(HUD_LAYOUT.WAVE_PANEL.y + HUD_LAYOUT.WAVE_TEXT.offsetY);
    expect(Math.abs(HUD_LAYOUT.WAVE_TEXT.offsetY)).toBeLessThanOrEqual(3);
  });
});
