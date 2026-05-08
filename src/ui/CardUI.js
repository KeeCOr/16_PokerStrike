import { SUIT_COLORS, SUIT_NAMES } from '../cards/Card.js';
import { evaluateHand, HAND_NAMES } from '../cards/HandEvaluator.js';

const CARD_W = 52;
const CARD_H = 76;
const CARD_Y = 730;

export default class CardUI {
  constructor(scene) {
    this.scene = scene;
    this.cardObjects = [];
    this.sharedObjects = [];
    this.handLabel = null;
    this._buttons = {};
  }

  render(hand, sharedCards) {
    // Destroy old card objects
    this.cardObjects.forEach(objs => objs.forEach(g => g.destroy()));
    this.sharedObjects.forEach(objs => objs.forEach(g => g.destroy()));
    if (this.handLabel) { this.handLabel.destroy(); this.handLabel = null; }

    this.cardObjects = [];
    this.sharedObjects = [];

    // Hand cards (5 slots)
    const totalW = hand.cards.length * (CARD_W + 6);
    const startX = (480 - totalW) / 2 + CARD_W / 2;
    hand.cards.forEach((card, i) => {
      const x = startX + i * (CARD_W + 6);
      this.cardObjects.push(this._drawCard(x, CARD_Y, card));
    });

    // Hand evaluation label
    if (hand.cards.length === 5) {
      const { rank } = evaluateHand(hand.cards);
      this.handLabel = this.scene.add.text(240, CARD_Y + CARD_H / 2 + 14, HAND_NAMES[rank], {
        fontSize: '13px', color: '#ffdd88'
      }).setOrigin(0.5).setDepth(12);
    }

    // Shared cards (top-right area)
    sharedCards.cards.forEach((card, i) => {
      const x = 390 + i * (CARD_W * 0.75 + 4);
      const y = CARD_Y - 90;
      this.sharedObjects.push(this._drawCard(x, y, card, 0.75));
    });
  }

  _drawCard(x, y, card, scale = 1) {
    const w = CARD_W * scale;
    const h = CARD_H * scale;
    const color = SUIT_COLORS[card.suit] ?? 0xffffff;
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    const bg = this.scene.add.rectangle(x, y, w, h, 0x1a2a3a).setDepth(12);
    const border = this.scene.add.rectangle(x, y, w - 4, h - 4, 0x0d1b2a).setDepth(12);
    const suitText = this.scene.add.text(x, y - 8 * scale, SUIT_NAMES[card.suit], {
      fontSize: `${10 * scale}px`, color: colorHex
    }).setOrigin(0.5).setDepth(13);
    const valText = this.scene.add.text(x, y + 8 * scale, card.value, {
      fontSize: `${14 * scale}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(13);
    return [bg, border, suitText, valText];
  }

  renderButtons(drawCost, replaceCost) {
    // Destroy old buttons if they exist
    ['summonBtn', 'magicBtn', 'replaceBtn'].forEach(k => {
      if (this._buttons[k]) { this._buttons[k].destroy(); delete this._buttons[k]; }
    });

    const summonBtn = this.scene.add.text(80, 820, `소환 (${drawCost}G)`, {
      fontSize: '13px', color: '#ffffff',
      backgroundColor: '#2244aa', padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setDepth(12).setInteractive();

    const magicBtn = this.scene.add.text(240, 820, `마법`, {
      fontSize: '13px', color: '#ffffff',
      backgroundColor: '#883399', padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setDepth(12).setInteractive();

    const replaceBtn = this.scene.add.text(400, 820, `교체 (${replaceCost}G)`, {
      fontSize: '13px', color: '#ffffff',
      backgroundColor: '#226644', padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setDepth(12).setInteractive();

    this._buttons = { summonBtn, magicBtn, replaceBtn };
    return this._buttons;
  }
}
