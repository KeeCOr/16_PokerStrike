export const SUITS = ['H', 'D', 'C', 'S']; // 불, 물, 땅, 바람
export const VALUES = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const SUIT_NAMES = { H: '불', D: '물', C: '땅', S: '바람' };
export const SUIT_COLORS = { H: 0xff4444, D: 0x4488ff, C: 0x44cc44, S: 0xaa66ff };

export default class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
    this.id = `${suit}-${value}`;
  }
}
