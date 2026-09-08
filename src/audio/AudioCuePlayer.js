import { AUDIO_ASSETS, AUDIO_KEYS } from '../assets/audio/AudioAssetKeys.js';

export const AUDIO_CUES = Object.freeze({
  UI_CLICK: 'ui-click',
  CARD_SELECT: 'card-select',
  SUMMON_CONFIRM: 'summon-confirm',
  MAGIC_CAST: 'magic-cast',
  ATTACK_HIT: 'attack-hit',
  BASE_HIT: 'base-hit',
  ENEMY_KO: 'enemy-ko',
  STAGE_CLEAR: 'stage-clear',
  GAME_OVER: 'game-over',
});

export const CUE_TO_AUDIO_KEY = Object.freeze({
  [AUDIO_CUES.UI_CLICK]: AUDIO_KEYS.UI_CLICK,
  [AUDIO_CUES.CARD_SELECT]: AUDIO_KEYS.CARD_SELECT,
  [AUDIO_CUES.SUMMON_CONFIRM]: AUDIO_KEYS.SUMMON_CONFIRM,
  [AUDIO_CUES.MAGIC_CAST]: AUDIO_KEYS.MAGIC_CAST,
  [AUDIO_CUES.ATTACK_HIT]: AUDIO_KEYS.HIT,
  [AUDIO_CUES.BASE_HIT]: AUDIO_KEYS.FAILURE,
  [AUDIO_CUES.ENEMY_KO]: AUDIO_KEYS.KO,
  [AUDIO_CUES.STAGE_CLEAR]: AUDIO_KEYS.STAGE_CLEAR,
  [AUDIO_CUES.GAME_OVER]: AUDIO_KEYS.FAILURE,
});

const DEFAULT_VOLUME_BY_CUE = Object.freeze({
  [AUDIO_CUES.UI_CLICK]: 0.45,
  [AUDIO_CUES.CARD_SELECT]: 0.5,
  [AUDIO_CUES.SUMMON_CONFIRM]: 0.7,
  [AUDIO_CUES.MAGIC_CAST]: 0.74,
  [AUDIO_CUES.ATTACK_HIT]: 0.38,
  [AUDIO_CUES.BASE_HIT]: 0.64,
  [AUDIO_CUES.ENEMY_KO]: 0.58,
  [AUDIO_CUES.STAGE_CLEAR]: 0.68,
  [AUDIO_CUES.GAME_OVER]: 0.64,
});

const CATEGORY_BY_CUE = Object.freeze({
  [AUDIO_CUES.UI_CLICK]: 'ui',
  [AUDIO_CUES.CARD_SELECT]: 'ui',
  [AUDIO_CUES.SUMMON_CONFIRM]: 'transition',
  [AUDIO_CUES.MAGIC_CAST]: 'action',
  [AUDIO_CUES.ATTACK_HIT]: 'action',
  [AUDIO_CUES.BASE_HIT]: 'danger',
  [AUDIO_CUES.ENEMY_KO]: 'action',
  [AUDIO_CUES.STAGE_CLEAR]: 'result',
  [AUDIO_CUES.GAME_OVER]: 'result',
});

export function playAudioCue(scene, cue, options = {}) {
  const key = CUE_TO_AUDIO_KEY[cue];
  const src = key ? AUDIO_ASSETS[key]?.[0] : null;
  if (!src) return false;
  return globalThis.__gameAudioRuntime?.playCue?.({
    src,
    category: CATEGORY_BY_CUE[cue] ?? 'action',
    gain: options.volume ?? DEFAULT_VOLUME_BY_CUE[cue] ?? 0.5,
  }) ?? false;
}
