export function isUnitUpgrade(upgrade) {
  return upgrade.type?.startsWith('unit') ?? false;
}

export function getAffectedUnitCount(upgrade, units, rogueliteManager) {
  if (!isUnitUpgrade(upgrade)) return null;
  return units.filter(unit => rogueliteManager.matches(upgrade, unit)).length;
}

export function getEligibleWaveUpgrades(upgrades, units, rogueliteManager) {
  return upgrades.filter(upgrade => {
    const affectedCount = getAffectedUnitCount(upgrade, units, rogueliteManager);
    return affectedCount === null || affectedCount > 0;
  });
}

export function pickWaveUpgrades(upgrades, units, rogueliteManager, count = 3, random = Math.random) {
  return [...getEligibleWaveUpgrades(upgrades, units, rogueliteManager)]
    .sort(() => random() - 0.5)
    .slice(0, count);
}
