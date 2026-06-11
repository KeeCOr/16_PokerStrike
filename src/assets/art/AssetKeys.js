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

export const VFX_TEXTURES = {
  FIRE_PROJECTILE: 'vfx-fire-projectile',
  FIRE_IMPACT: 'vfx-fire-impact',
  ICE_PROJECTILE: 'vfx-ice-projectile',
  ICE_IMPACT: 'vfx-ice-impact',
  CLUB_PROJECTILE: 'vfx-club-projectile',
  ARMOR_BREAK_IMPACT: 'vfx-armor-break-impact',
  SPADE_PROJECTILE: 'vfx-spade-projectile',
  PIERCE_IMPACT: 'vfx-pierce-impact',
  AURA_RING: 'vfx-aura-ring',
  MAGIC_BURST: 'vfx-magic-burst',
  HIT_SPARK: 'vfx-hit-spark',
  SHIELD_RIPPLE: 'vfx-shield-ripple',
};

export const ENV_TEXTURES = {
  BOARD_TILE: 'env-board-tile',
  BOARD_TILE_ALT: 'env-board-tile-alt',
  OBSTACLE_STONE: 'env-obstacle-stone',
  OBSTACLE_BARRICADE: 'env-obstacle-barricade',
  SPAWN_GATE: 'env-spawn-gate',
  BASE_CORE: 'env-base-core',
  BASE_SHIELD: 'env-base-shield',
  BATTLE_LABEL_FRAME: 'env-battle-label-frame',
};

export const UI_TEXTURES = {
  BUTTON_ACTION_GOLD: 'ui-button-action-gold',
  BUTTON_ACTION_CYAN: 'ui-button-action-cyan',
  BUTTON_ACTION_PURPLE: 'ui-button-action-purple',
  BUTTON_ACTION_DISABLED: 'ui-button-action-disabled',
  BUTTON_UPGRADE_GREEN: 'ui-button-upgrade-green',
  BUTTON_UPGRADE_ORANGE: 'ui-button-upgrade-orange',
  BUTTON_UPGRADE_BLUE: 'ui-button-upgrade-blue',
  BUTTON_DANGER_RED: 'ui-button-danger-red',
  TAB_ACTIVE: 'ui-tab-active',
  TAB_INACTIVE: 'ui-tab-inactive',
  PANEL_RESOURCE: 'ui-panel-resource',
  BADGE_WAVE: 'ui-badge-wave',
};

const ENEMY_ASSETS = {
  [ENEMY_TEXTURES[ENEMY_TYPE.BASIC]]: new URL('./monsters/basic.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.TANK]]: new URL('./monsters/tank.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.RUNNER]]: new URL('./monsters/runner.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.AERIAL]]: new URL('./monsters/aerial.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.MAGIC_IMMUNE]]: new URL('./monsters/magicImmune.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.SPLITTER]]: new URL('./monsters/splitter.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.REGEN]]: new URL('./monsters/regen.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.FREEZER]]: new URL('./monsters/freezer.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.BOSS]]: new URL('./monsters/boss.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.ARMORED]]: new URL('./monsters/armored.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.SWARM]]: new URL('./monsters/swarm.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.BERSERKER]]: new URL('./monsters/berserker.png', import.meta.url).href,
  [ENEMY_TEXTURES[ENEMY_TYPE.SHIELDED]]: new URL('./monsters/shielded.png', import.meta.url).href,
};

const TOWER_ASSETS = {
  [TOWER_TEXTURES.H]: new URL('./towers/H.png', import.meta.url).href,
  [TOWER_TEXTURES.D]: new URL('./towers/D.png', import.meta.url).href,
  [TOWER_TEXTURES.C]: new URL('./towers/C.png', import.meta.url).href,
  [TOWER_TEXTURES.S]: new URL('./towers/S.png', import.meta.url).href,
};

const VFX_ASSETS = {
  [VFX_TEXTURES.FIRE_PROJECTILE]: new URL('./vfx/fire-projectile.png', import.meta.url).href,
  [VFX_TEXTURES.FIRE_IMPACT]: new URL('./vfx/fire-impact.png', import.meta.url).href,
  [VFX_TEXTURES.ICE_PROJECTILE]: new URL('./vfx/ice-projectile.png', import.meta.url).href,
  [VFX_TEXTURES.ICE_IMPACT]: new URL('./vfx/ice-impact.png', import.meta.url).href,
  [VFX_TEXTURES.CLUB_PROJECTILE]: new URL('./vfx/club-projectile.png', import.meta.url).href,
  [VFX_TEXTURES.ARMOR_BREAK_IMPACT]: new URL('./vfx/armor-break-impact.png', import.meta.url).href,
  [VFX_TEXTURES.SPADE_PROJECTILE]: new URL('./vfx/spade-projectile.png', import.meta.url).href,
  [VFX_TEXTURES.PIERCE_IMPACT]: new URL('./vfx/pierce-impact.png', import.meta.url).href,
  [VFX_TEXTURES.AURA_RING]: new URL('./vfx/aura-ring.png', import.meta.url).href,
  [VFX_TEXTURES.MAGIC_BURST]: new URL('./vfx/magic-burst.png', import.meta.url).href,
  [VFX_TEXTURES.HIT_SPARK]: new URL('./vfx/hit-spark.png', import.meta.url).href,
  [VFX_TEXTURES.SHIELD_RIPPLE]: new URL('./vfx/shield-ripple.png', import.meta.url).href,
};

const ENV_ASSETS = {
  [ENV_TEXTURES.BOARD_TILE]: new URL('./environment/board-tile.png', import.meta.url).href,
  [ENV_TEXTURES.BOARD_TILE_ALT]: new URL('./environment/board-tile-alt.png', import.meta.url).href,
  [ENV_TEXTURES.OBSTACLE_STONE]: new URL('./environment/obstacle-stone.png', import.meta.url).href,
  [ENV_TEXTURES.OBSTACLE_BARRICADE]: new URL('./environment/obstacle-barricade.png', import.meta.url).href,
  [ENV_TEXTURES.SPAWN_GATE]: new URL('./environment/spawn-gate.png', import.meta.url).href,
  [ENV_TEXTURES.BASE_CORE]: new URL('./environment/base-core.png', import.meta.url).href,
  [ENV_TEXTURES.BASE_SHIELD]: new URL('./environment/base-shield.png', import.meta.url).href,
  [ENV_TEXTURES.BATTLE_LABEL_FRAME]: new URL('./environment/battle-label-frame.png', import.meta.url).href,
};

const UI_ASSETS = {
  [UI_TEXTURES.BUTTON_ACTION_GOLD]: new URL('../ui/generated/button-action-gold.png', import.meta.url).href,
  [UI_TEXTURES.BUTTON_ACTION_CYAN]: new URL('../ui/generated/button-action-cyan.png', import.meta.url).href,
  [UI_TEXTURES.BUTTON_ACTION_PURPLE]: new URL('../ui/generated/button-action-purple.png', import.meta.url).href,
  [UI_TEXTURES.BUTTON_ACTION_DISABLED]: new URL('../ui/generated/button-action-disabled.png', import.meta.url).href,
  [UI_TEXTURES.BUTTON_UPGRADE_GREEN]: new URL('../ui/generated/button-upgrade-green.png', import.meta.url).href,
  [UI_TEXTURES.BUTTON_UPGRADE_ORANGE]: new URL('../ui/generated/button-upgrade-orange.png', import.meta.url).href,
  [UI_TEXTURES.BUTTON_UPGRADE_BLUE]: new URL('../ui/generated/button-upgrade-blue.png', import.meta.url).href,
  [UI_TEXTURES.BUTTON_DANGER_RED]: new URL('../ui/generated/button-danger-red.png', import.meta.url).href,
  [UI_TEXTURES.TAB_ACTIVE]: new URL('../ui/generated/tab-active.png', import.meta.url).href,
  [UI_TEXTURES.TAB_INACTIVE]: new URL('../ui/generated/tab-inactive.png', import.meta.url).href,
  [UI_TEXTURES.PANEL_RESOURCE]: new URL('../ui/generated/panel-resource.png', import.meta.url).href,
  [UI_TEXTURES.BADGE_WAVE]: new URL('../ui/generated/badge-wave.png', import.meta.url).href,
};

export function preloadArtAssets(scene) {
  if (!scene?.load?.image) return;
  for (const [key, url] of Object.entries(ENEMY_ASSETS)) {
    scene.load.image(key, url);
  }
  for (const [key, url] of Object.entries(TOWER_ASSETS)) {
    scene.load.image(key, url);
  }
  for (const [key, url] of Object.entries(VFX_ASSETS)) {
    scene.load.image(key, url);
  }
  for (const [key, url] of Object.entries(ENV_ASSETS)) {
    scene.load.image(key, url);
  }
  for (const [key, url] of Object.entries(UI_ASSETS)) {
    scene.load.image(key, url);
  }
}

export function getEnemyTextureKey(type) {
  return ENEMY_TEXTURES[type] ?? ENEMY_TEXTURES[ENEMY_TYPE.BASIC];
}

export function getTowerTextureKey(suit) {
  return TOWER_TEXTURES[suit] ?? TOWER_TEXTURES.H;
}

export function getVfxTextureKey(key) {
  return VFX_TEXTURES[key] ?? VFX_TEXTURES.HIT_SPARK;
}

export function getEnvironmentTextureKey(key) {
  return ENV_TEXTURES[key] ?? ENV_TEXTURES.BOARD_TILE;
}

export function getUiTextureKey(key) {
  return UI_TEXTURES[key] ?? UI_TEXTURES.BUTTON_ACTION_DISABLED;
}
