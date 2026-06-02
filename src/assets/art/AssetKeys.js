import { ENEMY_TYPE } from '../../enemies/EnemyData.js';

export const ENEMY_TEXTURES = {
  [ENEMY_TYPE.BASIC]: 'enemy-basic',
  [ENEMY_TYPE.TANK]: 'enemy-tank',
  [ENEMY_TYPE.RUNNER]: 'enemy-runner',
  [ENEMY_TYPE.AERIAL]: 'enemy-aerial',
  [ENEMY_TYPE.MAGIC_IMMUNE]: 'enemy-magicImmune',
  [ENEMY_TYPE.SPLITTER]: 'enemy-splitter',
  [ENEMY_TYPE.REGEN]: 'enemy-regen',
  [ENEMY_TYPE.FREEZER]: 'enemy-freezer',
  [ENEMY_TYPE.BOSS]: 'enemy-boss',
  [ENEMY_TYPE.ARMORED]: 'enemy-armored',
  [ENEMY_TYPE.SWARM]: 'enemy-swarm',
  [ENEMY_TYPE.BERSERKER]: 'enemy-berserker',
  [ENEMY_TYPE.SHIELDED]: 'enemy-shielded',
};

export const TOWER_TEXTURES = {
  H: 'tower-H',
  D: 'tower-D',
  C: 'tower-C',
  S: 'tower-S',
};

const ENEMY_ASSETS = {
  [ENEMY_TEXTURES[ENEMY_TYPE.BASIC]]: new URL('./monsters/basic.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.TANK]]: new URL('./monsters/tank.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.RUNNER]]: new URL('./monsters/runner.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.AERIAL]]: new URL('./monsters/aerial.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.MAGIC_IMMUNE]]: new URL('./monsters/magicImmune.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.SPLITTER]]: new URL('./monsters/splitter.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.REGEN]]: new URL('./monsters/regen.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.FREEZER]]: new URL('./monsters/freezer.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.BOSS]]: new URL('./monsters/boss.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.ARMORED]]: new URL('./monsters/armored.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.SWARM]]: new URL('./monsters/swarm.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.BERSERKER]]: new URL('./monsters/berserker.svg', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.SHIELDED]]: new URL('./monsters/shielded.svg', import.meta.url).href,
};

const TOWER_ASSETS = {
  [TOWER_TEXTURES.H]: new URL('./towers/H.svg', import.meta.url).href,
  [TOWER_TEXTURES.D]: new URL('./towers/D.svg', import.meta.url).href,
  [TOWER_TEXTURES.C]: new URL('./towers/C.svg', import.meta.url).href,
  [TOWER_TEXTURES.S]: new URL('./towers/S.svg', import.meta.url).href,
};

export function preloadArtAssets(scene) {
  if (!scene?.load?.svg) return;
  for (const [key, url] of Object.entries(ENEMY_ASSETS)) {
    scene.load.svg(key, url, { width: 64, height: 64 });
  }
  for (const [key, url] of Object.entries(TOWER_ASSETS)) {
    scene.load.svg(key, url, { width: 80, height: 80 });
  }
}

export function getEnemyTextureKey(type) {
  return ENEMY_TEXTURES[type] ?? ENEMY_TEXTURES[ENEMY_TYPE.BASIC];
}

export function getTowerTextureKey(suit) {
  return TOWER_TEXTURES[suit] ?? TOWER_TEXTURES.H;
}
