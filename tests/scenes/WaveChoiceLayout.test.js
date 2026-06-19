import { describe, expect, it } from 'vitest';
import { getWaveChoiceTextureKey, WAVE_CHOICE_LAYOUT } from '../../src/scenes/WaveChoiceLayout.js';
import { UI_TEXTURES } from '../../src/assets/art/AssetKeys.js';

describe('Wave choice layout', () => {
  it('uses a stronger title treatment for the upgrade choice overlay', () => {
    expect(WAVE_CHOICE_LAYOUT.TITLE_FONT).toBeGreaterThanOrEqual(30);
    expect(WAVE_CHOICE_LAYOUT.TITLE_FRAME.w).toBeGreaterThanOrEqual(340);
    expect(WAVE_CHOICE_LAYOUT.TITLE_FRAME.h).toBeGreaterThanOrEqual(76);
    expect(WAVE_CHOICE_LAYOUT.TITLE_SUBTITLE_FONT).toBeGreaterThanOrEqual(12);
  });

  it('uses larger readable fonts for upgrade choices', () => {
    expect(WAVE_CHOICE_LAYOUT.LABEL_FONT).toBeGreaterThanOrEqual(19);
    expect(WAVE_CHOICE_LAYOUT.TYPE_FONT).toBeGreaterThanOrEqual(14);
  });

  it('uses image-backed cards that match the rest of the UI kit', () => {
    expect(WAVE_CHOICE_LAYOUT.CARD_W).toBeGreaterThanOrEqual(500);
    expect(WAVE_CHOICE_LAYOUT.CARD_H).toBeGreaterThanOrEqual(148);
    expect(WAVE_CHOICE_LAYOUT.CARD_TEXTURE_PADDING_X).toBeGreaterThanOrEqual(24);
    expect(WAVE_CHOICE_LAYOUT.LABEL_WRAP_WIDTH).toBeLessThanOrEqual(WAVE_CHOICE_LAYOUT.CARD_W - 72);
    expect(WAVE_CHOICE_LAYOUT.TYPE_WRAP_WIDTH).toBeLessThanOrEqual(WAVE_CHOICE_LAYOUT.CARD_W - 88);
    expect(WAVE_CHOICE_LAYOUT.ROW_GAP).toBeGreaterThanOrEqual(WAVE_CHOICE_LAYOUT.CARD_H + 10);
    expect(getWaveChoiceTextureKey({ type: 'unitHp' })).toBe(UI_TEXTURES.BUTTON_UPGRADE_GREEN);
    expect(getWaveChoiceTextureKey({ type: 'unitAtk' })).toBe(UI_TEXTURES.BUTTON_UPGRADE_ORANGE);
    expect(getWaveChoiceTextureKey({ type: 'drawCost' })).toBe(UI_TEXTURES.BUTTON_UPGRADE_BLUE);
  });
});

