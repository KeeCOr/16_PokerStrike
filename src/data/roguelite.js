import { HAND_RANK } from '../cards/HandEvaluator.js';
import { ROLE } from '../units/UnitData.js';

// ── 속성별 강화 ────────────────────────────────────────────────────────────
// H(불): 범위 스플래시 유닛  /  D(물): 슬로우 유닛
// C(땅): 스턴 유닛           /  S(바람): HP%딜 저격 유닛
export const UPGRADE_POOL = [
  // 불(H) — 스플래시
  { id: 'atk_fire',        label: '♥ 공격력 +30%',             type: 'unitAtk',         suit: 'H',                           mult:  1.30 },
  { id: 'splash_fire',     label: '♥ 스플래시 확률 +20%',      type: 'unitSplashChance', suit: 'H',                           bonus: 0.20 },
  { id: 'range_fire',      label: '♥ 사거리 +1칸',             type: 'unitRange',        suit: 'H',                           bonus: 1.0  },

  // 물(D) — 슬로우
  { id: 'atk_water',       label: '♦ 공격력 +25%',             type: 'unitAtk',         suit: 'D',                           mult:  1.25 },
  { id: 'slow_water',      label: '♦ 감속량 +15%',             type: 'unitSlow',        suit: 'D',                           bonus: 0.15 },
  { id: 'range_water',     label: '♦ 사거리 +0.5칸',           type: 'unitRange',       suit: 'D',                           bonus: 0.5  },

  // 땅(C) — 스턴
  { id: 'atk_earth',       label: '♣ 공격력 +30%',             type: 'unitAtk',         suit: 'C',                           mult:  1.30 },
  { id: 'hp_earth',        label: '♣ HP +40%',                 type: 'unitHp',          suit: 'C',                           mult:  1.40 },
  { id: 'stun_earth',      label: '♣ 스턴 확률 +15%',          type: 'unitStunChance',  suit: 'C',                           bonus: 0.15 },

  // 바람(S) — HP% 저격
  { id: 'atk_wind',        label: '♠ 공격력 +35%',             type: 'unitAtk',         suit: 'S',                           mult:  1.35 },
  { id: 'hp_wind',         label: '♠ HP +50%',                 type: 'unitHp',          suit: 'S',                           mult:  1.50 },
  { id: 'range_wind',      label: '♠ 사거리 +1칸',             type: 'unitRange',       suit: 'S',                           bonus: 1.0  },

  // ── 조합별 강화 ─────────────────────────────────────────────────────────
  { id: 'spd_pair',        label: '원페어 공격속도 +25%',       type: 'unitAtkSpeed',    handRank: HAND_RANK.ONE_PAIR,        mult:  1.25 },
  { id: 'atk_twopair',     label: '투페어 공격력 +30%',         type: 'unitAtk',         handRank: HAND_RANK.TWO_PAIR,        mult:  1.30 },
  { id: 'hp_triple',       label: '트리플 HP +30%',             type: 'unitHp',          handRank: HAND_RANK.THREE_OF_A_KIND, mult:  1.30 },
  { id: 'atk_fullhouse',   label: '풀하우스 공격력 +25%',       type: 'unitAtk',         handRank: HAND_RANK.FULL_HOUSE,      mult:  1.25 },

  // ── 경제 강화 ───────────────────────────────────────────────────────────
  { id: 'draw_cheap',      label: '드로우 비용 -2G',            type: 'drawCost',                                             bonus: -2   },
  { id: 'replace_cheap',   label: '교체 기본 비용 -3G',         type: 'replaceCost',                                          bonus: -3   },
  { id: 'gold_pair',       label: '원페어 소환 시 +5G',         type: 'goldOnSummon',    handRank: HAND_RANK.ONE_PAIR,        amount: 5   },
  { id: 'gold_straight',   label: '스트레이트 소환 시 +8G',     type: 'goldOnSummon',    handRank: HAND_RANK.STRAIGHT,        amount: 8   },
];
