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

    // 처음 실행 시 튜토리얼 (localStorage로 체크)
    if (!localStorage.getItem('ps_tutorial_done')) {
      this.time.delayedCall(800, () => this._showTutorial());
    }

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
    const eco = gameScene.economyManager;
    if (this.hand.cards.length < 3) return;

    // 최고 족보: 패에서 3장 선택 × 공용패 조합 모두 시도
    let bestRank = -1, bestSuit = null;
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

    gameScene.unitManager.showSummonPreview(); // 카드 탭에서 항상 미리보기
    this.cardUI.render(this.hand, this.sharedCards);
    const buttons = this.cardUI.renderButtons(
      eco.getDrawCost(), eco.getReplaceCost(),
      summonPreview, magicPreview
    );

    buttons.summonBtn.on('pointerdown', () => {
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
    const gems = gameScene.gems ?? 0;
    let y = PANEL_Y + 20;

    // Permanent upgrade section (영구 강화, 젬 사용)
    const permTitle = this.add.text(320, y, '— 영구 강화  (◆ 젬 사용) —', {
      fontSize: '11px', color: '#88eeff'
    }).setOrigin(0.5).setDepth(12);
    this._upgradeObjs.push(permTitle);
    y += 20;

    const permHpLv = gameScene.permHpLevel ?? 0;
    const permAtkLv = gameScene.permAtkLevel ?? 0;
    const PERM_MAX = 10, PERM_COST = 1;

    const permHpBtn = this.add.text(190, y,
      permHpLv >= PERM_MAX ? `HP +${permHpLv * 3}% MAX` : `HP +3%  (◆${PERM_COST})  Lv${permHpLv}`,
      { fontSize: '11px', color: '#ffffff', backgroundColor: '#1a4a2a', padding: { x: 6, y: 3 } }
    ).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });
    permHpBtn.on('pointerover', () => permHpBtn.setStyle({ color: '#44ff88' }));
    permHpBtn.on('pointerout', () => permHpBtn.setStyle({ color: '#ffffff' }));
    permHpBtn.on('pointerdown', () => {
      if (permHpLv < PERM_MAX && gameScene.gems >= PERM_COST) {
        gameScene.gems -= PERM_COST;
        gameScene.permHpLevel = (gameScene.permHpLevel ?? 0) + 1;
        gameScene.registry.set('gems', gameScene.gems);
        this._renderUpgradeTab();
      }
    });
    this._upgradeObjs.push(permHpBtn);

    const permAtkBtn = this.add.text(440, y,
      permAtkLv >= PERM_MAX ? `ATK +${permAtkLv * 3}% MAX` : `ATK +3%  (◆${PERM_COST})  Lv${permAtkLv}`,
      { fontSize: '11px', color: '#ffffff', backgroundColor: '#4a2a1a', padding: { x: 6, y: 3 } }
    ).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });
    permAtkBtn.on('pointerover', () => permAtkBtn.setStyle({ color: '#ffaa44' }));
    permAtkBtn.on('pointerout', () => permAtkBtn.setStyle({ color: '#ffffff' }));
    permAtkBtn.on('pointerdown', () => {
      if (permAtkLv < PERM_MAX && gameScene.gems >= PERM_COST) {
        gameScene.gems -= PERM_COST;
        gameScene.permAtkLevel = (gameScene.permAtkLevel ?? 0) + 1;
        gameScene.registry.set('gems', gameScene.gems);
        this._renderUpgradeTab();
      }
    });
    this._upgradeObjs.push(permAtkBtn);
    y += 30;

    // Base HP recovery section
    const baseTitle = this.add.text(320, y, '— 본진 강화 —', {
      fontSize: '11px', color: '#88ccff'
    }).setOrigin(0.5).setDepth(12);
    this._upgradeObjs.push(baseTitle);
    y += 18;

    const recoverBtn = this.add.text(320, y, `본진 HP +20  (30G)`, {
      fontSize: '12px', color: '#ffffff',
      backgroundColor: '#2a4a2a', padding: { x: 8, y: 4 }
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
    y += 36;

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

  _showTutorial() {
    const steps = [
      {
        title: '소환 (Summon)',
        body: '패 5장의 족보를 판단해 타워를 소환합니다.\n높은 족보일수록 강한 타워가 나옵니다.\n교체를 하면 소환 비용이 할인됩니다.',
        color: '#2244aa',
      },
      {
        title: '교체 (Replace)',
        body: '원하는 카드 1장을 덱에서 새 카드로 교체합니다.\n교체할수록 소환 비용이 저렴해집니다.\n소환하면 교체 비용이 초기화됩니다.',
        color: '#226644',
      },
      {
        title: '마법 (Magic)',
        body: '패 3장 + 공용패 2장으로 족보를 만들어\n강력한 마법을 발동합니다.\n마법 사용 시 교체 비용이 초기화됩니다.',
        color: '#883399',
      },
    ];

    let stepIdx = 0;
    const objs = [];

    const uiScene = this.scene.get('UIScene') ?? this;
    const gs = this.scene.get('GameScene');
    if (gs) gs.input.enabled = false;

    const show = () => {
      objs.forEach(o => { if (o?.active) o.destroy(); });
      objs.length = 0;

      const s = steps[stepIdx];
      const overlay = this.add.rectangle(320, 400, 580, 360, 0x000000, 0.88).setDepth(30);
      const box = this.add.rectangle(320, 400, 560, 340, 0x0d1b2a, 1).setDepth(30).setStrokeStyle(2, 0x3a6080, 1);
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
      const btnLabel = isLast ? '시작하기' : '다음 ▶';
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
          localStorage.setItem('ps_tutorial_done', '1');
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
