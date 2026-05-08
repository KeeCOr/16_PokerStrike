import Card, { SUITS, VALUES } from './Card.js';

export default class Deck {
  constructor() {
    this.drawPile = [];
    this.discardPile = [];
    this._buildDeck();
    this._shuffle(this.drawPile);
  }

  _buildDeck() {
    for (const suit of SUITS) {
      for (const value of VALUES) {
        this.drawPile.push(new Card(suit, value));
      }
    }
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  draw() {
    if (this.drawPile.length === 0) {
      if (this.discardPile.length === 0) return null;
      this.drawPile = [...this.discardPile];
      this.discardPile = [];
      this._shuffle(this.drawPile);
    }
    return this.drawPile.pop();
  }

  discard(card) {
    this.discardPile.push(card);
  }

  discardMany(cards) {
    cards.forEach(c => this.discard(c));
  }
}
