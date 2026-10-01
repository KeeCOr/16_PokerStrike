/**
 * PokerStrike Design Tokens
 * Competitor reference: Balatro (dark felt + neon), Slay the Spire (dungeon roguelite)
 * Palette: midnight navy base, gold accent, poker suit neons, HP state gradients
 */
export const THEME = {
  // ─── Backgrounds ───────────────────────────────────────────────────────────
  bg: {
    base:    0x07111d,  // main canvas — deep midnight navy
    panel:   0x0d1b2a,  // card / HUD panel backing
    overlay: 0x051018,  // modal / dimmer overlay
    felt:    0x0a1520,  // game board "felt" surface
    mid:     0x111b27,  // mid-level panel (reward screens)
  },

  // ─── Text ──────────────────────────────────────────────────────────────────
  text: {
    primary:   0xf8fbff,  // near-white body text
    secondary: 0xaaddff,  // steel-blue stat labels
    gold:      0xffcc55,  // score / coin values
    muted:     0x65717f,  // dimmed / disabled text
    dim:       0xb8c1cc,  // secondary info
  },

  // ─── Poker Suits ───────────────────────────────────────────────────────────
  suit: {
    heart:   0xff4444,  // ♥ red
    diamond: 0x4488ff,  // ♦ blue
    club:    0x44cc44,  // ♣ green
    spade:   0xaa66ff,  // ♠ purple
  },

  // ─── HP / Status Bars ──────────────────────────────────────────────────────
  status: {
    hpHigh:   0x44ff88,  // > 60% — healthy green
    hpMid:    0xffaa00,  // 30–60% — warning orange
    hpLow:    0xff4444,  // < 30% — critical red
    shield:   0x88ccff,  // blue shield overlay
    poison:   0xaa55ff,  // purple dot
    burn:     0xff6622,  // fire DoT
    frozen:   0x44ddff,  // ice CC
  },

  // ─── Economy / Resources ───────────────────────────────────────────────────
  economy: {
    coin:    0xffdd00,  // standard gold coin
    gem:     0x55d6ff,  // cyan premium currency
    mana:    0xffcc55,  // mana cost orb
  },

  // ─── Enemy Tiers ───────────────────────────────────────────────────────────
  enemy: {
    common:  0xcccccc,
    elite:   0xff8822,
    boss:    0xff3333,
    undead:  0xaaddff,
  },

  // ─── UI Components ─────────────────────────────────────────────────────────
  ui: {
    border:       0x2b5d78,  // default panel border
    borderGold:   0x8a5a12,  // selected / highlighted border
    borderBright: 0x4a8ace,  // hover border
    btnBase:      0x1a3050,  // button resting state
    btnHover:     0x2a4a6a,  // button hover
    btnActive:    0x0d2035,  // button pressed
    btnGold:      0x8a5a12,  // primary CTA button
    glow:         0x4488ff,  // selection / focus glow
    glowGold:     0xffcc55,  // gold glow (high-value items)
  },
};
