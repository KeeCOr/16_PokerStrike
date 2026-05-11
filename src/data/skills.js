import { HAND_RANK } from '../cards/HandEvaluator.js';

export const SKILLS = {
  [HAND_RANK.STRAIGHT_FLUSH]: {
    name: '절멸',
    effect: 'killAll',
    description: '화면 내 모든 적 즉사',
  },
  [HAND_RANK.FOUR_OF_A_KIND]: {
    name: '대폭발',
    effect: 'massiveDamage',
    damage: 500,
    description: '모든 적에게 500 데미지',
  },
  [HAND_RANK.FULL_HOUSE]: {
    name: '회복',
    effect: 'healBase',
    amount: 30,
    description: '본진 HP 30 회복',
  },
  [HAND_RANK.FLUSH]: {
    name: '속성 강화',
    effect: 'buffSuit',
    multiplier: 1.5,
    duration: 30000,
    description: '해당 속성 유닛 공격력 50% 증가 (30초)',
  },
  [HAND_RANK.STRAIGHT]: {
    name: '대지진',
    effect: 'slowAll',
    slowAmount: 0.5,
    duration: 15000,
    description: '모든 적 이동속도 50% 감소 (15초)',
  },
  [HAND_RANK.THREE_OF_A_KIND]: {
    name: '소환 지원',
    effect: 'randomUnit',
    description: '무작위 위치에 트리플 유닛 1기 소환',
  },
  [HAND_RANK.TWO_PAIR]: {
    name: '골드 획득',
    effect: 'gainGold',
    amount: 30,
    description: '골드 30 즉시 획득',
  },
  [HAND_RANK.ONE_PAIR]: {
    name: '소환 비용 초기화',
    effect: 'resetDrawCost',
    description: '소환 비용을 초기값으로 되돌림',
  },
  [HAND_RANK.HIGH_CARD]: {
    name: '공용 패 교체',
    effect: 'refreshShared',
    description: '공용 패 2장 즉시 재드로우',
  },
};
