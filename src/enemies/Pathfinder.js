import { GRID_COLS, GRID_ROWS } from '../grid/Grid.js';

export default class Pathfinder {
  constructor(grid) {
    this.grid = grid;
  }

  findPath(startCol, startRow, endCol, endRow) {
    const key = (c, r) => `${c},${r}`;
    const heuristic = (c, r) => Math.abs(c - endCol) + Math.abs(r - endRow);

    const open = new Map();
    const closed = new Set();
    const cameFrom = new Map();
    const gScore = new Map();

    const startKey = key(startCol, startRow);
    open.set(startKey, { col: startCol, row: startRow, f: heuristic(startCol, startRow) });
    gScore.set(startKey, 0);

    const dirs = [
      { dc: 0, dr: -1 }, { dc: 0, dr: 1 },
      { dc: -1, dr: 0 }, { dc: 1, dr: 0 },
    ];

    while (open.size > 0) {
      let currentKey = null;
      let lowestF = Infinity;
      for (const [k, node] of open) {
        if (node.f < lowestF) { lowestF = node.f; currentKey = k; }
      }

      const current = open.get(currentKey);
      open.delete(currentKey);

      if (current.col === endCol && current.row === endRow) {
        return this._reconstructPath(cameFrom, currentKey);
      }

      closed.add(currentKey);

      for (const { dc, dr } of dirs) {
        const nc = current.col + dc;
        const nr = current.row + dr;
        const nk = key(nc, nr);

        if (closed.has(nk)) continue;
        if (!this.grid.isInBounds(nc, nr)) continue;
        if (!this.grid.isWalkable(nc, nr) && !(nc === endCol && nr === endRow)) continue;

        const tentativeG = (gScore.get(currentKey) || 0) + 1;
        if (tentativeG < (gScore.get(nk) ?? Infinity)) {
          cameFrom.set(nk, currentKey);
          gScore.set(nk, tentativeG);
          open.set(nk, { col: nc, row: nr, f: tentativeG + heuristic(nc, nr) });
        }
      }
    }

    return null;
  }

  _reconstructPath(cameFrom, endKey) {
    const path = [];
    let current = endKey;

    // Add the end node
    const [endCol, endRow] = endKey.split(',').map(Number);
    path.push({ col: endCol, row: endRow });

    // Trace back to start
    while (cameFrom.has(current)) {
      current = cameFrom.get(current);
      const [col, row] = current.split(',').map(Number);
      path.unshift({ col, row });
    }

    return path;
  }
}
