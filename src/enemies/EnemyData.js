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
  // 신규 속성 특화 카운터 적
  ARMORED:   'armored',   // 방어력 50% — ♠바람 HP%딜로 관통
  SWARM:     'swarm',     // 초저체력 다수 — ♥불 스플래시로 섬멸
  BERSERKER: 'berserker', // 고속 슬로우면역 — ♣땅 스턴 또는 고등급 격파
  SHIELDED:  'shielded',  // 흡수 방어막 — 고족보 버스트로 방어막 붕괴
};

export const ENEMY_STATS = {
  [ENEMY_TYPE.BASIC]:        { hp: 50,  atk: 10, speed: 48,  reward: 0.5, magicImmune: false, isAerial: false },
  [ENEMY_TYPE.TANK]:         { hp: 200, atk: 15, speed: 24,  reward: 3,   magicImmune: false, isAerial: false },
  [ENEMY_TYPE.RUNNER]:       { hp: 25,  atk: 8,  speed: 96,  reward: 1,   magicImmune: false, isAerial: false },
  [ENEMY_TYPE.AERIAL]:       { hp: 40,  atk: 12, speed: 64,  reward: 2,   magicImmune: false, isAerial: true  },
  [ENEMY_TYPE.MAGIC_IMMUNE]: { hp: 60,  atk: 12, speed: 48,  reward: 3,   magicImmune: true,  isAerial: false },
  [ENEMY_TYPE.SPLITTER]:     { hp: 75,  atk: 10, speed: 40,  reward: 2,   magicImmune: false, isAerial: false, splitsInto: 'basic', splitCount: 2 },
  [ENEMY_TYPE.REGEN]:        { hp: 100, atk: 10, speed: 44,  reward: 2,   magicImmune: false, isAerial: false, regenRate: 5 },
  [ENEMY_TYPE.FREEZER]:      { hp: 45,  atk: 8,  speed: 52,  reward: 2,   magicImmune: false, isAerial: false, freezeRadius: 2.0, freezeDuration: 2000 },
  [ENEMY_TYPE.BOSS]:         { hp: 1000, atk: 30, speed: 32, reward: 10,  magicImmune: false, isAerial: false },
  [ENEMY_TYPE.ARMORED]:   { hp: 180, atk: 12, speed: 36, reward: 4,  magicImmune: false, isAerial: false, armor: 0.55 },
  [ENEMY_TYPE.SWARM]:     { hp: 8,   atk: 5,  speed: 88, reward: 0.2, magicImmune: false, isAerial: false },
  [ENEMY_TYPE.BERSERKER]: { hp: 55,  atk: 18, speed: 130, reward: 3, magicImmune: false, isAerial: false, slowImmune: true },
  [ENEMY_TYPE.SHIELDED]:  { hp: 100, atk: 12, speed: 40, reward: 5,  magicImmune: false, isAerial: false, shield: 120 },
};
