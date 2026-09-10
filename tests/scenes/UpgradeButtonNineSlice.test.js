import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

describe('UIScene upgrade button nine-slice usage', () => {
  it('never stretches the legacy generated upgrade button image as the background', () => {
    const src = read('../../src/scenes/UIScene.js');
    const start = src.indexOf('_drawUpgradeButton(x, y, width, label, fill, stroke, onClick, options = {}) {');
    const method = src.slice(start, src.indexOf('_showTutorial(', start));

    expect(method).toContain('createNineSlice(this, x, y, width + 24, 34, UI_TEXTURES.STRIP_FRAME_9S');
    expect(method).not.toMatch(/this\.add\.image\(x, y, textureKey\)/);
    expect(method).not.toContain('_getUpgradeButtonTexture');
    expect(method).toContain('this.add.rectangle(x, y, width, 24, fill, 0.94)');
  });

  it('removes the now-unused legacy texture selector', () => {
    expect(read('../../src/scenes/UIScene.js')).not.toContain('_getUpgradeButtonTexture');
  });
});
