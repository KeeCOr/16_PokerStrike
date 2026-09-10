export const NINE_SLICE_MARGIN = Object.freeze({
  STRIP: Object.freeze({ left: 32, right: 32, top: 12, bottom: 12 }),
  PANEL: Object.freeze({ left: 36, right: 36, top: 36, bottom: 36 }),
});

export const NINE_SLICE_MIN = Object.freeze({
  STRIP: Object.freeze({ width: 64, height: 24 }),
  PANEL: Object.freeze({ width: 72, height: 72 }),
});

export function meetsStripMinimum(width, height) {
  return width >= NINE_SLICE_MIN.STRIP.width && height >= NINE_SLICE_MIN.STRIP.height;
}

export function meetsPanelMinimum(width, height) {
  return width >= NINE_SLICE_MIN.PANEL.width && height >= NINE_SLICE_MIN.PANEL.height;
}

/**
 * Creates a native Phaser NineSlice game object, or returns null when the
 * runtime (or a test mock) doesn't support `scene.add.nineslice` or the
 * texture isn't loaded. Callers must fall back to their legacy procedural
 * drawing in that case, never both at once.
 */
export function createNineSlice(scene, x, y, width, height, textureKey, margin, depth) {
  const minWidth = (margin?.left ?? 0) + (margin?.right ?? 0);
  const minHeight = (margin?.top ?? 0) + (margin?.bottom ?? 0);
  if (width < minWidth || height < minHeight) return null;

  const hasFactory = typeof scene?.add?.nineslice === 'function';
  const hasTexture = !!scene?.textures?.exists?.(textureKey);
  if (!hasFactory || !hasTexture) return null;

  const ns = scene.add.nineslice(
    x, y, textureKey, undefined,
    width, height,
    margin.left, margin.right, margin.top, margin.bottom,
  );
  ns.setOrigin(0.5);
  if (depth !== undefined) ns.setDepth(depth);
  return ns;
}
