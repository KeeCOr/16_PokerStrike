import { AUDIO_KEYS } from '../assets/audio/AudioAssetKeys.js';

export const AUDIO_CUES = Object.freeze({
  UI_CLICK: 'ui-click',
  CARD_SELECT: 'card-select',
  SUMMON_CONFIRM: 'summon-confirm',
  MAGIC_CAST: 'magic-cast',
  ATTACK_HIT: 'attack-hit',
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
  [AUDIO_CUES.ENEMY_KO]: 0.58,
  [AUDIO_CUES.STAGE_CLEAR]: 0.68,
  [AUDIO_CUES.GAME_OVER]: 0.64,
});

export function playAudioCue(scene, cue, options = {}) {
  const key = CUE_TO_AUDIO_KEY[cue];
  if (!key || !scene?.sound?.play) return false;
  if (scene.cache?.audio?.exists && !scene.cache.audio.exists(key)) return false;
  const volume = options.volume ?? DEFAULT_VOLUME_BY_CUE[cue] ?? 0.5;
  scene.sound.play(key, { volume });
  return true;
}
