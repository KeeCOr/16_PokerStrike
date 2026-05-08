import { HAND_RANK } from '../cards/HandEvaluator.js';

export const ATTR = { H: '불', D: '물', C: '땅', S: '바람' };

export const ROLE = {
  ATTACK: 'attack',
  AREA: 'area',
  SUPPORT_SPEED: 'supportSpeed',
  SUPPORT_SLOW: 'supportSlow',
  TANK: 'tank',
  SNIPER: 'sniper',
};

export const GRADE_MULTIPLIER = { 1: 1.0, 2: 1.8, 3: 3.2 };

export const UNIT_ROLE_MAP = {
  [HAND_RANK.HIGH_CARD]:       { H: ROLE.ATTACK,        D: ROLE.ATTACK,        C: ROLE.TANK,          S: ROLE.ATTACK },
  [HAND_RANK.ONE_PAIR]:        { H: ROLE.ATTACK,        D: ROLE.SUPPORT_SLOW,  C: ROLE.TANK,          S: ROLE.SUPPORT_SPEED },
  [HAND_RANK.TWO_PAIR]:        { H: ROLE.AREA,          D: ROLE.SUPPORT_SLOW,  C: ROLE.TANK,          S: ROLE.SUPPORT_SPEED },
  [HAND_RANK.THREE_OF_A_KIND]: { H: ROLE.ATTACK,        D: ROLE.AREA,          C: ROLE.TANK,          S: ROLE.SNIPER },
  [HAND_RANK.STRAIGHT]:        { H: ROLE.AREA,          D: ROLE.SUPPORT_SLOW,  C: ROLE.TANK,          S: ROLE.SNIPER },
  [HAND_RANK.FLUSH]:           { H: ROLE.ATTACK,        D: ROLE.AREA,          C: ROLE.SUPPORT_SPEED, S: ROLE.SNIPER },
  [HAND_RANK.FULL_HOUSE]:      { H: ROLE.ATTACK,        D: ROLE.SUPPORT_SLOW,  C: ROLE.TANK,          S: ROLE.SUPPORT_SPEED },
  [HAND_RANK.FOUR_OF_A_KIND]:  { H: ROLE.AREA,          D: ROLE.AREA,          C: ROLE.SUPPORT_SPEED, S: ROLE.SNIPER },
  [HAND_RANK.STRAIGHT_FLUSH]:  { H: ROLE.ATTACK,        D: ROLE.AREA,          C: ROLE.TANK,          S: ROLE.SNIPER },
};

export const ROLE_BASE_STATS = {
  [ROLE.ATTACK]:        { hp: 120, atk: 25, atkSpeed: 1.2, range: 2.5, areaRadius: 0 },
  [ROLE.AREA]:          { hp: 100, atk: 15, atkSpeed: 0.9, range: 2.0, areaRadius: 1.5 },
  [ROLE.SUPPORT_SPEED]: { hp: 80,  atk: 10, atkSpeed: 1.0, range: 1.5, areaRadius: 0, buffRadius: 2, buffAtkSpeed: 0.4 },
  [ROLE.SUPPORT_SLOW]:  { hp: 90,  atk: 12, atkSpeed: 1.0, range: 2.0, areaRadius: 0, slowAmount: 0.4 },
  [ROLE.TANK]:          { hp: 300, atk: 8,  atkSpeed: 0.6, range: 1.5, areaRadius: 0 },
  [ROLE.SNIPER]:        { hp: 70,  atk: 40, atkSpeed: 0.4, range: 5.0, areaRadius: 0 },
};

export function getUnitStats(handRank, suit, grade) {
  const role = UNIT_ROLE_MAP[handRank]?.[suit] ?? ROLE.ATTACK;
  const base = { ...ROLE_BASE_STATS[role] };
  const mult = GRADE_MULTIPLIER[grade] ?? 1;
  return {
    role,
    hp: Math.floor(base.hp * mult),
    maxHp: Math.floor(base.hp * mult),
    atk: Math.floor(base.atk * mult),
    atkSpeed: base.atkSpeed,
    range: base.range,
    areaRadius: base.areaRadius ?? 0,
    buffRadius: base.buffRadius ?? 0,
    buffAtkSpeed: base.buffAtkSpeed ?? 0,
    slowAmount: base.slowAmount ?? 0,
  };
}
