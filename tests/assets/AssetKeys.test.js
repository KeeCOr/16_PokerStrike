import { describe, expect, it } from 'vitest';
import {
  ENEMY_TEXTURES,
  TOWER_TEXTURES,
  getEnemyTextureKey,
  getTowerTextureKey,
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
});
