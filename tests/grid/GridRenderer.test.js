import { describe, expect, it } from 'vitest';
import { GRID_RENDERER_STYLE } from '../../src/grid/GridRenderer.js';

describe('GridRenderer style', () => {
  it('keeps walkable cells visibly darker than the PNG tile base', () => {
    expect(GRID_RENDERER_STYLE.WALKABLE_TILE_ALPHA).toBeLessThanOrEqual(0.72);
    expect(GRID_RENDERER_STYLE.WALKABLE_OVERLAY_COLOR).toBe(0x020610);
    expect(GRID_RENDERER_STYLE.WALKABLE_OVERLAY_ALPHA).toBeGreaterThanOrEqual(0.5);
  });
});
