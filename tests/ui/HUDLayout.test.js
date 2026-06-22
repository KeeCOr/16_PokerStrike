import { describe, expect, it } from 'vitest';
import { HUD_LAYOUT } from '../../src/ui/HUD.js';

describe('HUD layout', () => {
  it('places wave info at top center and separated resources at top right', () => {
    const waveCenter = HUD_LAYOUT.WAVE_PANEL.x;
    const waveRight = HUD_LAYOUT.WAVE_PANEL.x + HUD_LAYOUT.WAVE_PANEL.w / 2;
    const waveLeft = HUD_LAYOUT.WAVE_PANEL.x - HUD_LAYOUT.WAVE_PANEL.w / 2;
    const goldLeft = HUD_LAYOUT.GOLD_PANEL.x - HUD_LAYOUT.GOLD_PANEL.w / 2;
    const gemRight = HUD_LAYOUT.GEM_PANEL.x + HUD_LAYOUT.GEM_PANEL.w / 2;

    expect(HUD_LAYOUT.GOLD_PANEL.x).toBeLessThan(HUD_LAYOUT.GEM_PANEL.x);
    expect(goldLeft).toBeGreaterThanOrEqual(waveRight + HUD_LAYOUT.RESOURCE_WAVE_GAP);
    expect(gemRight).toBeLessThanOrEqual(640 - 12);
    expect(waveCenter).toBe(320);
    expect(HUD_LAYOUT.WAVE_TEXT.x).toBe(HUD_LAYOUT.WAVE_PANEL.x);
    expect(HUD_LAYOUT.ENEMY_COUNT_TEXT.x).toBeGreaterThan(HUD_LAYOUT.WAVE_PANEL.x);
    expect(HUD_LAYOUT.ENEMY_COUNT_TEXT.x).toBeLessThan(waveRight);
    expect(waveLeft).toBeLessThan(320);
    expect(waveRight).toBeGreaterThan(320);
  });

  it('keeps each currency value inside its own frame and close to the icon', () => {
    const goldLeft = HUD_LAYOUT.GOLD_PANEL.x - HUD_LAYOUT.GOLD_PANEL.w / 2;
    const goldRight = HUD_LAYOUT.GOLD_PANEL.x + HUD_LAYOUT.GOLD_PANEL.w / 2;
    const gemLeft = HUD_LAYOUT.GEM_PANEL.x - HUD_LAYOUT.GEM_PANEL.w / 2;
    const gemRight = HUD_LAYOUT.GEM_PANEL.x + HUD_LAYOUT.GEM_PANEL.w / 2;

    expect(HUD_LAYOUT.GOLD_TEXT.originX).toBe(1);
    expect(HUD_LAYOUT.GEM_TEXT.originX).toBe(1);
    expect(HUD_LAYOUT.GOLD_ICON.x).toBeGreaterThan(goldLeft);
    expect(HUD_LAYOUT.GOLD_TEXT.x).toBeLessThan(goldRight);
    expect(HUD_LAYOUT.GEM_ICON.x).toBeGreaterThan(gemLeft);
    expect(HUD_LAYOUT.GEM_TEXT.x).toBeLessThan(gemRight);
    expect(HUD_LAYOUT.GOLD_TEXT.x - HUD_LAYOUT.GOLD_ICON.x).toBeLessThanOrEqual(44);
    expect(HUD_LAYOUT.GEM_TEXT.x - HUD_LAYOUT.GEM_ICON.x).toBeLessThanOrEqual(44);
    expect(HUD_LAYOUT.GOLD_TEXT.maxWidth).toBeGreaterThanOrEqual(38);
    expect(HUD_LAYOUT.GEM_TEXT.maxWidth).toBeGreaterThanOrEqual(38);
  });

  it('keeps wave text centered inside the visual badge frame', () => {
    expect(HUD_LAYOUT.WAVE_BADGE_DISPLAY.w).toBeLessThanOrEqual(HUD_LAYOUT.WAVE_PANEL.w + 8);
    expect(HUD_LAYOUT.WAVE_TEXT.x).toBe(HUD_LAYOUT.WAVE_PANEL.x);
    expect(HUD_LAYOUT.WAVE_TEXT.y).toBe(HUD_LAYOUT.WAVE_PANEL.y + HUD_LAYOUT.WAVE_TEXT.offsetY);
    expect(HUD_LAYOUT.ENEMY_COUNT_TEXT.y).toBe(HUD_LAYOUT.WAVE_TEXT.y);
    expect(Math.abs(HUD_LAYOUT.WAVE_TEXT.offsetY)).toBeLessThanOrEqual(3);
  });
});
