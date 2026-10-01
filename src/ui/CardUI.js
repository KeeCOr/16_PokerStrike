import { SUIT_COLORS, SUIT_ICONS } from '../cards/Card.js';
import { UI_TEXTURES, getTowerTextureKey } from '../assets/art/AssetKeys.js';
import { THEME } from '../theme.js';

export const CARD_LAYOUT = {
  CARD_W: 50,
  CARD_H: 64,
  CARD_Y: 840,
  HAND_START_X: 53,
  HAND_GAP: 6,
  SEPARATOR_X: 350,
  SHARED_CENTER_X: 496,
  SHARED_GAP: 8,
  META_Y: 798,
  META_H: 16,
  PREVIEW_Y: 887,
  PREVIEW_H: 22,
  PREVIEW_TEXT_PAD: 14,
  ACTION_Y: 924,
  ACTION_H: 42,
  ACTION_GROUP_GAP: 2,
  ACTION_TEXTURE_PAD_X: 22,
  ACTION_TEXT_Y_OFFSET: 2,
  SHARED_SCALE: 0.86,
  SUIT_LABEL_FONT: 9,
  VALUE_FONT: 26,
  SUIT_MARK_FONT: 19,
  SUIT_LABEL_USES_ICON_ONLY: true,
};

export const ACTION_GROUP_SPECS = Object.freeze({
  magic: { x: 104, w: 200, label: 'MAGIC', fill: 0x120f24, stroke: 0x8e62d7 },
  hand: { x: 421, w: 430, label: 'HAND ACTIONS', fill: 0x161b16, stroke: 0xf2c96b },
});

export const ACTION_BUTTON_SPECS = Object.freeze({
  magic: { x: 104, w: 172, group: 'magic', intent: 'utility', fill: 0x56308f, stroke: 0xb776ff, textureKey: UI_TEXTURES.BUTTON_ACTION_PURPLE },
  summon: { x: 318, w: 204, group: 'hand', intent: 'primary', fill: THEME.ui.btnGold, stroke: THEME.text.gold, textureKey: UI_TEXTURES.BUTTON_ACTION_GOLD, costIcon: 'gold' },
  replace: { x: 528, w: 168, group: 'hand', intent: 'utility', fill: 0x0f5878, stroke: THEME.economy.gem, textureKey: UI_TEXTURES.BUTTON_ACTION_CYAN, icon: 'replace', costIcon: 'gold' },
});

const {
  CARD_W,
  CARD_H,
  CARD_Y,
  HAND_START_X,
  HAND_GAP,
  SEPARATOR_X,
  SHARED_CENTER_X,
  SHARED_GAP,
  META_Y,
  META_H,
  PREVIEW_Y,
  PREVIEW_H,
  PREVIEW_TEXT_PAD,
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

    const handGap = HAND_GAP;
    const startX = HAND_START_X;

    hand.cards.forEach((card, i) => {
      const x = startX + i * (CARD_W + handGap);
      this.cardObjects.push(this._drawCard(x, CARD_Y, card));
    });

    const sepX = SEPARATOR_X;
    const sep = this.scene.add.graphics().setDepth(12);
    sep.lineStyle(1, 0x2d6688, 0.9);
    sep.lineBetween(sepX, META_Y - 8, sepX, CARD_Y + 34);
    this.sharedObjects.push([sep]);

    const sharedCardW = Math.floor(CARD_W * SHARED_SCALE);
    const sharedGap = SHARED_GAP;
    const sharedTotal = sharedCards.cards.length * (sharedCardW + sharedGap) - sharedGap;
    const sharedCenterX = SHARED_CENTER_X;
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

  renderButtons(drawCost, replaceCost, summonPreview = null, magicSkillName = null) {
    Object.values(this._buttons).forEach(obj => { if (obj?.active) obj.destroy(); });
    this._buttons = {};

    const summonPreviewObjects = summonPreview
      ? this._drawSummonPreview(421, 430, summonPreview)
      : [];

    let magicPreview = null;
    let magicPreviewBg = null;
    if (magicSkillName) {
      [magicPreviewBg, magicPreview] = this._drawPreviewStrip(112, 184, magicSkillName, '#dca7ff', 10);
    }

    const magicGroup = this._drawActionGroupBackplate(ACTION_GROUP_SPECS.magic);
    const handGroup = this._drawActionGroupBackplate(ACTION_GROUP_SPECS.hand);
    const magicBtn = this._drawActionButton(ACTION_BUTTON_SPECS.magic, '마법 발동');
    const summonBtn = this._drawActionButton(ACTION_BUTTON_SPECS.summon, `${drawCost}`);
    const replaceBtn = this._drawActionButton(ACTION_BUTTON_SPECS.replace, `${replaceCost}`);

    this._buttons = { summonBtn, magicBtn, replaceBtn, magicGroup, handGroup, magicPreviewBg, magicPreview };
    summonPreviewObjects.forEach((object, index) => { this._buttons[`summonDecision${index}`] = object; });
    return { summonBtn, magicBtn, replaceBtn };
  }

  _drawLabelPill(x, y, w, label, color, depth = 12) {
    const bg = this.scene.add.rectangle(x, y, w, META_H, 0x08131f, 0.92)
      .setDepth(depth)
      .setStrokeStyle(1, 0x2d6688, 0.7);
    const text = this.scene.add.text(x, y + CARD_LAYOUT.ACTION_TEXT_Y_OFFSET, label, {
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
      wordWrap: { width: w - PREVIEW_TEXT_PAD },
    }).setOrigin(0.5).setDepth(13);
    return [bg, text];
  }

  _drawSummonPreview(x, w, preview) {
    const bg = this.scene.add.rectangle(x, PREVIEW_Y, w, PREVIEW_H, 0x091421, 0.97)
      .setDepth(12)
      .setStrokeStyle(1, 0xa67a32, 0.85);
    const suitColor = SUIT_COLORS[preview.suit] ?? 0xffffff;
    const unitFrame = this.scene.add.circle(x - 184, PREVIEW_Y, 10, suitColor, 0.13)
      .setDepth(13)
      .setStrokeStyle(1, suitColor, 0.72);
    const towerTexture = getTowerTextureKey(preview.suit);
    const unit = this.scene.textures?.exists?.(towerTexture) && this.scene.add.image
      ? this.scene.add.image(x - 184, PREVIEW_Y, towerTexture).setDisplaySize(18, 18).setDepth(14)
      : this.scene.add.circle(x - 184, PREVIEW_Y, 6, suitColor, 0.95).setDepth(14);
    const hand = this.scene.add.text(x - 160, PREVIEW_Y, preview.hand, {
      fontSize: '12px', color: '#ffcf7e', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2, align: 'center',
    }).setOrigin(0, 0.5).setDepth(13);
    const divider = this.scene.add.rectangle(x + 105, PREVIEW_Y, 1, PREVIEW_H - 6, 0x40546d, 0.9).setDepth(13);
    const suit = this.scene.add.text(x + 150, PREVIEW_Y - 1, SUIT_ICONS[preview.suit] ?? '', {
      fontSize: '19px', color: `#${suitColor.toString(16).padStart(6, '0')}`,
      stroke: '#000000', strokeThickness: 2, align: 'center',
    }).setOrigin(0.5).setDepth(13);
    return [bg, unitFrame, unit, hand, divider, suit];
  }

  _drawActionGroupBackplate(group) {
    return this.scene.add.rectangle(group.x, ACTION_Y, group.w, ACTION_H + 12, group.fill, 0.42)
      .setDepth(11)
      .setStrokeStyle(1, group.stroke, 0.38);
  }

  _drawActionButton(spec, label) {
    const { x, w, fill, stroke, textureKey, icon: iconType, costIcon } = spec;
    const hasTexture = textureKey && this.scene.textures?.exists?.(textureKey) && this.scene.add.image;
    const bg = hasTexture
      ? this.scene.add.image(x, ACTION_Y, textureKey)
        .setDepth(12)
        .setDisplaySize(w + CARD_LAYOUT.ACTION_TEXTURE_PAD_X, ACTION_H + 16)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.98)
      : this.scene.add.rectangle(x, ACTION_Y, w, ACTION_H, fill, 0.95)
        .setDepth(12)
        .setStrokeStyle(2, stroke, 0.9)
        .setInteractive({ useHandCursor: true });
    const hasReplaceIcon = iconType === 'replace';
    const hasGoldCost = costIcon === 'gold';
    const icon = hasReplaceIcon ? this._drawReplaceButtonIcon(x + (hasGoldCost ? -20 : -25), ACTION_Y) : null;
    const goldIcon = hasGoldCost ? this._drawGoldCostIcon(x + (hasReplaceIcon ? 0 : -14), ACTION_Y) : null;
    const textX = x + (hasReplaceIcon ? 20 : hasGoldCost ? 14 : 0);
    const text = this.scene.add.text(textX, ACTION_Y + CARD_LAYOUT.ACTION_TEXT_Y_OFFSET, label, {
      fontSize: spec.intent === 'primary' ? '14px' : '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(13);
    bg.on('pointerover', () => {
      if (hasTexture) bg.setAlpha(1);
      else bg.setFillStyle(fill, 1);
    });
    bg.on('pointerout', () => {
      if (hasTexture) bg.setAlpha(0.98);
      else bg.setFillStyle(fill, 0.95);
    });
    text.setInteractive({ useHandCursor: true });
    text.on('pointerover', () => bg.emit('pointerover'));
    text.on('pointerout', () => bg.emit('pointerout'));
    text.on('pointerdown', () => bg.emit('pointerdown'));
    bg.destroy = ((originalDestroy) => function (...args) {
      if (text?.active) text.destroy();
      if (icon?.active) icon.destroy();
      if (goldIcon?.active) goldIcon.destroy();
      return originalDestroy.apply(this, args);
    })(bg.destroy);
    return bg;
  }

  _drawReplaceButtonIcon(x, y) {
    const icon = this.scene.add.graphics().setDepth(13);
    icon.lineStyle(1.5, 0xffffff, 0.95);
    icon.strokeRoundedRect(x - 11, y - 8, 9, 12, 1);
    icon.strokeRoundedRect(x - 6, y - 5, 9, 12, 1);
    icon.beginPath();
    icon.moveTo(x - 12, y + 9);
    icon.lineTo(x + 8, y + 9);
    icon.lineTo(x + 4, y + 5);
    icon.moveTo(x + 8, y + 9);
    icon.lineTo(x + 4, y + 13);
    icon.strokePath();
    return icon;
  }

  _drawGoldCostIcon(x, y) {
    if (this.scene.textures?.exists?.(UI_TEXTURES.RESOURCE_GOLD) && this.scene.add.image) {
      return this.scene.add.image(x, y, UI_TEXTURES.RESOURCE_GOLD)
        .setDisplaySize(15, 15)
        .setDepth(13);
    }
    return this.scene.add.circle(x, y, 7, THEME.text.gold, 0.95)
      .setDepth(13)
      .setStrokeStyle(1, 0xffffff, 0.65);
  }
}
