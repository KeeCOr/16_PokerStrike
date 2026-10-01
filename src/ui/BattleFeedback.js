export const BATTLE_FEEDBACK_COLORS = Object.freeze({
  summon: '#ffe38a',
  magic: '#dca7ff',
  reward: '#8cffb4',
  info: '#d7f4ff',
});
export function getSummonPayoffCue(payload = {}) {
  const parts = [
    payload.rankName || null,
    payload.rankImpact || null,
    payload.suitEffect || payload.suitImpact || null,
    Number(payload.bonusGold) > 0 ? `+${payload.bonusGold}G` : null,
  ].filter(Boolean);
  return parts.length > 0 ? `Payoff: ${parts.join(' / ')}` : null;
}
export function getBattleFeedback(payload = {}) {
  if (payload.type === 'summon') {
    const hasImpactCopy = Boolean(
      payload.roleLabel || payload.suitEffect || payload.payoffCue || payload.rankImpact || payload.suitImpact ||
      payload.combatHint || Number(payload.bonusGold) > 0
    );
    const useEnglish = Boolean(
      (payload.payoffCue || payload.rankImpact || payload.suitImpact || payload.combatHint) &&
      [payload.rankName, payload.roleLabel, payload.suitLabel, payload.suitEffect, payload.payoffCue, payload.rankImpact, payload.suitImpact, payload.combatHint]
        .filter(Boolean)
        .every(value => isAsciiText(value))
    );
    return {
      text: joinParts([
        useEnglish ? `${payload.rankName || 'Combo'} summon` : `${payload.rankName || '조합'} 소환`,
        payload.payoffCue || null,
        hasImpactCopy
          ? (useEnglish ? `${payload.roleLabel || 'Frontline'} placed` : `${payload.roleLabel || '전선'} 배치`)
          : (payload.suitLabel ? `${payload.suitLabel} 전선 배치` : '전선 배치'),
        payload.rankImpact || null,
        hasImpactCopy && payload.suitLabel && payload.suitEffect ? `${payload.suitLabel} ${payload.suitEffect}` : null,
        payload.suitImpact || null,
        payload.combatHint || null,
        Number.isFinite(payload.cost) ? (useEnglish ? `${payload.cost}G spent` : `${payload.cost}G 사용`) : null,
        Number(payload.bonusGold) > 0 ? (useEnglish ? `bonus +${payload.bonusGold}G` : `보너스 +${payload.bonusGold}G`) : null,
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

function isAsciiText(value) {
  return /^[\x20-\x7e]+$/.test(String(value));
}
function joinParts(parts) {
  return parts.filter(Boolean).join(' · ');
}

function formatReward(value) {
  return Number.isInteger(value) ? String(value) : Number(value).toFixed(1).replace(/\.0$/, '');
}
