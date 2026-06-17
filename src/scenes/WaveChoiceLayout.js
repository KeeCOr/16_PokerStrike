import { UI_TEXTURES } from '../assets/art/AssetKeys.js';

export const WAVE_CHOICE_LAYOUT = {
  TITLE_FONT: 26,
  LABEL_FONT: 19,
  TYPE_FONT: 14,
  CARD_W: 440,
  CARD_H: 128,
  CARD_TEXTURE_PADDING_X: 34,
  CARD_TEXTURE_PADDING_Y: 18,
  START_Y: 232,
  ROW_GAP: 144,
  LABEL_Y_OFFSET: -22,
  TYPE_Y_OFFSET: 20,
};

export function getWaveChoiceTextureKey(upgrade) {
  if (upgrade.type === 'unitHp' || upgrade.type === 'unitSlow') return UI_TEXTURES.BUTTON_UPGRADE_GREEN;
  if (upgrade.type === 'unitAtk' || upgrade.type === 'unitAtkSpeed' || upgrade.type === 'unitSplashChance' || upgrade.type === 'unitStunChance') {
    return UI_TEXTURES.BUTTON_UPGRADE_ORANGE;
  }
  return UI_TEXTURES.BUTTON_UPGRADE_BLUE;
}
