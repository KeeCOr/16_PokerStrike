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
});
