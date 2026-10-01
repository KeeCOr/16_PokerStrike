import { describe, it, expect } from 'vitest';
import { evaluateHand, HAND_RANK } from '../../src/cards/HandEvaluator.js';

const c = (suit, value) => ({ suit, value });

describe('HandEvaluator', () => {
  it('스트레이트 플러시 감지', () => {
    const cards = [c('H','7'), c('H','8'), c('H','9'), c('H','10'), c('H','J')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.STRAIGHT_FLUSH);
  });

  it('포카인드 감지', () => {
    const cards = [c('H','A'), c('D','A'), c('C','A'), c('S','A'), c('H','K')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.FOUR_OF_A_KIND);
  });

  it('풀하우스 감지', () => {
    const cards = [c('H','K'), c('D','K'), c('C','K'), c('H','7'), c('D','7')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.FULL_HOUSE);
  });

  it('플러시 감지', () => {
    const cards = [c('H','7'), c('H','9'), c('H','J'), c('H','K'), c('H','A')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.FLUSH);
  });

  it('스트레이트 감지', () => {
    const cards = [c('H','7'), c('D','8'), c('C','9'), c('S','10'), c('H','J')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.STRAIGHT);
  });

  it('트리플 감지', () => {
    const cards = [c('H','Q'), c('D','Q'), c('C','Q'), c('S','7'), c('H','8')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.THREE_OF_A_KIND);
  });

  it('투페어 감지', () => {
    const cards = [c('H','K'), c('D','K'), c('H','Q'), c('D','Q'), c('C','7')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.TWO_PAIR);
  });

  it('원페어 감지', () => {
    const cards = [c('H','J'), c('D','J'), c('C','7'), c('S','9'), c('H','A')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.ONE_PAIR);
  });

  it('탑(노페어) 감지', () => {
    const cards = [c('H','7'), c('D','9'), c('C','J'), c('S','K'), c('H','A')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.HIGH_CARD);
  });

  it('dominantSuit: 가장 많은 무늬 반환', () => {
    const cards = [c('H','7'), c('H','9'), c('D','J'), c('H','K'), c('C','A')];
    expect(evaluateHand(cards).dominantSuit).toBe('H');
  });
});
