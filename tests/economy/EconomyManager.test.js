import { describe, it, expect } from 'vitest';
import EconomyManager from '../../src/economy/EconomyManager.js';

describe('EconomyManager', () => {
  it('초기 골드는 20', () => {
    const em = new EconomyManager();
    expect(em.gold).toBe(15);
  });

  it('addGold: 골드 증가', () => {
    const em = new EconomyManager();
    em.addGold(10);
    expect(em.gold).toBe(25);
  });

  it('spend: 충분한 골드 → true, 골드 차감', () => {
    const em = new EconomyManager();
    const ok = em.spend(15);
    expect(ok).toBe(true);
    expect(em.gold).toBe(0);
  });

  it('spend: 골드 부족 → false', () => {
    const em = new EconomyManager();
    const ok = em.spend(100);
    expect(ok).toBe(false);
    expect(em.gold).toBe(15);
  });

  it('getDrawCost: 5골드', () => {
    const em = new EconomyManager();
    expect(em.getDrawCost()).toBe(5);
  });

  it('getReplaceCost: 초기 10골드, 교체마다 +2 누적', () => {
    const em = new EconomyManager();
    expect(em.getReplaceCost()).toBe(2);
    em.recordReplace();
    expect(em.getReplaceCost()).toBe(4);
    em.recordReplace();
    expect(em.getReplaceCost()).toBe(6);
  });

  it('resetReplaceCost: 새 핸드 드로우 시 초기화', () => {
    const em = new EconomyManager();
    em.recordReplace();
    em.recordReplace();
    em.resetReplaceCost();
    expect(em.getReplaceCost()).toBe(2);
  });

  it('recordReplace: 援먯껜留덈떎 ?뚰솚 鍮꾩슜 1怨⑤뱶 ?좎씤', () => {
    const em = new EconomyManager();
    expect(em.getDrawCost()).toBe(5);
    em.recordReplace();
    expect(em.getDrawCost()).toBe(4);
    em.recordReplace();
    expect(em.getDrawCost()).toBe(3);
  });
});
