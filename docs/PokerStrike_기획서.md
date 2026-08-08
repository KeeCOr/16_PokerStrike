# PokerStrike 기획서

> v0.4.0 | 최종 수정: 2026-08-08

## 문제 정의

PokerStrike는 짧은 시간 안에 카드 조합을 읽고, 소환과 전투 결과를 즉시 확인하고 싶은 PC 전략 카드 게임 플레이어를 위한 게임이다. 복잡한 튜토리얼보다 카드 선택, 패 교체, 소환 확정, 타격 결과가 빠르게 읽히는 전투 피드백을 우선한다.

## 주 페르소나

| 항목 | 내용 |
| --- | --- |
| 이름 | 김도현 |
| 나이 | 33세 |
| 직업 | 제조업 설계직 |
| 현재 행동 | 퇴근 후 PC에서 20-30분짜리 전략 카드 게임을 찾는다. |
| 사용 맥락 | Balatro식 조합 판단은 좋아하지만, 결과가 늦게 보이거나 효과가 불명확하면 금방 이탈한다. |

## 핵심 루프

플레이어가 카드 패를 확인한다 -> 소환, 교체, 마법 중 하나를 선택한다 -> 포커 조합이 유닛 성능과 전투 효과로 변환된다 -> 웨이브를 막고 보상을 고른다 -> 다시 다음 카드 패를 확인한다.

## MVP 가설

1. 포커 조합이 소환 성능과 직접 연결되면 별도 설명 없이도 1분 안에 기본 전략을 이해한다.
2. 웨이브 보상을 3개 선택지로 제한하면 매 세션의 빌드 방향이 달라지고 재도전 의지가 생긴다.
3. 전투 결과를 이미지 VFX와 짧은 SFX로 즉시 전달하면 카드 선택의 손맛과 전술 판단이 명확해진다.

## 레퍼런스 분석

| 레퍼런스 | 핵심 행동 단계 수 | 적용 교훈 |
| --- | ---: | --- |
| Balatro | 3 | 익숙한 포커 규칙을 전투 시스템에 붙이면 설명 부담이 줄어든다. |
| Kingdom Rush | 4 | 배치 가능 구역과 전투 결과를 명확히 보여줘야 전략 판단이 빨라진다. |
| Slay the Spire | 4 | 3개 보상 선택지는 빌드 소유감을 주면서도 선택 피로를 낮춘다. |

## 성공 KPI

| 지표 | 목표 | 측정 방법 |
| --- | --- | --- |
| 1웨이브 완주율 | 첫 실행 플레이어 40% 이상 | 게임 시작 대비 첫 클리어 이벤트 비율 |
| 평균 세션 길이 | 20분 이상 | 시작부터 종료까지 타임스탬프 |
| 재시도율 | 다음 날 재실행 30% 이상 | 실행 날짜 로그 |
| 반복 플레이 | 7일 동안 1인 평균 5회 이상 | 세션 카운트 |

## 구현 상태

| 영역 | 상태 | 메모 |
| --- | --- | --- |
| 카드 평가 | 구현됨 | 포커 조합 판정 테스트 보유 |
| 전투 시스템 | 구현됨 | 전투, 적, 스테이지 테스트 보유 |
| UI/HUD | 구현됨 | 카드패, 업그레이드, 강화 목록, 결과 UI 테스트 보유 |
| 보상 선택 | 구현됨 | 웨이브 클리어 보상 구조 적용 |
| SFX/VFX | 구현됨 | Kenney SFX 8개와 전투 VFX 텍스처 12개를 런타임 매핑 |
| 배포 | 진행 중 | Electron portable 빌드 기준 |

## UI, HUD, 컨트롤 규칙

- 하단 탭은 카드패, 업그레이드, 강화 목록의 텍스트 중심 구조를 유지한다.
- 골드와 보석은 분리된 프레임으로 표시하고 아이콘과 수치 간격을 좁게 유지한다.
- 게임 오버와 스테이지 클리어는 이미지 기반 버튼과 프레임 UI를 사용한다.
- HUD 같은 레이어의 요소는 겹치지 않도록 배치한다.

## SFX/VFX 적용

| 종류 | 파일 | 용도 |
| --- | --- | --- |
| SFX | `ui-click.ogg` | 탭과 교체 UI 클릭 |
| SFX | `card-select.ogg` | 카드 선택 |
| SFX | `summon-confirm.ogg` | 소환 확정 |
| SFX | `magic-cast.ogg` | 마법 시전 |
| SFX | `hit.ogg` | 공격 적중 |
| SFX | `ko.ogg` | 적 처치 |
| SFX | `stage-clear.ogg` | 스테이지 클리어 |
| SFX | `failure.ogg` | 게임 오버 |
| VFX | `fire-projectile.png`, `fire-impact.png` | 화염 공격 투사체와 충돌 |
| VFX | `ice-projectile.png`, `ice-impact.png` | 빙결 공격 투사체와 충돌 |
| VFX | `hit-spark.png`, `magic-burst.png` | 일반 타격과 마법 폭발 |
| VFX | `shield-ripple.png`, `aura-ring.png` | 방어와 오라 표시 |

라이선스: Kenney 공식 에셋 기준 Creative Commons CC0. 상세 매핑은 `src/assets/audio/kenney/README.md`, `src/assets/audio/AudioAssetKeys.js`, `src/assets/art/AssetKeys.js`, `docs/sfx-vfx-candidates-20260808.md`에 기록한다.

## 공유용 이미지

- `docs/PokerStrike_gameplay_preview.png`
- `docs/PokerStrike_01_플레이예시.png`

## 빌드와 테스트

| 목적 | 명령 |
| --- | --- |
| 전체 테스트 | `npm test` |
| 웹 빌드 | `npm run build` |
| portable 패키지 | `npm run dist` |

## 업데이트 이력

### 2026-08-08 SFX/VFX 공용 리소스 반영

- 워크스페이스 공용 SFX/VFX 카탈로그에 PokerStrike 리소스를 등록했다.
- 프로젝트 문서 `docs/sfx-vfx-candidates-20260808.md`에 SFX 8개, VFX 13개 후보와 런타임 매핑 상태를 기록했다.
- 깨진 인코딩의 기획서를 정상 UTF-8 문서로 정리하고, 현재 SFX/VFX 적용 상태를 반영했다.

### 2026-07-27 UX 개선 반영

- 패 조합 선택 전에 공격 타입과 전장 효과를 한 줄로 연결해 선택 전 예측과 결과 연출의 거리를 줄였다.

### 2026-07-15 v0.4.0 Kenney SFX 적용

- Kenney Interface Sounds와 Digital Audio의 CC0 효과음을 `src/assets/audio/kenney/`에 프로젝트용 파일명으로 배치했다.
- `GameScene.preload()`에서 오디오 에셋을 로드하고, `UIScene`과 `GameScene`의 주요 입력, 전투, 결과 이벤트에 `playAudioCue()`를 연결했다.
