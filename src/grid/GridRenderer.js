import { CELL_SIZE, GRID_COLS, GRID_ROWS, GRID_OFFSET_X, GRID_OFFSET_Y, CELL_BLOCKED } from './Grid.js';
import { ENV_TEXTURES } from '../assets/art/AssetKeys.js';

export const GRID_RENDERER_STYLE = {
  WALKABLE_TILE_ALPHA: 0.72,
  WALKABLE_OVERLAY_COLOR: 0x020610,
  WALKABLE_OVERLAY_ALPHA: 0.52,
  BUILDABLE_EFFECT_COLOR: 0x37e6ff,
  BUILDABLE_EFFECT_FILL_ALPHA: 0.035,
  BUILDABLE_EFFECT_LINE_ALPHA: 0.28,
  BUILDABLE_EFFECT_CORNER_ALPHA: 0.62,
};

export default class GridRenderer {
  constructor(scene, grid) {
    this.scene = scene;
    this.grid = grid;
    this.graphics = scene.add.graphics();
    this.buildableEffects = scene.add.graphics().setDepth(0.4).setAlpha(0.78);
    this.tileImages = [];
    this.scene.tweens?.add?.({
      targets: this.buildableEffects,
      alpha: 0.44,
      duration: 1150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.draw();
  }

  draw() {
    const g = this.graphics;
    const fx = this.buildableEffects;
    g.clear();
    fx.clear();
    this.tileImages.forEach(img => { if (img?.active) img.destroy(); });
    this.tileImages = [];

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = GRID_OFFSET_X + col * CELL_SIZE;
        const y = GRID_OFFSET_Y + row * CELL_SIZE;
        const cellType = this.grid.getCell(col, row);
        const cx = x + CELL_SIZE / 2;
        const cy = y + CELL_SIZE / 2;

        if (cellType === CELL_BLOCKED) {
          const key = (col + row) % 2 === 0 ? ENV_TEXTURES.OBSTACLE_STONE : ENV_TEXTURES.OBSTACLE_BARRICADE;
          if (this.scene.textures?.exists?.(key) && this.scene.add.image) {
            this.tileImages.push(this.scene.add.image(cx, cy, key)
              .setDepth(0)
              .setDisplaySize(CELL_SIZE + 6, CELL_SIZE + 6));
          } else {
            g.fillStyle(0x334455, 1);
            g.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          }
        } else {
          const key = (col + row) % 2 === 0 ? ENV_TEXTURES.BOARD_TILE : ENV_TEXTURES.BOARD_TILE_ALT;
          if (this.scene.textures?.exists?.(key) && this.scene.add.image) {
            this.tileImages.push(this.scene.add.image(cx, cy, key)
              .setDepth(-1)
              .setDisplaySize(CELL_SIZE + 3, CELL_SIZE + 3)
              .setAlpha(GRID_RENDERER_STYLE.WALKABLE_TILE_ALPHA));
          }
          g.fillStyle(GRID_RENDERER_STYLE.WALKABLE_OVERLAY_COLOR, GRID_RENDERER_STYLE.WALKABLE_OVERLAY_ALPHA);
          g.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          this._drawBuildableEffect(fx, x, y);
        }
        g.lineStyle(1, 0x2a3a4a, 0.42);
        g.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  refresh() {
    this.draw();
  }

  _drawBuildableEffect(g, x, y) {
    const pad = 9;
    const inner = CELL_SIZE - pad * 2;
    const corner = 15;
    const color = GRID_RENDERER_STYLE.BUILDABLE_EFFECT_COLOR;

    g.fillStyle(color, GRID_RENDERER_STYLE.BUILDABLE_EFFECT_FILL_ALPHA);
    g.fillRect(x + pad, y + pad, inner, inner);

    g.lineStyle(1, color, GRID_RENDERER_STYLE.BUILDABLE_EFFECT_LINE_ALPHA);
    g.strokeRect(x + pad, y + pad, inner, inner);

    g.lineStyle(2, color, GRID_RENDERER_STYLE.BUILDABLE_EFFECT_CORNER_ALPHA);
    g.beginPath();
    g.moveTo(x + pad, y + pad + corner);
    g.lineTo(x + pad, y + pad);
    g.lineTo(x + pad + corner, y + pad);
    g.moveTo(x + CELL_SIZE - pad - corner, y + pad);
    g.lineTo(x + CELL_SIZE - pad, y + pad);
    g.lineTo(x + CELL_SIZE - pad, y + pad + corner);
    g.moveTo(x + CELL_SIZE - pad, y + CELL_SIZE - pad - corner);
    g.lineTo(x + CELL_SIZE - pad, y + CELL_SIZE - pad);
    g.lineTo(x + CELL_SIZE - pad - corner, y + CELL_SIZE - pad);
    g.moveTo(x + pad + corner, y + CELL_SIZE - pad);
    g.lineTo(x + pad, y + CELL_SIZE - pad);
    g.lineTo(x + pad, y + CELL_SIZE - pad - corner);
    g.strokePath();
  }
}
