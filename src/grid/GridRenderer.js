import { CELL_SIZE, GRID_COLS, GRID_ROWS, GRID_OFFSET_X, GRID_OFFSET_Y, CELL_BLOCKED } from './Grid.js';
import { ENV_TEXTURES } from '../assets/art/AssetKeys.js';

export default class GridRenderer {
  constructor(scene, grid) {
    this.scene = scene;
    this.grid = grid;
    this.graphics = scene.add.graphics();
    this.tileImages = [];
    this.draw();
  }

  draw() {
    const g = this.graphics;
    g.clear();
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
              .setAlpha(0.84));
          }
          g.fillStyle(0x030914, 0.24);
          g.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        }
        g.lineStyle(1, 0x2a3a4a, 0.42);
        g.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  refresh() {
    this.draw();
  }
}
