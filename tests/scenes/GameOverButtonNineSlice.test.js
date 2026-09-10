import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

describe('GameScene game-over button nine-slice usage', () => {
  it('never stretches the legacy action/danger texture as the button background', () => {
    const src = read('../../src/scenes/GameScene.js');
    const start = src.indexOf('_drawGameOverButton(x, y, label, textureKey, onClick, options = {}) {');
    const method = src.slice(start, src.indexOf('_stageCleared(', start));

    expect(method).toContain('createNineSlice(this, x, y, buttonW, buttonH, UI_TEXTURES.STRIP_FRAME_9S');
    expect(method).not.toMatch(/this\.add\.image\(x, y, textureKey\)/);
    expect(method).not.toMatch(/\.setDisplaySize\(buttonW, buttonH\)/);
    expect(method).toContain('this.add.rectangle(x, y, buttonW, buttonH');
  });
});
