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
  if (isFlush && isSequential)                    rank = HAND_RANK.STRAIGHT_FLUSH;
  else if (counts[0] === 4)                        rank = HAND_RANK.FOUR_OF_A_KIND;
  else if (counts[0] === 3 && counts[1] === 2)     rank = HAND_RANK.FULL_HOUSE;
  else if (isFlush)                                rank = HAND_RANK.FLUSH;
  else if (isSequential)                           rank = HAND_RANK.STRAIGHT;
  else if (counts[0] === 3)                        rank = HAND_RANK.THREE_OF_A_KIND;
  else if (counts[0] === 2 && counts[1] === 2)     rank = HAND_RANK.TWO_PAIR;
  else if (counts[0] === 2)                        rank = HAND_RANK.ONE_PAIR;
  else                                             rank = HAND_RANK.HIGH_CARD;

  const suitCounts = {};
  suits.forEach(s => { suitCounts[s] = (suitCounts[s] || 0) + 1; });
  const dominantSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0][0];

  return { rank, dominantSuit };
}

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
