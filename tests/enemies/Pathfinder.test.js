import { describe, it, expect } from 'vitest';
import Pathfinder from '../../src/enemies/Pathfinder.js';
import Grid, { CELL_UNIT } from '../../src/grid/Grid.js';

describe('Pathfinder', () => {
  it('직선 경로 찾기', () => {
    const grid = new Grid();
    const pf = new Pathfinder(grid);
    const path = pf.findPath(0, 0, 0, 3);
    expect(path).not.toBeNull();
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toEqual({ col: 0, row: 3 });
  });

  it('장애물 우회', () => {
    const grid = new Grid();
    for (let r = 0; r < 5; r++) grid.setCell(1, r, CELL_UNIT);
    const pf = new Pathfinder(grid);
    const path = pf.findPath(0, 0, 2, 0);
    expect(path).not.toBeNull();
    // Verify path avoids all blocked cells
    for (const step of path) {
      expect(grid.isWalkable(step.col, step.row)).toBe(true);
    }
  });

  it('경로 없으면 null', () => {
    const grid = new Grid();
    for (let c = 0; c < 10; c++) grid.setCell(c, 5, CELL_UNIT);
    const pf = new Pathfinder(grid);
    const path = pf.findPath(0, 0, 0, 6);
    expect(path).toBeNull();
  });
});
