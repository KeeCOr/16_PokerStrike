import { ENEMY_TYPE } from '../enemies/EnemyData.js';

export const STAGES = [
  {
    id: 1,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.BASIC, count: 5, interval: 1500 }] },
      { enemies: [{ type: ENEMY_TYPE.BASIC, count: 8, interval: 1200 }] },
      { enemies: [{ type: ENEMY_TYPE.RUNNER, count: 4, interval: 800 }, { type: ENEMY_TYPE.BASIC, count: 3, interval: 1500 }] },
    ],
  },
  {
    id: 2,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.BASIC, count: 8, interval: 1200 }, { type: ENEMY_TYPE.TANK, count: 2, interval: 3000 }] },
      { enemies: [{ type: ENEMY_TYPE.RUNNER, count: 6, interval: 700 }, { type: ENEMY_TYPE.REGEN, count: 3, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.FREEZER, count: 2, interval: 4000 }, { type: ENEMY_TYPE.BASIC, count: 10, interval: 1000 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 1, interval: 0 }] },
    ],
  },
];
