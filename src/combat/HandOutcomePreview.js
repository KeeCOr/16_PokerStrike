export function previewHandOutcome({ baseDamage = 0, handMultiplier = 1, enemyHp = 0, incomingDamage = 0, blockers = 0 }) {
  const damage = Math.max(0, Math.round(baseDamage * handMultiplier));
  const lethal = damage >= enemyHp;
  return {
    damage,
    lethal,
    risk: lethal ? '처치 확정' : incomingDamage > 0 ? `반격 ${incomingDamage} 피해 예상` : '낮은 위험',
    payoff: blockers > 0 ? `${blockers}개 방어선 관통` : '단일 대상 집중',
  };
}

export function buildHandConversionCue({ rankName = 'High Card', damage = 0, effect = 'single target' } = {}) {
  return {
    headline: `${rankName} -> ${damage} damage`,
    effect,
    intensity: damage >= 20 ? 'legendary' : damage >= 10 ? 'strong' : 'normal',
  };
}

export function buildMatchRecap({ plays = [], lostTo = 'unknown threat' } = {}) {
  const decisive = [...plays].sort((a, b) => (b.swing ?? 0) - (a.swing ?? 0))[0] ?? null;
  return {
    decisivePlay: decisive ? `${decisive.rankName}: ${decisive.swing} swing` : 'No decisive hand recorded',
    deckReason: decisive?.weakness ? `Adjust deck for ${decisive.weakness}` : `Adjust deck for ${lostTo}`,
  };
}

export function buildWaveDecisionRecap({ plays = [] } = {}) {
  const decisive = [...plays].sort((a, b) => (b.swing ?? 0) - (a.swing ?? 0))[0] ?? null;

  if (!decisive) {
    return {
      decisivePlay: '핵심 패: 소환 기록 없음',
      nextFocus: '다음 선택 기준: 범용 경제 또는 소환 기반 검토',
    };
  }

  const handLabel = `${decisive.rankName}${decisive.suitLabel ? ` ${decisive.suitLabel}` : ''}`;
  return {
    decisivePlay: `핵심 패: ${handLabel}`,
    nextFocus: `다음 선택 기준: ${handLabel} 시너지 검토`,
  };
}
