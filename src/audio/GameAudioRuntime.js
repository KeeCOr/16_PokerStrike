import { GameAudioDirector } from './GameAudioDirector.js';
import { AUDIO_ASSETS, AUDIO_KEYS } from '../assets/audio/AudioAssetKeys.js';

export function installGameAudioRuntime(basePath, bgmFile = 'bgm-loop.ogg') {
  if (globalThis.__gameAudioRuntime) return globalThis.__gameAudioRuntime;
  const director = new GameAudioDirector({
    audioFactory: () => new Audio(),
    bgmUrl: `${basePath}/${bgmFile}`,
    cues: {
      ui: { src: AUDIO_ASSETS[AUDIO_KEYS.UI_CLICK][0], category: 'ui', gain: 0.45 },
      action: { src: AUDIO_ASSETS[AUDIO_KEYS.HIT][0], category: 'action', gain: 0.38 },
      danger: { src: AUDIO_ASSETS[AUDIO_KEYS.FAILURE][0], category: 'danger', gain: 0.64 },
      transition: { src: AUDIO_ASSETS[AUDIO_KEYS.SUMMON_CONFIRM][0], category: 'transition', gain: 0.7 },
      result: { src: AUDIO_ASSETS[AUDIO_KEYS.STAGE_CLEAR][0], category: 'result', gain: 0.68 },
    },
  });
  const start = () => director.startFromGesture();
  window.addEventListener('pointerdown', start, { once: true });
  window.addEventListener('keydown', start, { once: true });
  document.addEventListener('visibilitychange', () => director.handleVisibility(document.hidden));
  window.addEventListener('game-audio', (event) => {
    if (event.detail?.cue) director.playCue(event.detail.cue);
  });
  globalThis.__gameAudioRuntime = director;
  return director;
}

export function emitGameAudioCue(cue) {
  window.dispatchEvent(new CustomEvent('game-audio', { detail: { cue } }));
}
