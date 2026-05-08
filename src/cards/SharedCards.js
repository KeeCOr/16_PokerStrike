export const SHARED_SIZE = 2;

export default class SharedCards {
  constructor() {
    this.cards = [];
  }

  fill(deck) {
    while (this.cards.length < SHARED_SIZE) {
      const card = deck.draw();
      if (card) this.cards.push(card);
    }
  }

  consume(deck) {
    const consumed = [...this.cards];
    this.cards = [];
    this.fill(deck);
    return consumed;
  }

  getCards() {
    return [...this.cards];
  }
}
