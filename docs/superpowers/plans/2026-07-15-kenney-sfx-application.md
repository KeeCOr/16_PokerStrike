# Kenney SFX Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small Kenney-sourced SFX layer to PokerStrike so core card combat actions have audible feedback.

**Architecture:** Keep audio isolated from gameplay logic. `AudioAssetKeys.js` owns sound keys and preload URLs, while `AudioCuePlayer.js` maps semantic game cues to Phaser sound playback. Scenes call `playAudioCue(scene, cue)` at existing event boundaries.

**Tech Stack:** Vite, Phaser 3, Vitest, local static audio assets under `src/assets/audio/kenney/`.

## Global Constraints

- Start with `16_PS` only; defer other projects.
- Do not replace visual art in this task.
- Prefer Kenney SFX and short jingles; long BGM remains deferred.
- Use TDD for new logic.
- Update PokerStrike GDD only after runtime behavior changes are in place.

---

### Task 1: Audio Asset Registry

**Files:**
- Create: `src/assets/audio/AudioAssetKeys.js`
- Test: `tests/assets/AudioAssetKeys.test.js`

**Interfaces:**
- Produces: `AUDIO_KEYS`, `AUDIO_ASSETS`, `preloadAudioAssets(scene)`, `getAudioKey(name)`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { AUDIO_ASSETS, AUDIO_KEYS, getAudioKey, preloadAudioAssets } from '../../src/assets/audio/AudioAssetKeys.js';

describe('AudioAssetKeys', () => {
  it('defines the PokerStrike Kenney SFX keys', () => {
    expect(AUDIO_KEYS.UI_CLICK).toBe('audio-ui-click');
    expect(AUDIO_KEYS.CARD_SELECT).toBe('audio-card-select');
    expect(AUDIO_KEYS.SUMMON_CONFIRM).toBe('audio-summon-confirm');
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
    expect(loaded.every(item => item.urls.every(url => url.endsWith('.wav')))).toBe(true);
    expect(Object.keys(AUDIO_ASSETS)).toEqual(Object.values(AUDIO_KEYS));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/assets/AudioAssetKeys.test.js`
Expected: FAIL because `src/assets/audio/AudioAssetKeys.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `AUDIO_KEYS`, `AUDIO_ASSETS`, `getAudioKey`, and `preloadAudioAssets`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/assets/AudioAssetKeys.test.js`
Expected: PASS.

### Task 2: Semantic Cue Player

**Files:**
- Create: `src/audio/AudioCuePlayer.js`
- Test: `tests/audio/AudioCuePlayer.test.js`

**Interfaces:**
- Consumes: `AUDIO_KEYS` from Task 1.
- Produces: `AUDIO_CUES`, `CUE_TO_AUDIO_KEY`, `playAudioCue(scene, cue, options)`.

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/audio/AudioCuePlayer.test.js`
Expected: FAIL because `AudioCuePlayer.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create semantic cue constants, cue-to-key mapping, default volumes, and safe playback.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/audio/AudioCuePlayer.test.js`
Expected: PASS.

### Task 3: Scene Integration

**Files:**
- Modify: `src/scenes/GameScene.js`
- Modify: `src/scenes/UIScene.js`
- Test: `tests/audio/AudioIntegration.test.js`

**Interfaces:**
- Consumes: `preloadAudioAssets`, `playAudioCue`, `AUDIO_CUES`.

- [ ] **Step 1: Write integration tests**

Test that `preloadAudioAssets` is called by `GameScene.preload`, and static source checks confirm the main cue calls exist in `UIScene` and `GameScene`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/audio/AudioIntegration.test.js`
Expected: FAIL because scenes do not import or call audio helpers.

- [ ] **Step 3: Integrate helpers**

In `GameScene.preload`, call `preloadAudioAssets(this)`. In stage clear and game over, play `STAGE_CLEAR` and `GAME_OVER`. In `UIScene`, play UI click, summon confirm, card select, magic cast, attack hit, enemy KO.

- [ ] **Step 4: Run focused audio tests**

Run: `npm test -- tests/assets/AudioAssetKeys.test.js tests/audio/AudioCuePlayer.test.js tests/audio/AudioIntegration.test.js`
Expected: PASS.

### Task 4: Kenney Asset Files And Docs

**Files:**
- Create audio files under `src/assets/audio/kenney/`
- Create: `src/assets/audio/kenney/README.md`
- Modify: `docs/PokerStrike_기획서.md`
- Modify: `docs/PokerStrike_기획서.html`

**Interfaces:**
- Consumes: asset filenames from `AudioAssetKeys.js`.

- [ ] **Step 1: Add or generate placeholder-safe audio files**

Download selected Kenney packs or add documented temporary generated WAV placeholders if network access is not available.

- [ ] **Step 2: Verify Vite can resolve assets**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Update GDD**

Document the applied SFX cues and Kenney source packs.

- [ ] **Step 4: Run final project validation**

Run: `npm test`
Run: `npm run build`
Expected: both PASS.
