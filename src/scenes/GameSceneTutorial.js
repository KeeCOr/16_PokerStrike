export function shouldShowUpgradeTutorialOnStageClear(stageIndex, alreadyShown) {
  return stageIndex === 0 && !alreadyShown;
}
