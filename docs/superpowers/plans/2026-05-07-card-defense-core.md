# Card Defense Game — Core MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phaser 3 기반 카드 타워 디펜스 MVP — 포커 패로 유닛 소환, 그리드 배치, 적 웨이브 방어, 승패 판정.

**Architecture:** GameScene(게임 로직) + UIScene(카드 UI, HUD) 병렬 실행. 각 시스템은 독립 Manager 클래스로 분리. Phaser Registry로 씬 간 상태 공유, 씬 이벤트로 액션 통신.

**Tech Stack:** Phaser 3.60, Vite 5, JavaScript ES Modules, Vitest

---

## File Map

```
index.html
vite.config.js
package.json
src/
  main.js
  scenes/
    BootScene.js
    MenuScene.js
    GameScene.js        - 모든 Manager 조율
    UIScene.js          - 카드 UI + HUD (GameScene과 병렬)
  grid/
    Grid.js             - 셀 데이터, 점유 여부
    GridRenderer.js     - Phaser Graphics로 그리드 렌더
  cards/
    Card.js             - { suit, value }
    Deck.js             - 드로우 파일 + 무덤
    Hand.js             - 핸드 5장 관리
    SharedCards.js      - 공용 패 2장 슬롯
    HandEvaluator.js    - 포커 패 감지
  units/
    Unit.js             - 유닛 베이스 클래스
    UnitData.js         - 패 타입 × 속성 × 등급별 스탯
    UnitManager.js      - 소환, 배치, 관리
  enemies/
    Enemy.js            - 적 베이스 클래스
    EnemyData.js        - 적 타입별 스탯
    EnemyManager.js     - 스폰, 웨이브 관리
    Pathfinder.js       - A* 경로탐색
  combat/
    CombatManager.js    - 공격 틱, 데미지 처리
  stages/
    StageData.js        - 스테이지/웨이브 정의
    StageManager.js     - 웨이브 순서, 승패 판정
  ui/
    CardUI.js           - 핸드/공용패 렌더 + 인터랙션
    HUD.js              - 골드, 본진 HP, 웨이브 표시
tests/
  cards/
    HandEvaluator.test.js
    Deck.test.js
  grid/
    Grid.test.js
  enemies/
    Pathfinder.test.js
```

---

### Task 1: 프로젝트 셋업

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "card-defense",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "phaser": "^3.60.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: vite.config.js 작성**

```javascript
export default {
  base: './',
};
```

- [ ] **Step 3: index.html 작성**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Card Defense</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
  </style>
</head>
<body>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: src/main.js 작성 (씬 플레이스홀더로 시작)**

```javascript
import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() { this.scene.start('MenuScene'); }
}

class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }
  create() {
    this.add.text(240, 400, 'Card Defense', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    this.add.text(240, 460, '클릭하여 시작', { fontSize: '18px', color: '#aaa' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('GameScene'));
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  create() {
    this.add.text(240, 427, 'GameScene', { color: '#fff' }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 854,
  backgroundColor: '#1a1a2e',
  scene: [BootScene, MenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
```

- [ ] **Step 5: 의존성 설치 및 실행 확인**

```bash
npm install
npm run dev
```

Expected: 브라우저에서 "Card Defense" 텍스트와 시작 텍스트 표시됨.

- [ ] **Step 6: 커밋**

```bash
git init
git add .
git commit -m "feat: 프로젝트 초기 셋업 (Phaser 3 + Vite)"
```

---

### Task 2: Grid 시스템

**Files:**
- Create: `src/grid/Grid.js`
- Create: `src/grid/GridRenderer.js`
- Create: `tests/grid/Grid.test.js`

- [ ] **Step 1: 테스트 작성**

```javascript
// tests/grid/Grid.test.js
import { describe, it, expect } from 'vitest';
import Grid, { CELL_EMPTY, CELL_BLOCKED, CELL_UNIT, GRID_COLS, GRID_ROWS } from '../../src/grid/Grid.js';

describe('Grid', () => {
  it('초기 셀은 모두 CELL_EMPTY', () => {
    const grid = new Grid();
    expect(grid.getCell(0, 0)).toBe(CELL_EMPTY);
    expect(grid.getCell(GRID_COLS - 1, GRID_ROWS - 1)).toBe(CELL_EMPTY);
  });

  it('범위 밖은 null', () => {
    const grid = new Grid();
    expect(grid.getCell(-1, 0)).toBeNull();
    expect(grid.getCell(GRID_COLS, 0)).toBeNull();
  });

  it('CELL_UNIT은 isWalkable false', () => {
    const grid = new Grid();
    grid.setCell(3, 5, CELL_UNIT);
    expect(grid.isWalkable(3, 5)).toBe(false);
  });

  it('CELL_EMPTY는 isWalkable true', () => {
    const grid = new Grid();
    expect(grid.isWalkable(3, 5)).toBe(true);
  });

  it('cellToWorld / worldToCell 변환', () => {
    const grid = new Grid();
    const world = grid.cellToWorld(2, 3);
    const cell = grid.worldToCell(world.x, world.y);
    expect(cell.col).toBe(2);
    expect(cell.row).toBe(3);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test
```
Expected: FAIL (Grid.js 없음)

- [ ] **Step 3: Grid.js 작성**

```javascript
// src/grid/Grid.js
export const CELL_SIZE = 44;
export const GRID_COLS = 10;
export const GRID_ROWS = 14;
export const CELL_EMPTY = 0;
export const CELL_BLOCKED = 1;
export const CELL_UNIT = 2;

// 맵 상단 여백(적 스폰 영역 위), 하단 UI 영역 고려
export const GRID_OFFSET_X = (480 - GRID_COLS * CELL_SIZE) / 2; // 8px
export const GRID_OFFSET_Y = 20;

export default class Grid {
  constructor() {
    this.cells = Array.from({ length: GRID_ROWS }, () =>
      Array(GRID_COLS).fill(CELL_EMPTY)
    );
  }

  isInBounds(col, row) {
    return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
  }

  isWalkable(col, row) {
    if (!this.isInBounds(col, row)) return false;
    return this.cells[row][col] === CELL_EMPTY;
  }

  setCell(col, row, type) {
    if (this.isInBounds(col, row)) this.cells[row][col] = type;
  }

  getCell(col, row) {
    if (!this.isInBounds(col, row)) return null;
    return this.cells[row][col];
  }

  cellToWorld(col, row) {
    return {
      x: GRID_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2,
      y: GRID_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2,
    };
  }

  worldToCell(x, y) {
    return {
      col: Math.floor((x - GRID_OFFSET_X) / CELL_SIZE),
      row: Math.floor((y - GRID_OFFSET_Y) / CELL_SIZE),
    };
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```
Expected: PASS (5 tests)

- [ ] **Step 5: GridRenderer.js 작성**

```javascript
// src/grid/GridRenderer.js
import { CELL_SIZE, GRID_COLS, GRID_ROWS, GRID_OFFSET_X, GRID_OFFSET_Y, CELL_BLOCKED } from './Grid.js';

export default class GridRenderer {
  constructor(scene, grid) {
    this.scene = scene;
    this.grid = grid;
    this.graphics = scene.add.graphics();
    this.draw();
  }

  draw() {
    const g = this.graphics;
    g.clear();

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = GRID_OFFSET_X + col * CELL_SIZE;
        const y = GRID_OFFSET_Y + row * CELL_SIZE;
        const cellType = this.grid.getCell(col, row);

        if (cellType === CELL_BLOCKED) {
          g.fillStyle(0x334455, 1);
          g.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        } else {
          g.lineStyle(1, 0x2a3a4a, 0.5);
          g.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }

  refresh() {
    this.draw();
  }
}
```

- [ ] **Step 6: GameScene에 Grid + GridRenderer 연결**

`src/main.js`의 GameScene을 아래로 교체:

```javascript
// src/main.js (GameScene 부분만 교체)
import Grid from './grid/Grid.js';
import GridRenderer from './grid/GridRenderer.js';

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  create() {
    this.grid = new Grid();
    this.gridRenderer = new GridRenderer(this, this.grid);
    // 테스트용: 가운데 셀 클릭 시 유닛 표시
    this.input.on('pointerdown', (ptr) => {
      const { col, row } = this.grid.worldToCell(ptr.x, ptr.y);
      if (this.grid.isWalkable(col, row)) {
        this.grid.setCell(col, row, 2); // CELL_UNIT
        const pos = this.grid.cellToWorld(col, row);
        this.add.rectangle(pos.x, pos.y, 36, 36, 0x44aaff);
        this.gridRenderer.refresh();
      }
    });
  }
}
```

- [ ] **Step 7: 브라우저 확인**

`npm run dev` → 그리드 격자가 세로로 표시되고, 클릭하면 파란 사각형이 배치됨.

- [ ] **Step 8: 커밋**

```bash
git add src/grid/ tests/grid/ src/main.js
git commit -m "feat: 그리드 시스템 구현 (Grid, GridRenderer)"
```

---

### Task 3: 카드 & 덱 시스템

**Files:**
- Create: `src/cards/Card.js`
- Create: `src/cards/Deck.js`
- Create: `src/cards/Hand.js`
- Create: `src/cards/SharedCards.js`
- Create: `tests/cards/Deck.test.js`

- [ ] **Step 1: 테스트 작성**

```javascript
// tests/cards/Deck.test.js
import { describe, it, expect } from 'vitest';
import Deck from '../../src/cards/Deck.js';

describe('Deck', () => {
  it('초기 덱은 32장', () => {
    const deck = new Deck();
    expect(deck.drawPile.length).toBe(32);
  });

  it('draw()는 카드를 반환하고 덱을 1장 줄임', () => {
    const deck = new Deck();
    const card = deck.draw();
    expect(card).toHaveProperty('suit');
    expect(card).toHaveProperty('value');
    expect(deck.drawPile.length).toBe(31);
  });

  it('덱 소진 시 무덤을 셔플하여 재사용', () => {
    const deck = new Deck();
    const drawn = [];
    for (let i = 0; i < 32; i++) drawn.push(deck.draw());
    drawn.forEach(c => deck.discard(c));
    expect(deck.drawPile.length).toBe(0);
    expect(deck.discardPile.length).toBe(32);
    const card = deck.draw(); // 자동 셔플
    expect(card).toBeTruthy();
    expect(deck.drawPile.length).toBe(31);
    expect(deck.discardPile.length).toBe(0);
  });

  it('discard()는 무덤에 추가', () => {
    const deck = new Deck();
    const card = deck.draw();
    deck.discard(card);
    expect(deck.discardPile.length).toBe(1);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test
```
Expected: FAIL

- [ ] **Step 3: Card.js 작성**

```javascript
// src/cards/Card.js
export const SUITS = ['H', 'D', 'C', 'S']; // 불, 물, 땅, 바람
export const VALUES = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const SUIT_NAMES = { H: '불', D: '물', C: '땅', S: '바람' };
export const SUIT_COLORS = { H: 0xff4444, D: 0x4488ff, C: 0x44cc44, S: 0xaa66ff };

export default class Card {
  constructor(suit, value) {
    this.suit = suit;   // 'H'|'D'|'C'|'S'
    this.value = value; // '7'|'8'|...|'A'
    this.id = `${suit}-${value}`;
  }
}
```

- [ ] **Step 4: Deck.js 작성**

```javascript
// src/cards/Deck.js
import Card, { SUITS, VALUES } from './Card.js';

export default class Deck {
  constructor() {
    this.drawPile = [];
    this.discardPile = [];
    this._buildDeck();
    this._shuffle(this.drawPile);
  }

  _buildDeck() {
    for (const suit of SUITS) {
      for (const value of VALUES) {
        this.drawPile.push(new Card(suit, value));
      }
    }
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  draw() {
    if (this.drawPile.length === 0) {
      if (this.discardPile.length === 0) return null;
      this.drawPile = [...this.discardPile];
      this.discardPile = [];
      this._shuffle(this.drawPile);
    }
    return this.drawPile.pop();
  }

  discard(card) {
    this.discardPile.push(card);
  }

  discardMany(cards) {
    cards.forEach(c => this.discard(c));
  }
}
```

- [ ] **Step 5: Hand.js 작성**

```javascript
// src/cards/Hand.js
export const HAND_SIZE = 5;

export default class Hand {
  constructor() {
    this.cards = []; // 최대 5장
  }

  addCard(card) {
    if (this.cards.length < HAND_SIZE) {
      this.cards.push(card);
      return true;
    }
    return false;
  }

  isFull() {
    return this.cards.length >= HAND_SIZE;
  }

  removeCard(index) {
    return this.cards.splice(index, 1)[0];
  }

  // 핸드 전체 반환 후 비움
  consumeAll() {
    const all = [...this.cards];
    this.cards = [];
    return all;
  }

  // 특정 인덱스 카드 교체용 - 교체 비용은 EconomyManager에서 처리
  replaceCard(index, newCard) {
    const old = this.cards[index];
    this.cards[index] = newCard;
    return old;
  }
}
```

- [ ] **Step 6: SharedCards.js 작성**

```javascript
// src/cards/SharedCards.js
export const SHARED_SIZE = 2;

export default class SharedCards {
  constructor() {
    this.cards = []; // 항상 2장 유지
  }

  fill(deck) {
    while (this.cards.length < SHARED_SIZE) {
      const card = deck.draw();
      if (card) this.cards.push(card);
    }
  }

  // 마법 사용 후 2장 소모 → 새로 드로우
  consume(deck) {
    const consumed = [...this.cards];
    this.cards = [];
    this.fill(deck);
    return consumed;
  }

  getCards() {
    return [...this.cards];
  }
}
```

- [ ] **Step 7: 테스트 통과 확인**

```bash
npm test
```
Expected: PASS (4 tests)

- [ ] **Step 8: 커밋**

```bash
git add src/cards/ tests/cards/Deck.test.js
git commit -m "feat: 카드/덱/핸드/공용패 시스템 구현"
```

---

### Task 4: HandEvaluator (포커 패 감지)

**Files:**
- Create: `src/cards/HandEvaluator.js`
- Create: `tests/cards/HandEvaluator.test.js`

- [ ] **Step 1: 테스트 작성**

```javascript
// tests/cards/HandEvaluator.test.js
import { describe, it, expect } from 'vitest';
import { evaluateHand, HAND_RANK } from '../../src/cards/HandEvaluator.js';

const c = (suit, value) => ({ suit, value });

describe('HandEvaluator', () => {
  it('스트레이트 플러시 감지', () => {
    const cards = [c('H','7'), c('H','8'), c('H','9'), c('H','10'), c('H','J')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.STRAIGHT_FLUSH);
  });

  it('포카인드 감지', () => {
    const cards = [c('H','A'), c('D','A'), c('C','A'), c('S','A'), c('H','K')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.FOUR_OF_A_KIND);
  });

  it('풀하우스 감지', () => {
    const cards = [c('H','K'), c('D','K'), c('C','K'), c('H','7'), c('D','7')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.FULL_HOUSE);
  });

  it('플러시 감지', () => {
    const cards = [c('H','7'), c('H','9'), c('H','J'), c('H','K'), c('H','A')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.FLUSH);
  });

  it('스트레이트 감지', () => {
    const cards = [c('H','7'), c('D','8'), c('C','9'), c('S','10'), c('H','J')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.STRAIGHT);
  });

  it('트리플 감지', () => {
    const cards = [c('H','Q'), c('D','Q'), c('C','Q'), c('S','7'), c('H','8')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.THREE_OF_A_KIND);
  });

  it('투페어 감지', () => {
    const cards = [c('H','K'), c('D','K'), c('H','Q'), c('D','Q'), c('C','7')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.TWO_PAIR);
  });

  it('원페어 감지', () => {
    const cards = [c('H','J'), c('D','J'), c('C','7'), c('S','9'), c('H','A')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.ONE_PAIR);
  });

  it('탑(노페어) 감지', () => {
    const cards = [c('H','7'), c('D','9'), c('C','J'), c('S','K'), c('H','A')];
    expect(evaluateHand(cards).rank).toBe(HAND_RANK.HIGH_CARD);
  });

  it('dominantSuit: 가장 많은 무늬 반환', () => {
    const cards = [c('H','7'), c('H','9'), c('D','J'), c('H','K'), c('C','A')];
    expect(evaluateHand(cards).dominantSuit).toBe('H');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test
```
Expected: FAIL

- [ ] **Step 3: HandEvaluator.js 작성**

```javascript
// src/cards/HandEvaluator.js
export const HAND_RANK = {
  HIGH_CARD: 0,
  ONE_PAIR: 1,
  TWO_PAIR: 2,
  THREE_OF_A_KIND: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  FOUR_OF_A_KIND: 7,
  STRAIGHT_FLUSH: 8,
};

const VALUE_ORDER = {
  '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

export function evaluateHand(cards) {
  const values = cards.map(c => VALUE_ORDER[c.value]).sort((a, b) => a - b);
  const suits = cards.map(c => c.suit);

  const valueCounts = {};
  values.forEach(v => { valueCounts[v] = (valueCounts[v] || 0) + 1; });
  const counts = Object.values(valueCounts).sort((a, b) => b - a);

  const isFlush = suits.every(s => s === suits[0]);
  const isSequential = values[4] - values[0] === 4 && new Set(values).size === 5;

  let rank;
  if (isFlush && isSequential)        rank = HAND_RANK.STRAIGHT_FLUSH;
  else if (counts[0] === 4)           rank = HAND_RANK.FOUR_OF_A_KIND;
  else if (counts[0] === 3 && counts[1] === 2) rank = HAND_RANK.FULL_HOUSE;
  else if (isFlush)                   rank = HAND_RANK.FLUSH;
  else if (isSequential)              rank = HAND_RANK.STRAIGHT;
  else if (counts[0] === 3)           rank = HAND_RANK.THREE_OF_A_KIND;
  else if (counts[0] === 2 && counts[1] === 2) rank = HAND_RANK.TWO_PAIR;
  else if (counts[0] === 2)           rank = HAND_RANK.ONE_PAIR;
  else                                rank = HAND_RANK.HIGH_CARD;

  const suitCounts = {};
  suits.forEach(s => { suitCounts[s] = (suitCounts[s] || 0) + 1; });
  const dominantSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0][0];

  return { rank, dominantSuit };
}

// 핸드 패 이름 (UI 표시용)
export const HAND_NAMES = {
  [HAND_RANK.HIGH_CARD]: '탑',
  [HAND_RANK.ONE_PAIR]: '원페어',
  [HAND_RANK.TWO_PAIR]: '투페어',
  [HAND_RANK.THREE_OF_A_KIND]: '트리플',
  [HAND_RANK.STRAIGHT]: '스트레이트',
  [HAND_RANK.FLUSH]: '플러시',
  [HAND_RANK.FULL_HOUSE]: '풀하우스',
  [HAND_RANK.FOUR_OF_A_KIND]: '포카인드',
  [HAND_RANK.STRAIGHT_FLUSH]: '스트레이트플러시',
};
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```
Expected: PASS (10 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/cards/HandEvaluator.js tests/cards/HandEvaluator.test.js
git commit -m "feat: 포커 핸드 평가기 구현 (HandEvaluator)"
```

---

### Task 5: Pathfinder (A*)

**Files:**
- Create: `src/enemies/Pathfinder.js`
- Create: `tests/enemies/Pathfinder.test.js`

- [ ] **Step 1: 테스트 작성**

```javascript
// tests/enemies/Pathfinder.test.js
import { describe, it, expect } from 'vitest';
import Pathfinder from '../../src/enemies/Pathfinder.js';
import Grid, { CELL_UNIT } from '../../src/grid/Grid.js';

describe('Pathfinder', () => {
  it('직선 경로 찾기', () => {
    const grid = new Grid();
    const pf = new Pathfinder(grid);
    const path = pf.findPath(0, 0, 0, 3);
    expect(path).not.toBeNull();
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toEqual({ col: 0, row: 3 });
  });

  it('장애물 우회', () => {
    const grid = new Grid();
    // col 1을 모두 막음
    for (let r = 0; r < 5; r++) grid.setCell(1, r, CELL_UNIT);
    const pf = new Pathfinder(grid);
    const path = pf.findPath(0, 0, 2, 0);
    expect(path).not.toBeNull();
    // col 1을 지나지 않아야 함
    const passesCol1 = path.some(p => p.col === 1);
    expect(passesCol1).toBe(false);
  });

  it('경로 없으면 null', () => {
    const grid = new Grid();
    // 목적지를 완전히 막음
    for (let c = 0; c < 10; c++) grid.setCell(c, 5, CELL_UNIT);
    const pf = new Pathfinder(grid);
    const path = pf.findPath(0, 0, 0, 6);
    expect(path).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test
```
Expected: FAIL

- [ ] **Step 3: Pathfinder.js 작성**

```javascript
// src/enemies/Pathfinder.js
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
      // 가장 낮은 f 값 노드 선택
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

    return null; // 경로 없음
  }

  _reconstructPath(cameFrom, endKey) {
    const path = [];
    let current = endKey;
    while (cameFrom.has(current)) {
      const [col, row] = current.split(',').map(Number);
      path.unshift({ col, row });
      current = cameFrom.get(current);
    }
    return path;
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```
Expected: PASS (3 new tests, 17 total)

- [ ] **Step 5: 커밋**

```bash
git add src/enemies/Pathfinder.js tests/enemies/Pathfinder.test.js
git commit -m "feat: A* 경로탐색 구현 (Pathfinder)"
```

---

### Task 6: 씬 구조 + UnitData + EnemyData

**Files:**
- Create: `src/units/UnitData.js`
- Create: `src/enemies/EnemyData.js`
- Modify: `src/main.js` → 씬을 별도 파일로 분리

- [ ] **Step 1: src/scenes/ 디렉토리에 씬 파일 생성**

```javascript
// src/scenes/BootScene.js
import Phaser from 'phaser';
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {
    // 추후 에셋 로드
  }
  create() { this.scene.start('MenuScene'); }
}
```

```javascript
// src/scenes/MenuScene.js
import Phaser from 'phaser';
export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }
  create() {
    this.add.rectangle(240, 427, 480, 854, 0x0d1b2a);
    this.add.text(240, 360, 'CARD DEFENSE', {
      fontSize: '36px', color: '#e8c97a', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(240, 420, '항해와 패의 시대', {
      fontSize: '18px', color: '#8ab4d4'
    }).setOrigin(0.5);
    const btn = this.add.text(240, 500, '[ 게임 시작 ]', {
      fontSize: '22px', color: '#ffffff'
    }).setOrigin(0.5).setInteractive();
    btn.on('pointerover', () => btn.setColor('#e8c97a'));
    btn.on('pointerout', () => btn.setColor('#ffffff'));
    btn.on('pointerdown', () => this.scene.start('GameScene'));
  }
}
```

```javascript
// src/scenes/UIScene.js
import Phaser from 'phaser';
export default class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }
  create() {
    // GameScene이 실행한 후 launch됨
    // 추후 CardUI, HUD 연결
  }
}
```

```javascript
// src/scenes/GameScene.js
import Phaser from 'phaser';
import Grid from '../grid/Grid.js';
import GridRenderer from '../grid/GridRenderer.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.grid = new Grid();
    this.gridRenderer = new GridRenderer(this, this.grid);
    this.scene.launch('UIScene');
  }

  update(time, delta) {}
}
```

- [ ] **Step 2: main.js를 씬 임포트 방식으로 교체**

```javascript
// src/main.js
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 854,
  backgroundColor: '#0d1b2a',
  scene: [BootScene, MenuScene, GameScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
```

- [ ] **Step 3: UnitData.js 작성**

```javascript
// src/units/UnitData.js
import { HAND_RANK } from '../cards/HandEvaluator.js';

// 속성(suit) 이름
export const ATTR = { H: '불', D: '물', C: '땅', S: '바람' };

// 역할 타입
export const ROLE = {
  ATTACK: 'attack',       // 단일 대상 고공격
  AREA: 'area',           // 범위 저공격
  SUPPORT_SPEED: 'supportSpeed', // 주변 아군 공격속도 증가
  SUPPORT_SLOW: 'supportSlow',   // 공격한 적 감속
  TANK: 'tank',           // 고HP 어그로
  SNIPER: 'sniper',       // 긴 사거리 저공격속도
};

// 패 랭크 → 기본 스탯 배수 (등급 1 기준)
// grade 2: ×1.8, grade 3: ×3.2
export const GRADE_MULTIPLIER = { 1: 1.0, 2: 1.8, 3: 3.2 };

// 패 랭크 × 속성 → 역할 매핑
// [handRank][suit] = role
export const UNIT_ROLE_MAP = {
  [HAND_RANK.HIGH_CARD]:       { H: ROLE.ATTACK,        D: ROLE.ATTACK,        C: ROLE.TANK,          S: ROLE.ATTACK },
  [HAND_RANK.ONE_PAIR]:        { H: ROLE.ATTACK,        D: ROLE.SUPPORT_SLOW,  C: ROLE.TANK,          S: ROLE.SUPPORT_SPEED },
  [HAND_RANK.TWO_PAIR]:        { H: ROLE.AREA,          D: ROLE.SUPPORT_SLOW,  C: ROLE.TANK,          S: ROLE.SUPPORT_SPEED },
  [HAND_RANK.THREE_OF_A_KIND]: { H: ROLE.ATTACK,        D: ROLE.AREA,          C: ROLE.TANK,          S: ROLE.SNIPER },
  [HAND_RANK.STRAIGHT]:        { H: ROLE.AREA,          D: ROLE.SUPPORT_SLOW,  C: ROLE.TANK,          S: ROLE.SNIPER },
  [HAND_RANK.FLUSH]:           { H: ROLE.ATTACK,        D: ROLE.AREA,          C: ROLE.SUPPORT_SPEED, S: ROLE.SNIPER },
  [HAND_RANK.FULL_HOUSE]:      { H: ROLE.ATTACK,        D: ROLE.SUPPORT_SLOW,  C: ROLE.TANK,          S: ROLE.SUPPORT_SPEED },
  [HAND_RANK.FOUR_OF_A_KIND]:  { H: ROLE.AREA,          D: ROLE.AREA,          C: ROLE.SUPPORT_SPEED, S: ROLE.SNIPER },
  [HAND_RANK.STRAIGHT_FLUSH]:  { H: ROLE.ATTACK,        D: ROLE.AREA,          C: ROLE.TANK,          S: ROLE.SNIPER },
};

// 역할별 기본 스탯 (grade 1)
export const ROLE_BASE_STATS = {
  [ROLE.ATTACK]:        { hp: 120, atk: 25, atkSpeed: 1.2, range: 2.5, areaRadius: 0 },
  [ROLE.AREA]:          { hp: 100, atk: 15, atkSpeed: 0.9, range: 2.0, areaRadius: 1.5 },
  [ROLE.SUPPORT_SPEED]: { hp: 80,  atk: 10, atkSpeed: 1.0, range: 1.5, areaRadius: 0, buffRadius: 2, buffAtkSpeed: 0.4 },
  [ROLE.SUPPORT_SLOW]:  { hp: 90,  atk: 12, atkSpeed: 1.0, range: 2.0, areaRadius: 0, slowAmount: 0.4 },
  [ROLE.TANK]:          { hp: 300, atk: 8,  atkSpeed: 0.6, range: 1.5, areaRadius: 0 },
  [ROLE.SNIPER]:        { hp: 70,  atk: 40, atkSpeed: 0.4, range: 5.0, areaRadius: 0 },
};

export function getUnitStats(handRank, suit, grade) {
  const role = UNIT_ROLE_MAP[handRank]?.[suit] ?? ROLE.ATTACK;
  const base = { ...ROLE_BASE_STATS[role] };
  const mult = GRADE_MULTIPLIER[grade] ?? 1;
  return {
    role,
    hp: Math.floor(base.hp * mult),
    maxHp: Math.floor(base.hp * mult),
    atk: Math.floor(base.atk * mult),
    atkSpeed: base.atkSpeed,
    range: base.range,
    areaRadius: base.areaRadius ?? 0,
    buffRadius: base.buffRadius ?? 0,
    buffAtkSpeed: base.buffAtkSpeed ?? 0,
    slowAmount: base.slowAmount ?? 0,
  };
}
```

- [ ] **Step 4: EnemyData.js 작성**

```javascript
// src/enemies/EnemyData.js
export const ENEMY_TYPE = {
  BASIC: 'basic',
  TANK: 'tank',
  RUNNER: 'runner',
  AERIAL: 'aerial',
  MAGIC_IMMUNE: 'magicImmune',
  SPLITTER: 'splitter',
  REGEN: 'regen',
  FREEZER: 'freezer',
  BOSS: 'boss',
};

export const ENEMY_STATS = {
  [ENEMY_TYPE.BASIC]:       { hp: 100, atk: 10, speed: 60,  reward: 2, magicImmune: false, isAerial: false },
  [ENEMY_TYPE.TANK]:        { hp: 400, atk: 15, speed: 30,  reward: 5, magicImmune: false, isAerial: false },
  [ENEMY_TYPE.RUNNER]:      { hp: 50,  atk: 8,  speed: 120, reward: 2, magicImmune: false, isAerial: false },
  [ENEMY_TYPE.AERIAL]:      { hp: 80,  atk: 12, speed: 80,  reward: 3, magicImmune: false, isAerial: true  },
  [ENEMY_TYPE.MAGIC_IMMUNE]:{ hp: 120, atk: 12, speed: 60,  reward: 5, magicImmune: true,  isAerial: false },
  [ENEMY_TYPE.SPLITTER]:    { hp: 150, atk: 10, speed: 50,  reward: 4, magicImmune: false, isAerial: false, splitsInto: ENEMY_TYPE.BASIC, splitCount: 2 },
  [ENEMY_TYPE.REGEN]:       { hp: 200, atk: 10, speed: 55,  reward: 4, magicImmune: false, isAerial: false, regenRate: 5 },
  [ENEMY_TYPE.FREEZER]:     { hp: 90,  atk: 8,  speed: 65,  reward: 5, magicImmune: false, isAerial: false, freezeRadius: 2.0, freezeDuration: 2000 },
  [ENEMY_TYPE.BOSS]:        { hp: 2000, atk: 30, speed: 40, reward: 20, magicImmune: false, isAerial: false },
};
```

- [ ] **Step 5: 브라우저 확인**

```bash
npm run dev
```
Expected: 메뉴 화면 → 클릭 시 게임 씬(그리드만)으로 전환됨.

- [ ] **Step 6: 커밋**

```bash
git add src/scenes/ src/units/UnitData.js src/enemies/EnemyData.js src/main.js
git commit -m "feat: 씬 구조 분리, UnitData/EnemyData 정의"
```

---

### Task 7: Unit 시스템

**Files:**
- Create: `src/units/Unit.js`
- Create: `src/units/UnitManager.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Unit.js 작성**

```javascript
// src/units/Unit.js
import { ROLE } from './UnitData.js';
import { SUIT_COLORS } from '../cards/Card.js';

export default class Unit {
  constructor(scene, col, row, handRank, suit, grade, stats) {
    this.scene = scene;
    this.col = col;
    this.row = row;
    this.handRank = handRank;
    this.suit = suit;
    this.grade = grade;
    this.stats = { ...stats };
    this.hp = stats.hp;
    this.maxHp = stats.maxHp;
    this.atkCooldown = 0;
    this.target = null;
    this.frozen = false;
    this.frozenUntil = 0;

    // Phaser 게임 오브젝트
    const pos = scene.grid.cellToWorld(col, row);
    const color = SUIT_COLORS[suit] ?? 0xffffff;
    this.sprite = scene.add.rectangle(pos.x, pos.y, 36, 36, color).setDepth(2);
    this.hpBar = scene.add.graphics().setDepth(3);
    this.gradeText = scene.add.text(pos.x, pos.y - 14, `${grade}`, {
      fontSize: '10px', color: '#fff'
    }).setOrigin(0.5).setDepth(4);
    this._drawHpBar();

    // 지원형: 버프 영역 원 (옵션)
    this.glowCircle = null;
  }

  _drawHpBar() {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    this.hpBar.clear();
    const ratio = this.hp / this.maxHp;
    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(pos.x - 18, pos.y + 16, 36, 4);
    this.hpBar.fillStyle(ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff4444);
    this.hpBar.fillRect(pos.x - 18, pos.y + 16, Math.floor(36 * ratio), 4);
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this._drawHpBar();
    return this.hp <= 0;
  }

  freeze(duration) {
    this.frozen = true;
    this.frozenUntil = Date.now() + duration; // Date.now() ms 기준
    this.sprite.setFillStyle(0xaaddff);
  }

  update(time) {
    // frozenUntil은 Date.now() 기준이므로 Date.now()로 비교
    if (this.frozen && Date.now() > this.frozenUntil) {
      this.frozen = false;
      this.sprite.setFillStyle(SUIT_COLORS[this.suit] ?? 0xffffff);
    }
  }

  setGlow(active) {
    const pos = this.scene.grid.cellToWorld(this.col, this.row);
    if (active && !this.glowCircle) {
      this.glowCircle = this.scene.add.circle(pos.x, pos.y, 22, 0xffff00, 0.35).setDepth(1);
    } else if (!active && this.glowCircle) {
      this.glowCircle.destroy();
      this.glowCircle = null;
    }
  }

  destroy() {
    this.sprite.destroy();
    this.hpBar.destroy();
    this.gradeText.destroy();
    if (this.glowCircle) this.glowCircle.destroy();
  }
}
```

- [ ] **Step 2: UnitManager.js 작성**

```javascript
// src/units/UnitManager.js
import Unit from './Unit.js';
import { getUnitStats, ROLE } from './UnitData.js';
import { CELL_UNIT, CELL_EMPTY } from '../grid/Grid.js';

export default class UnitManager {
  constructor(scene) {
    this.scene = scene;
    this.units = []; // Unit[]
  }

  // 유닛 소환 및 배치
  placeUnit(col, row, handRank, suit, grade) {
    if (!this.scene.grid.isWalkable(col, row)) return null;
    const stats = getUnitStats(handRank, suit, grade);
    const unit = new Unit(this.scene, col, row, handRank, suit, grade, stats);
    this.units.push(unit);
    this.scene.grid.setCell(col, row, CELL_UNIT);
    this._checkMerge(unit);
    return unit;
  }

  // 같은 패+등급 유닛 2개 있으면 글로우 표시
  _checkMerge(newUnit) {
    const matches = this.units.filter(u =>
      u !== newUnit &&
      u.handRank === newUnit.handRank &&
      u.grade === newUnit.grade
    );
    if (matches.length >= 1) {
      newUnit.setGlow(true);
      matches[0].setGlow(true);
    }
  }

  // 드래그로 합성: targetUnit 위치에서 sourceUnit → 업그레이드
  merge(sourceUnit, targetUnit) {
    if (sourceUnit.handRank !== targetUnit.handRank) return null;
    if (sourceUnit.grade !== targetUnit.grade) return null;
    if (sourceUnit.grade >= 3) return null;

    const { col, row } = targetUnit;
    const newGrade = sourceUnit.grade + 1;
    const { handRank, suit } = targetUnit;

    this.removeUnit(sourceUnit);
    this.removeUnit(targetUnit);

    const merged = this.placeUnit(col, row, handRank, suit, newGrade);
    return merged;
  }

  removeUnit(unit) {
    this.scene.grid.setCell(unit.col, unit.row, CELL_EMPTY);
    unit.destroy();
    this.units = this.units.filter(u => u !== unit);
    this._refreshAllGlows();
  }

  _refreshAllGlows() {
    // 모든 글로우 초기화 후 재검사
    this.units.forEach(u => u.setGlow(false));
    for (let i = 0; i < this.units.length; i++) {
      for (let j = i + 1; j < this.units.length; j++) {
        const a = this.units[i];
        const b = this.units[j];
        if (a.handRank === b.handRank && a.grade === b.grade) {
          a.setGlow(true);
          b.setGlow(true);
        }
      }
    }
  }

  getUnitsInRange(x, y, range) {
    const cellRange = range; // range는 셀 단위
    return this.units.filter(u => {
      const pos = this.scene.grid.cellToWorld(u.col, u.row);
      const dx = pos.x - x;
      const dy = pos.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= cellRange * 44;
    });
  }

  update(time, delta) {
    this.units.forEach(u => u.update(time));
  }
}
```

- [ ] **Step 3: GameScene에 연결 (유닛 소환 테스트)**

```javascript
// src/scenes/GameScene.js
import Phaser from 'phaser';
import Grid from '../grid/Grid.js';
import GridRenderer from '../grid/GridRenderer.js';
import UnitManager from '../units/UnitManager.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.grid = new Grid();
    this.gridRenderer = new GridRenderer(this, this.grid);
    this.unitManager = new UnitManager(this);
    this.scene.launch('UIScene');

    // 테스트: 클릭 시 원페어 불 1등급 유닛 배치
    this.input.on('pointerdown', (ptr) => {
      if (ptr.y > 650) return; // UI 영역 클릭 제외
      const { col, row } = this.grid.worldToCell(ptr.x, ptr.y);
      this.unitManager.placeUnit(col, row, HAND_RANK.ONE_PAIR, 'H', 1);
    });
  }

  update(time, delta) {
    this.unitManager.update(time, delta);
  }
}
```

- [ ] **Step 4: 브라우저 확인**

그리드 클릭 → 빨간 사각형 유닛 배치됨. 같은 타입 2개 배치 시 노란 글로우 표시.

- [ ] **Step 5: 커밋**

```bash
git add src/units/ src/scenes/GameScene.js
git commit -m "feat: 유닛 시스템 구현 (Unit, UnitManager, 합성 감지)"
```

---

### Task 8: Enemy + EnemyManager

**Files:**
- Create: `src/enemies/Enemy.js`
- Create: `src/enemies/EnemyManager.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Enemy.js 작성**

```javascript
// src/enemies/Enemy.js
import { ENEMY_STATS, ENEMY_TYPE } from './EnemyData.js';
import { GRID_OFFSET_X, GRID_OFFSET_Y, CELL_SIZE } from '../grid/Grid.js';

export default class Enemy {
  constructor(scene, col, row, type) {
    this.scene = scene;
    this.col = col;
    this.row = row;
    this.type = type;
    const stats = { ...ENEMY_STATS[type] };
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.atk = stats.atk;
    this.speed = stats.speed; // px/sec
    this.reward = stats.reward;
    this.magicImmune = stats.magicImmune;
    this.isAerial = stats.isAerial;
    this.regenRate = stats.regenRate ?? 0;
    this.freezeRadius = stats.freezeRadius ?? 0;
    this.freezeDuration = stats.freezeDuration ?? 0;

    this.path = null;
    this.pathIndex = 0;
    this.targetUnit = null; // 경로 없을 때 공격할 유닛

    // 월드 좌표
    const pos = scene.grid.cellToWorld(col, row);
    this.x = pos.x;
    this.y = pos.y;

    const color = type === ENEMY_TYPE.BOSS ? 0xff0000 : 0xee8800;
    this.sprite = scene.add.rectangle(this.x, this.y, 32, 32, color).setDepth(2);
    this.hpBar = scene.add.graphics().setDepth(3);
    this._drawHpBar();

    this.atkCooldown = 0;
    this.regenAccum = 0;
    this.frozenUntil = 0;
  }

  _drawHpBar() {
    this.hpBar.clear();
    const ratio = this.hp / this.maxHp;
    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(this.x - 16, this.y - 22, 32, 4);
    this.hpBar.fillStyle(0xff3333);
    this.hpBar.fillRect(this.x - 16, this.y - 22, Math.floor(32 * ratio), 4);
  }

  takeDamage(amount) {
    if (this.hp <= 0) return true;
    this.hp = Math.max(0, this.hp - amount);
    this._drawHpBar();
    return this.hp <= 0;
  }

  update(time, delta) {
    if (time < this.frozenUntil) return;

    const dtSec = delta / 1000;

    // 재생형 HP 회복
    if (this.regenRate > 0) {
      this.regenAccum += this.regenRate * dtSec;
      if (this.regenAccum >= 1) {
        this.hp = Math.min(this.maxHp, this.hp + Math.floor(this.regenAccum));
        this.regenAccum = 0;
        this._drawHpBar();
      }
    }

    this._moveAlongPath(dtSec);
  }

  _moveAlongPath(dtSec) {
    if (!this.path || this.pathIndex >= this.path.length) return;

    const target = this.path[this.pathIndex];
    const targetPos = this.scene.grid.cellToWorld(target.col, target.row);
    const dx = targetPos.x - this.x;
    const dy = targetPos.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveAmount = this.speed * dtSec;

    if (dist <= moveAmount) {
      this.x = targetPos.x;
      this.y = targetPos.y;
      this.col = target.col;
      this.row = target.row;
      this.pathIndex++;
    } else {
      this.x += (dx / dist) * moveAmount;
      this.y += (dy / dist) * moveAmount;
    }

    this.sprite.setPosition(this.x, this.y);
    this._drawHpBar();
  }

  applyFreeze(duration) {
    this.frozenUntil = Date.now() + duration;
    this.sprite.setFillStyle(0xaaddff);
  }

  setPath(path) {
    this.path = path;
    this.pathIndex = 0;
  }

  isAtDestination(destCol, destRow) {
    return this.col === destCol && this.row === destRow;
  }

  destroy() {
    this.sprite.destroy();
    this.hpBar.destroy();
  }
}
```

- [ ] **Step 2: EnemyManager.js 작성**

```javascript
// src/enemies/EnemyManager.js
import Enemy from './Enemy.js';
import Pathfinder from './Pathfinder.js';
import { GRID_COLS } from '../grid/Grid.js';

const SPAWN_COL = Math.floor(GRID_COLS / 2);
const SPAWN_ROW = 0;
const BASE_COL = Math.floor(GRID_COLS / 2);

export default class EnemyManager {
  constructor(scene, baseRow) {
    this.scene = scene;
    this.baseRow = baseRow; // 본진 row
    this.enemies = [];
    this.pathfinder = new Pathfinder(scene.grid);
    this.onEnemyReachBase = null; // 콜백
    this.onEnemyDied = null;      // 콜백 (reward 전달)
  }

  spawnEnemy(type, col = SPAWN_COL, row = SPAWN_ROW) {
    const enemy = new Enemy(this.scene, col, row, type);
    this._assignPath(enemy);
    this.enemies.push(enemy);
    return enemy;
  }

  _assignPath(enemy) {
    if (enemy.isAerial) {
      // 공중 유닛: 직선 경로
      const path = [];
      for (let r = enemy.row + 1; r <= this.baseRow; r++) {
        path.push({ col: BASE_COL, row: r });
      }
      enemy.setPath(path);
      return;
    }

    const path = this.pathfinder.findPath(enemy.col, enemy.row, BASE_COL, this.baseRow);
    if (path) {
      enemy.setPath(path);
    } else {
      // 경로 없음: 가장 가까운 유닛을 타겟으로 설정
      this._setNearestUnitTarget(enemy);
    }
  }

  _setNearestUnitTarget(enemy) {
    const units = this.scene.unitManager.units;
    if (units.length === 0) return;
    let nearest = null;
    let nearestDist = Infinity;
    for (const unit of units) {
      const pos = this.scene.grid.cellToWorld(unit.col, unit.row);
      const dx = pos.x - enemy.x;
      const dy = pos.y - enemy.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < nearestDist) { nearestDist = d; nearest = unit; }
    }
    enemy.targetUnit = nearest;
  }

  // 그리드 변경 시 (유닛 배치/제거) 모든 적 경로 재계산
  recalculateAllPaths() {
    for (const enemy of this.enemies) {
      if (!enemy.isAerial) this._assignPath(enemy);
    }
  }

  update(time, delta) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(time, delta);

      // 본진 도달 체크
      if (enemy.isAtDestination(BASE_COL, this.baseRow)) {
        if (this.onEnemyReachBase) this.onEnemyReachBase(enemy.atk);
        enemy.destroy();
        this.enemies.splice(i, 1);
        continue;
      }

      // 경로 없는 적이 타겟 유닛 공격
      if (enemy.targetUnit && !enemy.path?.length) {
        this._handleNoPathEnemy(enemy, time, delta);
      }
    }
  }

  _handleNoPathEnemy(enemy, time, delta) {
    if (!enemy.targetUnit || enemy.targetUnit.hp <= 0) {
      this._setNearestUnitTarget(enemy);
      return;
    }
    const pos = this.scene.grid.cellToWorld(enemy.targetUnit.col, enemy.targetUnit.row);
    const dx = pos.x - enemy.x;
    const dy = pos.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 40) {
      // 타겟 방향으로 이동
      const dtSec = delta / 1000;
      enemy.x += (dx / dist) * enemy.speed * dtSec;
      enemy.y += (dy / dist) * enemy.speed * dtSec;
      enemy.sprite.setPosition(enemy.x, enemy.y);
    } else {
      // 근접 공격
      enemy.atkCooldown -= delta;
      if (enemy.atkCooldown <= 0) {
        const dead = enemy.targetUnit.takeDamage(enemy.atk);
        if (dead) {
          this.scene.unitManager.removeUnit(enemy.targetUnit);
          enemy.targetUnit = null;
          this._assignPath(enemy); // 경로 재계산
        }
        enemy.atkCooldown = 1500;
      }
    }
  }

  removeEnemy(enemy) {
    enemy.destroy();
    this.enemies = this.enemies.filter(e => e !== enemy);
  }

  getAll() {
    return this.enemies;
  }
}
```

- [ ] **Step 3: GameScene에 EnemyManager 연결**

```javascript
// src/scenes/GameScene.js (전체 교체)
import Phaser from 'phaser';
import Grid, { GRID_ROWS } from '../grid/Grid.js';
import GridRenderer from '../grid/GridRenderer.js';
import UnitManager from '../units/UnitManager.js';
import EnemyManager from '../enemies/EnemyManager.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';
import { ENEMY_TYPE } from '../enemies/EnemyData.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.grid = new Grid();
    this.gridRenderer = new GridRenderer(this, this.grid);
    this.unitManager = new UnitManager(this);
    this.enemyManager = new EnemyManager(this, GRID_ROWS - 1);
    this.scene.launch('UIScene');

    // 테스트: 클릭으로 유닛 배치
    this.input.on('pointerdown', (ptr) => {
      if (ptr.y > 650) return;
      const { col, row } = this.grid.worldToCell(ptr.x, ptr.y);
      this.unitManager.placeUnit(col, row, HAND_RANK.ONE_PAIR, 'H', 1);
      this.enemyManager.recalculateAllPaths();
    });

    // 테스트: 스페이스바로 적 스폰
    this.input.keyboard.on('keydown-SPACE', () => {
      this.enemyManager.spawnEnemy(ENEMY_TYPE.BASIC);
    });
  }

  update(time, delta) {
    this.unitManager.update(time, delta);
    this.enemyManager.update(time, delta);
  }
}
```

- [ ] **Step 4: 브라우저 확인**

유닛 배치 후 스페이스바 → 적이 상단에서 스폰되어 하단으로 이동. 유닛이 경로를 막으면 우회함.

- [ ] **Step 5: 커밋**

```bash
git add src/enemies/ src/scenes/GameScene.js
git commit -m "feat: 적 시스템 구현 (Enemy, EnemyManager, 경로탐색)"
```

---

### Task 9: CombatManager

**Files:**
- Create: `src/combat/CombatManager.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: CombatManager.js 작성**

```javascript
// src/combat/CombatManager.js
import { ROLE } from '../units/UnitData.js';
import { CELL_SIZE } from '../grid/Grid.js';

export default class CombatManager {
  constructor(scene) {
    this.scene = scene;
  }

  update(time, delta) {
    const units = this.scene.unitManager.units;
    const enemies = this.scene.enemyManager.getAll();

    // 유닛 → 적 공격
    for (const unit of units) {
      if (unit.frozen) continue;
      unit.atkCooldown -= delta;
      if (unit.atkCooldown > 0) continue;

      const unitPos = this.scene.grid.cellToWorld(unit.col, unit.row);
      const rangeInPx = unit.stats.range * CELL_SIZE;

      // 사거리 내 적 (공중 유닛 처리)
      const inRange = enemies.filter(e => {
        if (e.isAerial && unit.stats.role !== ROLE.SNIPER && unit.stats.role !== ROLE.AREA) return false;
        const dx = e.x - unitPos.x;
        const dy = e.y - unitPos.y;
        return Math.sqrt(dx * dx + dy * dy) <= rangeInPx;
      });

      if (inRange.length === 0) continue;

      // 가장 앞쪽(row가 큰) 적 우선 타겟
      inRange.sort((a, b) => b.row - a.row);
      const target = inRange[0];

      if (unit.stats.areaRadius > 0) {
        // 범위 공격
        const areaInPx = unit.stats.areaRadius * CELL_SIZE;
        for (const e of enemies) {
          const dx = e.x - target.x;
          const dy = e.y - target.y;
          if (Math.sqrt(dx * dx + dy * dy) <= areaInPx) {
            const dead = e.takeDamage(unit.stats.atk);
            if (dead) this._onEnemyDied(e);
          }
        }
      } else {
        const dead = target.takeDamage(unit.stats.atk);
        if (dead) this._onEnemyDied(target);
      }

      // 감속 처리
      if (unit.stats.slowAmount > 0) {
        target.speed *= (1 - unit.stats.slowAmount);
      }

      // 빙결형 적 처리 (freezer 유닛 공격 → 아군이 아닌 적의 효과는 EnemyManager에서)
      unit.atkCooldown = Math.floor(1000 / unit.stats.atkSpeed);
    }

    // 지원형 유닛: 주변 아군 공격속도 버프
    for (const unit of units) {
      if (unit.stats.role === ROLE.SUPPORT_SPEED && unit.stats.buffRadius > 0) {
        const pos = this.scene.grid.cellToWorld(unit.col, unit.row);
        const nearby = this.scene.unitManager.getUnitsInRange(pos.x, pos.y, unit.stats.buffRadius);
        for (const ally of nearby) {
          if (ally !== unit) {
            ally.stats.atkSpeed = ally.stats.atkSpeed; // 버프는 별도 시스템에서 관리 (Plan 2에서 확장)
          }
        }
      }
    }

    // 적 → 본진 공격은 EnemyManager에서 처리
    // 빙결형 적 효과
    for (const enemy of enemies) {
      if (enemy.freezeRadius > 0) {
        const areaInPx = enemy.freezeRadius * CELL_SIZE;
        for (const unit of units) {
          const pos = this.scene.grid.cellToWorld(unit.col, unit.row);
          const dx = enemy.x - pos.x;
          const dy = enemy.y - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) <= areaInPx) {
            unit.freeze(enemy.freezeDuration);
          }
        }
      }
    }
  }

  _onEnemyDied(enemy) {
    const reward = enemy.reward;
    this.scene.enemyManager.removeEnemy(enemy);
    // 골드 보상
    if (this.scene.economyManager) {
      this.scene.economyManager.addGold(reward);
    }
    // 분열형 처리
    if (enemy.type === 'splitter') {
      for (let i = 0; i < 2; i++) {
        this.scene.enemyManager.spawnEnemy('basic', enemy.col, enemy.row);
      }
    }
  }
}
```

- [ ] **Step 2: GameScene에 CombatManager 추가**

```javascript
// src/scenes/GameScene.js create() 메서드 내 추가
import CombatManager from '../combat/CombatManager.js';

// create() 내:
this.combatManager = new CombatManager(this);

// update() 내:
this.combatManager.update(time, delta);
```

- [ ] **Step 3: 브라우저 확인**

유닛 배치 후 스페이스바로 적 스폰 → 유닛이 적을 자동 공격하여 처치함.

- [ ] **Step 4: 커밋**

```bash
git add src/combat/ src/scenes/GameScene.js
git commit -m "feat: 전투 시스템 구현 (CombatManager, 자동 공격, 범위 공격)"
```

---

### Task 10: EconomyManager + StageManager + 승패 판정

**Files:**
- Create: `src/economy/EconomyManager.js`
- Create: `src/stages/StageData.js`
- Create: `src/stages/StageManager.js`
- Create: `tests/economy/EconomyManager.test.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: 테스트 작성**

```javascript
// tests/economy/EconomyManager.test.js
import { describe, it, expect, vi } from 'vitest';
import EconomyManager from '../../src/economy/EconomyManager.js';

describe('EconomyManager', () => {
  it('초기 골드는 20', () => {
    const em = new EconomyManager();
    expect(em.gold).toBe(20);
  });

  it('addGold: 골드 증가', () => {
    const em = new EconomyManager();
    em.addGold(10);
    expect(em.gold).toBe(30);
  });

  it('spend: 충분한 골드 → true, 골드 차감', () => {
    const em = new EconomyManager();
    const ok = em.spend(15);
    expect(ok).toBe(true);
    expect(em.gold).toBe(5);
  });

  it('spend: 골드 부족 → false', () => {
    const em = new EconomyManager();
    const ok = em.spend(100);
    expect(ok).toBe(false);
    expect(em.gold).toBe(20);
  });

  it('getDrawCost: 5골드', () => {
    const em = new EconomyManager();
    expect(em.getDrawCost()).toBe(5);
  });

  it('getReplaceCost: 초기 10골드, 교체마다 +2 누적', () => {
    const em = new EconomyManager();
    expect(em.getReplaceCost()).toBe(10);
    em.recordReplace();
    expect(em.getReplaceCost()).toBe(12);
    em.recordReplace();
    expect(em.getReplaceCost()).toBe(14);
  });

  it('resetReplaceCost: 새 핸드 드로우 시 초기화', () => {
    const em = new EconomyManager();
    em.recordReplace();
    em.recordReplace();
    em.resetReplaceCost();
    expect(em.getReplaceCost()).toBe(10);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test
```

- [ ] **Step 3: EconomyManager.js 작성**

```javascript
// src/economy/EconomyManager.js
const BASE_INCOME_RATE = 1;     // 골드/초
const INCOME_PER_WAVE = 0.5;    // 웨이브마다 추가 골드/초
const DRAW_COST = 5;
const REPLACE_BASE_COST = 10;
const REPLACE_INCREMENT = 2;

export default class EconomyManager {
  constructor() {
    this.gold = 20;
    this.incomeRate = BASE_INCOME_RATE;
    this.replaceCount = 0; // 현재 핸드 내 교체 횟수
    this.accumulator = 0;
    this.onGoldChanged = null; // UI 콜백
  }

  update(delta) {
    this.accumulator += this.incomeRate * (delta / 1000);
    if (this.accumulator >= 1) {
      const earned = Math.floor(this.accumulator);
      this.gold += earned;
      this.accumulator -= earned;
      if (this.onGoldChanged) this.onGoldChanged(this.gold);
    }
  }

  addGold(amount) {
    this.gold += amount;
    if (this.onGoldChanged) this.onGoldChanged(this.gold);
  }

  spend(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    if (this.onGoldChanged) this.onGoldChanged(this.gold);
    return true;
  }

  getDrawCost() { return DRAW_COST; }

  getReplaceCost() {
    return REPLACE_BASE_COST + this.replaceCount * REPLACE_INCREMENT;
  }

  recordReplace() { this.replaceCount++; }

  resetReplaceCost() { this.replaceCount = 0; }

  onWaveCleared() {
    this.incomeRate += INCOME_PER_WAVE;
  }
}
```

- [ ] **Step 4: StageData.js 작성**

```javascript
// src/stages/StageData.js
import { ENEMY_TYPE } from '../enemies/EnemyData.js';

// 각 스테이지: { waves: [ { enemies: [{type, count, interval}] } ] }
export const STAGES = [
  {
    id: 1,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.BASIC, count: 5, interval: 1500 }] },
      { enemies: [{ type: ENEMY_TYPE.BASIC, count: 8, interval: 1200 }] },
      { enemies: [{ type: ENEMY_TYPE.RUNNER, count: 4, interval: 800 }, { type: ENEMY_TYPE.BASIC, count: 3, interval: 1500 }] },
    ],
  },
  {
    id: 2,
    waves: [
      { enemies: [{ type: ENEMY_TYPE.BASIC, count: 8, interval: 1200 }, { type: ENEMY_TYPE.TANK, count: 2, interval: 3000 }] },
      { enemies: [{ type: ENEMY_TYPE.RUNNER, count: 6, interval: 700 }, { type: ENEMY_TYPE.REGEN, count: 3, interval: 2000 }] },
      { enemies: [{ type: ENEMY_TYPE.FREEZER, count: 2, interval: 4000 }, { type: ENEMY_TYPE.BASIC, count: 10, interval: 1000 }] },
      { enemies: [{ type: ENEMY_TYPE.BOSS, count: 1, interval: 0 }] },
    ],
  },
];
```

- [ ] **Step 5: StageManager.js 작성**

```javascript
// src/stages/StageManager.js
import { STAGES } from './StageData.js';

export default class StageManager {
  constructor(scene) {
    this.scene = scene;
    this.stageIndex = 0;
    this.waveIndex = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.waveActive = false;
    this.onWaveCleared = null;
    this.onStageCleared = null;
    this.onGameOver = null;
  }

  startStage(stageIndex) {
    this.stageIndex = stageIndex;
    this.waveIndex = 0;
    this._startNextWave();
  }

  _startNextWave() {
    const stage = STAGES[this.stageIndex];
    if (!stage) return;
    const wave = stage.waves[this.waveIndex];
    if (!wave) return;

    this.spawnQueue = [];
    for (const group of wave.enemies) {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({ type: group.type, delay: group.interval * i });
      }
    }
    this.spawnQueue.sort((a, b) => a.delay - b.delay);
    this.spawnTimer = 0;
    this.waveActive = true;
  }

  update(delta) {
    if (!this.waveActive) return;

    this.spawnTimer += delta;
    while (this.spawnQueue.length > 0 && this.spawnQueue[0].delay <= this.spawnTimer) {
      const { type } = this.spawnQueue.shift();
      this.scene.enemyManager.spawnEnemy(type);
    }

    // 스폰 완료 + 적 전멸 → 웨이브 클리어
    if (this.spawnQueue.length === 0 && this.scene.enemyManager.getAll().length === 0) {
      this.waveActive = false;
      this._onWaveCleared();
    }
  }

  _onWaveCleared() {
    if (this.onWaveCleared) this.onWaveCleared(this.waveIndex);
    this.scene.economyManager.onWaveCleared();

    const stage = STAGES[this.stageIndex];
    this.waveIndex++;
    if (this.waveIndex >= stage.waves.length) {
      if (this.onStageCleared) this.onStageCleared(this.stageIndex);
    } else {
      // 잠시 후 다음 웨이브 시작
      this.scene.time.delayedCall(3000, () => this._startNextWave());
    }
  }

  notifyBaseAttacked(damage) {
    // GameScene에서 본진 HP 관리
  }
}
```

- [ ] **Step 6: GameScene에 모두 통합**

```javascript
// src/scenes/GameScene.js (전체)
import Phaser from 'phaser';
import Grid, { GRID_ROWS } from '../grid/Grid.js';
import GridRenderer from '../grid/GridRenderer.js';
import UnitManager from '../units/UnitManager.js';
import EnemyManager from '../enemies/EnemyManager.js';
import CombatManager from '../combat/CombatManager.js';
import EconomyManager from '../economy/EconomyManager.js';
import StageManager from '../stages/StageManager.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';

const BASE_HP = 100;

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.grid = new Grid();
    this.gridRenderer = new GridRenderer(this, this.grid);
    this.unitManager = new UnitManager(this);
    this.enemyManager = new EnemyManager(this, GRID_ROWS - 1);
    this.combatManager = new CombatManager(this);
    this.economyManager = new EconomyManager();
    this.stageManager = new StageManager(this);

    this.baseHp = BASE_HP;
    this.gameOver = false;

    // 본진 피격 콜백
    this.enemyManager.onEnemyReachBase = (dmg) => {
      this.baseHp -= dmg;
      this.registry.set('baseHp', this.baseHp);
      if (this.baseHp <= 0) this._gameOver();
    };

    // 웨이브 클리어
    this.stageManager.onWaveCleared = (waveIndex) => {
      this.registry.set('wave', waveIndex + 2);
    };

    // 스테이지 클리어
    this.stageManager.onStageCleared = () => {
      this._stageCleared();
    };

    // 골드 변경 → UI 업데이트
    this.economyManager.onGoldChanged = (gold) => {
      this.registry.set('gold', gold);
    };

    // Registry 초기화
    this.registry.set('baseHp', this.baseHp);
    this.registry.set('gold', this.economyManager.gold);
    this.registry.set('wave', 1);

    this.scene.launch('UIScene');

    // 스테이지 0 시작
    this.stageManager.startStage(0);

    // 테스트: 클릭으로 유닛 배치
    this.input.on('pointerdown', (ptr) => {
      if (ptr.y > 650) return;
      const { col, row } = this.grid.worldToCell(ptr.x, ptr.y);
      if (this.economyManager.spend(0)) { // 소환 비용은 Task 11에서
        this.unitManager.placeUnit(col, row, HAND_RANK.ONE_PAIR, 'H', 1);
        this.enemyManager.recalculateAllPaths();
      }
    });
  }

  _gameOver() {
    this.gameOver = true;
    this.scene.pause('GameScene');
    this.add.rectangle(240, 427, 480, 854, 0x000000, 0.7).setDepth(10);
    this.add.text(240, 380, 'GAME OVER', {
      fontSize: '48px', color: '#ff4444', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.add.text(240, 460, '클릭하여 재시작', {
      fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(11);
    this.input.once('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.restart();
    });
  }

  _stageCleared() {
    this.add.text(240, 300, 'STAGE CLEAR!', {
      fontSize: '36px', color: '#ffdd44', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
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
```

- [ ] **Step 7: 테스트 통과 확인**

```bash
npm test
```
Expected: PASS (전체)

- [ ] **Step 8: 브라우저 확인**

게임 시작 → 적이 웨이브로 스폰됨 → 유닛이 자동 공격 → 웨이브 클리어 시 3초 후 다음 웨이브 → 본진 도달 시 게임오버 화면.

- [ ] **Step 9: 커밋**

```bash
git add src/economy/ src/stages/ src/scenes/GameScene.js tests/economy/
git commit -m "feat: 경제/스테이지/웨이브/승패 시스템 구현"
```

---

### Task 11: CardUI + HUD (UIScene 완성)

**Files:**
- Create: `src/ui/CardUI.js`
- Create: `src/ui/HUD.js`
- Modify: `src/scenes/UIScene.js`

- [ ] **Step 1: HUD.js 작성**

```javascript
// src/ui/HUD.js
export default class HUD {
  constructor(scene) {
    this.scene = scene;
    const y = 650;

    // 배경
    scene.add.rectangle(240, y + 80, 480, 160, 0x0a0f1e, 0.95).setDepth(10);

    this.hpText = scene.add.text(20, y + 10, 'HP: 100', {
      fontSize: '16px', color: '#ff6666'
    }).setDepth(11);

    this.goldText = scene.add.text(20, y + 35, 'Gold: 20', {
      fontSize: '16px', color: '#e8c97a'
    }).setDepth(11);

    this.waveText = scene.add.text(380, y + 10, 'Wave 1', {
      fontSize: '16px', color: '#88ccff'
    }).setOrigin(1, 0).setDepth(11);

    // Registry 감지
    scene.registry.events.on('changedata-baseHp', (_, val) => {
      this.hpText.setText(`HP: ${val}`);
    });
    scene.registry.events.on('changedata-gold', (_, val) => {
      this.goldText.setText(`Gold: ${val}`);
    });
    scene.registry.events.on('changedata-wave', (_, val) => {
      this.waveText.setText(`Wave ${val}`);
    });
  }
}
```

- [ ] **Step 2: CardUI.js 작성**

```javascript
// src/ui/CardUI.js
import { SUIT_COLORS, SUIT_NAMES } from '../cards/Card.js';
import { evaluateHand, HAND_NAMES } from '../cards/HandEvaluator.js';

const CARD_W = 52;
const CARD_H = 76;
const CARD_Y = 730;

export default class CardUI {
  constructor(scene) {
    this.scene = scene;
    this.cardObjects = [];   // 핸드 카드 게임오브젝트
    this.sharedObjects = []; // 공용 패 게임오브젝트
    this.handLabel = null;
    this.summonBtn = null;
    this.magicBtn = null;
  }

  render(hand, sharedCards) {
    this.cardObjects.forEach(o => o.forEach(g => g.destroy()));
    this.sharedObjects.forEach(o => o.forEach(g => g.destroy()));
    if (this.handLabel) this.handLabel.destroy();

    this.cardObjects = [];
    this.sharedObjects = [];

    // 핸드 5장 렌더
    const totalW = hand.cards.length * (CARD_W + 6);
    const startX = (480 - totalW) / 2 + CARD_W / 2;

    hand.cards.forEach((card, i) => {
      const x = startX + i * (CARD_W + 6);
      const objs = this._drawCard(x, CARD_Y, card);
      this.cardObjects.push(objs);
    });

    // 핸드 패 이름 표시
    if (hand.cards.length === 5) {
      const { rank } = evaluateHand(hand.cards);
      this.handLabel = this.scene.add.text(240, CARD_Y + CARD_H / 2 + 14, HAND_NAMES[rank], {
        fontSize: '13px', color: '#ffdd88'
      }).setOrigin(0.5).setDepth(12);
    }

    // 공용 패 2장 (우측 하단)
    sharedCards.cards.forEach((card, i) => {
      const x = 420 + i * (CARD_W + 4) - 30;
      const y = CARD_Y - 90;
      const objs = this._drawCard(x, y, card, 0.75);
      this.sharedObjects.push(objs);
    });
  }

  _drawCard(x, y, card, scale = 1) {
    const w = CARD_W * scale;
    const h = CARD_H * scale;
    const color = SUIT_COLORS[card.suit] ?? 0xffffff;
    const bg = this.scene.add.rectangle(x, y, w, h, 0x1a2a3a).setDepth(12);
    this.scene.add.rectangle(x, y, w - 4, h - 4, 0x0d1b2a).setDepth(12);
    const suit = this.scene.add.text(x, y - 8 * scale, SUIT_NAMES[card.suit], {
      fontSize: `${10 * scale}px`, color: `#${color.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5).setDepth(13);
    const val = this.scene.add.text(x, y + 8 * scale, card.value, {
      fontSize: `${14 * scale}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(13);
    return [bg, suit, val];
  }

  renderButtons(drawCost, replaceCost) {
    if (this.summonBtn) this.summonBtn.destroy();
    if (this.magicBtn) this.magicBtn.destroy();

    this.summonBtn = this.scene.add.text(100, 820, `소환 (${drawCost}G)`, {
      fontSize: '14px', color: '#ffffff',
      backgroundColor: '#2244aa', padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setDepth(12).setInteractive();

    this.magicBtn = this.scene.add.text(240, 820, `마법`, {
      fontSize: '14px', color: '#ffffff',
      backgroundColor: '#883399', padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setDepth(12).setInteractive();

    this.replaceBtn = this.scene.add.text(380, 820, `교체 (${replaceCost}G)`, {
      fontSize: '14px', color: '#ffffff',
      backgroundColor: '#226644', padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setDepth(12).setInteractive();

    return { summonBtn: this.summonBtn, magicBtn: this.magicBtn, replaceBtn: this.replaceBtn };
  }
}
```

- [ ] **Step 3: UIScene.js 완성**

```javascript
// src/scenes/UIScene.js
import Phaser from 'phaser';
import HUD from '../ui/HUD.js';
import CardUI from '../ui/CardUI.js';
import Deck from '../cards/Deck.js';
import Hand from '../cards/Hand.js';
import SharedCards from '../cards/SharedCards.js';
import { evaluateHand } from '../cards/HandEvaluator.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';

export default class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  create() {
    this.hud = new HUD(this);
    this.cardUI = new CardUI(this);

    this.deck = new Deck();
    this.hand = new Hand();
    this.sharedCards = new SharedCards();

    // 시작 시 공용 패 드로우
    this.sharedCards.fill(this.deck);

    // 핸드 초기 드로우 (무료)
    for (let i = 0; i < 5; i++) {
      const card = this.deck.draw();
      if (card) this.hand.addCard(card);
    }

    this._refreshUI();

    // 게임씬 참조
    const gameScene = this.scene.get('GameScene');

    // 소환 버튼
    this._buttons.summonBtn.on('pointerdown', () => {
      const eco = gameScene.economyManager;
      const drawCost = eco.getDrawCost();
      if (!eco.spend(drawCost)) return;

      // 현재 핸드 평가
      const { rank, dominantSuit } = evaluateHand(this.hand.cards);

      // 핸드 소모
      const consumed = this.hand.consumeAll();
      this.deck.discardMany(consumed);
      eco.resetReplaceCost();

      // 새 핸드 드로우
      for (let i = 0; i < 5; i++) {
        const card = this.deck.draw();
        if (card) this.hand.addCard(card);
      }

      // 소환 대기 상태로 전환 (클릭으로 배치)
      this.registry.set('pendingUnit', { rank, suit: dominantSuit, grade: 1 });
      this._refreshUI();
    });

    // 마법 버튼 (공용 패 + 핸드 3장 조합)
    this._buttons.magicBtn.on('pointerdown', () => {
      if (this.hand.cards.length < 3) return;
      const combined = [...this.hand.cards.slice(0, 3), ...this.sharedCards.getCards()];
      const { rank, dominantSuit } = evaluateHand(combined);
      // 마법 실행은 MagicManager에서 (Task 12)
      gameScene.events.emit('castMagic', { rank, suit: dominantSuit });
      // 핸드 3장 + 공용 패 소모
      const consumed = this.hand.consumeAll();
      this.deck.discardMany(consumed);
      this.sharedCards.consume(this.deck);
      for (let i = 0; i < 5; i++) {
        const card = this.deck.draw();
        if (card) this.hand.addCard(card);
      }
      this._refreshUI();
    });

    // 교체 버튼 (간단히: 첫 번째 카드 교체)
    this._buttons.replaceBtn.on('pointerdown', () => {
      const eco = gameScene.economyManager;
      const cost = eco.getReplaceCost();
      if (!eco.spend(cost)) return;
      eco.recordReplace();
      const old = this.hand.removeCard(0);
      if (old) this.deck.discard(old);
      const newCard = this.deck.draw();
      if (newCard) this.hand.addCard(newCard);
      this._refreshUI();
    });

    // 유닛 배치 클릭 처리
    gameScene.input.on('pointerdown', (ptr) => {
      const pending = this.registry.get('pendingUnit');
      if (!pending) return;
      if (ptr.y > 650) return;
      const { col, row } = gameScene.grid.worldToCell(ptr.x, ptr.y);
      gameScene.unitManager.placeUnit(col, row, pending.rank, pending.suit, pending.grade);
      gameScene.enemyManager.recalculateAllPaths();
      this.registry.set('pendingUnit', null);
    });
  }

  _refreshUI() {
    const eco = this.scene.get('GameScene').economyManager;
    this.cardUI.render(this.hand, this.sharedCards);
    this._buttons = this.cardUI.renderButtons(eco.getDrawCost(), eco.getReplaceCost());
    // 이벤트 재등록 필요 (renderButtons가 새 오브젝트 반환)
    this._rebindButtons();
  }

  _rebindButtons() {
    const gameScene = this.scene.get('GameScene');
    const eco = gameScene.economyManager;

    this._buttons.summonBtn.on('pointerdown', () => {
      if (!eco.spend(eco.getDrawCost())) return;
      const { rank, dominantSuit } = evaluateHand(this.hand.cards);
      this.deck.discardMany(this.hand.consumeAll());
      eco.resetReplaceCost();
      for (let i = 0; i < 5; i++) {
        const card = this.deck.draw();
        if (card) this.hand.addCard(card);
      }
      this.registry.set('pendingUnit', { rank, suit: dominantSuit, grade: 1 });
      this._refreshUI();
    });

    this._buttons.replaceBtn.on('pointerdown', () => {
      const cost = eco.getReplaceCost();
      if (!eco.spend(cost)) return;
      eco.recordReplace();
      const old = this.hand.removeCard(0);
      if (old) this.deck.discard(old);
      const card = this.deck.draw();
      if (card) this.hand.addCard(card);
      this._refreshUI();
    });
  }
}
```

- [ ] **Step 4: 브라우저 확인**

카드 UI가 하단에 표시됨. "소환" 클릭 → 골드 소모 → 그리드 클릭 시 유닛 배치. 골드/HP/웨이브 HUD 표시.

- [ ] **Step 5: 커밋**

```bash
git add src/ui/ src/scenes/UIScene.js
git commit -m "feat: 카드 UI, HUD 구현 (UIScene 완성)"
```

---

### Task 12: MagicManager + MergeManager (드래그 합성)

**Files:**
- Create: `src/magic/MagicManager.js`
- Create: `src/data/skills.js`
- Modify: `src/units/UnitManager.js` (드래그 합성)
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: skills.js 작성**

```javascript
// src/data/skills.js
import { HAND_RANK } from '../cards/HandEvaluator.js';

export const SKILLS = {
  [HAND_RANK.STRAIGHT_FLUSH]: {
    name: '절멸',
    effect: 'killAll',
    description: '화면 내 모든 적 즉사',
  },
  [HAND_RANK.FOUR_OF_A_KIND]: {
    name: '대폭발',
    effect: 'massiveDamage',
    damage: 500,
    description: '모든 적에게 500 데미지',
  },
  [HAND_RANK.FULL_HOUSE]: {
    name: '회복',
    effect: 'healBase',
    amount: 30,
    description: '본진 HP 30 회복',
  },
  [HAND_RANK.FLUSH]: {
    name: '속성 강화',
    effect: 'buffSuit',
    multiplier: 1.5,
    duration: 30000,
    description: '해당 속성 유닛 공격력 50% 증가 (30초)',
  },
  [HAND_RANK.STRAIGHT]: {
    name: '대지진',
    effect: 'slowAll',
    slowAmount: 0.5,
    duration: 15000,
    description: '모든 적 이동속도 50% 감소 (15초)',
  },
  [HAND_RANK.THREE_OF_A_KIND]: {
    name: '소환 지원',
    effect: 'randomUnit',
    description: '무작위 위치에 트리플 유닛 1기 소환',
  },
  [HAND_RANK.TWO_PAIR]: {
    name: '골드 획득',
    effect: 'gainGold',
    amount: 30,
    description: '골드 30 즉시 획득',
  },
  [HAND_RANK.ONE_PAIR]: {
    name: '무료 드로우',
    effect: 'freeDraw',
    description: '다음 드로우 비용 무료',
  },
  [HAND_RANK.HIGH_CARD]: {
    name: '공용 패 교체',
    effect: 'refreshShared',
    description: '공용 패 2장 즉시 재드로우',
  },
};
```

- [ ] **Step 2: MagicManager.js 작성**

```javascript
// src/magic/MagicManager.js
import { SKILLS } from '../data/skills.js';
import { HAND_RANK } from '../cards/HandEvaluator.js';
import { GRID_COLS, GRID_ROWS } from '../grid/Grid.js';

export default class MagicManager {
  constructor(scene) {
    this.scene = scene;
    this.freeDrawNext = false;
  }

  cast(rank, suit) {
    const skill = SKILLS[rank];
    if (!skill) return;

    const enemies = this.scene.enemyManager.getAll();
    const eco = this.scene.economyManager;

    switch (skill.effect) {
      case 'killAll':
        [...enemies].forEach(e => {
          if (!e.magicImmune) this.scene.enemyManager.removeEnemy(e);
        });
        break;

      case 'massiveDamage':
        [...enemies].forEach(e => {
          if (!e.magicImmune) {
            const dead = e.takeDamage(skill.damage);
            if (dead) this.scene.enemyManager.removeEnemy(e);
          }
        });
        break;

      case 'healBase':
        this.scene.baseHp = Math.min(100, this.scene.baseHp + skill.amount);
        this.scene.registry.set('baseHp', this.scene.baseHp);
        break;

      case 'buffSuit':
        this.scene.unitManager.units
          .filter(u => u.suit === suit)
          .forEach(u => {
            u.stats.atk = Math.floor(u.stats.atk * skill.multiplier);
            this.scene.time.delayedCall(skill.duration, () => {
              u.stats.atk = Math.floor(u.stats.atk / skill.multiplier);
            });
          });
        break;

      case 'slowAll':
        [...enemies].forEach(e => {
          if (!e.magicImmune) {
            e.speed *= (1 - skill.slowAmount);
            this.scene.time.delayedCall(skill.duration, () => {
              e.speed /= (1 - skill.slowAmount);
            });
          }
        });
        break;

      case 'randomUnit': {
        const emptyCells = [];
        for (let r = 2; r < GRID_ROWS - 2; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (this.scene.grid.isWalkable(c, r)) emptyCells.push({ col: c, row: r });
          }
        }
        if (emptyCells.length > 0) {
          const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          this.scene.unitManager.placeUnit(cell.col, cell.row, HAND_RANK.THREE_OF_A_KIND, suit, 1);
          this.scene.enemyManager.recalculateAllPaths();
        }
        break;
      }

      case 'gainGold':
        eco.addGold(skill.amount);
        break;

      case 'freeDraw':
        this.freeDrawNext = true;
        break;

      case 'refreshShared':
        // UIScene에서 처리 (SharedCards 접근 필요)
        this.scene.events.emit('refreshSharedCards');
        break;
    }
  }
}
```

- [ ] **Step 3: GameScene에 MagicManager 추가 및 이벤트 연결**

```javascript
// src/scenes/GameScene.js create() 내 추가
import MagicManager from '../magic/MagicManager.js';

// create():
this.magicManager = new MagicManager(this);

this.events.on('castMagic', ({ rank, suit }) => {
  this.magicManager.cast(rank, suit);
});
```

- [ ] **Step 4: UnitManager에 드래그 합성 인터랙션 추가**

```javascript
// src/units/UnitManager.js placeUnit() 메서드 뒤에 추가

// GameScene에서 호출: 드래그 합성 설정
setupMergeInteraction() {
  const scene = this.scene;
  let dragUnit = null;

  scene.input.on('pointerdown', (ptr) => {
    if (ptr.y > 650) return;
    const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
    const unit = this.units.find(u => u.col === col && u.row === row);
    if (unit && unit.glowCircle) {
      dragUnit = unit;
      dragUnit.sprite.setDepth(10);
    }
  });

  scene.input.on('pointermove', (ptr) => {
    if (!dragUnit) return;
    dragUnit.sprite.setPosition(ptr.x, ptr.y);
    if (dragUnit.hpBar) dragUnit.hpBar.clear();
  });

  scene.input.on('pointerup', (ptr) => {
    if (!dragUnit) return;
    const { col, row } = scene.grid.worldToCell(ptr.x, ptr.y);
    const target = this.units.find(u =>
      u !== dragUnit && u.col === col && u.row === row &&
      u.handRank === dragUnit.handRank && u.grade === dragUnit.grade
    );
    if (target) {
      this.merge(dragUnit, target);
      scene.enemyManager.recalculateAllPaths();
    } else {
      // 원래 위치로 복귀
      const pos = scene.grid.cellToWorld(dragUnit.col, dragUnit.row);
      dragUnit.sprite.setPosition(pos.x, pos.y);
      dragUnit.sprite.setDepth(2);
      dragUnit._drawHpBar();
    }
    dragUnit = null;
  });
}
```

- [ ] **Step 5: GameScene create()에 setupMergeInteraction 호출**

```javascript
// create() 맨 끝에 추가:
this.unitManager.setupMergeInteraction();
```

- [ ] **Step 6: 브라우저 확인**

같은 유닛 2개 배치 시 글로우 → 글로우 유닛 드래그하여 같은 유닛에 겹치면 합성됨. 마법 버튼 클릭 시 스킬 발동.

- [ ] **Step 7: 커밋**

```bash
git add src/magic/ src/data/ src/units/UnitManager.js src/scenes/GameScene.js
git commit -m "feat: 마법 스킬 시스템, 드래그 합성 구현"
```

---

### Task 13: MVP 완성 확인 및 빌드

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: 전체 테스트 통과 확인**

```bash
npm test
```
Expected: 전체 PASS

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```
Expected: `dist/` 폴더 생성, 에러 없음.

- [ ] **Step 3: 빌드 결과물 확인**

```bash
npx serve dist
```
브라우저에서 `http://localhost:3000` 접속하여 게임이 정상 동작하는지 확인.

체크리스트:
- [ ] 메뉴 → 게임 전환
- [ ] 카드 UI 렌더링
- [ ] 소환 버튼 → 골드 소모 → 유닛 배치
- [ ] 적 웨이브 스폰 → 자동 공격
- [ ] 합성 글로우 → 드래그 합성
- [ ] 마법 버튼 → 스킬 발동
- [ ] 적이 본진 도달 → 게임오버

- [ ] **Step 4: 최종 커밋**

```bash
git add .
git commit -m "feat: Card Defense MVP 완성"
```

---

## MVP 이후 — Plan 2 예정 항목

- 로그라이트 웨이브 클리어 선택지 UI
- 유닛 업그레이드 패널
- 스테이지 선택 화면
- 최초 클리어 유료 재화 시스템
- 모든 적 타입 완전 구현 (공중, 분열, 재생 등)
- 효과음 및 애니메이션 polish
- Electron 래핑 (Steam 배포 준비)
