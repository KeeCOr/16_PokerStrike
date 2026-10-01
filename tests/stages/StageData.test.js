import { describe, expect, it } from 'vitest';
import { ENEMY_TYPE } from '../../src/enemies/EnemyData.js';
import { STAGES } from '../../src/stages/StageData.js';

describe('StageData', () => {
  it('spawns at least one boss in every final stage wave', () => {
    for (const stage of STAGES) {
      const finalWave = stage.waves.at(-1);
      const bossGroup = finalWave.enemies.find(group => group.type === ENEMY_TYPE.BOSS);

      expect(bossGroup, `stage ${stage.id} final wave has no boss`).toBeDefined();
      expect(bossGroup.count).toBeGreaterThan(0);
    }
  });
});
