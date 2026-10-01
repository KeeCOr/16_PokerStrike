import { describe, it, expect } from 'vitest';
import Deck from '../../src/cards/Deck.js';

describe('Deck', () => {
  it('초기 덱은 32장', () => {
    const deck = new Deck();
    expect(deck.drawPile.length).toBe(32);
  });

  it('draw()는 카드를 반환하고 덱을 1장 줄임', () => {
    const deck = new Deck();
    const card = deck.draw();
    expect(card).toHaveProperty('suit');
    expect(card).toHaveProperty('value');
    expect(deck.drawPile.length).toBe(31);
  });

  it('덱 소진 시 무덤을 셔플하여 재사용', () => {
    const deck = new Deck();
    const drawn = [];
    for (let i = 0; i < 32; i++) drawn.push(deck.draw());
    drawn.forEach(c => deck.discard(c));
    expect(deck.drawPile.length).toBe(0);
    expect(deck.discardPile.length).toBe(32);
    const card = deck.draw();
    expect(card).toBeTruthy();
    expect(deck.drawPile.length).toBe(31);
    expect(deck.discardPile.length).toBe(0);
  });

  it('discard()는 무덤에 추가', () => {
    const deck = new Deck();
    const card = deck.draw();
    deck.discard(card);
    expect(deck.discardPile.length).toBe(1);
  });

  it('burnMany() keeps magic-used cards out of discard', () => {
    const deck = new Deck();
    const cards = [deck.draw(), deck.draw(), deck.draw()];
    deck.burnMany(cards);
    expect(deck.burnPile.length).toBe(3);
    expect(deck.burnCount).toBe(3);
    expect(deck.discardPile.length).toBe(0);
  });
});
