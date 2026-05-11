export const CELL_SIZE = 80;
export const GRID_COLS = 7;
export const GRID_ROWS = 9;
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 960;
export const CELL_EMPTY = 0;
export const CELL_BLOCKED = 1;
export const CELL_UNIT = 2;

export const GRID_OFFSET_X = (GAME_WIDTH - GRID_COLS * CELL_SIZE) / 2; // 20
export const GRID_OFFSET_Y = 20;
// Bottom of grid → top of UI panel
export const PANEL_Y = GRID_OFFSET_Y + GRID_ROWS * CELL_SIZE + 4; // 744

export default class Grid {
  constructor() {
    this.cells = Array.from({ length: GRID_ROWS }, () =>
      Array(GRID_COLS).fill(CELL_EMPTY)
    );
  }

  isInBounds(col, row) {
    return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
  }

  isWalkable(col, row) {
    if (!this.isInBounds(col, row)) return false;
    return this.cells[row][col] === CELL_EMPTY;
  }

  setCell(col, row, type) {
    if (this.isInBounds(col, row)) this.cells[row][col] = type;
  }

  getCell(col, row) {
    if (!this.isInBounds(col, row)) return null;
    return this.cells[row][col];
  }

  cellToWorld(col, row) {
    return {
      x: GRID_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2,
      y: GRID_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2,
    };
  }

  worldToCell(x, y) {
    return {
      col: Math.floor((x - GRID_OFFSET_X) / CELL_SIZE),
      row: Math.floor((y - GRID_OFFSET_Y) / CELL_SIZE),
    };
  }
}
