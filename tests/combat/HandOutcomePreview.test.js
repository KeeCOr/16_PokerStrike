import { describe, expect, it } from 'vitest';
import { buildHandConversionCue, buildMatchRecap, buildWaveDecisionRecap, previewHandOutcome } from '../../src/combat/HandOutcomePreview.js';
describe('hand outcome preview', () => {
  it('shows damage, lethal and retaliation before commit', () => {
    expect(previewHandOutcome({ baseDamage: 12, handMultiplier: 2, enemyHp: 30, incomingDamage: 7 })).toMatchObject({ damage: 24, lethal: false, risk: '반격 7 피해 예상' });
  });
});

it('turns a poker rank into a strong combat conversion cue', () => {
  expect(buildHandConversionCue({ rankName: 'Full House', damage: 24, effect: 'lane burst' })).toEqual({
    headline: 'Full House -> 24 damage', effect: 'lane burst', intensity: 'legendary',
  });
});

it('recaps the decisive hand and a concrete deck adjustment reason', () => {
  const recap = buildMatchRecap({ plays: [
    { rankName: 'Pair', swing: 4 },
    { rankName: 'Straight', swing: 15, weakness: 'armored waves' },
  ] });
  expect(recap.decisivePlay).toContain('Straight');
  expect(recap.deckReason).toContain('armored waves');
});

describe('wave decision recap', () => {
  it('connects the strongest actual summon to the next upgrade criteria', () => {
    expect(buildWaveDecisionRecap({
      plays: [
        { rankName: '원페어', suitLabel: '♥', swing: 8 },
        { rankName: '스트레이트', suitLabel: '♠', swing: 42 },
      ],
      baseHp: 78,
    })).toEqual({
      decisivePlay: '핵심 패: 스트레이트 ♠',
      nextFocus: '다음 선택 기준: 스트레이트 ♠ 시너지 검토',
    });
  });

  it('keeps the next choice focused on hand synergy', () => {
    expect(buildWaveDecisionRecap({
      plays: [{ rankName: '풀하우스', suitLabel: '♥', swing: 55 }],
      baseHp: 34,
    }).nextFocus).toBe('다음 선택 기준: 풀하우스 ♥ 시너지 검토');
  });

  it('provides a safe empty-state criterion when no summon was recorded', () => {
    expect(buildWaveDecisionRecap({ plays: [], baseHp: 90 })).toEqual({
      decisivePlay: '핵심 패: 소환 기록 없음',
      nextFocus: '다음 선택 기준: 범용 경제 또는 소환 기반 검토',
    });
  });
});
