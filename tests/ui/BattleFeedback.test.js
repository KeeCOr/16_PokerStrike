import { describe, expect, it } from 'vitest';
import { getBattleFeedback } from '../../src/ui/BattleFeedback.js';

describe('battle feedback copy', () => {
  it('summarizes summon combo results with rank and suit', () => {
    expect(getBattleFeedback({
      type: 'summon',
      rankName: 'Two Pair',
      suitLabel: 'Spade',
      cost: 2,
    })).toEqual({
      text: 'Two Pair 소환 · Spade 전선 배치 · 2G 사용',
      tone: 'summon',
    });
  });

  it('summarizes magic results with the burned card count', () => {
    expect(getBattleFeedback({
      type: 'magic',
      skillName: 'Meteor',
      rankName: 'Four Kind',
      burnedCount: 7,
    })).toEqual({
      text: 'Meteor 발동 · Four Kind 조합 · 카드 7장 소모',
      tone: 'magic',
    });
  });

  it('summarizes kill rewards without losing fractional reward context', () => {
    expect(getBattleFeedback({
      type: 'kill',
      enemyType: 'tank',
      reward: 3,
      goldAdded: 2,
    })).toEqual({
      text: 'tank 처치 · 보상 +3 · 골드 +2',
      tone: 'reward',
    });
  });
});
