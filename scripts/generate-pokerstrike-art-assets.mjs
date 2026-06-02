import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const artDir = join(__dirname, '..', 'src', 'assets', 'art');
const monsterDir = join(artDir, 'monsters');
const towerDir = join(artDir, 'towers');

mkdirSync(monsterDir, { recursive: true });
mkdirSync(towerDir, { recursive: true });

function monsterSvg({
  body,
  accent,
  dark,
  badge = '',
  wing = false,
  shield = false,
  crown = false,
  small = false,
}) {
  const size = small ? 22 : 28;
  const wingShape = wing
    ? `
    <path d="M24 29 L6 17 L13 42 Z" fill="#9eeeff" opacity=".82"/>
    <path d="M40 29 L58 17 L51 42 Z" fill="#9eeeff" opacity=".82"/>`
    : '';
  const crownShape = crown
    ? `
    <path d="M16 19 L22 5 L29 18 L34 4 L40 18 L47 5 L52 19 Z" fill="#ffd45a" stroke="#6b3c00" stroke-width="2"/>`
    : '';
  const shieldRing = shield
    ? `<circle cx="32" cy="34" r="27" fill="none" stroke="${accent}" stroke-width="4" opacity=".78"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000814" flood-opacity=".65"/>
  </filter>
  <g filter="url(#shadow)">
    ${wingShape}
    ${crownShape}
    <ellipse cx="32" cy="44" rx="22" ry="8" fill="#03101c" opacity=".5"/>
    <circle cx="32" cy="32" r="${size}" fill="${body}" stroke="${dark}" stroke-width="3"/>
    <circle cx="21" cy="27" r="9" fill="${body}" stroke="${dark}" stroke-width="2"/>
    <circle cx="43" cy="27" r="9" fill="${body}" stroke="${dark}" stroke-width="2"/>
    <path d="M20 18 L25 4 L31 20 Z" fill="${accent}" stroke="${dark}" stroke-width="2"/>
    <path d="M44 18 L39 4 L33 20 Z" fill="${accent}" stroke="${dark}" stroke-width="2"/>
    ${shieldRing}
    <circle cx="24" cy="29" r="5" fill="#f8fbff"/>
    <circle cx="40" cy="29" r="5" fill="#f8fbff"/>
    <circle cx="25" cy="30" r="2.5" fill="#07111d"/>
    <circle cx="41" cy="30" r="2.5" fill="#07111d"/>
    <rect x="24" y="43" width="16" height="4" rx="2" fill="${dark}" opacity=".9"/>
    ${badge}
  </g>
</svg>`;
}

function towerSvg({ body, accent, glow, suitPath }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000814" flood-opacity=".7"/>
  </filter>
  <g filter="url(#shadow)">
    <ellipse cx="40" cy="64" rx="28" ry="8" fill="#03101c" opacity=".55"/>
    <path d="M18 58 L24 32 L40 18 L56 32 L62 58 Z" fill="${body}" stroke="#07111d" stroke-width="4"/>
    <path d="M24 56 L29 35 L40 26 L51 35 L56 56 Z" fill="#0b1725" opacity=".65"/>
    <circle cx="40" cy="32" r="17" fill="${glow}" opacity=".25"/>
    <path d="M40 9 L53 29 L40 49 L27 29 Z" fill="${accent}" stroke="#f8e6a0" stroke-width="2"/>
    <g transform="translate(40 32) scale(0.8)" fill="#ffffff" stroke="#07111d" stroke-width="1.5">
      ${suitPath}
    </g>
    <rect x="19" y="56" width="42" height="9" rx="4" fill="#111827" stroke="${accent}" stroke-width="3"/>
  </g>
</svg>`;
}

const monsters = {
  basic: { body: '#e99535', accent: '#ffd26a', dark: '#5c2a0d' },
  tank: { body: '#65717f', accent: '#d8e0ea', dark: '#26313c', shield: true, badge: '<path d="M20 42 H44" stroke="#d8e0ea" stroke-width="4" opacity=".8"/>' },
  runner: { body: '#f4a340', accent: '#ffdf7a', dark: '#7d2e16', badge: '<path d="M14 48 L2 54 L16 57 Z M50 48 L62 54 L48 57 Z" fill="#ffdf7a"/>' },
  aerial: { body: '#3eb8e5', accent: '#9eeeff', dark: '#0d506d', wing: true, badge: '<circle cx="32" cy="8" r="3" fill="#d6fbff"/>' },
  magicImmune: { body: '#8e5bff', accent: '#ffd66b', dark: '#30185c', badge: '<circle cx="32" cy="10" r="3" fill="#ffd66b"/><circle cx="12" cy="34" r="3" fill="#ffd66b"/><circle cx="52" cy="34" r="3" fill="#ffd66b"/>' },
  splitter: { body: '#d16fcb', accent: '#ffa3ee', dark: '#611858', badge: '<circle cx="10" cy="48" r="7" fill="#d16fcb"/><circle cx="54" cy="48" r="7" fill="#d16fcb"/>' },
  regen: { body: '#55bd6a', accent: '#a8f0a2', dark: '#174f24', badge: '<rect x="29" y="45" width="6" height="14" fill="#d6ffd1"/><rect x="25" y="49" width="14" height="6" fill="#d6ffd1"/>' },
  freezer: { body: '#78d5f0', accent: '#d6fbff', dark: '#145d78', badge: '<path d="M32 8 V20 M24 12 L40 20 M40 12 L24 20" stroke="#d6fbff" stroke-width="2"/>' },
  boss: { body: '#b6292f', accent: '#ffcc55', dark: '#3a090c', crown: true, shield: true, badge: '<circle cx="32" cy="54" r="4" fill="#ffcc55"/>' },
  armored: { body: '#88919b', accent: '#e1e6eb', dark: '#242c33', shield: true, badge: '<circle cx="32" cy="35" r="15" fill="none" stroke="#2b333d" stroke-width="3"/>' },
  swarm: { body: '#ee62c0', accent: '#ffc5ef', dark: '#73194f', small: true, badge: '<circle cx="9" cy="47" r="5" fill="#ffc5ef"/><circle cx="55" cy="47" r="5" fill="#ffc5ef"/>' },
  berserker: { body: '#f05b28', accent: '#ffd24d', dark: '#7b1707', badge: '<path d="M16 50 L2 55 L18 59 Z M48 50 L62 55 L46 59 Z" fill="#ffd24d"/>' },
  shielded: { body: '#3d91f2', accent: '#96f0ff', dark: '#123c73', shield: true, badge: '<circle cx="32" cy="32" r="24" fill="none" stroke="#96f0ff" stroke-width="3" opacity=".75"/>' },
};

const suitPaths = {
  H: '<path d="M0 13 C-16 2 -15 -13 -5 -13 C0 -13 3 -10 5 -6 C7 -10 10 -13 15 -13 C25 -13 26 2 10 13 L0 22 Z"/>',
  D: '<path d="M0 -21 L16 0 L0 21 L-16 0 Z"/>',
  C: '<circle cx="-8" cy="0" r="8"/><circle cx="8" cy="0" r="8"/><circle cx="0" cy="-10" r="8"/><path d="M-4 8 L4 8 L8 21 L-8 21 Z"/>',
  S: '<path d="M0 -22 C-16 -8 -20 4 -10 11 C-4 15 1 11 4 6 C3 13 1 17 -5 21 H5 C-1 17 -3 13 -4 6 C-1 11 4 15 10 11 C20 4 16 -8 0 -22 Z"/>',
};

const towers = {
  H: { body: '#431420', accent: '#ff5a7a', glow: '#ff5a7a', suitPath: suitPaths.H },
  D: { body: '#123c63', accent: '#5bd6ff', glow: '#5bd6ff', suitPath: suitPaths.D },
  C: { body: '#173f25', accent: '#77dd77', glow: '#77dd77', suitPath: suitPaths.C },
  S: { body: '#252b35', accent: '#f1d06a', glow: '#f1d06a', suitPath: suitPaths.S },
};

for (const [name, spec] of Object.entries(monsters)) {
  writeFileSync(join(monsterDir, `${name}.svg`), monsterSvg(spec), 'utf8');
}

for (const [name, spec] of Object.entries(towers)) {
  writeFileSync(join(towerDir, `${name}.svg`), towerSvg(spec), 'utf8');
}
