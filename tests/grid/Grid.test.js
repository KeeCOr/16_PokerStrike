import { describe, it, expect } from 'vitest';
import Grid, { CELL_EMPTY, CELL_BLOCKED, CELL_UNIT, GRID_COLS, GRID_ROWS } from '../../src/grid/Grid.js';

describe('Grid', () => {
  it('초기 셀은 모두 CELL_EMPTY', () => {
    const grid = new Grid();
    expect(grid.getCell(0, 0)).toBe(CELL_EMPTY);
    expect(grid.getCell(GRID_COLS - 1, GRID_ROWS - 1)).toBe(CELL_EMPTY);
  });

  it('범위 밖은 null', () => {
    const grid = new Grid();
    expect(grid.getCell(-1, 0)).toBeNull();
    expect(grid.getCell(GRID_COLS, 0)).toBeNull();
  });

  it('CELL_UNIT은 isWalkable false', () => {
    const grid = new Grid();
    grid.setCell(3, 5, CELL_UNIT);
    expect(grid.isWalkable(3, 5)).toBe(false);
  });

  it('CELL_EMPTY는 isWalkable true', () => {
    const grid = new Grid();
    expect(grid.isWalkable(3, 5)).toBe(true);
  });

  it('cellToWorld / worldToCell 변환', () => {
    const grid = new Grid();
    const world = grid.cellToWorld(2, 3);
    const cell = grid.worldToCell(world.x, world.y);
    expect(cell.col).toBe(2);
    expect(cell.row).toBe(3);
  });
});
