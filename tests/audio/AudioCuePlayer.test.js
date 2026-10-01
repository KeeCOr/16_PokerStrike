import { describe, expect, it } from 'vitest';
import { AUDIO_KEYS } from '../../src/assets/audio/AudioAssetKeys.js';
import { AUDIO_CUES, CUE_TO_AUDIO_KEY, playAudioCue } from '../../src/audio/AudioCuePlayer.js';

function createSceneStub(existingKeys = Object.values(AUDIO_KEYS)) {
  const played = [];
  return {
    sound: {
      play(key, config) {
        played.push({ key, config });
      },
    },
    cache: {
      audio: {
        exists(key) {
          return existingKeys.includes(key);
        },
      },
    },
    played,
  };
}

describe('AudioCuePlayer', () => {
  it('maps gameplay cues to stable audio keys', () => {
    expect(CUE_TO_AUDIO_KEY[AUDIO_CUES.UI_CLICK]).toBe(AUDIO_KEYS.UI_CLICK);
    expect(CUE_TO_AUDIO_KEY[AUDIO_CUES.CARD_SELECT]).toBe(AUDIO_KEYS.CARD_SELECT);
    expect(CUE_TO_AUDIO_KEY[AUDIO_CUES.SUMMON_CONFIRM]).toBe(AUDIO_KEYS.SUMMON_CONFIRM);
    expect(CUE_TO_AUDIO_KEY[AUDIO_CUES.MAGIC_CAST]).toBe(AUDIO_KEYS.MAGIC_CAST);
    expect(CUE_TO_AUDIO_KEY[AUDIO_CUES.ATTACK_HIT]).toBe(AUDIO_KEYS.HIT);
    expect(CUE_TO_AUDIO_KEY[AUDIO_CUES.ENEMY_KO]).toBe(AUDIO_KEYS.KO);
    expect(CUE_TO_AUDIO_KEY[AUDIO_CUES.STAGE_CLEAR]).toBe(AUDIO_KEYS.STAGE_CLEAR);
    expect(CUE_TO_AUDIO_KEY[AUDIO_CUES.GAME_OVER]).toBe(AUDIO_KEYS.FAILURE);
  });

  it('plays a cue through Phaser sound with cue volume defaults', () => {
    const scene = createSceneStub();

    const played = playAudioCue(scene, AUDIO_CUES.SUMMON_CONFIRM);

    expect(played).toBe(true);
    expect(scene.played).toEqual([
      { key: AUDIO_KEYS.SUMMON_CONFIRM, config: { volume: 0.7 } },
    ]);
  });

  it('does not throw or play when the audio key is not loaded', () => {
    const scene = createSceneStub([]);

    expect(playAudioCue(scene, AUDIO_CUES.STAGE_CLEAR)).toBe(false);
    expect(scene.played).toEqual([]);
  });
});
