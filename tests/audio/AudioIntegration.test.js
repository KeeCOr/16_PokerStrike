import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');

function readSource(path) {
  return readFileSync(resolve(ROOT, path), 'utf8');
}

describe('PokerStrike audio integration', () => {
  it('preloads Kenney audio assets in GameScene', () => {
    const source = readSource('src/scenes/GameScene.js');

    expect(source).toContain("import { preloadAudioAssets } from '../assets/audio/AudioAssetKeys.js';");
    expect(source).toContain('preloadAudioAssets(this);');
  });

  it('plays result cues for stage clear and game over', () => {
    const source = readSource('src/scenes/GameScene.js');

    expect(source).toContain("import { AUDIO_CUES, playAudioCue } from '../audio/AudioCuePlayer.js';");
    expect(source).toContain('playAudioCue(this, AUDIO_CUES.STAGE_CLEAR);');
    expect(source).toContain('playAudioCue(this, AUDIO_CUES.GAME_OVER);');
  });

  it('plays action and combat cues in UIScene', () => {
    const source = readSource('src/scenes/UIScene.js');

    expect(source).toContain("import { AUDIO_CUES, playAudioCue } from '../audio/AudioCuePlayer.js';");
    expect(source).toContain('playAudioCue(this, AUDIO_CUES.UI_CLICK);');
    expect(source).toContain('playAudioCue(this, AUDIO_CUES.CARD_SELECT);');
    expect(source).toContain('playAudioCue(this, AUDIO_CUES.SUMMON_CONFIRM);');
    expect(source).toContain('playAudioCue(this, AUDIO_CUES.MAGIC_CAST);');
    expect(source).toContain('playAudioCue(this, AUDIO_CUES.ATTACK_HIT);');
    expect(source).toContain('playAudioCue(this, AUDIO_CUES.ENEMY_KO);');
  });
});
