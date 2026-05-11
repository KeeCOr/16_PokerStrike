import { GRID_ROWS } from '../grid/Grid.js';

export default class Pathfinder {
  constructor(grid) {
    this.grid = grid;
  }

  // Find shortest path to a specific cell (endCol, endRow)
  findPath(startCol, startRow, endRow, endCol = null) {
    const key = (c, r) => `${c},${r}`;
    const heuristic = endCol !== null
      ? (c, r) => Math.abs(r - endRow) + Math.abs(c - endCol)
      : (c, r) => Math.abs(r - endRow);

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

      // Goal: reach target cell
      const atGoal = endCol !== null
        ? current.row === endRow && current.col === endCol
        : current.row === endRow;
      if (atGoal) {
        return this._reconstructPath(cameFrom, currentKey);
      }

      closed.add(currentKey);

      for (const { dc, dr } of dirs) {
        const nc = current.col + dc;
        const nr = current.row + dr;
        const nk = key(nc, nr);

        if (closed.has(nk)) continue;
        if (!this.grid.isInBounds(nc, nr)) continue;
        // Allow the goal cell even if marked non-walkable
        const isGoal = endCol !== null ? nr === endRow && nc === endCol : nr === endRow;
        if (!this.grid.isWalkable(nc, nr) && !isGoal) continue;

        // Penalise moving backwards (away from base)
        const stepCost = dr === -1 ? 5 : 1;
        const tentativeG = (gScore.get(currentKey) || 0) + stepCost;
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

    const [endCol, endRow] = endKey.split(',').map(Number);
    path.push({ col: endCol, row: endRow });

    while (cameFrom.has(current)) {
      current = cameFrom.get(current);
      const [col, row] = current.split(',').map(Number);
      path.unshift({ col, row });
    }

    return path;
  }
}
