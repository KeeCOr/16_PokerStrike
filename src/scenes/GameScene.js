import Phaser from 'phaser';
import Grid, { GRID_ROWS, GRID_COLS, CELL_BLOCKED, CELL_EMPTY, CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y } from '../grid/Grid.js';
import GridRenderer from '../grid/GridRenderer.js';
import UnitManager from '../units/UnitManager.js';
import EnemyManager from '../enemies/EnemyManager.js';
import CombatManager from '../combat/CombatManager.js';
import EconomyManager from '../economy/EconomyManager.js';
import StageManager from '../stages/StageManager.js';
import MagicManager from '../magic/MagicManager.js';
import RogueliteManager from '../roguelite/RogueliteManager.js';
import { UPGRADE_POOL } from '../data/roguelite.js';
import { STAGES, STAGE_OBSTACLES } from '../stages/StageData.js';

const BASE_HP = 100;

function _upgradeTypeLabel(upgrade) {
  const typeMap = {
    unitAtk: '공격력 강화', unitHp: 'HP 강화', unitRange: '사거리 강화',
    unitAtkSpeed: '공격속도 강화', unitSlow: '감속 강화',
    unitSplashChance: '스플래시 강화', unitStunChance: '스턴 강화',
    drawCost: '경제 강화', replaceCost: '경제 강화', goldOnSummon: '골드 강화',
  };
  return typeMap[upgrade.type] ?? '강화';
}

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.startStageIndex = data?.startStageIndex ?? 0;
    this.savedUpgrades = data?.upgrades ?? [];
  }

  create() {
    this.grid = new Grid();
    this.gridRenderer = new GridRenderer(this, this.grid);
    this.unitManager = new UnitManager(this);
    this.enemyManager = new EnemyManager(this, GRID_ROWS - 1);
    this.combatManager = new CombatManager(this);
    this.economyManager = new EconomyManager();
    this.stageManager = new StageManager(this);
    this.magicManager = new MagicManager(this);
    this.rogueliteManager = new RogueliteManager();
    this.savedUpgrades.forEach(u => this.rogueliteManager.addUpgrade(u));
    this.economyManager.roguelite = this.rogueliteManager;

    this.baseHp = BASE_HP;
    this.gameOver = false;
    this._baseHpBar = null;

    this.enemyManager.onEnemyReachBase = (dmg) => {
      this.baseHp = Math.max(0, this.baseHp - dmg);
      this.registry.set('baseHp', this.baseHp);
      if (this.baseHp <= 0) this._gameOver();
    };

    this.stageManager.onWaveCleared = (waveIndex) => {
      this.registry.set('wave', waveIndex + 2);
    };

    this.stageManager.onStageCleared = (stageIndex) => {
      this._stageCleared(stageIndex);
    };

    this.stageManager.onWaveChoiceNeeded = (resumeFn) => {
      this._showWaveChoices(resumeFn);
    };

    this.economyManager.onGoldChanged = (gold) => {
      this.registry.set('gold', gold);
    };

    if (this.startStageIndex > 0) {
      this.economyManager.gold = 15 + this.startStageIndex * 5;
    }

    this.registry.set('baseHp', this.baseHp);
    this.registry.set('gold', this.economyManager.gold);
    this.registry.set('wave', 1);

    // Update base HP bar whenever baseHp registry changes
    const onBaseHpChange = () => this._drawBaseHpBar();
    this.registry.events.on('changedata-baseHp', onBaseHpChange);
    this.events.once('shutdown', () => {
      this.registry.events.off('changedata-baseHp', onBaseHpChange);
    });

    this._initMap();
    if (this.startStageIndex > 0) this._applyObstacles(this.startStageIndex);

    this.scene.launch('UIScene');

    this.unitManager.setupMergeInteraction();

    this._startCountdown(() => {
      this.stageManager.startStage(this.startStageIndex);
    });
  }

  _startCountdown(onComplete) {
    const cx = 320;
    const cy = GRID_OFFSET_Y + Math.floor(GRID_ROWS * CELL_SIZE / 2);
    const show = (text, delay, last) => {
      this.time.delayedCall(delay, () => {
        const t = this.add.text(cx, cy, text, {
          fontSize: '72px', color: '#ffdd44', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(25).setAlpha(1);
        this.tweens.add({ targets: t, alpha: 0, scaleX: 1.4, scaleY: 1.4, duration: 900, ease: 'Power2',
          onComplete: () => t.destroy() });
        if (last) this.time.delayedCall(1000, onComplete);
      });
    };
    show('3', 0, false);
    show('2', 1000, false);
    show('1', 2000, false);
    show('시작!', 3000, true);
  }

  _applyObstacles(stageIndex) {
    // 기존 장애물 초기화
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid.getCell(c, r) === CELL_BLOCKED) this.grid.setCell(c, r, CELL_EMPTY);
      }
    }
    const obstacles = STAGE_OBSTACLES[stageIndex] ?? STAGE_OBSTACLES[0];
    for (const [col, row] of obstacles) {
      this.grid.setCell(col, row, CELL_BLOCKED);
    }
    this.gridRenderer.refresh();
  }

  _initMap() {
    this._applyObstacles(0);

    // 스폰 구역 표시 (row 0, col 3)
    const spawnX = GRID_OFFSET_X + 3 * CELL_SIZE;
    const spawnY = GRID_OFFSET_Y;
    const sg = this.add.graphics().setDepth(0);
    sg.fillStyle(0xff2222, 0.25);
    sg.fillRect(spawnX + 1, spawnY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    this.add.text(spawnX + CELL_SIZE / 2, spawnY + CELL_SIZE / 2, '스폰', {
      fontSize: '9px', color: '#ff6666'
    }).setOrigin(0.5).setDepth(1);

    // 본진 표시 (row 8, 가운데 한 칸)
    const BASE_COL_IDX = Math.floor(GRID_COLS / 2);
    const baseY = GRID_OFFSET_Y + (GRID_ROWS - 1) * CELL_SIZE;
    const baseX = GRID_OFFSET_X + BASE_COL_IDX * CELL_SIZE;
    const bg = this.add.graphics().setDepth(0);
    bg.fillStyle(0x22aa44, 0.5);
    bg.fillRect(baseX + 1, baseY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    this.add.text(baseX + CELL_SIZE / 2, baseY + CELL_SIZE / 2, '본진', {
      fontSize: '11px', color: '#44ff88', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1);

    // 본진 HP 바 (본진 셀 바로 위)
    this._baseHpBar = this.add.graphics().setDepth(2);
    this._drawBaseHpBar();
  }

  _drawBaseHpBar() {
    if (!this._baseHpBar) return;
    const BASE_COL_IDX = Math.floor(GRID_COLS / 2);
    const baseX = GRID_OFFSET_X + BASE_COL_IDX * CELL_SIZE;
    const baseY = GRID_OFFSET_Y + (GRID_ROWS - 1) * CELL_SIZE;
    const barW = CELL_SIZE;
    const ratio = Math.max(0, this.baseHp / BASE_HP);
    this._baseHpBar.clear();
    this._baseHpBar.fillStyle(0x333333);
    this._baseHpBar.fillRect(baseX, baseY - 7, barW, 6);
    this._baseHpBar.fillStyle(ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff4444);
    this._baseHpBar.fillRect(baseX, baseY - 7, Math.floor(barW * ratio), 6);
  }

  _showWaveChoices(resumeFn) {
    const pool = [...UPGRADE_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    const overlay = this.add.rectangle(320, 310, 640, 620, 0x000000, 0.75).setDepth(20);
    const titleText = this.add.text(320, 60, '강화 선택', {
      fontSize: '22px', color: '#ffdd44', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    const objs = [overlay, titleText];
    pool.forEach((upgrade, i) => {
      const y = 150 + i * 130;
      const bg = this.add.rectangle(320, y, 400, 110, 0x1a2a3a).setDepth(21)
        .setInteractive({ useHandCursor: true });
      const border = this.add.rectangle(320, y, 396, 106, 0x0d1b2a).setDepth(21);
      const affectedCount = this.unitManager.units.filter(u => this.rogueliteManager.matches(upgrade, u)).length;
      const label = this.add.text(320, y - 16, upgrade.label, {
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(22);
      const typeLabel = this.add.text(320, y + 22, `${_upgradeTypeLabel(upgrade)}  (${affectedCount}마리 적용)`, {
        fontSize: '12px', color: '#88ccff'
      }).setOrigin(0.5).setDepth(22);
      objs.push(bg, border, label, typeLabel);

      bg.on('pointerover', () => {
        bg.setFillStyle(0x2a4a6a);
        border.setFillStyle(0x1a3050);
        this.unitManager.units.forEach(u => {
          if (this.rogueliteManager.matches(upgrade, u)) u.setHighlight(true);
        });
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(0x1a2a3a);
        border.setFillStyle(0x0d1b2a);
        this.unitManager.units.forEach(u => u.setHighlight(false));
      });
      bg.on('pointerdown', () => {
        this.unitManager.units.forEach(u => u.setHighlight(false));
        this.rogueliteManager.addUpgrade(upgrade);
        objs.forEach(o => o.destroy());
        resumeFn();
      });
    });
  }

  showMagicEffect(rank, skillName, description) {
    const COLORS = [
      0xcccccc, // 0 HC  - 공용 패 교체
      0xaaddff, // 1 1P  - 무료 드로우
      0xffd700, // 2 2P  - 골드 획득
      0x44ffff, // 3 3K  - 소환 지원
      0x4488ff, // 4 STR - 대지진
      0xffee44, // 5 FLU - 속성 강화
      0x44ff88, // 6 FH  - 회복
      0xff5522, // 7 4K  - 대폭발
      0xcc44ff, // 8 SF  - 절멸
    ];
    const color = COLORS[rank] ?? 0xffffff;

    // Flash overlay (game grid area only)
    const flash = this.add.rectangle(320, 380, 640, 740, color, 0.35).setDepth(18);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    // Skill name — scale up then float away
    const nameText = this.add.text(320, 340, skillName, {
      fontSize: '38px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0).setDepth(19);

    this.tweens.add({
      targets: nameText,
      alpha: 1,
      scaleX: 1.15, scaleY: 1.15,
      duration: 180,
      onComplete: () => {
        this.tweens.add({
          targets: nameText,
          alpha: 0,
          y: nameText.y - 50,
          scaleX: 0.9, scaleY: 0.9,
          duration: 600,
          delay: 400,
          ease: 'Quad.easeIn',
          onComplete: () => nameText.destroy(),
        });
      },
    });

    // Description subtitle
    if (description) {
      const descText = this.add.text(320, 400, description, {
        fontSize: '14px', color: '#ffffff',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setAlpha(0).setDepth(19);

      this.tweens.add({
        targets: descText,
        alpha: 0.9,
        duration: 200,
        delay: 100,
        onComplete: () => {
          this.tweens.add({
            targets: descText,
            alpha: 0,
            y: descText.y - 30,
            duration: 500,
            delay: 500,
            onComplete: () => descText.destroy(),
          });
        },
      });
    }
  }

  _gameOver() {
    this.gameOver = true;
    this.add.rectangle(320, 480, 640, 960, 0x000000, 0.7).setDepth(10);
    this.add.text(320, 380, 'GAME OVER', {
      fontSize: '48px', color: '#ff4444', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    const currentStage = this.stageManager.stageIndex;

    if (currentStage > 0) {
      // 현재 스테이지부터 재시작
      const continueBtn = this.add.text(320, 470, `▶  ${currentStage + 1}스테이지부터 재시작`, {
        fontSize: '18px', color: '#ffffff',
        backgroundColor: '#1a5e2a', padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
      continueBtn.on('pointerover', () => continueBtn.setStyle({ color: '#ffdd44' }));
      continueBtn.on('pointerout',  () => continueBtn.setStyle({ color: '#ffffff' }));
      continueBtn.on('pointerdown', () => {
        this.scene.stop('UIScene');
        this.scene.restart({ startStageIndex: currentStage, upgrades: this.rogueliteManager.upgrades });
      });

      // 1스테이지부터 재시작
      const restartBtn = this.add.text(320, 535, '↺  1스테이지부터 재시작', {
        fontSize: '16px', color: '#cccccc',
        backgroundColor: '#3a2a1a', padding: { x: 20, y: 8 }
      }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
      restartBtn.on('pointerover', () => restartBtn.setStyle({ color: '#ffdd44' }));
      restartBtn.on('pointerout',  () => restartBtn.setStyle({ color: '#cccccc' }));
      restartBtn.on('pointerdown', () => {
        this.scene.stop('UIScene');
        this.scene.restart();
      });
    } else {
      const restartBtn = this.add.text(320, 490, '클릭하여 재시작', {
        fontSize: '20px', color: '#ffffff'
      }).setOrigin(0.5).setDepth(11);
      this.input.once('pointerdown', () => {
        this.scene.stop('UIScene');
        this.scene.restart();
      });
    }
  }

  _stageCleared(stageIndex) {
    const isLast = stageIndex >= STAGES.length - 1;
    const overlay = this.add.rectangle(320, 480, 640, 960, 0x000000, 0.6).setDepth(10);
    const clearText = this.add.text(320, 360, `STAGE ${stageIndex + 1} CLEAR!`, {
      fontSize: '36px', color: '#ffdd44', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    const objs = [overlay, clearText];

    // 획득한 로그라이트 강화 목록 표시
    const upgrades = this.rogueliteManager.upgrades;
    if (upgrades.length > 0) {
      const buffTitle = this.add.text(320, 415, '획득한 강화:', {
        fontSize: '12px', color: '#aaddff'
      }).setOrigin(0.5).setDepth(11);
      objs.push(buffTitle);
      const labels = upgrades.map(u => u.label).join('  /  ');
      const buffList = this.add.text(320, 435, labels, {
        fontSize: '11px', color: '#88ccff', wordWrap: { width: 500 }
      }).setOrigin(0.5).setDepth(11);
      objs.push(buffList);
    }

    if (isLast) {
      const finalText = this.add.text(320, 490, '모든 스테이지 클리어!', {
        fontSize: '22px', color: '#ffffff'
      }).setOrigin(0.5).setDepth(11);
      objs.push(finalText);
    } else {
      const nextBtn = this.add.text(320, 490, '▶  다음 스테이지', {
        fontSize: '20px', color: '#ffffff',
        backgroundColor: '#1a5e2a', padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
      nextBtn.on('pointerover', () => nextBtn.setStyle({ color: '#ffdd44' }));
      nextBtn.on('pointerout', () => nextBtn.setStyle({ color: '#ffffff' }));
      nextBtn.on('pointerdown', () => {
        objs.forEach(o => o.destroy());
        this.unitManager.clearAll();
        const next = stageIndex + 1;
        this._applyObstacles(next);
        this.enemyManager.recalculateAllPaths();
        // 본진 HP 완전 회복 + 골드 초기화
        this.baseHp = BASE_HP;
        this.registry.set('baseHp', this.baseHp);
        this._drawBaseHpBar();
        this.economyManager.resetForNewStage(next);
        this.registry.set('wave', 1);
        this.stageManager.startStage(next);
      });
      objs.push(nextBtn);
    }

    const restartBtn = this.add.text(320, isLast ? 490 : 548, '↺  새로 시작', {
      fontSize: '18px', color: '#cccccc',
      backgroundColor: '#3a2a1a', padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
    restartBtn.on('pointerover', () => restartBtn.setStyle({ color: '#ffdd44' }));
    restartBtn.on('pointerout', () => restartBtn.setStyle({ color: '#cccccc' }));
    restartBtn.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.restart();
    });
    objs.push(restartBtn);
  }

  update(time, delta) {
    if (this.gameOver) return;
    this.unitManager.update(time, delta);
    this.enemyManager.update(time, delta);
    this.combatManager.update(time, delta);
    this.economyManager.update(delta);
    this.stageManager.update(delta);
  }
}
