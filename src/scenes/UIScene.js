import Phaser from 'phaser';
import HUD from '../ui/HUD.js';
import CardUI from '../ui/CardUI.js';
import { THEME } from '../theme.js';
import { ENV_TEXTURES, UI_TEXTURES } from '../assets/art/AssetKeys.js';
import { BATTLE_FEEDBACK_COLORS, getBattleFeedback } from '../ui/BattleFeedback.js';
import Deck from '../cards/Deck.js';
import Hand from '../cards/Hand.js';
import SharedCards from '../cards/SharedCards.js';
import { evaluateHand, HAND_NAMES } from '../cards/HandEvaluator.js';
import { SKILLS } from '../data/skills.js';
import { PANEL_Y } from '../grid/Grid.js';
import { SUIT_ICONS } from '../cards/Card.js';
import { applyGoldSuitUpgradeToUnits, createGoldSuitUpgrade, GOLD_SUIT_UPGRADE_COST } from '../roguelite/GoldSuitUpgrade.js';

export const READABLE_TAB_LAYOUT = {
  TEXT_Y_OFFSET: 2,
};

export default class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  create() {
    this.hud = new HUD(this);
    this.cardUI = new CardUI(this);

    this.deck = new Deck();
    this.hand = new Hand();
    this.sharedCards = new SharedCards();
    this.sharedCards.fill(this.deck);
    for (let i = 0; i < 5; i++) {
      const card = this.deck.draw();
      if (card) this.hand.addCard(card);
    }

    this._activeTab = 'card';
    this._upgradeObjs = [];
    this._battleFeedbackObjects = [];
    this._battleFeedbackTimer = null;

    this._createTabButtons();
    this._createReadableTabs();
    this._refreshUI();

    const gameScene = this.scene.get('GameScene');
    if (!gameScene || gameScene.startStageIndex === 0) {
      this.time.delayedCall(800, () => this._showTutorial());
    }

    this._onBattleFeedback = payload => this._showBattleFeedback(payload);
    gameScene.events.on('refreshSharedCards', () => {
      this.sharedCards.consume(this.deck);
      this._refreshUI();
    });
    gameScene.events.on('battle-feedback', this._onBattleFeedback);
    this.events.once('shutdown', () => {
      gameScene.events.off('battle-feedback', this._onBattleFeedback);
      this._clearBattleFeedback();
    });

    gameScene.unitManager.onUnitSelected = () => {
      if (this._activeTab === 'upgrade') this._renderUpgradeTab();
    };
    gameScene.unitManager.onUnitDeselected = () => {
      if (this._activeTab === 'upgrade') this._renderUpgradeTab();
    };
  }

  _createTabButtons() {
    // Legacy text tabs are replaced by the full-width tab bar in _createReadableTabs.
  }

  _switchTab(tab) {
    const gs = this.scene.get('GameScene');
    if (gs?.unitManager) gs.unitManager.hideSummonPreview();
    this._activeTab = tab;
    this._updateReadableTabs();
    this._refreshUI();
  }

  _createReadableTabs() {
    const y = PANEL_Y + 18;
    this._readableTabs = [
      this._createReadableTab('card', 112, y, 184, '카드패'),
      this._createReadableTab('upgrade', 320, y, 184, '업그레이드'),
      this._createReadableTab('roguelite', 528, y, 184, '강화 목록'),
    ];
    this._updateReadableTabs();
  }

  _createReadableTab(key, x, y, width, label) {
    const bg = this.textures?.exists?.(UI_TEXTURES.TAB_INACTIVE) && this.add.image
      ? this.add.image(x, y, UI_TEXTURES.TAB_INACTIVE)
        .setDisplaySize(width + 26, 42)
        .setDepth(13)
        .setInteractive({ useHandCursor: true })
      : this.add.rectangle(x, y, width, 32, 0x0a1522, 1)
        .setStrokeStyle(1, 0x314763, 1)
        .setDepth(13)
        .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y + READABLE_TAB_LAYOUT.TEXT_Y_OFFSET, label, {
      fontSize: '14px', color: '#c9d6ea', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(14).setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this._switchTab(key));
    text.on('pointerdown', () => this._switchTab(key));
    return { key, bg, text };
  }

  _updateReadableTabs() {
    this._readableTabs?.forEach(tab => {
      const active = tab.key === this._activeTab;
      const activeFill = tab.key === 'card' ? 0x123b55 : tab.key === 'upgrade' ? 0x26321a : 0x2a2140;
      const activeStroke = tab.key === 'card' ? THEME.economy.gem : tab.key === 'upgrade' ? 0x9fd56c : 0xc88cff;
      if (tab.bg.setTexture && this.textures?.exists?.(active ? UI_TEXTURES.TAB_ACTIVE : UI_TEXTURES.TAB_INACTIVE)) {
        tab.bg.setTexture(active ? UI_TEXTURES.TAB_ACTIVE : UI_TEXTURES.TAB_INACTIVE);
        tab.bg.setAlpha(active ? 1 : 0.72);
      } else {
        tab.bg.setFillStyle(active ? activeFill : 0x0a1522, 1);
        tab.bg.setStrokeStyle(active ? 2 : 1, active ? activeStroke : 0x314763, active ? 1 : 0.75);
      }
      tab.text.setStyle({ color: active ? '#ffffff' : '#95a4b8' });
    });
  }

  _summon() {
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;
    const cost = eco.getDrawCost();
    if (!eco.spend(cost)) return;
    eco.recordSummon();

    const { rank, dominantSuit } = evaluateHand(this.hand.cards);
    const rankName = HAND_NAMES[rank];
    const suitLabel = SUIT_ICONS[dominantSuit] || dominantSuit;
    this.deck.discardMany(this.hand.consumeAll());

    for (let i = 0; i < 5; i++) {
      const card = this.deck.draw();
      if (card) this.hand.addCard(card);
    }

    gameScene.unitManager.placeUnitRandom(rank, dominantSuit, 1);
    gameScene.events.emit('battle-feedback', {
      type: 'summon',
      rankName,
      suitLabel,
      cost,
    });
    if (gameScene.rogueliteManager) {
      const bonus = gameScene.rogueliteManager.getGoldOnSummon(rank);
      if (bonus > 0) eco.addGold(bonus);
    }
    this._refreshUI();
  }

  _castMagic() {
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;
    if (this.hand.cards.length < 3) return;

    let bestRank = -1;
    let bestSuit = null;
    const h = this.hand.cards;
    const shared = this.sharedCards.getCards();
    for (let a = 0; a < h.length - 2; a++) {
      for (let b = a + 1; b < h.length - 1; b++) {
        for (let c = b + 1; c < h.length; c++) {
          const { rank, dominantSuit } = evaluateHand([h[a], h[b], h[c], ...shared]);
          if (rank > bestRank) { bestRank = rank; bestSuit = dominantSuit; }
        }
      }
    }

    const skill = SKILLS[bestRank];
    gameScene.magicManager.cast(bestRank, bestSuit);
    if (skill) gameScene.showMagicEffect(bestRank, skill.name, skill.description);

    const burnedHand = this.hand.consumeAll();
    const burnedShared = this.sharedCards.consume(this.deck);
    const burnedCount = burnedHand.length + burnedShared.length;
    this.deck.burnMany([...burnedHand, ...burnedShared]);
    gameScene.events.emit('battle-feedback', {
      type: 'magic',
      skillName: skill?.name,
      rankName: HAND_NAMES[bestRank],
      burnedCount,
    });
    eco.resetReplaceCost();

    for (let i = 0; i < 5; i++) {
      const card = this.deck.draw();
      if (card) this.hand.addCard(card);
    }

    this._refreshUI();
  }

  _replace() {
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;
    const cost = eco.getReplaceCost();
    if (eco.gold < cost) return;

    this.cardUI.enterReplaceMode(this.hand, (idx) => {
      if (!eco.spend(cost)) return;
      eco.recordReplace();
      const old = this.hand.removeCard(idx);
      if (old) this.deck.discard(old);
      const newCard = this.deck.draw();
      if (newCard) this.hand.addCard(newCard);
      this._refreshUI();
    }, () => {
      this._refreshUI();
    });
  }

  _refreshUI() {
    if (this._activeTab === 'card') {
      this._clearUpgradeObjs();
      this._renderCardTab();
    } else if (this._activeTab === 'upgrade') {
      this.cardUI.clear();
      this._renderUpgradeTab();
    } else {
      this.cardUI.clear();
      this._renderRogueliteTab();
    }
  }

  _renderCardTab() {
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;

    const summonPreview = this.hand.cards.length === 5
      ? HAND_NAMES[evaluateHand(this.hand.cards).rank]
      : null;

    let magicPreview = null;
    const shared = this.sharedCards.getCards();
    if (this.hand.cards.length >= 3 && shared.length > 0) {
      let bestRank = -1;
      const h = this.hand.cards;
      for (let a = 0; a < h.length - 2; a++) {
        for (let b = a + 1; b < h.length - 1; b++) {
          for (let c = b + 1; c < h.length; c++) {
            const { rank } = evaluateHand([h[a], h[b], h[c], ...shared]);
            if (rank > bestRank) bestRank = rank;
          }
        }
      }
      const skill = SKILLS[bestRank];
      magicPreview = skill ? `${HAND_NAMES[bestRank]} / ${skill.name}` : null;
    }

    gameScene.unitManager.showSummonPreview();
    this.cardUI.render(this.hand, this.sharedCards, this.deck.burnCount);
    const buttons = this.cardUI.renderButtons(
      eco.getDrawCost(), eco.getReplaceCost(),
      summonPreview, magicPreview
    );

    buttons.summonBtn.on('pointerdown', () => this._summon());
    buttons.magicBtn.on('pointerdown', () => this._castMagic());
    buttons.replaceBtn.on('pointerdown', () => this._replace());
  }

  _clearUpgradeObjs() {
    this._upgradeObjs.forEach(o => { if (o && o.active) o.destroy(); });
    this._upgradeObjs = [];
  }

  _showBattleFeedback(payload) {
    this._clearBattleFeedback();
    const feedback = getBattleFeedback(payload);
    const x = 320;
    const y = PANEL_Y - 18;
    let bg;
    if (this.textures?.exists?.(ENV_TEXTURES.BATTLE_LABEL_FRAME) && this.add.image) {
      bg = this.add.image(x, y, ENV_TEXTURES.BATTLE_LABEL_FRAME)
        .setDisplaySize(420, 34)
        .setAlpha(0.96)
        .setDepth(30);
    } else {
      bg = this.add.rectangle(x, y, 420, 28, 0x08131f, 0.94)
        .setStrokeStyle(1, 0xf2c96b, 0.85)
        .setDepth(30);
    }
    const text = this.add.text(x, y + 1, feedback.text, {
      fontSize: '13px',
      color: BATTLE_FEEDBACK_COLORS[feedback.tone] || BATTLE_FEEDBACK_COLORS.info,
      fontStyle: 'bold',
      align: 'center',
      fixedWidth: 388,
    }).setOrigin(0.5).setDepth(31);
    text.setStroke?.('#02070d', 3);
    this._battleFeedbackObjects = [bg, text];
    this.tweens.add({
      targets: this._battleFeedbackObjects,
      scaleX: { from: 0.96, to: 1 },
      scaleY: { from: 0.96, to: 1 },
      alpha: { from: 0.72, to: 1 },
      duration: 120,
      ease: 'Quad.easeOut',
    });
    this._battleFeedbackTimer = this.time.delayedCall(1700, () => this._clearBattleFeedback());
  }

  _clearBattleFeedback() {
    if (this._battleFeedbackTimer) {
      this._battleFeedbackTimer.remove(false);
      this._battleFeedbackTimer = null;
    }
    this._battleFeedbackObjects?.forEach(obj => { if (obj?.active) obj.destroy(); });
    this._battleFeedbackObjects = [];
  }

  _renderRogueliteTab() {
    this._clearUpgradeObjs();
    const gameScene = this.scene.get('GameScene');
    const upgrades = gameScene?.rogueliteManager?.upgrades ?? [];
    let y = PANEL_Y + 48;

    const title = this.add.text(320, y, '획득한 강화 목록', {
      fontSize: '11px', color: '#ffdd44'
    }).setOrigin(0.5).setDepth(12);
    this._upgradeObjs.push(title);
    y += 22;

    if (upgrades.length === 0) {
      const emptyMain = this.add.text(320, y + 22, '아직 획득한 강화가 없습니다', {
        fontSize: '11px', color: '#aaaaaa', align: 'center'
      }).setOrigin(0.5).setDepth(12);
      const emptySub = this.add.text(320, y + 42, '스테이지를 클리어하면 강화를 선택할 수 있습니다', {
        fontSize: '10px', color: '#888888', align: 'center', wordWrap: { width: 260 }
      }).setOrigin(0.5).setDepth(12);
      this._upgradeObjs.push(emptyMain, emptySub);
      return;
    }

    for (const u of upgrades) {
      const row = this.add.text(320, y, `- ${u.label}`, {
        fontSize: '11px', color: '#aaddff'
      }).setOrigin(0.5).setDepth(12);
      this._upgradeObjs.push(row);
      y += 18;
      if (y > PANEL_Y + 196) break;
    }
  }

  _renderUpgradeTab() {
    this._clearUpgradeObjs();
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;
    let y = PANEL_Y + 48;

    const permTitle = this.add.text(320, y, '전체 영구 강화', {
      fontSize: '11px', color: '#88eeff'
    }).setOrigin(0.5).setDepth(12);
    this._upgradeObjs.push(permTitle);
    y += 18;

    const permHpLv = gameScene.permHpLevel ?? 0;
    const permAtkLv = gameScene.permAtkLevel ?? 0;
    const PERM_MAX = 10;
    const PERM_COST = 1;

    this._drawUpgradeButton(190, y, 190,
      permHpLv >= PERM_MAX ? `HP +${permHpLv * 3}% MAX` : `HP +3%  ${PERM_COST}보석  Lv${permHpLv}`,
      0x17351f, 0x58d27c, () => {
        if (permHpLv < PERM_MAX && gameScene.gems >= PERM_COST) {
          gameScene.gems -= PERM_COST;
          gameScene.permHpLevel = (gameScene.permHpLevel ?? 0) + 1;
          gameScene.registry.set('gems', gameScene.gems);
          this._renderUpgradeTab();
        }
      });

    this._drawUpgradeButton(440, y, 190,
      permAtkLv >= PERM_MAX ? `ATK +${permAtkLv * 3}% MAX` : `ATK +3%  ${PERM_COST}보석  Lv${permAtkLv}`,
      0x3d2412, 0xffb65c, () => {
        if (permAtkLv < PERM_MAX && gameScene.gems >= PERM_COST) {
          gameScene.gems -= PERM_COST;
          gameScene.permAtkLevel = (gameScene.permAtkLevel ?? 0) + 1;
          gameScene.registry.set('gems', gameScene.gems);
          this._renderUpgradeTab();
        }
      });
    y += 26;

    const suitTitle = this.add.text(320, y, 'G 문양별 공격 강화', {
      fontSize: '11px', color: '#ffd166'
    }).setOrigin(0.5).setDepth(12);
    this._upgradeObjs.push(suitTitle);
    y += 18;

    ['H', 'D', 'C', 'S'].forEach((suit, i) => {
      const x = 112 + i * 138;
      this._drawUpgradeButton(x, y, 126, `${SUIT_ICONS[suit]} ATK +10%  ${GOLD_SUIT_UPGRADE_COST}G`,
        0x332914, 0xffd166, () => {
          if (!eco.spend(GOLD_SUIT_UPGRADE_COST)) return;
          const upgrade = createGoldSuitUpgrade(suit);
          gameScene.rogueliteManager.addUpgrade(upgrade);
          applyGoldSuitUpgradeToUnits(gameScene.unitManager.units, upgrade);
          this._renderUpgradeTab();
        }, { fontSize: '10px' });
    });
    y += 26;

    const baseTitle = this.add.text(320, y, '본진 / 선택 유닛 강화', {
      fontSize: '11px', color: '#88ccff'
    }).setOrigin(0.5).setDepth(12);
    this._upgradeObjs.push(baseTitle);
    y += 17;

    this._drawUpgradeButton(320, y, 210, '본진 HP +20  30G', 0x17351f, 0x58d27c, () => {
      if (eco.spend(30)) {
        gameScene.baseHp = Math.min(100, gameScene.baseHp + 20);
        gameScene.registry.set('baseHp', gameScene.baseHp);
        gameScene._drawBaseHpBar();
      }
    });
    y += 26;

    const unit = gameScene.unitManager.selectedUnit;
    if (!unit) {
      const hint = this.add.text(320, y, '유닛을 클릭하여 선택하세요', {
        fontSize: '11px', color: '#888888'
      }).setOrigin(0.5).setDepth(12);
      this._upgradeObjs.push(hint);
      return;
    }

    const info = this.add.text(320, y, `${HAND_NAMES[unit.handRank]}  등급 ${unit.grade}`, {
      fontSize: '13px', color: '#ffdd88', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(12);
    this._upgradeObjs.push(info);
    y += 24;

    if (unit.upgradeHp && unit.upgradeAtk) {
      const done = this.add.text(320, y, '업그레이드 완료', {
        fontSize: '12px', color: '#aaaaaa'
      }).setOrigin(0.5).setDepth(12);
      this._upgradeObjs.push(done);
      return;
    }

    if (!unit.upgradeHp) {
      this._drawUpgradeButton(220, y, 150, 'HP +50%  25G', 0x17351f, 0x58d27c, () => {
        if (eco.spend(25)) {
          unit.stats.maxHp = Math.floor(unit.stats.maxHp * 1.5);
          unit.hp = Math.min(unit.hp + Math.floor(unit.maxHp * 0.5), unit.stats.maxHp);
          unit.maxHp = unit.stats.maxHp;
          unit.upgradeHp = true;
          unit._drawHpBar();
          this._renderUpgradeTab();
        }
      });
    }

    if (!unit.upgradeAtk) {
      this._drawUpgradeButton(430, y, 150, 'ATK +30%  20G', 0x3d2412, 0xffb65c, () => {
        if (eco.spend(20)) {
          unit.stats.atk = Math.floor(unit.stats.atk * 1.3);
          unit.upgradeAtk = true;
          this._renderUpgradeTab();
        }
      });
    }
  }

  _drawUpgradeButton(x, y, width, label, fill, stroke, onClick, options = {}) {
    const textureKey = options.textureKey ?? this._getUpgradeButtonTexture(fill);
    const hasTexture = textureKey && this.textures?.exists?.(textureKey) && this.add.image;
    const bg = hasTexture
      ? this.add.image(x, y, textureKey)
        .setDepth(12)
        .setDisplaySize(width + 24, 34)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.96)
      : this.add.rectangle(x, y, width, 24, fill, 0.94)
        .setDepth(12)
        .setStrokeStyle(1, stroke, 0.85)
        .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontSize: options.fontSize ?? '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(13).setInteractive({ useHandCursor: true });

    const over = () => {
      if (hasTexture) bg.setAlpha(1);
      else {
        bg.setFillStyle(fill, 1);
        bg.setStrokeStyle(2, stroke, 1);
      }
      text.setStyle({ color: '#ffef9a' });
    };
    const out = () => {
      if (hasTexture) bg.setAlpha(0.96);
      else {
        bg.setFillStyle(fill, 0.94);
        bg.setStrokeStyle(1, stroke, 0.85);
      }
      text.setStyle({ color: '#ffffff' });
    };
    bg.on('pointerover', over);
    bg.on('pointerout', out);
    text.on('pointerover', over);
    text.on('pointerout', out);
    bg.on('pointerdown', onClick);
    text.on('pointerdown', onClick);
    this._upgradeObjs.push(bg, text);
    return bg;
  }

  _getUpgradeButtonTexture(fill) {
    if (fill === 0x17351f) return UI_TEXTURES.BUTTON_UPGRADE_GREEN;
    if (fill === 0x3d2412 || fill === 0x332914) return UI_TEXTURES.BUTTON_UPGRADE_ORANGE;
    return UI_TEXTURES.BUTTON_UPGRADE_BLUE;
  }

  _showTutorial() {
    const steps = [
      {
        title: '소환 (Summon)',
        body: '내 카드 5장의 족보를 판단해 타워를 소환합니다.\n높은 족보일수록 강한 타워가 나옵니다.\n교체를 하면 소환 비용이 줄어듭니다.',
        color: '#65d9ff',
      },
      {
        title: '교체 (Replace)',
        body: '원하는 카드 1장을 덱의 새 카드로 교체합니다.\n교체할수록 소환 비용이 낮아집니다.\n소환하면 교체 비용은 초기화됩니다.',
        color: '#9fd56c',
      },
      {
        title: '마법 (Magic)',
        body: '내 카드 3장과 공용 카드 2장으로 족보를 만들어 강력한 마법을 발동합니다.\n마법 사용 후 교체 비용은 초기화됩니다.',
        color: '#c88cff',
      },
    ];

    let stepIdx = 0;
    const objs = [];
    const gs = this.scene.get('GameScene');
    if (gs) gs.input.enabled = false;

    const show = () => {
      objs.forEach(o => { if (o?.active) o.destroy(); });
      objs.length = 0;

      const s = steps[stepIdx];
      const overlay = this.add.rectangle(320, 400, 580, 360, 0x000000, 0.88).setDepth(30);
      const box = this.add.rectangle(320, 400, 560, 340, THEME.bg.panel, 1).setDepth(30).setStrokeStyle(2, 0x3a6080, 1);
      const numTxt = this.add.text(320, 262, `${stepIdx + 1} / ${steps.length}`, {
        fontSize: '11px', color: '#888888'
      }).setOrigin(0.5).setDepth(31);
      const titleTxt = this.add.text(320, 288, s.title, {
        fontSize: '20px', color: s.color, fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(31);
      const bodyTxt = this.add.text(320, 370, s.body, {
        fontSize: '13px', color: '#dddddd', align: 'center',
        wordWrap: { width: 500 },
      }).setOrigin(0.5).setDepth(31);

      const isLast = stepIdx >= steps.length - 1;
      const btnLabel = isLast ? '시작하기' : '다음';
      const btn = this.add.text(320, 498, btnLabel, {
        fontSize: '15px', color: '#ffffff',
        backgroundColor: isLast ? '#1a5e2a' : '#1a3a6a', padding: { x: 20, y: 8 }
      }).setOrigin(0.5).setDepth(31).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setStyle({ color: '#ffdd44' }));
      btn.on('pointerout', () => btn.setStyle({ color: '#ffffff' }));
      btn.once('pointerdown', () => {
        if (isLast) {
          objs.forEach(o => { if (o?.active) o.destroy(); });
          if (gs) gs.input.enabled = true;
          this.events.emit('tutorialDone');
        } else {
          stepIdx++;
          show();
        }
      });

      objs.push(overlay, box, numTxt, titleTxt, bodyTxt, btn);
    };

    show();
  }
}
