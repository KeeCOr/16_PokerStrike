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
  it('explains summon battlefield impact with role and suit effect', () => {
    expect(getBattleFeedback({
      type: 'summon',
      rankName: '스트레이트',
      suitLabel: '♠',
      roleLabel: '기사',
      suitEffect: '바람 저격',
      cost: 4,
      bonusGold: 8,
    })).toEqual({
      text: '스트레이트 소환 · 기사 배치 · ♠ 바람 저격 · 4G 사용 · 보너스 +8G',
      tone: 'summon',
    });
  });
  it('connects a straight summon to its frontline combat impact', () => {
    expect(getBattleFeedback({
      type: 'summon',
      rankName: 'Straight',
      suitLabel: 'S',
      roleLabel: 'Knight',
      suitEffect: 'wind sniper',
      rankImpact: 'holds front lane',
      suitImpact: 'targets backline',
      combatHint: 'next hit pierces priority enemy',
      cost: 4,
    })).toEqual({
      text: 'Straight summon · Knight placed · holds front lane · S wind sniper · targets backline · next hit pierces priority enemy · 4G spent',
      tone: 'summon',
    });
  });

  it('surfaces the selected hand payoff before detailed summon impact', () => {
    expect(getBattleFeedback({
      type: 'summon',
      rankName: 'Full House',
      suitLabel: 'D',
      roleLabel: 'Guardian',
      rankImpact: 'burst tank damage',
      suitImpact: 'slows the next wave',
      payoffCue: 'Payoff: elite burst + slow threat control',
      cost: 6,
    })).toEqual({
      text: 'Full House summon · Payoff: elite burst + slow threat control · Guardian placed · burst tank damage · slows the next wave · 6G spent',
      tone: 'summon',
    });
  });

  it('connects a flush summon to multi-target combat impact', () => {
    expect(getBattleFeedback({
      type: 'summon',
      rankName: 'Flush',
      suitLabel: 'H',
      roleLabel: 'Rapid',
      suitEffect: 'fire splash',
      rankImpact: 'hits up to 3 enemies',
      suitImpact: 'splash chance boosted',
      cost: 5,
    })).toEqual({
      text: 'Flush summon · Rapid placed · hits up to 3 enemies · H fire splash · splash chance boosted · 5G spent',
      tone: 'summon',
    });
  });

  it('connects a four-kind summon to piercing combat impact and bonus economy', () => {
    expect(getBattleFeedback({
      type: 'summon',
      rankName: 'Four Kind',
      suitLabel: 'C',
      roleLabel: 'Piercer',
      suitEffect: 'armor break',
      rankImpact: 'line pierce enabled',
      suitImpact: 'breaks armor before damage',
      bonusGold: 6,
    })).toEqual({
      text: 'Four Kind summon · Piercer placed · line pierce enabled · C armor break · breaks armor before damage · bonus +6G',
      tone: 'summon',
    });
  });
});
