import { ENEMY_TYPE } from '../enemies/EnemyData.js';

export const STAGE_OBSTACLES = [
  // 스테이지 1: 기본 지형
  [[1,2],[2,2],[5,3],[6,3],[0,5],[1,5],[4,6],[5,6],[2,7],[3,7]],
  // 스테이지 2: 양쪽 벽, 중앙 압박
  [[0,2],[1,2],[5,2],[6,2],[2,4],[3,4],[0,6],[1,6],[5,6],[6,6]],
  // 스테이지 3: 지그재그
  [[0,1],[0,2],[6,3],[6,4],[1,4],[2,4],[4,5],[5,5],[0,7],[1,7],[5,7],[6,7]],
  // 스테이지 4: 복합 미로
  [[1,2],[2,2],[3,2],[4,4],[5,4],[0,5],[1,5],[3,6],[4,6],[1,7],[2,7]],
];

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
  {
    id: 3,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.MAGIC_IMMUNE, count: 4, interval: 2000 }, { type: ENEMY_TYPE.RUNNER, count: 6, interval: 600 }] },
      { enemies: [{ type: ENEMY_TYPE.SPLITTER, count: 5, interval: 2000 }, { type: ENEMY_TYPE.REGEN, count: 4, interval: 1800 }] },
      { enemies: [{ type: ENEMY_TYPE.AERIAL, count: 4, interval: 1500 }, { type: ENEMY_TYPE.TANK, count: 3, interval: 3000 }] },
      { enemies: [{ type: ENEMY_TYPE.FREEZER, count: 3, interval: 2500 }, { type: ENEMY_TYPE.MAGIC_IMMUNE, count: 5, interval: 1500 }] },
    ],
  },
  {
    id: 4,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.RUNNER, count: 10, interval: 500 }, { type: ENEMY_TYPE.MAGIC_IMMUNE, count: 6, interval: 1200 }] },
      { enemies: [{ type: ENEMY_TYPE.SPLITTER, count: 6, interval: 1500 }, { type: ENEMY_TYPE.FREEZER, count: 4, interval: 2000 }, { type: ENEMY_TYPE.AERIAL, count: 4, interval: 1500 }] },
      { enemies: [{ type: ENEMY_TYPE.TANK, count: 5, interval: 2500 }, { type: ENEMY_TYPE.REGEN, count: 5, interval: 1800 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 1, interval: 0 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 2, interval: 5000 }] },
    ],
  },
];
