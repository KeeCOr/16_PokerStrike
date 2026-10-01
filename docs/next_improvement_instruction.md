# PokerStrike Next Improvement Instruction

Date: 2026-06-24

## Completed 2026-09-28 v0.4.1

- 소환 미리보기를 족보명과 지배 속성 아이콘만 남기는 간결한 표시로 바꿨다.
- 첫 타격·공격 유형·방어 위험을 위한 전장 데이터 재조회 경로를 제거했다.
- 검증은 변경 뒤 실행한다. 실제 플레이 육안 검수는 필요하다.

## Next Candidates

1. 강한 족보일수록 소환 순간을 더 명확하게 연출한다.
2. 종료 화면에 이번 판의 결정적 패와 다음 덱 조정 이유를 요약한다.

## Goal
Turn the current biggest project issue into a small, executable improvement batch. This file is intentionally scoped so the next worker can start without rereading the whole workspace audit.

## Instructions
1. Strengthen one complete card-to-attack action: hand selection, commit, strike impact, and result panel.
2. Add tests or deterministic examples for at least three hand outcomes and their combat effects.
3. Keep release docs aligned with the latest portable exe name after any gameplay code change.

## Completion Rules
- Do not include discarded projects in this batch.
- If gameplay, UI, systems, content, controls, build behavior, or project scope changes, update the project planning document and update log before build/release.
- If runtime source changes, run the nearest available validation and then perform the required build/package step from the project instructions.
- If a folder or asset looks ambiguous, document the decision instead of deleting it.
## Completed 2026-06-30 v0.2.0

- Completed the card-to-attack feedback loop for summon impact copy: hand selection result, unit role, rank impact, suit effect, combat hint, cost, and bonus economy are summarized in one result banner.
- Added deterministic feedback coverage for three hand outcomes: Straight frontline impact, Flush multi-target impact, and Four Kind piercing/armor-break impact.
- Verified latest release docs reference `PokerStrike_v0.2.0_portable.exe`.
- Validation: `npm test` passed 26 files / 112 tests; `npm run build` passed; `npm run dist` rebuilt `release/PokerStrike_v0.2.0_portable.exe`.


## 2026-09-18 전체 프로젝트 공통 완료 조건

1. **첫 5분 핵심 루프**: 시작 10초 안에 목표가 읽히고, 5분 안에 첫 판단→실행→결과→보상/손실→다음 목표가 한 번 완결되어야 한다.
2. **판단 전후 피드백**: 선택 전 예상 이득·위험·비용, 실행 직후 성공·실패·상태 변화, 결과 화면의 원인·변화·다음 점검 행동을 같은 흐름으로 제공한다. 정답을 자동 추천하지 않는다.
3. **출시 증거 패키지**: 테스트·빌드·첫 5분 수동 확인·대표 실행 화면·로딩/빈 상태/오류/저장 복귀·버전과 검증 날짜를 기록한다. 수행하지 않은 항목은 미검증으로 표시한다.

공통 기준 원문: `C:\Development\_workspace_docs\전체_프로젝트_공통_개선기준_2026-09-18.md`

## 2026-09-18 프로젝트별 고유 개선 3개
> 아래 세 항목은 이 프로젝트의 고유 우선순위다. 구현 후에만 완료로 표시한다.

1. 패 선택 전에 족보명·속성 아이콘 표시
2. 포커 족보가 전투 효과로 변환되는 순간을 강하게 연출
3. 한 판 종료 후 승부를 바꾼 패와 다음 덱 조정 이유 설명
