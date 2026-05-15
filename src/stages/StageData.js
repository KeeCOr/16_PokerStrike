import { ENEMY_TYPE } from '../enemies/EnemyData.js';

export const STAGE_OBSTACLES = [
  // 스테이지 1: 기본 지형
  [[1,2],[2,2],[5,3],[6,3],[0,5],[1,5],[4,6],[5,6],[2,7],[3,7]],
  // 스테이지 2: 양쪽 벽
  [[0,2],[1,2],[5,2],[6,2],[2,4],[3,4],[0,6],[1,6],[5,6],[6,6]],
  // 스테이지 3: 지그재그
  [[0,1],[0,2],[6,3],[6,4],[1,4],[2,4],[4,5],[5,5],[0,7],[1,7],[5,7],[6,7]],
  // 스테이지 4: 복합 미로
  [[1,2],[2,2],[3,2],[4,4],[5,4],[0,5],[1,5],[3,6],[4,6],[1,7],[2,7]],
  // 스테이지 5: V자 협로
  [[1,2],[2,2],[4,2],[5,2],[0,5],[1,5],[5,5],[6,5],[2,7],[4,7]],
  // 스테이지 6: 계단식
  [[0,1],[6,1],[1,3],[5,3],[0,5],[6,5],[2,7],[4,7],[1,4],[5,4]],
  // 스테이지 7: 이중 핀치
  [[1,1],[5,1],[2,3],[4,3],[0,5],[6,5],[1,6],[5,6],[2,7],[4,7]],
  // 스테이지 8: 밀집 장애물
  [[0,2],[1,2],[5,2],[6,2],[2,4],[4,4],[0,6],[1,6],[5,6],[6,6],[2,7],[4,7]],
  // 스테이지 9: 포위망
  [[1,1],[2,1],[4,1],[5,1],[0,3],[6,3],[2,5],[4,5],[0,7],[1,7],[5,7],[6,7]],
  // 스테이지 10: 최종 미로
  [[0,1],[1,1],[5,1],[6,1],[2,3],[4,3],[1,4],[5,4],[0,6],[6,6],[2,7],[4,7]],
];

export const STAGES = [
  {
    id: 1,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.BASIC, count: 3, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.BASIC, count: 5, interval: 1500 }, { type: ENEMY_TYPE.SWARM, count: 6, interval: 600 }] },
      { enemies: [{ type: ENEMY_TYPE.RUNNER, count: 4, interval: 800 }, { type: ENEMY_TYPE.BASIC, count: 4, interval: 1500 }, { type: ENEMY_TYPE.BOSS, count: 1, interval: 3000 }] },
    ],
  },
  {
    id: 2,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.BASIC, count: 5, interval: 1500 }, { type: ENEMY_TYPE.ARMORED, count: 2, interval: 3000 }] },
      { enemies: [{ type: ENEMY_TYPE.SWARM, count: 10, interval: 400 }, { type: ENEMY_TYPE.RUNNER, count: 4, interval: 800 }] },
      { enemies: [{ type: ENEMY_TYPE.BERSERKER, count: 4, interval: 1200 }, { type: ENEMY_TYPE.BASIC, count: 6, interval: 1200 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 1, interval: 0 }] },
    ],
  },
  {
    id: 3,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.SHIELDED, count: 3, interval: 2500 }, { type: ENEMY_TYPE.RUNNER, count: 5, interval: 700 }] },
      { enemies: [{ type: ENEMY_TYPE.SWARM, count: 12, interval: 300 }, { type: ENEMY_TYPE.ARMORED, count: 3, interval: 2500 }] },
      { enemies: [{ type: ENEMY_TYPE.AERIAL, count: 4, interval: 1500 }, { type: ENEMY_TYPE.BERSERKER, count: 5, interval: 1000 }] },
      { enemies: [{ type: ENEMY_TYPE.MAGIC_IMMUNE, count: 4, interval: 2000 }, { type: ENEMY_TYPE.SHIELDED, count: 3, interval: 2500 }, { type: ENEMY_TYPE.BOSS, count: 1, interval: 4000 }] },
    ],
  },
  {
    id: 4,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.BERSERKER, count: 6, interval: 800 }, { type: ENEMY_TYPE.ARMORED, count: 4, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.SWARM, count: 15, interval: 250 }, { type: ENEMY_TYPE.SPLITTER, count: 4, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.SHIELDED, count: 5, interval: 2000 }, { type: ENEMY_TYPE.REGEN, count: 4, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 1, interval: 0 }] },
      { enemies: [{ type: ENEMY_TYPE.ARMORED, count: 3, interval: 2500 }, { type: ENEMY_TYPE.BOSS, count: 1, interval: 5000 }] },
    ],
  },
  {
    id: 5,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.SWARM, count: 15, interval: 200 }, { type: ENEMY_TYPE.BERSERKER, count: 5, interval: 900 }] },
      { enemies: [{ type: ENEMY_TYPE.AERIAL, count: 6, interval: 1200 }, { type: ENEMY_TYPE.ARMORED, count: 4, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.SHIELDED, count: 6, interval: 1800 }, { type: ENEMY_TYPE.REGEN, count: 4, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.MAGIC_IMMUNE, count: 5, interval: 1500 }, { type: ENEMY_TYPE.BERSERKER, count: 6, interval: 800 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 2, interval: 4000 }] },
    ],
  },
  {
    id: 6,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.BERSERKER, count: 8, interval: 600 }, { type: ENEMY_TYPE.SWARM, count: 12, interval: 250 }, { type: ENEMY_TYPE.ARMORED, count: 3, interval: 2500 }] },
      { enemies: [{ type: ENEMY_TYPE.AERIAL, count: 8, interval: 1000 }, { type: ENEMY_TYPE.SHIELDED, count: 5, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.SPLITTER, count: 6, interval: 1500 }, { type: ENEMY_TYPE.ARMORED, count: 5, interval: 2000 }, { type: ENEMY_TYPE.REGEN, count: 4, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.MAGIC_IMMUNE, count: 6, interval: 1500 }, { type: ENEMY_TYPE.SHIELDED, count: 5, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 3, interval: 4000 }] },
    ],
  },
  {
    id: 7,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.SWARM, count: 20, interval: 180 }, { type: ENEMY_TYPE.BERSERKER, count: 6, interval: 700 }, { type: ENEMY_TYPE.ARMORED, count: 4, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.SHIELDED, count: 7, interval: 1800 }, { type: ENEMY_TYPE.MAGIC_IMMUNE, count: 5, interval: 1500 }] },
      { enemies: [{ type: ENEMY_TYPE.AERIAL, count: 10, interval: 800 }, { type: ENEMY_TYPE.ARMORED, count: 5, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.SPLITTER, count: 6, interval: 1500 }, { type: ENEMY_TYPE.BERSERKER, count: 8, interval: 700 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 3, interval: 3500 }, { type: ENEMY_TYPE.ARMORED, count: 4, interval: 2500 }] },
    ],
  },
  {
    id: 8,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.BERSERKER, count: 8, interval: 500 }, { type: ENEMY_TYPE.ARMORED, count: 6, interval: 1800 }, { type: ENEMY_TYPE.SWARM, count: 15, interval: 200 }] },
      { enemies: [{ type: ENEMY_TYPE.SHIELDED, count: 8, interval: 1500 }, { type: ENEMY_TYPE.REGEN, count: 5, interval: 1800 }, { type: ENEMY_TYPE.MAGIC_IMMUNE, count: 4, interval: 1500 }] },
      { enemies: [{ type: ENEMY_TYPE.AERIAL, count: 10, interval: 700 }, { type: ENEMY_TYPE.ARMORED, count: 6, interval: 1800 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 4, interval: 3500 }, { type: ENEMY_TYPE.SHIELDED, count: 4, interval: 2500 }] },
      { enemies: [{ type: ENEMY_TYPE.SWARM, count: 20, interval: 150 }, { type: ENEMY_TYPE.BERSERKER, count: 8, interval: 500 }, { type: ENEMY_TYPE.AERIAL, count: 6, interval: 1000 }, { type: ENEMY_TYPE.BOSS, count: 2, interval: 3500 }] },
    ],
  },
  {
    id: 9,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.ARMORED, count: 8, interval: 1500 }, { type: ENEMY_TYPE.BERSERKER, count: 8, interval: 500 }, { type: ENEMY_TYPE.SWARM, count: 15, interval: 180 }] },
      { enemies: [{ type: ENEMY_TYPE.SHIELDED, count: 8, interval: 1500 }, { type: ENEMY_TYPE.REGEN, count: 6, interval: 1600 }, { type: ENEMY_TYPE.MAGIC_IMMUNE, count: 5, interval: 1500 }] },
      { enemies: [{ type: ENEMY_TYPE.AERIAL, count: 12, interval: 600 }, { type: ENEMY_TYPE.ARMORED, count: 6, interval: 1500 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 5, interval: 3000 }, { type: ENEMY_TYPE.SHIELDED, count: 5, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 3, interval: 3500 }, { type: ENEMY_TYPE.BERSERKER, count: 10, interval: 400 }, { type: ENEMY_TYPE.ARMORED, count: 6, interval: 1500 }] },
    ],
  },
  {
    id: 10,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.SWARM, count: 20, interval: 150 }, { type: ENEMY_TYPE.BERSERKER, count: 8, interval: 450 }, { type: ENEMY_TYPE.ARMORED, count: 4, interval: 1800 }] },
      { enemies: [{ type: ENEMY_TYPE.SHIELDED, count: 8, interval: 1500 }, { type: ENEMY_TYPE.MAGIC_IMMUNE, count: 6, interval: 1200 }, { type: ENEMY_TYPE.REGEN, count: 5, interval: 1800 }] },
      { enemies: [{ type: ENEMY_TYPE.AERIAL, count: 10, interval: 700 }, { type: ENEMY_TYPE.ARMORED, count: 8, interval: 1500 }, { type: ENEMY_TYPE.SHIELDED, count: 5, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 6, interval: 3000 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 4, interval: 3000 }, { type: ENEMY_TYPE.SHIELDED, count: 6, interval: 1500 }, { type: ENEMY_TYPE.ARMORED, count: 6, interval: 1500 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 5, interval: 2500 }, { type: ENEMY_TYPE.BERSERKER, count: 10, interval: 350 }, { type: ENEMY_TYPE.SWARM, count: 20, interval: 150 }] },
    ],
  },
];
