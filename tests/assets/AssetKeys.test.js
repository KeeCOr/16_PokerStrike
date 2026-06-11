import { describe, expect, it } from 'vitest';
import {
  ENEMY_TEXTURES,
  ENV_TEXTURES,
  TOWER_TEXTURES,
  UI_TEXTURES,
  VFX_TEXTURES,
  getEnvironmentTextureKey,
  getEnemyTextureKey,
  getTowerTextureKey,
  getUiTextureKey,
  getVfxTextureKey,
  preloadArtAssets,
} from '../../src/assets/art/AssetKeys.js';
import { ENEMY_TYPE } from '../../src/enemies/EnemyData.js';

describe('AssetKeys', () => {
  it('maps every enemy type to a texture key', () => {
    for (const type of Object.values(ENEMY_TYPE)) {
      expect(getEnemyTextureKey(type)).toBe(ENEMY_TEXTURES[type]);
    }
  });

  it('falls back to basic enemy and heart tower textures', () => {
    expect(getEnemyTextureKey('unknown')).toBe(ENEMY_TEXTURES[ENEMY_TYPE.BASIC]);
    expect(getTowerTextureKey('unknown')).toBe(TOWER_TEXTURES.H);
  });

  it('maps card suits to tower textures', () => {
    expect(getTowerTextureKey('H')).toBe('tower-H');
    expect(getTowerTextureKey('D')).toBe('tower-D');
    expect(getTowerTextureKey('C')).toBe('tower-C');
    expect(getTowerTextureKey('S')).toBe('tower-S');
  });

  it('maps VFX texture keys', () => {
    expect(getVfxTextureKey('FIRE_PROJECTILE')).toBe(VFX_TEXTURES.FIRE_PROJECTILE);
    expect(getVfxTextureKey('unknown')).toBe(VFX_TEXTURES.HIT_SPARK);
  });

  it('maps environment and UI texture keys', () => {
    expect(getEnvironmentTextureKey('BASE_CORE')).toBe(ENV_TEXTURES.BASE_CORE);
    expect(getEnvironmentTextureKey('unknown')).toBe(ENV_TEXTURES.BOARD_TILE);
    expect(getUiTextureKey('BUTTON_ACTION_GOLD')).toBe(UI_TEXTURES.BUTTON_ACTION_GOLD);
    expect(getUiTextureKey('unknown')).toBe(UI_TEXTURES.BUTTON_ACTION_DISABLED);
  });

  it('preloads art as image assets', () => {
    const loaded = [];
    preloadArtAssets({
      load: {
        image(key, url) {
          loaded.push({ key, url });
        },
      },
    });

    expect(loaded.map(item => item.key)).toContain('enemy-basic');
    expect(loaded.map(item => item.key)).toContain('tower-H');
    expect(loaded.map(item => item.key)).toContain('vfx-fire-projectile');
    expect(loaded.map(item => item.key)).toContain('vfx-aura-ring');
    expect(loaded.map(item => item.key)).toContain('env-base-core');
    expect(loaded.map(item => item.key)).toContain('ui-button-action-gold');
    expect(loaded.every(item => item.url.endsWith('.png'))).toBe(true);
  });
});
