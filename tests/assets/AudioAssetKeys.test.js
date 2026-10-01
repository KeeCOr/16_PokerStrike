import { describe, expect, it } from 'vitest';
import {
  AUDIO_ASSETS,
  AUDIO_KEYS,
  getAudioKey,
  preloadAudioAssets,
} from '../../src/assets/audio/AudioAssetKeys.js';

describe('AudioAssetKeys', () => {
  it('defines the PokerStrike Kenney SFX keys', () => {
    expect(AUDIO_KEYS.UI_CLICK).toBe('audio-ui-click');
    expect(AUDIO_KEYS.CARD_SELECT).toBe('audio-card-select');
    expect(AUDIO_KEYS.SUMMON_CONFIRM).toBe('audio-summon-confirm');
    expect(AUDIO_KEYS.MAGIC_CAST).toBe('audio-magic-cast');
    expect(AUDIO_KEYS.HIT).toBe('audio-hit');
    expect(AUDIO_KEYS.KO).toBe('audio-ko');
    expect(AUDIO_KEYS.STAGE_CLEAR).toBe('audio-stage-clear');
    expect(AUDIO_KEYS.FAILURE).toBe('audio-failure');
  });

  it('maps unknown audio names to the UI click fallback', () => {
    expect(getAudioKey('SUMMON_CONFIRM')).toBe(AUDIO_KEYS.SUMMON_CONFIRM);
    expect(getAudioKey('unknown')).toBe(AUDIO_KEYS.UI_CLICK);
  });

  it('preloads all audio assets through Phaser audio loader', () => {
    const loaded = [];
    preloadAudioAssets({
      load: {
        audio(key, urls) {
          loaded.push({ key, urls });
        },
      },
    });

    expect(loaded.map(item => item.key)).toEqual(Object.values(AUDIO_KEYS));
    expect(loaded.every(item => item.urls.every(url => url.endsWith('.ogg')))).toBe(true);
    expect(Object.keys(AUDIO_ASSETS)).toEqual(Object.values(AUDIO_KEYS));
  });
});

