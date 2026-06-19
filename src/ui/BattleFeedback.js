export const BATTLE_FEEDBACK_COLORS = Object.freeze({
  summon: '#ffe38a',
  magic: '#dca7ff',
  reward: '#8cffb4',
  info: '#d7f4ff',
});

export function getBattleFeedback(payload = {}) {
  if (payload.type === 'summon') {
    return {
      text: joinParts([
        `${payload.rankName || '조합'} 소환`,
        payload.suitLabel ? `${payload.suitLabel} 전선 배치` : '전선 배치',
        Number.isFinite(payload.cost) ? `${payload.cost}G 사용` : null,
      ]),
      tone: 'summon',
    };
  }

  if (payload.type === 'magic') {
    return {
      text: joinParts([
        `${payload.skillName || '마법'} 발동`,
        payload.rankName ? `${payload.rankName} 조합` : null,
        Number.isFinite(payload.burnedCount) ? `카드 ${payload.burnedCount}장 소모` : null,
      ]),
      tone: 'magic',
    };
  }

  if (payload.type === 'kill') {
    return {
      text: joinParts([
        `${payload.enemyType || '적'} 처치`,
        Number.isFinite(payload.reward) ? `보상 +${formatReward(payload.reward)}` : null,
        Number(payload.goldAdded) > 0 ? `골드 +${payload.goldAdded}` : null,
      ]),
      tone: 'reward',
    };
  }

  return { text: String(payload.text || '전투 진행 중'), tone: 'info' };
}

function joinParts(parts) {
  return parts.filter(Boolean).join(' · ');
}

function formatReward(value) {
  return Number.isInteger(value) ? String(value) : Number(value).toFixed(1).replace(/\.0$/, '');
}
