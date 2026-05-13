export const ENEMY_TYPE = {
  BASIC: 'basic',
  TANK: 'tank',
  RUNNER: 'runner',
  AERIAL: 'aerial',
  MAGIC_IMMUNE: 'magicImmune',
  SPLITTER: 'splitter',
  REGEN: 'regen',
  FREEZER: 'freezer',
  BOSS: 'boss',
};

export const ENEMY_STATS = {
  [ENEMY_TYPE.BASIC]:        { hp: 100, atk: 10, speed: 60,  reward: 0.5, magicImmune: false, isAerial: false },
  [ENEMY_TYPE.TANK]:         { hp: 400, atk: 15, speed: 30,  reward: 3, magicImmune: false, isAerial: false },
  [ENEMY_TYPE.RUNNER]:       { hp: 50,  atk: 8,  speed: 120, reward: 1, magicImmune: false, isAerial: false },
  [ENEMY_TYPE.AERIAL]:       { hp: 80,  atk: 12, speed: 80,  reward: 2, magicImmune: false, isAerial: true  },
  [ENEMY_TYPE.MAGIC_IMMUNE]: { hp: 120, atk: 12, speed: 60,  reward: 3, magicImmune: true,  isAerial: false },
  [ENEMY_TYPE.SPLITTER]:     { hp: 150, atk: 10, speed: 50,  reward: 2, magicImmune: false, isAerial: false, splitsInto: 'basic', splitCount: 2 },
  [ENEMY_TYPE.REGEN]:        { hp: 200, atk: 10, speed: 55,  reward: 2, magicImmune: false, isAerial: false, regenRate: 5 },
  [ENEMY_TYPE.FREEZER]:      { hp: 90,  atk: 8,  speed: 65,  reward: 2, magicImmune: false, isAerial: false, freezeRadius: 2.0, freezeDuration: 2000 },
  [ENEMY_TYPE.BOSS]:         { hp: 2000, atk: 30, speed: 40, reward: 10, magicImmune: false, isAerial: false },
};
