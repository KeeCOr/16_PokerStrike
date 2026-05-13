import { SKILLS } from '../data/skills.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';
import { GRID_COLS, GRID_ROWS } from '../grid/Grid.js';

export default class MagicManager {
  constructor(scene) {
    this.scene = scene;
  }

  cast(rank, suit) {
    const skill = SKILLS[rank];
    if (!skill) return;

    const scene = this.scene;
    const enemies = scene.enemyManager.getAll();
    const eco = scene.economyManager;

    switch (skill.effect) {
      case 'killAll':
        [...enemies].forEach(e => {
          if (!e.magicImmune) scene.enemyManager.removeEnemy(e);
        });
        break;

      case 'massiveDamage':
        [...enemies].forEach(e => {
          if (!e.magicImmune) {
            const dead = e.takeDamage(skill.damage);
            if (dead) scene.enemyManager.removeEnemy(e);
          }
        });
        break;

      case 'healBase':
        scene.baseHp = Math.min(100, scene.baseHp + skill.amount);
        scene.registry.set('baseHp', scene.baseHp);
        break;

      case 'buffSuit':
        scene.unitManager.units
          .filter(u => u.suit === suit)
          .forEach(u => {
            u.stats.atk = Math.floor(u.stats.atk * skill.multiplier);
            scene.time.delayedCall(skill.duration, () => {
              u.stats.atk = Math.floor(u.stats.atk / skill.multiplier);
            });
          });
        break;

      case 'slowAll':
        [...enemies].forEach(e => {
          if (!e.magicImmune) {
            const originalSpeed = e.speed;
            e.speed = Math.max(e.speed * (1 - skill.slowAmount), 10);
            scene.time.delayedCall(skill.duration, () => {
              e.speed = originalSpeed;
            });
          }
        });
        break;

      case 'randomUnit': {
        const emptyCells = [];
        for (let r = 2; r < GRID_ROWS - 2; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (scene.grid.isWalkable(c, r)) emptyCells.push({ col: c, row: r });
          }
        }
        if (emptyCells.length > 0) {
          const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          scene.unitManager.placeUnit(cell.col, cell.row, HAND_RANK.THREE_OF_A_KIND, suit, 1);
          scene.enemyManager.recalculateAllPaths();
        }
        break;
      }

      case 'gainGold':
        eco.addGold(skill.amount);
        break;

      case 'resetDrawCost':
        eco.summonCount = 0;
        break;

      case 'refreshShared':
        scene.events.emit('refreshSharedCards');
        break;

      case 'buffAllTowers':
        scene.unitManager.units.forEach(u => {
          u.stats.atkSpeed = +(u.stats.atkSpeed * skill.multiplier).toFixed(3);
          scene.time.delayedCall(skill.duration, () => {
            u.stats.atkSpeed = +(u.stats.atkSpeed / skill.multiplier).toFixed(3);
          });
        });
        break;
    }
  }
}
