import { describe, expect, it } from 'vitest';
import { getWaveChoiceTextureKey, WAVE_CHOICE_LAYOUT } from '../../src/scenes/WaveChoiceLayout.js';
import { UI_TEXTURES } from '../../src/assets/art/AssetKeys.js';

describe('Wave choice layout', () => {
  it('uses larger readable fonts for upgrade choices', () => {
    expect(WAVE_CHOICE_LAYOUT.LABEL_FONT).toBeGreaterThanOrEqual(19);
    expect(WAVE_CHOICE_LAYOUT.TYPE_FONT).toBeGreaterThanOrEqual(14);
  });

  it('uses image-backed cards that match the rest of the UI kit', () => {
    expect(WAVE_CHOICE_LAYOUT.CARD_W).toBeGreaterThanOrEqual(430);
    expect(WAVE_CHOICE_LAYOUT.CARD_H).toBeGreaterThanOrEqual(126);
    expect(WAVE_CHOICE_LAYOUT.CARD_TEXTURE_PADDING_X).toBeGreaterThanOrEqual(28);
    expect(getWaveChoiceTextureKey({ type: 'unitHp' })).toBe(UI_TEXTURES.BUTTON_UPGRADE_GREEN);
    expect(getWaveChoiceTextureKey({ type: 'unitAtk' })).toBe(UI_TEXTURES.BUTTON_UPGRADE_ORANGE);
    expect(getWaveChoiceTextureKey({ type: 'drawCost' })).toBe(UI_TEXTURES.BUTTON_UPGRADE_BLUE);
  });
});
