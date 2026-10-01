export const AUDIO_KEYS = Object.freeze({
  UI_CLICK: 'audio-ui-click',
  CARD_SELECT: 'audio-card-select',
  SUMMON_CONFIRM: 'audio-summon-confirm',
  MAGIC_CAST: 'audio-magic-cast',
  HIT: 'audio-hit',
  KO: 'audio-ko',
  STAGE_CLEAR: 'audio-stage-clear',
  FAILURE: 'audio-failure',
});

export const AUDIO_ASSETS = Object.freeze({
  [AUDIO_KEYS.UI_CLICK]: [new URL('./kenney/ui-click.ogg', import.meta.url).href],
  [AUDIO_KEYS.CARD_SELECT]: [new URL('./kenney/card-select.ogg', import.meta.url).href],
  [AUDIO_KEYS.SUMMON_CONFIRM]: [new URL('./kenney/summon-confirm.ogg', import.meta.url).href],
  [AUDIO_KEYS.MAGIC_CAST]: [new URL('./kenney/magic-cast.ogg', import.meta.url).href],
  [AUDIO_KEYS.HIT]: [new URL('./kenney/hit.ogg', import.meta.url).href],
  [AUDIO_KEYS.KO]: [new URL('./kenney/ko.ogg', import.meta.url).href],
  [AUDIO_KEYS.STAGE_CLEAR]: [new URL('./kenney/stage-clear.ogg', import.meta.url).href],
  [AUDIO_KEYS.FAILURE]: [new URL('./kenney/failure.ogg', import.meta.url).href],
});

export function getAudioKey(name) {
  return AUDIO_KEYS[name] ?? AUDIO_KEYS.UI_CLICK;
}

export function preloadAudioAssets(scene) {
  if (!scene?.load?.audio) return;
  for (const [key, urls] of Object.entries(AUDIO_ASSETS)) {
    scene.load.audio(key, urls);
  }
}

