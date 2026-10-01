import { describe, expect, it } from 'vitest';
import { getSummonPayoffCue } from '../../src/ui/BattleFeedback.js';

describe('summon payoff cue', () => {
  it('combines hand tier, attack payoff, suit threat, and bonus reward into one cue', () => {
    expect(getSummonPayoffCue({
      rankName: '풀하우스',
      rankImpact: '근접 초고화력',
      suitEffect: '물 감속',
      bonusGold: 8,
    })).toBe('Payoff: 풀하우스 / 근접 초고화력 / 물 감속 / +8G');
  });
});
