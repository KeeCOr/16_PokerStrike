import { SUIT_COLORS, SUIT_NAMES, SUIT_ICONS } from '../cards/Card.js';

const CARD_W = 52;
const CARD_H = 76;
const CARD_Y = 820;
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

    const labelY = CARD_Y - 46;
    const totalW = hand.cards.length * (CARD_W + 6);
    const startX = (460 - totalW) / 2 + CARD_W / 2;

    hand.cards.forEach((card, i) => {
      const x = startX + i * (CARD_W + 6);
      this.cardObjects.push(this._drawCard(x, CARD_Y, card));
    });

    const sepX = 460;
    const sep = this.scene.add.graphics().setDepth(12);
    sep.lineStyle(1, 0x3a5070, 1);
    sep.lineBetween(sepX, CARD_Y - 40, sepX, CARD_Y + 40);
    this.sharedObjects.push([sep]);

    const sharedCardW = Math.floor(CARD_W * SHARED_SCALE);
    const sharedGap = 8;
    const sharedTotal = sharedCards.cards.length * (sharedCardW + sharedGap) - sharedGap;
    const sharedStartX = Math.floor((460 + 640) / 2 - sharedTotal / 2 + sharedCardW / 2);
    const sharedCenterX = Math.floor((460 + 640) / 2);
    const sharedLbl = this.scene.add.text(sharedCenterX, labelY, `공용패  |  무덤 ${burnCount}`, {
      fontSize: '11px', color: '#dd99ff',
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
    const bg = this.scene.add.rectangle(x, y, w, h, 0x1a2a3a).setDepth(12);
    const border = this.scene.add.rectangle(x, y, w - 4, h - 4, 0x0d1b2a).setDepth(12);
    const icon = SUIT_ICONS[card.suit] ?? '';
    const suitText = this.scene.add.text(x, y - 8 * scale, `${icon} ${SUIT_NAMES[card.suit]}`, {
      fontSize: `${10 * scale}px`, color: colorHex,
    }).setOrigin(0.5).setDepth(13);
    const valText = this.scene.add.text(x, y + 8 * scale, card.value, {
      fontSize: `${14 * scale}px`, color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(13);
    return [bg, border, suitText, valText];
  }

  enterReplaceMode(hand, onSelect, onCancel) {
    this.exitReplaceMode();

    this._replaceModeHint = this.scene.add.text(230, CARD_Y - 46, '교체할 카드를 선택하세요', {
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
      bg.setFillStyle(0x1a2a3a);
      bg.removeAllListeners();
    });
  }

  renderButtons(drawCost, replaceCost, summonHandName = null, magicSkillName = null) {
    ['summonBtn', 'magicBtn', 'replaceBtn', 'summonPreview', 'magicPreview'].forEach(k => {
      if (this._buttons[k]) { this._buttons[k].destroy(); delete this._buttons[k]; }
    });

    let summonPreview = null;
    if (summonHandName) {
      summonPreview = this.scene.add.text(320, 872, summonHandName, {
        fontSize: '11px', color: '#ffdd88',
      }).setOrigin(0.5).setDepth(12);
    }

    let magicPreview = null;
    if (magicSkillName) {
      magicPreview = this.scene.add.text(100, 872, magicSkillName, {
        fontSize: '11px', color: '#cc88ff',
      }).setOrigin(0.5).setDepth(12);
    }

    const magicBtn = this.scene.add.text(100, 904, '마법', {
      fontSize: '13px', color: '#ffffff',
      backgroundColor: '#883399', padding: { x: 8, y: 5 },
    }).setOrigin(0.5).setDepth(12).setInteractive();

    const summonBtn = this.scene.add.text(320, 904, `소환 (${drawCost}G)`, {
      fontSize: '13px', color: '#ffffff',
      backgroundColor: '#2244aa', padding: { x: 8, y: 5 },
    }).setOrigin(0.5).setDepth(12).setInteractive();

    const replaceBtn = this.scene.add.text(530, 904, `교체 (${replaceCost}G)`, {
      fontSize: '13px', color: '#ffffff',
      backgroundColor: '#226644', padding: { x: 8, y: 5 },
    }).setOrigin(0.5).setDepth(12).setInteractive();

    this._buttons = { summonBtn, magicBtn, replaceBtn, summonPreview, magicPreview };
    return { summonBtn, magicBtn, replaceBtn };
  }
}
