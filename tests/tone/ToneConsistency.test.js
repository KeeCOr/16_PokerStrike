import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { HUD_LAYOUT } from '../../src/ui/HUD.js';
import { UI_TEXTURES } from '../../src/assets/art/AssetKeys.js';
import { WAVE_CHOICE_LAYOUT } from '../../src/scenes/WaveChoiceLayout.js';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

describe('PokerStrike tone consistency', () => {
  it('uses PokerStrike branding on the title screen', () => {
    const menu = read('../../src/scenes/MenuScene.js');

    expect(menu).toContain('PokerStrike');
    expect(menu).not.toContain('Card Defense');
    expect(menu).not.toContain("'CARD'");
    expect(menu).not.toContain("'DEFENSE'");
  });

  it('keeps bottom tab labels text-only without leading symbol icons', () => {
    const ui = read('../../src/scenes/UIScene.js');

    expect(ui).toContain("'카드패'");
    expect(ui).toContain("'업그레이드'");
    expect(ui).toContain("'강화 목록'");
    expect(ui).not.toMatch(/['"][▱⇧✦]\s{1,}/);
  });

  it('uses separate currency frames with tight icon-to-value spacing', () => {
    expect(HUD_LAYOUT.GOLD_PANEL).toBeDefined();
    expect(HUD_LAYOUT.GEM_PANEL).toBeDefined();
    expect(HUD_LAYOUT.GOLD_PANEL.x).toBeLessThan(HUD_LAYOUT.GEM_PANEL.x);
    expect(HUD_LAYOUT.GOLD_TEXT.x - HUD_LAYOUT.GOLD_ICON.x).toBeLessThanOrEqual(44);
    expect(HUD_LAYOUT.GEM_TEXT.x - HUD_LAYOUT.GEM_ICON.x).toBeLessThanOrEqual(44);
    expect(HUD_LAYOUT.GEM_TEXT.color).toBe('#55d6ff');
  });

  it('uses the blue-gold UI kit for upgrade choice title framing', () => {
    expect(WAVE_CHOICE_LAYOUT.TITLE_TEXTURE).toBe(UI_TEXTURES.TAB_ACTIVE);
  });

  it('renders game over with framed result UI and image-backed buttons', () => {
    const scene = read('../../src/scenes/GameScene.js');

    expect(scene).toContain('GAME_OVER_LAYOUT');
    expect(scene).toContain('UI_TEXTURES.BUTTON_DANGER_RED');
    expect(scene).toContain('UI_TEXTURES.BUTTON_ACTION_GOLD');
    expect(scene).toContain('전투 결과');
  });

  it('keeps planning docs free of mojibake text', () => {
    const md = fs.readFileSync('C:/Development/16_PS/docs/PokerStrike_기획서.md', 'utf8');
    const html = fs.readFileSync('C:/Development/16_PS/docs/PokerStrike_기획서.html', 'utf8');

    expect(md + html).not.toMatch(/[湲媛移濡蹂援諛怨紐]|\?{2,}/);
    expect(md).toContain('# PokerStrike 기획서');
    expect(html).toContain('<title>PokerStrike 기획서</title>');
  });
});
