import { describe, expect, it, vi } from 'vitest';
import {
  NINE_SLICE_MARGIN,
  NINE_SLICE_MIN,
  meetsStripMinimum,
  meetsPanelMinimum,
  createNineSlice,
} from '../../src/ui/NineSlice.js';

function makeScene({ hasFactory = true, hasTexture = true } = {}) {
  const nineslice = vi.fn(() => ({
    setOrigin: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
  }));
  return {
    add: hasFactory ? { nineslice } : {},
    textures: { exists: vi.fn(() => hasTexture) },
    _nineslice: nineslice,
  };
}

describe('NineSlice margins and minimums', () => {
  it('defines exact strip margins and minimum size', () => {
    expect(NINE_SLICE_MARGIN.STRIP).toEqual({ left: 32, right: 32, top: 12, bottom: 12 });
    expect(NINE_SLICE_MIN.STRIP).toEqual({ width: 64, height: 24 });
  });

  it('defines exact panel margins and minimum size', () => {
    expect(NINE_SLICE_MARGIN.PANEL).toEqual({ left: 36, right: 36, top: 36, bottom: 36 });
    expect(NINE_SLICE_MIN.PANEL).toEqual({ width: 72, height: 72 });
  });

  it('accepts and rejects strip and panel dimensions at their boundaries', () => {
    expect(meetsStripMinimum(64, 24)).toBe(true);
    expect(meetsStripMinimum(63, 24)).toBe(false);
    expect(meetsStripMinimum(64, 23)).toBe(false);
    expect(meetsPanelMinimum(72, 72)).toBe(true);
    expect(meetsPanelMinimum(71, 72)).toBe(false);
    expect(meetsPanelMinimum(72, 71)).toBe(false);
  });
});

describe('createNineSlice', () => {
  it('calls the native nineslice factory in Phaser argument order', () => {
    const scene = makeScene();
    const margin = { left: 1, right: 2, top: 3, bottom: 4 };

    createNineSlice(scene, 10, 20, 30, 40, 'tex-key', margin, 7);

    expect(scene._nineslice).toHaveBeenCalledWith(
      10, 20, 'tex-key', undefined,
      30, 40,
      1, 2, 3, 4,
    );
  });

  it('centers origin and applies depth without using an image stretch', () => {
    const scene = makeScene();
    const image = vi.fn();
    scene.add.image = image;

    const ns = createNineSlice(scene, 0, 0, 10, 10, 'tex-key', { left: 1, right: 1, top: 1, bottom: 1 }, 5);

    expect(ns.setOrigin).toHaveBeenCalledWith(0.5);
    expect(ns.setDepth).toHaveBeenCalledWith(5);
    expect(image).not.toHaveBeenCalled();
    expect(ns.setDisplaySize).toBeUndefined();
  });

  it('returns null when factory or texture is unavailable', () => {
    const margin = { left: 1, right: 1, top: 1, bottom: 1 };
    expect(createNineSlice(makeScene({ hasFactory: false }), 0, 0, 10, 10, 'tex-key', margin, 1)).toBeNull();
    expect(createNineSlice(makeScene({ hasTexture: false }), 0, 0, 10, 10, 'tex-key', margin, 1)).toBeNull();
  });

  it('skips the factory when strip dimensions are below its margins', () => {
    const scene = makeScene();
    const margin = NINE_SLICE_MARGIN.STRIP;

    expect(createNineSlice(scene, 0, 0, 63, 24, 'strip', margin, 1)).toBeNull();
    expect(createNineSlice(scene, 0, 0, 64, 23, 'strip', margin, 1)).toBeNull();
    expect(scene._nineslice).not.toHaveBeenCalled();
  });

  it('skips the factory when panel dimensions are below its margins', () => {
    const scene = makeScene();
    const margin = NINE_SLICE_MARGIN.PANEL;

    expect(createNineSlice(scene, 0, 0, 71, 72, 'panel', margin, 1)).toBeNull();
    expect(createNineSlice(scene, 0, 0, 72, 71, 'panel', margin, 1)).toBeNull();
    expect(scene._nineslice).not.toHaveBeenCalled();
  });
});
