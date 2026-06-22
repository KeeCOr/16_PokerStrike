import { describe, expect, it } from 'vitest';
import { CARD_LAYOUT } from '../../src/ui/CardUI.js';
import { PANEL_Y } from '../../src/grid/Grid.js';

describe('CardUI layout', () => {
  it('reserves separate rows for tabs, labels, cards, previews, and buttons', () => {
    const tabCenterY = PANEL_Y + 18;
    const tabBottom = tabCenterY + 16;
    const metaTop = CARD_LAYOUT.META_Y - CARD_LAYOUT.META_H / 2;
    const metaBottom = CARD_LAYOUT.META_Y + CARD_LAYOUT.META_H / 2;
    const cardTop = CARD_LAYOUT.CARD_Y - CARD_LAYOUT.CARD_H / 2;
    const cardBottom = CARD_LAYOUT.CARD_Y + CARD_LAYOUT.CARD_H / 2;
    const previewTop = CARD_LAYOUT.PREVIEW_Y - CARD_LAYOUT.PREVIEW_H / 2;
    const previewBottom = CARD_LAYOUT.PREVIEW_Y + CARD_LAYOUT.PREVIEW_H / 2;
    const buttonTop = CARD_LAYOUT.ACTION_Y - CARD_LAYOUT.ACTION_H / 2;

    expect(metaTop).toBeGreaterThanOrEqual(tabBottom + 2);
    expect(metaBottom).toBeLessThanOrEqual(cardTop - 2);
    expect(previewTop).toBeGreaterThanOrEqual(cardBottom + 4);
    expect(previewBottom).toBeLessThanOrEqual(buttonTop - 4);
  });

  it('uses only suit icons for card suit labels and emphasizes value/icon typography', () => {
    expect(CARD_LAYOUT.SUIT_LABEL_USES_ICON_ONLY).toBe(true);
    expect(CARD_LAYOUT.VALUE_FONT).toBeGreaterThanOrEqual(26);
    expect(CARD_LAYOUT.SUIT_MARK_FONT).toBeGreaterThanOrEqual(18);
  });

  it('keeps action button labels visually centered without leading icons', () => {
    expect(CARD_LAYOUT.ACTION_TEXT_Y_OFFSET).toBe(2);
  });
  it('keeps hand cards, separator, and shared cards in distinct readable zones', () => {
    const handRight = CARD_LAYOUT.HAND_START_X + 4 * (CARD_LAYOUT.CARD_W + CARD_LAYOUT.HAND_GAP) + CARD_LAYOUT.CARD_W / 2;
    const sharedCardW = Math.floor(CARD_LAYOUT.CARD_W * CARD_LAYOUT.SHARED_SCALE);
    const sharedTotal = 2 * sharedCardW + CARD_LAYOUT.SHARED_GAP;
    const sharedLeft = CARD_LAYOUT.SHARED_CENTER_X - sharedTotal / 2;

    expect(CARD_LAYOUT.HAND_GAP).toBeGreaterThanOrEqual(6);
    expect(handRight).toBeLessThanOrEqual(CARD_LAYOUT.SEPARATOR_X - 24);
    expect(sharedLeft).toBeGreaterThanOrEqual(CARD_LAYOUT.SEPARATOR_X + 48);
  });

  it('uses fixed preview text padding so long poker labels wrap inside strips', () => {
    expect(CARD_LAYOUT.PREVIEW_TEXT_PAD).toBeGreaterThanOrEqual(14);
    expect(CARD_LAYOUT.PREVIEW_TEXT_PAD).toBeLessThanOrEqual(24);
  });
});

