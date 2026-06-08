import { SUIT_COLORS, SUIT_ICONS } from '../cards/Card.js';
import { THEME } from '../theme.js';

export const CARD_LAYOUT = {
  CARD_W: 50,
  CARD_H: 64,
  CARD_Y: 832,
  META_Y: 790,
  META_H: 16,
  PREVIEW_Y: 879,
  PREVIEW_H: 22,
  ACTION_Y: 916,
  ACTION_H: 42,
  SHARED_SCALE: 0.86,
  SUIT_LABEL_FONT: 9,
  VALUE_FONT: 26,
  SUIT_MARK_FONT: 19,
  SUIT_LABEL_USES_ICON_ONLY: true,
};

const {
  CARD_W,
  CARD_H,
  CARD_Y,
  META_Y,
  META_H,
  PREVIEW_Y,
  PREVIEW_H,
  ACTION_Y,
  ACTION_H,
  SHARED_SCALE,
  SUIT_LABEL_FONT,
  VALUE_FONT,
  SUIT_MARK_FONT,
} = CARD_LAYOUT;

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
    Object.values(this._buttons).forEach(obj => { if (obj?.active) obj.destroy(); });
    this._destroyObjectGroup(this._replaceModeHint);
    this._replaceModeHint = null;
    this.cardObjects = [];
    this.sharedObjects = [];
    this._buttons = {};
  }

  render(hand, sharedCards, burnCount = 0) {
    this.cardObjects.forEach(objs => objs.forEach(g => { if (g && g.active) g.destroy(); }));
    this.sharedObjects.forEach(objs => objs.forEach(g => { if (g && g.active) g.destroy(); }));

    this.cardObjects = [];
    this.sharedObjects = [];

    const handGap = 6;
    const startX = Math.floor(28 + CARD_W / 2);

    hand.cards.forEach((card, i) => {
      const x = startX + i * (CARD_W + handGap);
      this.cardObjects.push(this._drawCard(x, CARD_Y, card));
    });

    const sepX = 350;
    const sep = this.scene.add.graphics().setDepth(12);
    sep.lineStyle(1, 0x2d6688, 0.9);
    sep.lineBetween(sepX, META_Y - 8, sepX, CARD_Y + 34);
    this.sharedObjects.push([sep]);

    const sharedCardW = Math.floor(CARD_W * SHARED_SCALE);
    const sharedGap = 8;
    const sharedTotal = sharedCards.cards.length * (sharedCardW + sharedGap) - sharedGap;
    const sharedCenterX = 496;
    const sharedStartX = Math.floor(sharedCenterX - sharedTotal / 2 + sharedCardW / 2);
    this.sharedObjects.push(this._drawLabelPill(455, META_Y, 72, '공용패', '#9ee6ff'));
    this.sharedObjects.push(this._drawLabelPill(540, META_Y, 76, `무덤 ${burnCount}`, '#d8b6ff'));

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
    const bg = this.scene.add.rectangle(x, y, w, h, THEME.bg.mid).setDepth(12)
      .setStrokeStyle(2, color, 0.95);
    const inner = this.scene.add.rectangle(x, y, w - 7 * scale, h - 7 * scale, 0xefe8dc, 1).setDepth(12)
      .setStrokeStyle(1, 0xffffff, 0.35);
    const topBand = this.scene.add.rectangle(x, y - h * 0.29, w - 12 * scale, 15 * scale, THEME.bg.panel, 0.9).setDepth(13);
    const icon = SUIT_ICONS[card.suit] ?? '';
    const suitText = this.scene.add.text(x, y - 22 * scale, icon, {
      fontSize: `${SUIT_LABEL_FONT * scale}px`, color: colorHex, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(13);
    const valText = this.scene.add.text(x, y + 8 * scale, card.value, {
      fontSize: `${VALUE_FONT * scale}px`, color: '#151a22', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(13);
    const suitMark = this.scene.add.text(x, y + 25 * scale, icon, {
      fontSize: `${SUIT_MARK_FONT * scale}px`, color: colorHex,
    }).setOrigin(0.5).setDepth(13);
    return [bg, inner, topBand, suitText, valText, suitMark];
  }

  enterReplaceMode(hand, onSelect, onCancel) {
    this.exitReplaceMode();

    this._replaceModeHint = this._drawLabelPill(166, META_Y, 190, '교체할 카드를 선택하세요', '#ffdd44', 15);

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
    this._destroyObjectGroup(this._replaceModeHint);
    this._replaceModeHint = null;
    if (this._cancelOnOutsideClick) {
      this.scene.input.off('pointerdown', this._cancelOnOutsideClick);
      this._cancelOnOutsideClick = null;
    }
    this.cardObjects.forEach((objs) => {
      const [bg] = objs;
      if (!bg?.active) return;
      bg.setFillStyle(THEME.bg.mid);
      bg.removeAllListeners();
    });
  }

  renderButtons(drawCost, replaceCost, summonHandName = null, magicSkillName = null) {
    Object.values(this._buttons).forEach(obj => { if (obj?.active) obj.destroy(); });
    this._buttons = {};

    let summonPreview = null;
    let summonPreviewBg = null;
    if (summonHandName) {
      [summonPreviewBg, summonPreview] = this._drawPreviewStrip(320, 208, `족보  ${summonHandName}`, '#ffdd88', 15);
    }

    let magicPreview = null;
    let magicPreviewBg = null;
    if (magicSkillName) {
      [magicPreviewBg, magicPreview] = this._drawPreviewStrip(112, 184, magicSkillName, '#dca7ff', 10);
    }

    const magicBtn = this._drawActionButton(112, ACTION_Y, 184, '✦  마법', 0x56308f, 0xb776ff);
    const summonBtn = this._drawActionButton(320, ACTION_Y, 196, `♜  소환 ${drawCost}G`, THEME.ui.btnGold, THEME.text.gold);
    const replaceBtn = this._drawActionButton(528, ACTION_Y, 184, `↻  교체 ${replaceCost}G`, 0x0f5878, THEME.economy.gem);

    this._buttons = { summonBtn, magicBtn, replaceBtn, summonPreviewBg, summonPreview, magicPreviewBg, magicPreview };
    return { summonBtn, magicBtn, replaceBtn };
  }

  _drawLabelPill(x, y, w, label, color, depth = 12) {
    const bg = this.scene.add.rectangle(x, y, w, META_H, 0x08131f, 0.92)
      .setDepth(depth)
      .setStrokeStyle(1, 0x2d6688, 0.7);
    const text = this.scene.add.text(x, y, label, {
      fontSize: '10px',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(depth + 1);
    bg.destroy = ((originalDestroy) => function (...args) {
      if (text?.active) text.destroy();
      return originalDestroy.apply(this, args);
    })(bg.destroy);
    return [bg, text];
  }

  _destroyObjectGroup(group) {
    if (!group) return;
    const objects = Array.isArray(group) ? group : [group];
    objects.forEach(obj => { if (obj?.active) obj.destroy(); });
  }

  _drawPreviewStrip(x, w, label, color, fontSize) {
    const bg = this.scene.add.rectangle(x, PREVIEW_Y, w, PREVIEW_H, 0x091421, 0.94)
      .setDepth(12)
      .setStrokeStyle(1, 0x40546d, 0.85);
    const text = this.scene.add.text(x, PREVIEW_Y, label, {
      fontSize: `${fontSize}px`,
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
      wordWrap: { width: w - 14 },
    }).setOrigin(0.5).setDepth(13);
    return [bg, text];
  }

  _drawActionButton(x, y, w, label, fill, stroke) {
    const bg = this.scene.add.rectangle(x, y, w, ACTION_H, fill, 0.95)
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
