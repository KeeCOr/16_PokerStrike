import Phaser from 'phaser';
import HUD from '../ui/HUD.js';
import CardUI from '../ui/CardUI.js';
import Deck from '../cards/Deck.js';
import Hand from '../cards/Hand.js';
import SharedCards from '../cards/SharedCards.js';
import { evaluateHand } from '../cards/HandEvaluator.js';

export default class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  create() {
    this.hud = new HUD(this);
    this.cardUI = new CardUI(this);

    this.deck = new Deck();
    this.hand = new Hand();
    this.sharedCards = new SharedCards();

    // Draw shared cards first (2 cards), then hand (5 cards)
    this.sharedCards.fill(this.deck);
    for (let i = 0; i < 5; i++) {
      const card = this.deck.draw();
      if (card) this.hand.addCard(card);
    }

    this._refreshUI();

    // GameScene reference
    const gameScene = this.scene.get('GameScene');

    // Handle unit placement click in GameScene
    gameScene.input.on('pointerdown', (ptr) => {
      const pending = this.registry.get('pendingUnit');
      if (!pending) return;
      if (ptr.y > 650) return;
      const { col, row } = gameScene.grid.worldToCell(ptr.x, ptr.y);
      gameScene.unitManager.placeUnit(col, row, pending.rank, pending.suit, pending.grade);
      gameScene.enemyManager.recalculateAllPaths();
      this.registry.set('pendingUnit', null);
    });

    // Listen for magic cast event from UIScene buttons
    this.events.on('castMagic', ({ rank, suit }) => {
      if (gameScene.magicManager) gameScene.magicManager.cast(rank, suit);
    });

    // Listen for refreshSharedCards from magic manager
    gameScene.events.on('refreshSharedCards', () => {
      this.sharedCards.consume(this.deck);
      this._refreshUI();
    });
  }

  _summon() {
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;
    if (!eco.spend(eco.getDrawCost())) return;

    const { rank, dominantSuit } = evaluateHand(this.hand.cards);
    this.deck.discardMany(this.hand.consumeAll());
    eco.resetReplaceCost();

    for (let i = 0; i < 5; i++) {
      const card = this.deck.draw();
      if (card) this.hand.addCard(card);
    }

    this.registry.set('pendingUnit', { rank, suit: dominantSuit, grade: 1 });
    this._refreshUI();
  }

  _castMagic() {
    const gameScene = this.scene.get('GameScene');
    if (this.hand.cards.length < 3) return;

    const combined = [...this.hand.cards.slice(0, 3), ...this.sharedCards.getCards()];
    const { rank, dominantSuit } = evaluateHand(combined);

    this.events.emit('castMagic', { rank, suit: dominantSuit });

    // Consume hand + shared cards, draw fresh 5
    this.deck.discardMany(this.hand.consumeAll());
    this.sharedCards.consume(this.deck);

    for (let i = 0; i < 5; i++) {
      const card = this.deck.draw();
      if (card) this.hand.addCard(card);
    }

    this._refreshUI();
  }

  _replace() {
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;
    const cost = eco.getReplaceCost();
    if (!eco.spend(cost)) return;
    eco.recordReplace();

    const old = this.hand.removeCard(0);
    if (old) this.deck.discard(old);
    const newCard = this.deck.draw();
    if (newCard) this.hand.addCard(newCard);

    this._refreshUI();
  }

  _refreshUI() {
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;

    this.cardUI.render(this.hand, this.sharedCards);
    const buttons = this.cardUI.renderButtons(eco.getDrawCost(), eco.getReplaceCost());

    buttons.summonBtn.on('pointerdown', () => this._summon());
    buttons.magicBtn.on('pointerdown', () => this._castMagic());
    buttons.replaceBtn.on('pointerdown', () => this._replace());
  }
}
