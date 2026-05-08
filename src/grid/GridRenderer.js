import { CELL_SIZE, GRID_COLS, GRID_ROWS, GRID_OFFSET_X, GRID_OFFSET_Y, CELL_BLOCKED } from './Grid.js';

export default class GridRenderer {
  constructor(scene, grid) {
    this.scene = scene;
    this.grid = grid;
    this.graphics = scene.add.graphics();
    this.draw();
  }

  draw() {
    const g = this.graphics;
    g.clear();

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = GRID_OFFSET_X + col * CELL_SIZE;
        const y = GRID_OFFSET_Y + row * CELL_SIZE;
        const cellType = this.grid.getCell(col, row);

        if (cellType === CELL_BLOCKED) {
          g.fillStyle(0x334455, 1);
          g.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        } else {
          g.lineStyle(1, 0x2a3a4a, 0.5);
          g.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }

  refresh() {
    this.draw();
  }
}
