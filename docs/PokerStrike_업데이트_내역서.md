# PokerStrike 업데이트 내역서

## 2026-06-24 문서 구조 정리
- 기획서와 업데이트 내역서를 분리했다.
- 기획서는 게임 소개, 핵심 루프, MVP 가설, KPI, UX 원칙 중심으로 재작성했다.
- 변경 이력, 구현 로그, 검증 기록은 이 문서에서 관리한다.

## 기존 문서에서 분리한 이력 후보
- 강화 선택 카드 hover는 이미지 버튼의 표시 크기를 바꾸지 않고 강조 상태만 변경한다.
- 프로젝트 루트, release/, G:\내 드라이브\실행파일\에는 최신 버전 하나만 유지한다.
- 프로젝트 루트, `release/`, `G:\내 드라이브\실행파일\`에는 최신 버전 하나만 유지한다.

## 작성 규칙
- 기능 추가, 밸런스 변경, UI/UX 수정, 리소스 교체, 빌드/배포 변경은 날짜와 버전을 함께 기록한다.
- 기획서에는 최신 소개와 현재 설계 의도만 남기고, 과거 작업 로그는 이 문서로 이동한다.
- MD와 HTML은 항상 함께 갱신한다.

## 2026-06-26 v0.1.66 전투 피드백 배너 프레임 교체
- `src/assets/art/environment/battle-label-frame.png`를 동일 런타임 경로에서 새 PNG 배너 프레임으로 교체했다.
- `ENV_TEXTURES.BATTLE_LABEL_FRAME`를 사용하는 전투 피드백/결과 배너가 새 골드 트림 카지노 판타지 프레임을 사용한다.
- 원본 파일은 `_temp/battle-label-frame_backup_20260626-163324.png`에 백업했다.

## 2026-06-30 v0.2.0 Hand-to-Strike Impact Feedback
- `BattleFeedback` summon copy가 rankImpact, suitImpact, combatHint 필드를 지원하도록 확장됐다.
- `UIScene` 소환 이벤트가 핸드별 전투 역할과 슈트별 효과를 함께 전달한다.
- Straight/Flush/Four Kind 3개 hand outcome의 전투 효과 테스트를 추가했다.
- 전투 피드백 배너 폭과 text fixedWidth를 확장했다.
- 검증: `npm exec vitest run tests/ui/BattleFeedback.test.js`, `npm test` 통과.
## 2026-07-15 v0.4.0 핸드 선택 보상 밀도

- 소환 전투 피드백에 Payoff cue를 추가해 선택한 포커 족보가 이번 턴 어떤 공격 역할, 문양 효과, 보너스 골드로 이어지는지 한 줄로 읽히게 했다.
- Straight/Flush/Four Kind/Full House 등 주요 족보가 전방 유지, 다중 타격, 관통, 고화력 같은 전장 의미와 직접 연결된다.
- 테스트 기준: BattleFeedback 및 SummonPayoffCue 단위 테스트로 핸드 선택 → 공격 결과 연결 문구를 검증한다.