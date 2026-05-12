export const HAND_SIZE = 5;

const VALUE_ORDER = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export default class Hand {
  constructor() {
    this.cards = [];
  }

  addCard(card) {
    if (this.cards.length < HAND_SIZE) {
      this.cards.push(card);
      this.cards.sort((a, b) => VALUE_ORDER.indexOf(b.value) - VALUE_ORDER.indexOf(a.value));
      return true;
    }
    return false;
  }

  isFull() {
    return this.cards.length >= HAND_SIZE;
  }

  removeCard(index) {
    return this.cards.splice(index, 1)[0];
  }

  consumeAll() {
    const all = [...this.cards];
    this.cards = [];
    return all;
  }

  replaceCard(index, newCard) {
    const old = this.cards[index];
    this.cards[index] = newCard;
    return old;
  }
}
