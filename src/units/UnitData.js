import { HAND_RANK } from '../cards/HandEvaluator.js';

export const ATTR = { H: '불', D: '물', C: '땅', S: '바람' };

export const ROLE = {
  ATTACK:        'attack',
  AREA:          'area',
  SUPPORT_SLOW:  'supportSlow',
  SNIPER:        'sniper',
  SUPPORT_SPEED: 'supportSpeed',
};

// ── 등급 배율 ────────────────────────────────────────────────
export const GRADE_MULTIPLIER = { 1: 1.0, 2: 1.8, 3: 3.2 };

// ── 패 조합별 파워 배율 ──
// 트리플 이하: 좁은 간격의 범용 구간
// 스트레이트 이상: 유사한 배율, 개성은 고유 메커닉으로 구분
const RANK_POWER = {
  [HAND_RANK.HIGH_CARD]:       0.60,
  [HAND_RANK.ONE_PAIR]:        0.82,
  [HAND_RANK.TWO_PAIR]:        1.05,
  [HAND_RANK.THREE_OF_A_KIND]: 1.25,
  [HAND_RANK.STRAIGHT]:        2.0,
  [HAND_RANK.FLUSH]:           2.2,  // 다중 공격 (3연타)
  [HAND_RANK.FULL_HOUSE]:      2.5,  // 근접 초강타
  [HAND_RANK.FOUR_OF_A_KIND]:  2.8,  // 직선 관통
  [HAND_RANK.STRAIGHT_FLUSH]:  3.0,  // 주기 버프 오라 서포터
};

// ── 조합별 아키타입 기본 스탯 ──
const ARCHETYPE = {
  [HAND_RANK.HIGH_CARD]:       { hp: 80,  atk: 14, atkSpeed: 1.0,  range: 2.0 }, // 잡병
  [HAND_RANK.ONE_PAIR]:        { hp: 75,  atk: 10, atkSpeed: 0.55, range: 4.0 }, // 탑
  [HAND_RANK.TWO_PAIR]:        { hp: 130, atk: 22, atkSpeed: 1.2,  range: 1.5 }, // 전사
  [HAND_RANK.THREE_OF_A_KIND]: { hp: 100, atk: 24, atkSpeed: 0.8,  range: 3.0 }, // 마법사
  [HAND_RANK.STRAIGHT]:        { hp: 140, atk: 20, atkSpeed: 1.1,  range: 2.2 }, // 기사
  [HAND_RANK.FLUSH]:           { hp: 85,  atk: 16, atkSpeed: 1.7,  range: 2.5 }, // 다중 연사 (3타깃)
  [HAND_RANK.FULL_HOUSE]:      { hp: 210, atk: 55, atkSpeed: 0.65, range: 1.2 }, // 근접 초강타
  [HAND_RANK.FOUR_OF_A_KIND]:  { hp: 80,  atk: 40, atkSpeed: 0.5,  range: 5.0 }, // 직선 관통
  [HAND_RANK.STRAIGHT_FLUSH]:  { hp: 180, atk: 20, atkSpeed: 1.0,  range: 2.5 }, // 오라 서포터
};

// ── 속성별 변환 (role + 스탯 배율) ────────────────────────────
// 속성이 유닛의 역할을 크게 바꿈
// grade 배열은 [등급1, 등급2, 등급3] 순서
const SUIT_MOD = {
  H: { // 불 → 확률 스플래시 (등급 높을수록 확률↑)
    role: ROLE.AREA,
    hpMult: 1.0, atkMult: 1.0, speedMult: 0.9, rangeMult: 0.9,
    areaRadius:   1.2,
    splashChance: [0.25, 0.50, 0.80],
  },
  D: { // 물 → 슬로우 (등급 높을수록 확률·범위·강도↑)
    role: ROLE.SUPPORT_SLOW,
    hpMult: 1.0, atkMult: 1.0, speedMult: 0.7, rangeMult: 1.5,
    slowChance:  [0.60, 0.80, 1.00],
    slowAmount:  [0.30, 0.45, 0.60],
    slowRadius:  [0.00, 1.00, 1.80], // 0 = 단일 대상
  },
  C: { // 땅 → 스턴 (등급 높을수록 확률·범위·지속↑)
    role: ROLE.ATTACK,
    hpMult: 1.0, atkMult: 1.0, speedMult: 0.5, rangeMult: 0.8,
    stunChance:   [0.40, 0.60, 0.90],
    stunDuration: [600,  1200, 2200], // ms
    stunRadius:   [0.00, 1.00, 1.80], // 0 = 단일 대상
    armorBreakAmount: [0.12, 0.20, 0.30],
    armorBreakDuration: 5000,
  },
  S: { // 바람 → HP% 대미지 단일 공격
    role: ROLE.SNIPER,
    hpMult: 1.0, atkMult: 1.0, speedMult: 1.8, rangeMult: 1.6,
    hpPctDamage: [0.05, 0.10, 0.18], // 적 최대 HP의 n%
  },
};

export function getUnitStats(handRank, suit, grade) {
  const archetype = ARCHETYPE[handRank] ?? ARCHETYPE[HAND_RANK.HIGH_CARD];
  const mod       = SUIT_MOD[suit]       ?? SUIT_MOD.H;
  const power     = RANK_POWER[handRank] ?? 1.0;
  const gradeMult = GRADE_MULTIPLIER[grade] ?? 1.0;

  const totalMult = power * gradeMult;

  const hp  = Math.floor(archetype.hp  * mod.hpMult    * totalMult);
  const atk = Math.floor(archetype.atk * mod.atkMult   * totalMult);
  const range = +(archetype.range * mod.rangeMult).toFixed(2);

  // atkSpeed는 power·grade 배율을 약하게만 적용 (지나치게 빨라지지 않게)
  const speedBoost = 1 + (totalMult - 1) * 0.12;
  const atkSpeed = +(archetype.atkSpeed * mod.speedMult * speedBoost).toFixed(3);

  const gi = Math.max(0, Math.min(2, (grade ?? 1) - 1)); // 0,1,2

  // ── 족보별 고유 메커닉 플래그 ──
  // FLUSH: 최대 3타깃 동시 공격
  const multiTarget = handRank === HAND_RANK.FLUSH ? 3 : 0;
  // FOUR_OF_A_KIND: 직선 관통 공격
  const piercing = handRank === HAND_RANK.FOUR_OF_A_KIND;
  // STRAIGHT_FLUSH: 주기적 주변 타워 버프 오라
  const auraInterval   = handRank === HAND_RANK.STRAIGHT_FLUSH ? 10000 : 0;
  const auraRadius     = handRank === HAND_RANK.STRAIGHT_FLUSH ? 2.5   : 0;
  const auraBuff       = handRank === HAND_RANK.STRAIGHT_FLUSH ? 0.35  : 0; // atkSpeed +35%
  const auraDuration   = handRank === HAND_RANK.STRAIGHT_FLUSH ? 12000 : 0;

  return {
    role:         mod.role,
    hp,
    maxHp:        hp,
    atk,
    atkSpeed,
    range,
    areaRadius:   mod.areaRadius  ?? 0,
    splashChance: mod.splashChance ? mod.splashChance[gi] : 0,
    slowChance:   mod.slowChance   ? mod.slowChance[gi]   : 0,
    slowAmount:   mod.slowAmount   ? mod.slowAmount[gi]   : 0,
    slowRadius:   mod.slowRadius   ? mod.slowRadius[gi]   : 0,
    stunChance:   mod.stunChance   ? mod.stunChance[gi]   : 0,
    stunDuration: mod.stunDuration ? mod.stunDuration[gi] : 0,
    stunRadius:   mod.stunRadius   ? mod.stunRadius[gi]   : 0,
    armorBreakAmount: mod.armorBreakAmount ? mod.armorBreakAmount[gi] : 0,
    armorBreakDuration: mod.armorBreakDuration ?? 0,
    hpPctDamage:  mod.hpPctDamage  ? mod.hpPctDamage[gi]  : 0,
    buffRadius:   mod.buffRadius   ?? 0,
    buffAtkSpeed: mod.buffAtkSpeed ?? 0,
    multiTarget,
    piercing,
    auraInterval,
    auraRadius,
    auraBuff,
    auraDuration,
  };
}
