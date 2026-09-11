import { describe, expect, it, vi } from 'vitest';
import {
  UI_TEXTURES,
  preloadArtAssets,
} from '../../src/assets/art/AssetKeys.js';
import { NINE_SLICE_MARGIN, createNineSlice } from '../../src/ui/NineSlice.js';
import Unit from '../../src/units/Unit.js';
import Enemy from '../../src/enemies/Enemy.js';
import { ENEMY_TYPE } from '../../src/enemies/EnemyData.js';
import { HAND_RANK } from '../../src/cards/HandEvaluator.js';

function makeGrid() {
  return { cellToWorld: (col, row) => ({ x: col * 32, y: row * 32 }) };
}

function makeSceneRecorder() {
  const imageCalls = [];
  const scene = {
    grid: makeGrid(),
    textures: { exists: () => true },
    add: {
      image: vi.fn((x, y, key) => {
        const img = {
          key, x, y,
          setDisplaySize: vi.fn().mockReturnThis(),
          setDepth: vi.fn().mockReturnThis(),
          setOrigin: vi.fn().mockReturnThis(),
          setPosition: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
          setTint: vi.fn().mockReturnThis(),
          clearTint: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        };
        imageCalls.push(img);
        return img;
      }),
      graphics: vi.fn(() => ({
        setDepth: vi.fn().mockReturnThis(),
        setPosition: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        clear: vi.fn().mockReturnThis(),
        lineStyle: vi.fn().mockReturnThis(),
        fillStyle: vi.fn().mockReturnThis(),
        fillRect: vi.fn().mockReturnThis(),
        fillCircle: vi.fn().mockReturnThis(),
        setVisible: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
      circle: vi.fn(() => ({
        setDepth: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setPosition: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
      text: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setPosition: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
      container: vi.fn(() => ({
        setDepth: vi.fn().mockReturnThis(),
        setSize: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        add: vi.fn(),
        on: vi.fn(),
        setPosition: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
    },
  };
  return { scene, imageCalls };
}

describe('imagegen v1.0.2 planned assets (RED)', () => {
  it('AssetKeys declares the three new PNG UI texture keys', () => {
    expect(UI_TEXTURES.HP_GAUGE_SHELL).toBe('ps-hp-gauge-shell');
    expect(UI_TEXTURES.CHARACTER_FRAME).toBe('ps-character-frame');
    expect(UI_TEXTURES.FRAME_9S).toBe('ps-ui-frame-9s');
  });

  it('preloadArtAssets loads the three new keys as PNG images (no SVG/data URI)', () => {
    const loaded = [];
    preloadArtAssets({ load: { image(key, url) { loaded.push({ key, url }); } } });

    const shell = loaded.find(item => item.key === 'ps-hp-gauge-shell');
    const frame = loaded.find(item => item.key === 'ps-character-frame');
    const frame9s = loaded.find(item => item.key === 'ps-ui-frame-9s');

    expect(shell?.url.endsWith('.png')).toBe(true);
    expect(frame?.url.endsWith('.png')).toBe(true);
    expect(frame9s?.url.endsWith('.png')).toBe(true);
    expect([shell, frame, frame9s].every(item => !/^data:|\.svg$/i.test(item?.url ?? ''))).toBe(true);
  });

  it('Unit creates a bitmap character frame behind its contain-scaled tower sprite', () => {
    const { scene, imageCalls } = makeSceneRecorder();
    new Unit(scene, 0, 0, HAND_RANK.ONE_PAIR, 'H', 1, { hp: 10, maxHp: 10, range: 2 });

    const frameCall = imageCalls.find(img => img.key === 'ps-character-frame');
    expect(frameCall).toBeTruthy();
  });

  it('Enemy creates a bitmap character frame behind its contain-scaled monster sprite', () => {
    const { scene, imageCalls } = makeSceneRecorder();
    new Enemy(scene, 0, 0, ENEMY_TYPE.BASIC);

    const frameCall = imageCalls.find(img => img.key === 'ps-character-frame');
    expect(frameCall).toBeTruthy();
  });

  it('Unit and Enemy base HP use a static bitmap gauge shell while the fill stays Graphics-driven', () => {
    const { scene: unitScene, imageCalls: unitImages } = makeSceneRecorder();
    const unit = new Unit(unitScene, 0, 0, HAND_RANK.ONE_PAIR, 'H', 1, { hp: 5, maxHp: 10, range: 2 });
    expect(unitImages.some(img => img.key === 'ps-hp-gauge-shell')).toBe(true);
    expect(unit.hpBar.fillRect).toBeDefined();

    const { scene: enemyScene, imageCalls: enemyImages } = makeSceneRecorder();
    new Enemy(enemyScene, 0, 0, ENEMY_TYPE.BASIC);
    expect(enemyImages.some(img => img.key === 'ps-hp-gauge-shell')).toBe(true);
  });

  it('the new UI frame is wired through NineSlice with explicit STRIP or PANEL margins', () => {
    const nineslice = vi.fn(() => ({ setOrigin: vi.fn().mockReturnThis(), setDepth: vi.fn().mockReturnThis() }));
    const scene = { add: { nineslice }, textures: { exists: () => true } };

    createNineSlice(scene, 0, 0, 200, 200, UI_TEXTURES.FRAME_9S, NINE_SLICE_MARGIN.PANEL, 5);

    expect(nineslice).toHaveBeenCalledWith(
      0, 0, 'ps-ui-frame-9s', undefined,
      200, 200,
      NINE_SLICE_MARGIN.PANEL.left, NINE_SLICE_MARGIN.PANEL.right,
      NINE_SLICE_MARGIN.PANEL.top, NINE_SLICE_MARGIN.PANEL.bottom,
    );
  });
});
