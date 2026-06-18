import { describe, expect, it } from 'vitest';
import { GRID_RENDERER_STYLE } from '../../src/grid/GridRenderer.js';

describe('GridRenderer style', () => {
  it('lets loaded PNG board tiles carry the cell texture instead of covering them with code fill', () => {
    expect(GRID_RENDERER_STYLE.WALKABLE_TILE_ALPHA).toBeGreaterThanOrEqual(0.95);
    expect(GRID_RENDERER_STYLE.WALKABLE_TILE_TEXTURES).toEqual(['env-board-tile-move', 'env-board-tile-alt-move']);
    expect(GRID_RENDERER_STYLE.WALKABLE_OVERLAY_COLOR).toBe(0x020610);
    expect(GRID_RENDERER_STYLE.WALKABLE_OVERLAY_ALPHA).toBe(0);
    expect(GRID_RENDERER_STYLE.GRID_LINE_ALPHA_WITH_TILE).toBeLessThan(GRID_RENDERER_STYLE.GRID_LINE_ALPHA_FALLBACK);
  });

  it('uses only a weak outline for random summonable cells', () => {
    expect(GRID_RENDERER_STYLE.BUILDABLE_EFFECT_ENABLED).toBe(true);
    expect(GRID_RENDERER_STYLE.BUILDABLE_EFFECT_FILL_ALPHA).toBe(0);
    expect(GRID_RENDERER_STYLE.BUILDABLE_EFFECT_LINE_ALPHA).toBeLessThanOrEqual(0.16);
    expect(GRID_RENDERER_STYLE.BUILDABLE_EFFECT_CORNER_ALPHA).toBeLessThanOrEqual(0.24);
  });
});


