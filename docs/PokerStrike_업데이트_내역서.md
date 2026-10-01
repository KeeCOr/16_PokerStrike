# PokerStrike 업데이트 내역서

## 2026-09-22 v0.4.1 소환 전 판단 UI

- 목표 화면: `docs/design-references/2026-09-22_소환전판단_목표화면.png`.
- 구성요소 분해: 족보·문양 평가 데이터, 기본 공격력 계산, 적 수·본진 HP 위험 판정, 3구역 판단띠, 빈 손 숨김 상태.
- 발견한 격차: 기존 소환 미리보기는 공격 문양만 표시해 피해량과 방어 위험을 실행 전에 비교할 수 없었다.
- 실제 적용: `HandOutcomePreview.js`에 결정 모델을 추가하고 `UIScene.js`에서 실전 데이터를 연결했으며 `CardUI.js`에 세 영역 표시를 추가했다.
- 변경 파일: `src/combat/HandOutcomePreview.js`, `src/scenes/UIScene.js`, `src/ui/CardUI.js`, 관련 테스트, 패키지 버전, GDD·기획서·업데이트 문서.
- 검증: `npm test` 31개 파일·130개 테스트 통과, `npm run build` 통과, `npm run dist` 통과. `PokerStrike_v0.4.1_portable.exe` 생성 확인.
- 알려진 문제: 실제 플레이 육안 검수 미실행, Vite 대형 청크 경고, 기존 루트 v0.4.0 실행 파일 보존.
- 다음 후보: 강한 족보가 전투 효과로 변환되는 순간의 차등 연출, 종료 화면의 결정적 패·덱 조정 이유 요약.

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

## 2026-09-23 복원 로컬 분기 / 웨이브 회고 연결

- 기준점: 복원 로컬 소스 `v0.4.1`, Drive 배포본 `v1.0.2`. 로컬 소스가 더 오래됐으며 이번 변경은 Drive에 배포하지 않았다.
- 실제 배치에 성공한 소환의 패 이름, 문양, 적용 후 공격력을 웨이브 단위로 기록한다.
- 웨이브 보상 화면이 가장 강한 실제 소환과 현재 본진 HP를 회고한 뒤 강화 3개를 보여준다.
- 본진 HP가 낮으면 생존·제어, 첫 타격이 낮으면 공격, 그 외에는 핵심 패 시너지라는 판단 기준을 표시한다. 특정 강화 카드를 자동 선택하지 않는다.
- 기존 이미지 기반 제목·강화 카드와 호버 동작은 보존하고 2줄 회고 영역을 위한 레이아웃 간격만 조정했다.
- 변경 파일: `HandOutcomePreview.js`, `GameScene.js`, `UIScene.js`, `WaveChoiceLayout.js`, 관련 테스트와 문서.

검증:
- 집중 테스트 14개 통과.
- 전체 테스트 31개 파일, 134개 통과.
- `npm run build` 통과.
- `impeccable detect --json` 지적 0건.
- 미검증: 실제 웨이브 완주 화면 육안 확인.
- 미실행: `npm run dist`, 실행파일 배치, Drive 배포, 통합 현황 수정.
- 알려진 문제: Vite 대형 청크 경고.
