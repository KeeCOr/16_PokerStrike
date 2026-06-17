import Phaser from 'phaser';
import { THEME } from '../theme.js';
import Grid, { GRID_ROWS, GRID_COLS, CELL_BLOCKED, CELL_EMPTY, CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y } from '../grid/Grid.js';
import GridRenderer from '../grid/GridRenderer.js';
import UnitManager from '../units/UnitManager.js';
import EnemyManager from '../enemies/EnemyManager.js';
import CombatManager from '../combat/CombatManager.js';
import EconomyManager from '../economy/EconomyManager.js';
import StageManager from '../stages/StageManager.js';
import MagicManager from '../magic/MagicManager.js';
import RogueliteManager from '../roguelite/RogueliteManager.js';
import { getAffectedUnitCount, pickWaveUpgrades } from '../roguelite/UpgradeChoices.js';
import { UPGRADE_POOL } from '../data/roguelite.js';
import { STAGES, STAGE_OBSTACLES } from '../stages/StageData.js';
import { shouldShowUpgradeTutorialOnStageClear } from './GameSceneTutorial.js';
import { getWaveChoiceTextureKey, WAVE_CHOICE_LAYOUT } from './WaveChoiceLayout.js';
import { ENV_TEXTURES, preloadArtAssets } from '../assets/art/AssetKeys.js';

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

  preload() {
    preloadArtAssets(this);
  }

  init(data) {
    this.startStageIndex = data?.startStageIndex ?? 0;
    this.savedUpgrades = data?.upgrades ?? [];
    this.gems = data?.gems ?? 0;
    this.permHpLevel = data?.permHpLevel ?? 0;
    this.permAtkLevel = data?.permAtkLevel ?? 0;
    this.upgradeTutorialShown = data?.upgradeTutorialShown ?? false;
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
    this.selectedEnemy = null;
    this._enemyInfoObjs = [];

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
    this.registry.set('gems', this.gems);

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

    const startGame = () => {
      this._startCountdown(() => {
        this._showStageIntro(this.startStageIndex, () => this.stageManager.startStage(this.startStageIndex));
      });
    };

    if (this.startStageIndex === 0) {
      // 1스테이지 시작: 튜토리얼 완료 후 게임 시작
      this.scene.get('UIScene').events.once('tutorialDone', startGame);
    } else {
      startGame();
    }
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

  _showStageIntro(stageIndex, onComplete) {
    const stageName = `STAGE ${stageIndex + 1}`;
    const cx = 320, cy = 380;
    const overlay = this.add.rectangle(cx, cy + 80, 640, 300, 0x000000, 0.7).setDepth(24).setAlpha(0);
    const title = this.add.text(cx, cy, stageName, {
      fontSize: '52px', color: '#ffdd44', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0).setDepth(25);

    this.tweens.add({ targets: overlay, alpha: 1, duration: 250 });
    this.tweens.add({
      targets: title, alpha: 1, scaleX: 1.0, scaleY: 1.0,
      duration: 300, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(900, () => {
          this.tweens.add({
            targets: [overlay, title], alpha: 0, duration: 400,
            onComplete: () => {
              overlay.destroy(); title.destroy();
              if (onComplete) onComplete();
            },
          });
        });
      },
    });
  }

  _applyObstacles(stageIndex) {
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
    if (this.textures?.exists?.(ENV_TEXTURES.SPAWN_GATE) && this.add.image) {
      this.add.image(spawnX + CELL_SIZE / 2, spawnY + CELL_SIZE / 2, ENV_TEXTURES.SPAWN_GATE)
        .setDepth(1)
        .setDisplaySize(CELL_SIZE + 10, CELL_SIZE + 10);
    } else {
      const sg = this.add.graphics().setDepth(0);
      sg.fillStyle(0xff2222, 0.25);
      sg.fillRect(spawnX + 1, spawnY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      this.add.text(spawnX + CELL_SIZE / 2, spawnY + CELL_SIZE / 2, '스폰', {
        fontSize: '9px', color: '#ff6666'
      }).setOrigin(0.5).setDepth(1);
    }

    // 본진 표시 (row 8, 가운데 위치)
    const BASE_COL_IDX = Math.floor(GRID_COLS / 2);
    const baseY = GRID_OFFSET_Y + (GRID_ROWS - 1) * CELL_SIZE;
    const baseX = GRID_OFFSET_X + BASE_COL_IDX * CELL_SIZE;
    if (this.textures?.exists?.(ENV_TEXTURES.BASE_CORE) && this.add.image) {
      this.add.image(baseX + CELL_SIZE / 2, baseY + CELL_SIZE / 2, ENV_TEXTURES.BASE_CORE)
        .setDepth(1)
        .setDisplaySize(CELL_SIZE + 14, CELL_SIZE + 14);
    } else {
      const bg = this.add.graphics().setDepth(0);
      bg.fillStyle(0x22aa44, 0.5);
      bg.fillRect(baseX + 1, baseY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      this.add.text(baseX + CELL_SIZE / 2, baseY + CELL_SIZE / 2, '본진', {
        fontSize: '11px', color: '#44ff88', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(1);
    }

    // 본진 HP 바
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
    this._baseHpBar.fillStyle(ratio > 0.5 ? THEME.status.hpHigh : ratio > 0.25 ? THEME.status.hpMid : THEME.status.hpLow);
    this._baseHpBar.fillRect(baseX, baseY - 7, Math.floor(barW * ratio), 6);
  }

  showEnemyInfo(enemy) {
    this.selectedEnemy = enemy;
    this._renderEnemyInfo();
  }

  clearEnemyInfo() {
    this.selectedEnemy = null;
    this._enemyInfoObjs.forEach(o => { if (o?.active) o.destroy(); });
    this._enemyInfoObjs = [];
  }

  _renderEnemyInfo() {
    this._enemyInfoObjs.forEach(o => { if (o?.active) o.destroy(); });
    this._enemyInfoObjs = [];
    const enemy = this.selectedEnemy;
    if (!enemy || enemy.hp <= 0 || !this.enemyManager.getAll().includes(enemy)) return;

    const lines = enemy.getInfoLines();
    const x = 486;
    const y = 64;
    const height = 34 + lines.length * 18;

    const bg = this.add.rectangle(x, y, 196, height, THEME.bg.base, 0.94)
      .setDepth(18)
      .setStrokeStyle(1, THEME.status.shield, 0.85);
    const title = this.add.text(x, y - height / 2 + 13, '적 정보', {
      fontSize: '11px', color: '#88ccff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(19);
    this._enemyInfoObjs.push(bg, title);

    lines.forEach((line, index) => {
      const text = this.add.text(x, y - height / 2 + 32 + index * 18, line, {
        fontSize: '12px',
        color: index === 2 ? '#ffd166' : '#ffffff',
      }).setOrigin(0.5).setDepth(19);
      this._enemyInfoObjs.push(text);
    });
  }

  _showWaveChoices(resumeFn) {
    const pool = pickWaveUpgrades(UPGRADE_POOL, this.unitManager.units, this.rogueliteManager, 3);
    this.economyManager.paused = true;

    // 전체 화면 가림 + UIScene 입력 차단
    const overlay = this.add.rectangle(320, 480, 640, 960, 0x000000, 0.85).setDepth(20);
    const uiScene = this.scene.get('UIScene');
    if (uiScene) uiScene.input.enabled = false;

    const titleText = this.add.text(320, 100, '강화 선택', {
      fontSize: `${WAVE_CHOICE_LAYOUT.TITLE_FONT}px`, color: '#ffdd44', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    const objs = [overlay, titleText];
    pool.forEach((upgrade, i) => {
      const y = WAVE_CHOICE_LAYOUT.START_Y + i * WAVE_CHOICE_LAYOUT.ROW_GAP;
      const textureKey = getWaveChoiceTextureKey(upgrade);
      const hasTexture = this.textures?.exists?.(textureKey) && this.add.image;
      const bg = hasTexture
        ? this.add.image(320, y, textureKey)
          .setDepth(21)
          .setDisplaySize(
            WAVE_CHOICE_LAYOUT.CARD_W + WAVE_CHOICE_LAYOUT.CARD_TEXTURE_PADDING_X,
            WAVE_CHOICE_LAYOUT.CARD_H + WAVE_CHOICE_LAYOUT.CARD_TEXTURE_PADDING_Y,
          )
          .setAlpha(0.96)
          .setInteractive({ useHandCursor: true })
        : this.add.rectangle(320, y, WAVE_CHOICE_LAYOUT.CARD_W, WAVE_CHOICE_LAYOUT.CARD_H, 0x10253a, 0.96)
          .setDepth(21)
          .setStrokeStyle(2, THEME.ui.borderBright, 0.9)
          .setInteractive({ useHandCursor: true });
      const affectedCount = getAffectedUnitCount(upgrade, this.unitManager.units, this.rogueliteManager);
      const label = this.add.text(320, y + WAVE_CHOICE_LAYOUT.LABEL_Y_OFFSET, upgrade.label, {
        fontSize: `${WAVE_CHOICE_LAYOUT.LABEL_FONT}px`, color: '#ffffff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
        wordWrap: { width: WAVE_CHOICE_LAYOUT.CARD_W - 42 },
        align: 'center',
      }).setOrigin(0.5).setDepth(22);
      const affectedText = affectedCount === null ? '즉시/향후 적용' : `${affectedCount}명 적용`;
      const typeLabel = this.add.text(320, y + WAVE_CHOICE_LAYOUT.TYPE_Y_OFFSET, `${_upgradeTypeLabel(upgrade)}  (${affectedText})`, {
        fontSize: `${WAVE_CHOICE_LAYOUT.TYPE_FONT}px`, color: '#bceeff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(22);
      objs.push(bg, label, typeLabel);

      bg.on('pointerover', () => {
        bg.setAlpha(1);
        if (bg.setScale) bg.setScale(1.015);
        this.unitManager.units.forEach(u => {
          if (this.rogueliteManager.matches(upgrade, u)) u.setHighlight(true);
        });
      });
      bg.on('pointerout', () => {
        bg.setAlpha(0.96);
        if (bg.setScale) bg.setScale(1);
        this.unitManager.units.forEach(u => u.setHighlight(false));
      });
      bg.on('pointerdown', () => {
        this.unitManager.units.forEach(u => u.setHighlight(false));
        this.rogueliteManager.addUpgrade(upgrade);

        bg.setAlpha(1);
        this.tweens.add({
          targets: bg,
          alpha: { from: 1, to: 0.66 },
          yoyo: true,
          duration: 150,
        });

        const feedbackText = this.add.text(320, 480, '강화 적용!', {
          fontSize: '28px', color: '#ffdd44', fontStyle: 'bold',
          stroke: '#000000', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(25).setAlpha(0);
        this.tweens.add({
          targets: feedbackText,
          alpha: 1,
          duration: 150,
          onComplete: () => {
            this.time.delayedCall(300, () => {
              this.tweens.add({
                targets: feedbackText,
                alpha: 0,
                duration: 150,
                onComplete: () => feedbackText.destroy(),
              });
            });
          },
        });

        this.time.delayedCall(300, () => {
          objs.forEach(o => o.destroy());
          if (uiScene) uiScene.input.enabled = true;
          this.economyManager.paused = false;
          resumeFn();
        });
      });
    });
  }

  showMagicEffect(rank, skillName, description) {
    const COLORS = [
      THEME.enemy.common, // 0 HC  - 기본 효과
      THEME.text.secondary, // 1 1P  - 무료 교체
      0xffd700, // 2 2P  - 골드 획득
      0x44ffff, // 3 3K  - 소환 지원
      THEME.ui.glow, // 4 STR - 대지진
      0xffee44, // 5 FLU - 속성 강화
      THEME.status.hpHigh, // 6 FH  - 회복
      0xff5522, // 7 4K  - 광역 공격
      0xcc44ff, // 8 SF  - 전멸
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

    // Skill name ??scale up then float away
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
      const continueBtn = this.add.text(320, 470, `${currentStage + 1}스테이지부터 재시작`, {
        fontSize: '18px', color: '#ffffff',
        backgroundColor: '#1a5e2a', padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
      continueBtn.on('pointerover', () => continueBtn.setStyle({ color: '#ffdd44' }));
      continueBtn.on('pointerout',  () => continueBtn.setStyle({ color: '#ffffff' }));
      continueBtn.on('pointerdown', () => {
        this.scene.stop('UIScene');
        this.scene.restart({ startStageIndex: currentStage, upgrades: this.rogueliteManager.upgrades,
          gems: this.gems, permHpLevel: this.permHpLevel, permAtkLevel: this.permAtkLevel,
          upgradeTutorialShown: this.upgradeTutorialShown });
      });

      const restartBtn = this.add.text(320, 535, '1스테이지부터 재시작', {
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
    if (shouldShowUpgradeTutorialOnStageClear(stageIndex, this.upgradeTutorialShown)) {
      this.upgradeTutorialShown = true;
      this._showUpgradeTutorial(() => this._renderStageCleared(stageIndex));
      return;
    }
    this._renderStageCleared(stageIndex);
  }

  _showUpgradeTutorial(onDone) {
    const overlay = this.add.rectangle(320, 480, 640, 960, 0x000000, 0.78).setDepth(30);
    const box = this.add.rectangle(320, 420, 520, 300, THEME.bg.panel, 1)
      .setDepth(31)
      .setStrokeStyle(2, 0x8cd3ff, 0.95);
    const title = this.add.text(320, 315, '업그레이드 안내', {
      fontSize: '24px', color: '#ffdd44', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(32);
    const body = this.add.text(320, 405,
      '스테이지를 클리어하면 업그레이드 탭을 확인하세요.\n◆ 보석 강화는 모든 타워를 조금씩 성장시킵니다.\n골드 강화는 선택한 문양(♥ ♦ ♣ ♠) 타워만 강화합니다.\n유닛을 클릭하면 개별 HP/ATK 강화도 사용할 수 있습니다.',
      {
        fontSize: '14px',
        color: '#dcecff',
        align: 'center',
        wordWrap: { width: 460 },
        lineSpacing: 6,
      }).setOrigin(0.5).setDepth(32);
    const btn = this.add.text(320, 540, '확인', {
      fontSize: '16px', color: '#ffffff',
      backgroundColor: '#1a5e2a', padding: { x: 26, y: 9 },
    }).setOrigin(0.5).setDepth(32).setInteractive({ useHandCursor: true });
    const objs = [overlay, box, title, body, btn];
    btn.on('pointerover', () => btn.setStyle({ color: '#ffdd44' }));
    btn.on('pointerout', () => btn.setStyle({ color: '#ffffff' }));
    btn.once('pointerdown', () => {
      objs.forEach(o => { if (o?.active) o.destroy(); });
      if (onDone) onDone();
    });
  }

  _renderStageCleared(stageIndex) {
    const isLast = stageIndex >= STAGES.length - 1;
    const overlay = this.add.rectangle(320, 480, 640, 960, 0x000000, 0.6).setDepth(10);

    // Peak-End Rule: STAGE CLEAR 텍스트에 scale 애니메이션
    const clearText = this.add.text(320, 340, `STAGE ${stageIndex + 1} CLEAR!`, {
      fontSize: '36px', color: '#ffdd44', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(11).setScale(0.5);
    this.tweens.add({
      targets: clearText,
      scaleX: { from: 0.5, to: 1.1 },
      scaleY: { from: 0.5, to: 1.1 },
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: clearText,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 150,
          ease: 'Linear',
        });
      },
    });

    const objs = [overlay, clearText];

    // Peak-End Rule: 획득한 강화를 개별 박스로, 순서대로 페이드인
    const upgrades = this.rogueliteManager.upgrades;
    if (upgrades.length > 0) {
      const buffTitle = this.add.text(320, 390, '획득한 강화:', {
        fontSize: '12px', color: '#aaddff'
      }).setOrigin(0.5).setDepth(11).setAlpha(0);
      this.tweens.add({ targets: buffTitle, alpha: 1, duration: 200, delay: 350 });
      objs.push(buffTitle);

      const boxW = 200, boxH = 32, startX = 320 - ((Math.min(upgrades.length, 3) - 1) * (boxW + 8)) / 2;
      upgrades.slice(0, 5).forEach((u, idx) => {
        const bx = startX + (idx % 3) * (boxW + 8);
        const by = 415 + Math.floor(idx / 3) * (boxH + 6);
        const delay = 350 + idx * 200;
        const boxBg = this.add.rectangle(bx, by, boxW, boxH, 0x1a3a5a).setDepth(11).setAlpha(0)
          .setStrokeStyle(1, 0x4488cc, 0.8);
        const boxText = this.add.text(bx, by, u.label, {
          fontSize: '11px', color: '#88ccff', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(12).setAlpha(0);
        this.tweens.add({ targets: [boxBg, boxText], alpha: 1, duration: 200, delay });
        objs.push(boxBg, boxText);
      });
    }

    if (isLast) {
      const finalText = this.add.text(320, 510, '모든 스테이지 클리어!', {
        fontSize: '22px', color: '#ffffff'
      }).setOrigin(0.5).setDepth(11);
      objs.push(finalText);
    } else {
      const nextBtn = this.add.text(320, 510, '다음 스테이지', {
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
        this.registry.set('gems', this.gems);
        this._showStageIntro(next, () => this.stageManager.startStage(next));
      });
      objs.push(nextBtn);
    }

    const restartBtn = this.add.text(320, isLast ? 510 : 568, '새로 시작', {
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
    if (this.selectedEnemy) this._renderEnemyInfo();
  }
}



