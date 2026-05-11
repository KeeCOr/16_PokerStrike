import { HAND_RANK } from '../cards/HandEvaluator.js';
import { ROLE } from '../units/UnitData.js';

export const UPGRADE_POOL = [
  { id: 'atk_top',      label: '탑 유닛 공격력 +35%',     type: 'unitAtk',      handRank: HAND_RANK.HIGH_CARD,          mult: 1.35 },
  { id: 'atk_pair',     label: '원페어 유닛 공격력 +30%',  type: 'unitAtk',      handRank: HAND_RANK.ONE_PAIR,           mult: 1.30 },
  { id: 'atk_twopair',  label: '투페어 유닛 공격력 +30%',  type: 'unitAtk',      handRank: HAND_RANK.TWO_PAIR,           mult: 1.30 },
  { id: 'atk_triple',   label: '트리플 유닛 공격력 +25%',  type: 'unitAtk',      handRank: HAND_RANK.THREE_OF_A_KIND,    mult: 1.25 },
  { id: 'atk_area',     label: '범위형 공격력 +30%',       type: 'unitAtk',      role: ROLE.AREA,                        mult: 1.30 },
  { id: 'atk_sniper',   label: '저격형 공격력 +40%',       type: 'unitAtk',      role: ROLE.SNIPER,                      mult: 1.40 },
  { id: 'atk_speed_u',  label: '공격형 공격속도 +25%',     type: 'unitAtkSpeed', role: ROLE.ATTACK,                      mult: 1.25 },
  { id: 'hp_tank',      label: '탱커 HP +50%',             type: 'unitHp',       role: ROLE.TANK,                        mult: 1.50 },
  { id: 'hp_sniper',    label: '저격형 HP +60%',           type: 'unitHp',       role: ROLE.SNIPER,                      mult: 1.60 },
  { id: 'range_fire',   label: '불 속성 사거리 +1칸',       type: 'unitRange',    suit: 'H',                              bonus: 1.0 },
  { id: 'range_wind',   label: '바람 속성 사거리 +1칸',     type: 'unitRange',    suit: 'S',                              bonus: 1.0 },
  { id: 'range_water',  label: '물 속성 사거리 +0.5칸',     type: 'unitRange',    suit: 'D',                              bonus: 0.5 },
  { id: 'slow_more',    label: '감속형 감속량 +20%',        type: 'unitSlow',     role: ROLE.SUPPORT_SLOW,                bonus: 0.2 },
  { id: 'buff_radius',  label: '속도 지원 범위 +1칸',       type: 'unitBuffRadius', role: ROLE.SUPPORT_SPEED,             bonus: 1.0 },
  { id: 'draw_cheap',   label: '드로우 비용 -2G',           type: 'drawCost',                                             bonus: -2  },
  { id: 'replace_cheap',label: '교체 기본 비용 -3G',        type: 'replaceCost',                                          bonus: -3  },
  { id: 'gold_pair',    label: '원페어 소환 시 +5G',        type: 'goldOnSummon', handRank: HAND_RANK.ONE_PAIR,           amount: 5  },
  { id: 'gold_straight',label: '스트레이트 소환 시 +8G',    type: 'goldOnSummon', handRank: HAND_RANK.STRAIGHT,           amount: 8  },
];
