import { describe, expect, it } from 'vitest';
import EnemyManager from '../../src/enemies/EnemyManager.js';
import Grid, { CELL_UNIT } from '../../src/grid/Grid.js';

function createScene() {
  const grid = new Grid();
  return {
    grid,
    unitManager: {
      units: [],
      removeUnit(unit) {
        this.units = this.units.filter(u => u !== unit);
        grid.setCell(unit.col, unit.row, 0);
      },
    },
  };
}

function createEnemy(scene, col, row) {
  const pos = scene.grid.cellToWorld(col, row);
  return {
    col,
    row,
    x: pos.x,
    y: pos.y,
    speed: 220,
    atk: 10,
    atkCooldown: 1000,
    targetUnit: null,
    sprite: { setPosition(x, y) { this.x = x; this.y = y; } },
  };
}

describe('EnemyManager blocked path handling', () => {
  it('does not move a no-path enemy into a blocked unit cell', () => {
    const scene = createScene();
    const manager = new EnemyManager(scene, 8);
    const blockingUnit = {
      col: 3,
      row: 2,
      hp: 100,
      takeDamage() { return false; },
    };
    scene.unitManager.units = [blockingUnit];
    scene.grid.setCell(3, 2, CELL_UNIT);

    const enemy = createEnemy(scene, 3, 1);
    enemy.targetUnit = blockingUnit;

    const blockedPos = scene.grid.cellToWorld(3, 2);
    const blockedTop = blockedPos.y - 38;

    manager._handleNoPathEnemy(enemy, 0, 1000);

    expect(enemy.y).toBeLessThan(blockedTop);
  });

  it('does not move a diagonally approaching no-path enemy into a blocked unit cell', () => {
    const scene = createScene();
    const manager = new EnemyManager(scene, 8);
    const blockingUnit = {
      col: 3,
      row: 2,
      hp: 100,
      takeDamage() { return false; },
    };
    scene.unitManager.units = [blockingUnit];
    scene.grid.setCell(3, 2, CELL_UNIT);

    const enemy = createEnemy(scene, 2, 1);
    enemy.targetUnit = blockingUnit;

    manager._handleNoPathEnemy(enemy, 0, 1000);

    const cell = scene.grid.worldToCell(enemy.x, enemy.y);
    expect(cell).not.toEqual({ col: 3, row: 2 });
  });
});
