import { UI_TEXTURES } from '../assets/art/AssetKeys.js';

export const WAVE_CHOICE_LAYOUT = {
  TITLE_Y: 108,
  TITLE_FRAME: { w: 368, h: 84 },
  TITLE_EYEBROW_Y: -24,
  TITLE_TEXT_Y: -1,
  TITLE_SUBTITLE_Y: 28,
  TITLE_FONT: 32,
  TITLE_EYEBROW_FONT: 12,
  TITLE_SUBTITLE_FONT: 13,
  LABEL_FONT: 20,
  TYPE_FONT: 14,
  CARD_W: 520,
  CARD_H: 154,
  CARD_TEXTURE_PADDING_X: 28,
  CARD_TEXTURE_PADDING_Y: 22,
  START_Y: 246,
  ROW_GAP: 166,
  LABEL_Y_OFFSET: -31,
  TYPE_Y_OFFSET: 35,
  LABEL_WRAP_WIDTH: 440,
  TYPE_WRAP_WIDTH: 420,
};

export function getWaveChoiceTextureKey(upgrade) {
  if (upgrade.type === 'unitHp' || upgrade.type === 'unitSlow') return UI_TEXTURES.BUTTON_UPGRADE_GREEN;
  if (upgrade.type === 'unitAtk' || upgrade.type === 'unitAtkSpeed' || upgrade.type === 'unitSplashChance' || upgrade.type === 'unitStunChance') {
    return UI_TEXTURES.BUTTON_UPGRADE_ORANGE;
  }
  return UI_TEXTURES.BUTTON_UPGRADE_BLUE;
}

