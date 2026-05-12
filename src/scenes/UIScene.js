import Phaser from 'phaser';
import HUD from '../ui/HUD.js';
import CardUI from '../ui/CardUI.js';
import Deck from '../cards/Deck.js';
import Hand from '../cards/Hand.js';
import SharedCards from '../cards/SharedCards.js';
import { evaluateHand, HAND_NAMES } from '../cards/HandEvaluator.js';
import { SKILLS } from '../data/skills.js';
import { PANEL_Y } from '../grid/Grid.js';

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

    this._createTabButtons();
    this._refreshUI();

    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('refreshSharedCards', () => {
      this.sharedCards.consume(this.deck);
      this._refreshUI();
    });

    gameScene.unitManager.onUnitSelected = () => {
      if (this._activeTab === 'upgrade') this._renderUpgradeTab();
    };
    gameScene.unitManager.onUnitDeselected = () => {
      if (this._activeTab === 'upgrade') this._renderUpgradeTab();
    };
  }

  _createTabButtons() {
    const y = PANEL_Y + 12;
    this._tabCardBtn = this.add.text(55, y, '카드 패', {
      fontSize: '12px', color: '#ffffff',
      backgroundColor: '#2244aa', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });

    this._tabUpgradeBtn = this.add.text(165, y, '업그레이드', {
      fontSize: '12px', color: '#ffffff',
      backgroundColor: '#1a3a1a', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });

    this._tabRogueliteBtn = this.add.text(285, y, '강화 목록', {
      fontSize: '12px', color: '#ffffff',
      backgroundColor: '#4a3a00', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });

    this._tabCardBtn.on('pointerdown', () => this._switchTab('card'));
    this._tabUpgradeBtn.on('pointerdown', () => this._switchTab('upgrade'));
    this._tabRogueliteBtn.on('pointerdown', () => this._switchTab('roguelite'));
  }

  _switchTab(tab) {
    const gs = this.scene.get('GameScene');
    if (gs?.unitManager) gs.unitManager.hideSummonPreview();
    this._activeTab = tab;
    this._tabCardBtn.setStyle({ backgroundColor: tab === 'card' ? '#2244aa' : '#1a3a6a' });
    this._tabUpgradeBtn.setStyle({ backgroundColor: tab === 'upgrade' ? '#226644' : '#1a3a1a' });
    this._tabRogueliteBtn.setStyle({ backgroundColor: tab === 'roguelite' ? '#6a5a00' : '#4a3a00' });
    this._refreshUI();
  }

  _summon() {
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;
    const cost = eco.getDrawCost();
    if (!eco.spend(cost)) return;
    eco.recordSummon();

    const { rank, dominantSuit } = evaluateHand(this.hand.cards);
    this.deck.discardMany(this.hand.consumeAll());

    for (let i = 0; i < 5; i++) {
      const card = this.deck.draw();
      if (card) this.hand.addCard(card);
    }

    gameScene.unitManager.placeUnitRandom(rank, dominantSuit, 1);
    if (gameScene.rogueliteManager) {
      const bonus = gameScene.rogueliteManager.getGoldOnSummon(rank);
      if (bonus > 0) eco.addGold(bonus);
    }
    this._refreshUI();
  }

  _castMagic() {
    const gameScene = this.scene.get('GameScene');
    if (this.hand.cards.length < 3) return;

    const combined = [...this.hand.cards.slice(0, 3), ...this.sharedCards.getCards()];
    const { rank, dominantSuit } = evaluateHand(combined);

    const skill = SKILLS[rank];
    gameScene.magicManager.cast(rank, dominantSuit);
    if (skill) gameScene.showMagicEffect(rank, skill.name, skill.description);

    // Cards are burned (permanently removed from deck this session)
    this.hand.consumeAll();
    this.sharedCards.consume(this.deck);
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

    // Enter replace mode — wait for card selection
    this.cardUI.enterReplaceMode(this.hand, (idx) => {
      if (!eco.spend(cost)) return;
      eco.recordReplace();
      const old = this.hand.removeCard(idx);
      if (old) this.deck.discard(old);
      const newCard = this.deck.draw();
      if (newCard) this.hand.addCard(newCard);
      this._refreshUI();
    }, () => {
      // 패 밖 클릭 시 취소 → UI 갱신(힌트 제거)
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

    // Summon preview: current hand rank
    const summonPreview = this.hand.cards.length === 5
      ? HAND_NAMES[evaluateHand(this.hand.cards).rank]
      : null;

    // Magic preview: best 3 from hand + 2 shared cards (try all C(5,3) combos)
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
      magicPreview = skill ? `${HAND_NAMES[bestRank]} · ${skill.name}` : null;
    }

    this.cardUI.render(this.hand, this.sharedCards);
    const buttons = this.cardUI.renderButtons(
      eco.getDrawCost(), eco.getReplaceCost(),
      summonPreview, magicPreview
    );

    buttons.summonBtn.on('pointerover', () => gameScene.unitManager.showSummonPreview());
    buttons.summonBtn.on('pointerout', () => gameScene.unitManager.hideSummonPreview());
    buttons.summonBtn.on('pointerdown', () => {
      gameScene.unitManager.hideSummonPreview();
      this._summon();
    });
    buttons.magicBtn.on('pointerdown', () => this._castMagic());
    buttons.replaceBtn.on('pointerdown', () => this._replace());
  }

  _clearUpgradeObjs() {
    this._upgradeObjs.forEach(o => { if (o && o.active) o.destroy(); });
    this._upgradeObjs = [];
  }

  _renderRogueliteTab() {
    this._clearUpgradeObjs();
    const gameScene = this.scene.get('GameScene');
    const upgrades = gameScene?.rogueliteManager?.upgrades ?? [];
    let y = PANEL_Y + 24;

    const title = this.add.text(320, y, '— 획득한 로그라이트 강화 —', {
      fontSize: '11px', color: '#ffdd44'
    }).setOrigin(0.5).setDepth(12);
    this._upgradeObjs.push(title);
    y += 22;

    if (upgrades.length === 0) {
      const empty = this.add.text(320, y, '아직 획득한 강화가 없습니다', {
        fontSize: '11px', color: '#888888'
      }).setOrigin(0.5).setDepth(12);
      this._upgradeObjs.push(empty);
      return;
    }

    for (const u of upgrades) {
      const row = this.add.text(320, y, `· ${u.label}`, {
        fontSize: '11px', color: '#aaddff'
      }).setOrigin(0.5).setDepth(12);
      this._upgradeObjs.push(row);
      y += 18;
      if (y > 930) break;
    }
  }

  _renderUpgradeTab() {
    this._clearUpgradeObjs();
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;
    let y = PANEL_Y + 34;

    // Base HP recovery section
    const baseTitle = this.add.text(320, y, '— 본진 강화 —', {
      fontSize: '11px', color: '#88ccff'
    }).setOrigin(0.5).setDepth(12);
    this._upgradeObjs.push(baseTitle);
    y += 22;

    const recoverBtn = this.add.text(320, y, `본진 HP +20  (30G)`, {
      fontSize: '13px', color: '#ffffff',
      backgroundColor: '#2a4a2a', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });
    recoverBtn.on('pointerover', () => recoverBtn.setStyle({ color: '#44ff88' }));
    recoverBtn.on('pointerout', () => recoverBtn.setStyle({ color: '#ffffff' }));
    recoverBtn.on('pointerdown', () => {
      if (eco.spend(30)) {
        gameScene.baseHp = Math.min(100, gameScene.baseHp + 20);
        gameScene.registry.set('baseHp', gameScene.baseHp);
        gameScene._drawBaseHpBar();
      }
    });
    this._upgradeObjs.push(recoverBtn);
    y += 44;

    // Unit upgrade section
    const unitTitle = this.add.text(320, y, '— 유닛 강화 —', {
      fontSize: '11px', color: '#88ccff'
    }).setOrigin(0.5).setDepth(12);
    this._upgradeObjs.push(unitTitle);
    y += 22;

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
    y += 32;

    if (unit.upgradeHp && unit.upgradeAtk) {
      const done = this.add.text(320, y, '업그레이드 완료', {
        fontSize: '12px', color: '#aaaaaa'
      }).setOrigin(0.5).setDepth(12);
      this._upgradeObjs.push(done);
      return;
    }

    if (!unit.upgradeHp) {
      const hpBtn = this.add.text(220, y, 'HP +50%  (25G)', {
        fontSize: '12px', color: '#ffffff',
        backgroundColor: '#1a4a2a', padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });
      hpBtn.on('pointerover', () => hpBtn.setStyle({ color: '#44ff88' }));
      hpBtn.on('pointerout', () => hpBtn.setStyle({ color: '#ffffff' }));
      hpBtn.on('pointerdown', () => {
        if (eco.spend(25)) {
          unit.stats.maxHp = Math.floor(unit.stats.maxHp * 1.5);
          unit.hp = Math.min(unit.hp + Math.floor(unit.maxHp * 0.5), unit.stats.maxHp);
          unit.maxHp = unit.stats.maxHp;
          unit.upgradeHp = true;
          unit._drawHpBar();
          this._renderUpgradeTab();
        }
      });
      this._upgradeObjs.push(hpBtn);
    }

    if (!unit.upgradeAtk) {
      const atkBtn = this.add.text(430, y, 'ATK +30%  (20G)', {
        fontSize: '12px', color: '#ffffff',
        backgroundColor: '#4a2a1a', padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });
      atkBtn.on('pointerover', () => atkBtn.setStyle({ color: '#ffaa44' }));
      atkBtn.on('pointerout', () => atkBtn.setStyle({ color: '#ffffff' }));
      atkBtn.on('pointerdown', () => {
        if (eco.spend(20)) {
          unit.stats.atk = Math.floor(unit.stats.atk * 1.3);
          unit.upgradeAtk = true;
          this._renderUpgradeTab();
        }
      });
      this._upgradeObjs.push(atkBtn);
    }
  }
}
