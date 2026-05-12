import { SUIT_COLORS, SUIT_NAMES } from '../cards/Card.js';
import { evaluateHand, HAND_NAMES } from '../cards/HandEvaluator.js';

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

  render(hand, sharedCards) {
    // Destroy old card objects
    this.cardObjects.forEach(objs => objs.forEach(g => { if (g && g.active) g.destroy(); }));
    this.sharedObjects.forEach(objs => objs.forEach(g => { if (g && g.active) g.destroy(); }));

    this.cardObjects = [];
    this.sharedObjects = [];

    // Hand label
    const handLabelY = CARD_Y - 46;
    const handLbl = this.scene.add.text(280, handLabelY, '패', {
      fontSize: '10px', color: '#88aacc'
    }).setOrigin(0.5).setDepth(12);
    this.cardObjects.push([handLbl]);

    // Hand cards (5 slots) — shifted left to leave room for shared cards
    const totalW = hand.cards.length * (CARD_W + 6);
    const startX = (460 - totalW) / 2 + CARD_W / 2;
    hand.cards.forEach((card, i) => {
      const x = startX + i * (CARD_W + 6);
      this.cardObjects.push(this._drawCard(x, CARD_Y, card));
    });

    // Divider line
    const sepX = 460;
    const sep = this.scene.add.graphics().setDepth(12);
    sep.lineStyle(1, 0x3a5070, 1);
    sep.lineBetween(sepX, CARD_Y - 40, sepX, CARD_Y + 40);
    this.sharedObjects.push([sep]);

    // Shared cards — 오른쪽 영역(460~640) 중앙 배치
    const sharedCardW = Math.floor(CARD_W * SHARED_SCALE);
    const sharedGap = 8;
    const sharedTotal = sharedCards.cards.length * (sharedCardW + sharedGap) - sharedGap;
    const sharedStartX = Math.floor((460 + 640) / 2 - sharedTotal / 2 + sharedCardW / 2);

    // Shared cards label — 카드 영역 위 중앙
    const sharedCenterX = Math.floor((460 + 640) / 2);
    const sharedLbl = this.scene.add.text(sharedCenterX, handLabelY, '공용패', {
      fontSize: '11px', color: '#dd99ff'
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
    const suitText = this.scene.add.text(x, y - 8 * scale, SUIT_NAMES[card.suit], {
      fontSize: `${10 * scale}px`, color: colorHex
    }).setOrigin(0.5).setDepth(13);
    const valText = this.scene.add.text(x, y + 8 * scale, card.value, {
      fontSize: `${14 * scale}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(13);
    return [bg, border, suitText, valText];
  }

  // Enter replace mode: highlight cards and call onSelect(index) when clicked
  // onCancel: called when clicking outside the cards
  enterReplaceMode(hand, onSelect, onCancel) {
    this.exitReplaceMode(); // clean up any existing replace mode first

    // Show hint label
    this._replaceModeHint = this.scene.add.text(230, CARD_Y - 46, '교체할 카드를 선택하세요', {
      fontSize: '11px', color: '#ffdd44'
    }).setOrigin(0.5).setDepth(15);

    // Make each hand card clickable
    this.cardObjects.slice(1).forEach((objs, i) => { // slice(1) skips the '패' label
      const [bg] = objs;
      if (!bg?.active) return;
      bg.setInteractive({ useHandCursor: true });
      bg.setFillStyle(0x2a3f22); // green tint to show selectable
      bg.once('pointerdown', () => {
        this.exitReplaceMode();
        onSelect(i);
      });
      bg.on('pointerover', () => bg.setFillStyle(0x446633));
      bg.on('pointerout',  () => bg.setFillStyle(0x2a3f22));
    });

    // 카드 영역 밖 클릭 시 취소
    // _skipFirst: 교체 버튼 클릭한 pointerdown 이벤트 자체를 무시하기 위해 첫 번째 이벤트 건너뜀
    let skipFirst = true;
    this._cancelOnOutsideClick = (ptr) => {
      if (skipFirst) { skipFirst = false; return; }
      const onCard = this.cardObjects.slice(1).some(objs => {
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
    // Restore card bg colors and remove listeners
    this.cardObjects.slice(1).forEach((objs) => {
      const [bg] = objs;
      if (!bg?.active) return;
      bg.setFillStyle(0x1a2a3a);
      bg.removeAllListeners();
    });
  }

  // summonHandName: hand rank name string (e.g. "원페어")
  // magicSkillName: skill name string (e.g. "소환 지원")
  renderButtons(drawCost, replaceCost, summonHandName = null, magicSkillName = null) {
    ['summonBtn', 'magicBtn', 'replaceBtn', 'summonPreview', 'magicPreview'].forEach(k => {
      if (this._buttons[k]) { this._buttons[k].destroy(); delete this._buttons[k]; }
    });

    // Preview labels above buttons
    let summonPreview = null;
    if (summonHandName) {
      summonPreview = this.scene.add.text(320, 872, summonHandName, {
        fontSize: '11px', color: '#ffdd88'
      }).setOrigin(0.5).setDepth(12);
    }

    let magicPreview = null;
    if (magicSkillName) {
      magicPreview = this.scene.add.text(100, 872, magicSkillName, {
        fontSize: '11px', color: '#cc88ff'
      }).setOrigin(0.5).setDepth(12);
    }

    // Buttons: magic left (x=100), summon center (x=320), replace right (x=530)
    const magicBtn = this.scene.add.text(100, 904, `마법`, {
      fontSize: '13px', color: '#ffffff',
      backgroundColor: '#883399', padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setDepth(12).setInteractive();

    const summonBtn = this.scene.add.text(320, 904, `소환 (${drawCost}G)`, {
      fontSize: '13px', color: '#ffffff',
      backgroundColor: '#2244aa', padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setDepth(12).setInteractive();

    const replaceBtn = this.scene.add.text(530, 904, `교체 (${replaceCost}G)`, {
      fontSize: '13px', color: '#ffffff',
      backgroundColor: '#226644', padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setDepth(12).setInteractive();

    this._buttons = { summonBtn, magicBtn, replaceBtn, summonPreview, magicPreview };
    return { summonBtn, magicBtn, replaceBtn };
  }
}
