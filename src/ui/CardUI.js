import { SUIT_COLORS, SUIT_NAMES, SUIT_ICONS } from '../cards/Card.js';

const CARD_W = 54;
const CARD_H = 74;
const CARD_Y = 805;
const ACTION_Y = 882;
const PREVIEW_Y = 852;
const SHARED_SCALE = 0.85;

export default class CardUI {
  constructor(scene) {
    this.scene = scene;
    this.cardObjects = [];
    this.sharedObjects = [];
    this._buttons = {};
    this._replaceModeHint = null;
  }

  clear() {
    this.cardObjects.forEach(objs => objs.forEach(g => { if (g && g.active) g.destroy(); }));
    this.sharedObjects.forEach(objs => objs.forEach(g => { if (g && g.active) g.destroy(); }));
    ['summonBtn', 'magicBtn', 'replaceBtn', 'summonPreview', 'magicPreview'].forEach(k => {
      if (this._buttons[k]) { this._buttons[k].destroy(); delete this._buttons[k]; }
    });
    if (this._replaceModeHint) { this._replaceModeHint.destroy(); this._replaceModeHint = null; }
    this.cardObjects = [];
    this.sharedObjects = [];
    this._buttons = {};
  }

  render(hand, sharedCards, burnCount = 0) {
    this.cardObjects.forEach(objs => objs.forEach(g => { if (g && g.active) g.destroy(); }));
    this.sharedObjects.forEach(objs => objs.forEach(g => { if (g && g.active) g.destroy(); }));

    this.cardObjects = [];
    this.sharedObjects = [];

    const labelY = CARD_Y - 43;
    const handGap = 7;
    const startX = Math.floor(26 + CARD_W / 2);

    hand.cards.forEach((card, i) => {
      const x = startX + i * (CARD_W + handGap);
      this.cardObjects.push(this._drawCard(x, CARD_Y, card));
    });

    const sepX = 350;
    const sep = this.scene.add.graphics().setDepth(12);
    sep.lineStyle(1, 0x2d6688, 0.9);
    sep.lineBetween(sepX, CARD_Y - 42, sepX, CARD_Y + 42);
    this.sharedObjects.push([sep]);

    const sharedCardW = Math.floor(CARD_W * SHARED_SCALE);
    const sharedGap = 8;
    const sharedTotal = sharedCards.cards.length * (sharedCardW + sharedGap) - sharedGap;
    const sharedCenterX = 496;
    const sharedStartX = Math.floor(sharedCenterX - sharedTotal / 2 + sharedCardW / 2);
    const sharedLbl = this.scene.add.text(sharedCenterX, labelY, `공용패  |  무덤 ${burnCount}`, {
      fontSize: '11px', color: '#cfa8ff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(12);
    this.sharedObjects.push([sharedLbl]);

    sharedCards.cards.forEach((card, i) => {
      const x = sharedStartX + i * (sharedCardW + sharedGap);
      this.sharedObjects.push(this._drawCard(x, CARD_Y, card, SHARED_SCALE));
    });
  }

  _drawCard(x, y, card, scale = 1) {
    const w = CARD_W * scale;
    const h = CARD_H * scale;
    const color = SUIT_COLORS[card.suit] ?? 0xffffff;
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    const bg = this.scene.add.rectangle(x, y, w, h, 0x111b27).setDepth(12)
      .setStrokeStyle(2, color, 0.95);
    const inner = this.scene.add.rectangle(x, y, w - 7 * scale, h - 7 * scale, 0xefe8dc, 1).setDepth(12)
      .setStrokeStyle(1, 0xffffff, 0.35);
    const topBand = this.scene.add.rectangle(x, y - h * 0.29, w - 12 * scale, 15 * scale, 0x0d1b2a, 0.9).setDepth(13);
    const icon = SUIT_ICONS[card.suit] ?? '';
    const suitText = this.scene.add.text(x, y - 22 * scale, `${icon} ${SUIT_NAMES[card.suit]}`, {
      fontSize: `${9 * scale}px`, color: colorHex, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(13);
    const valText = this.scene.add.text(x, y + 8 * scale, card.value, {
      fontSize: `${22 * scale}px`, color: '#151a22', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(13);
    const suitMark = this.scene.add.text(x, y + 25 * scale, icon, {
      fontSize: `${15 * scale}px`, color: colorHex,
    }).setOrigin(0.5).setDepth(13);
    return [bg, inner, topBand, suitText, valText, suitMark];
  }

  enterReplaceMode(hand, onSelect, onCancel) {
    this.exitReplaceMode();

    this._replaceModeHint = this.scene.add.text(180, CARD_Y - 43, '교체할 카드를 선택하세요', {
      fontSize: '11px', color: '#ffdd44',
    }).setOrigin(0.5).setDepth(15);

    this.cardObjects.forEach((objs, i) => {
      const [bg] = objs;
      if (!bg?.active) return;
      bg.setInteractive({ useHandCursor: true });
      bg.setFillStyle(0x2a3f22);
      bg.once('pointerdown', () => {
        this.exitReplaceMode();
        onSelect(i);
      });
      bg.on('pointerover', () => bg.setFillStyle(0x446633));
      bg.on('pointerout',  () => bg.setFillStyle(0x2a3f22));
    });

    let skipFirst = true;
    this._cancelOnOutsideClick = (ptr) => {
      if (skipFirst) { skipFirst = false; return; }
      const onCard = this.cardObjects.some(objs => {
        const [bg] = objs;
        if (!bg?.active) return false;
        const b = bg.getBounds();
        return ptr.x >= b.left && ptr.x <= b.right && ptr.y >= b.top && ptr.y <= b.bottom;
      });
      if (!onCard) {
        this.exitReplaceMode();
        if (onCancel) onCancel();
      }
    };
    this.scene.input.on('pointerdown', this._cancelOnOutsideClick);
  }

  exitReplaceMode() {
    if (this._replaceModeHint) { this._replaceModeHint.destroy(); this._replaceModeHint = null; }
    if (this._cancelOnOutsideClick) {
      this.scene.input.off('pointerdown', this._cancelOnOutsideClick);
      this._cancelOnOutsideClick = null;
    }
    this.cardObjects.forEach((objs) => {
      const [bg] = objs;
      if (!bg?.active) return;
      bg.setFillStyle(0x111b27);
      bg.removeAllListeners();
    });
  }

  renderButtons(drawCost, replaceCost, summonHandName = null, magicSkillName = null) {
    ['summonBtn', 'magicBtn', 'replaceBtn', 'summonPreview', 'magicPreview'].forEach(k => {
      if (this._buttons[k]) { this._buttons[k].destroy(); delete this._buttons[k]; }
    });

    let summonPreview = null;
    if (summonHandName) {
      summonPreview = this.scene.add.text(320, PREVIEW_Y, summonHandName, {
        fontSize: '11px', color: '#ffdd88', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(12);
    }

    let magicPreview = null;
    if (magicSkillName) {
      magicPreview = this.scene.add.text(112, PREVIEW_Y, magicSkillName, {
        fontSize: '10px', color: '#cc88ff',
      }).setOrigin(0.5).setDepth(12);
    }

    const magicBtn = this._drawActionButton(112, ACTION_Y, 184, '✦  마법', 0x56308f, 0xb776ff);
    const summonBtn = this._drawActionButton(320, ACTION_Y, 196, `♜  소환 ${drawCost}G`, 0x8a5a12, 0xffcc55);
    const replaceBtn = this._drawActionButton(528, ACTION_Y, 184, `↻  교체 ${replaceCost}G`, 0x0f5878, 0x55d6ff);

    this._buttons = { summonBtn, magicBtn, replaceBtn, summonPreview, magicPreview };
    return { summonBtn, magicBtn, replaceBtn };
  }

  _drawActionButton(x, y, w, label, fill, stroke) {
    const bg = this.scene.add.rectangle(x, y, w, 42, fill, 0.95)
      .setDepth(12)
      .setStrokeStyle(2, stroke, 0.9)
      .setInteractive({ useHandCursor: true });
    const text = this.scene.add.text(x, y, label, {
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(13);
    bg.on('pointerover', () => bg.setFillStyle(fill, 1));
    bg.on('pointerout', () => bg.setFillStyle(fill, 0.95));
    text.setInteractive({ useHandCursor: true });
    text.on('pointerover', () => bg.emit('pointerover'));
    text.on('pointerout', () => bg.emit('pointerout'));
    text.on('pointerdown', () => bg.emit('pointerdown'));
    bg.destroy = ((originalDestroy) => function (...args) {
      if (text?.active) text.destroy();
      return originalDestroy.apply(this, args);
    })(bg.destroy);
    return bg;
  }
}
