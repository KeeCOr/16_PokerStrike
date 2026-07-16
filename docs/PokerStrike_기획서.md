# PokerStrike 기획서
> v0.4.0 | 최종 수정: 2026-07-15

---

## 문제 정의
전략 카드 게임을 좋아하지만 긴 튜토리얼과 복잡한 덱 빌딩에 지친 PC 플레이어가, 짧은 세션 안에서 바로 판단하고 결과를 확인할 수 있는 전술형 게임을 원한다. PokerStrike는 익숙한 포커 족보를 타워 디펜스식 소환과 전투 결과로 연결해 진입 장벽을 낮춘다.

## 주 페르소나
| 항목 | 내용 |
| --- | --- |
| 이름 | 김도현 |
| 나이 | 33세 |
| 직업 | 제조업 설계직 |
| 현재 행동 | 퇴근 후 PC에서 30분 안팎의 전략 게임을 찾는다. Balatro와 타워 디펜스류를 즐겼다. |
| 사용 맥락 | 복잡한 설명보다 카드 선택, 배치, 전투 결과가 빠르게 이어지는 게임을 선호한다. |

## 핵심 루프
플레이어가 카드패를 확인한다 -> 소환, 교체, 마법 중 하나를 선택한다 -> 포커 족보가 유닛 성능과 전투 효과로 변환된다 -> 웨이브를 막고 보상을 선택한다 -> 다시 다음 카드패를 확인한다.

## MVP 가설
1. 포커 족보를 소환 성능에 직접 연결하면 별도 튜토리얼 없이도 1분 안에 기본 전술을 이해한다.
2. 웨이브 보상을 3개 선택지로 제한하면 매 세션의 빌드 방향이 달라지고 재도전 의지가 생긴다.
3. 전투 결과와 오디오 피드백이 즉시 반응하면 카드 선택의 손맛과 전술 판단의 명확성이 올라간다.

## 레퍼런스 분석
| 레퍼런스 | 핵심 행동까지 단계 수 | 적용 교훈 |
| --- | ---: | --- |
| Balatro | 3 | 익숙한 포커 규칙을 새 시스템에 붙이면 설명 부담이 줄어든다. |
| Kingdom Rush | 4 | 배치 가능 구역과 전투 결과를 명확히 보여야 전략 판단이 빨라진다. |
| Slay the Spire | 4 | 3개 보상 선택지는 플레이어에게 빌드 소유감을 준다. |

## 성공 KPI
| 지표 | 목표 | 측정 방법 |
| --- | --- | --- |
| 1웨이브 완주율 | 첫 실행 플레이어 40% 이상 | 게임 시작 대비 첫 클리어 이벤트 비율 |
| 평균 세션 길이 | 25분 이상 | 시작부터 종료까지 타임스탬프 |
| 재실행률 | 다음 날 재실행 30% 이상 | 실행 날짜 로그 |
| 반복 플레이 | 7일 동안 1인 평균 5회 이상 | 세션 카운트 |

## 구현 상태
| 영역 | 상태 | 메모 |
| --- | --- | --- |
| 카드 평가 | 구현됨 | 포커 족보 판정 테스트 보유 |
| 전투 시스템 | 구현됨 | 전투, 적, 스테이지 테스트 보유 |
| UI와 HUD | 구현됨 | 카드패, 탭, 전투 결과, 재화 표시 테스트 보유 |
| 보상 선택 | 구현됨 | 웨이브 클리어 보상 선택 구조 적용 |
| 오디오 피드백 | 구현됨 | Kenney 효과음 8개 큐 적용 |
| 배포 | 진행 중 | Electron portable 빌드 기준 |

## UI, HUD, 컨트롤 규칙
- 하단 탭은 카드패, 업그레이드, 강화 목록의 텍스트 중심 구조를 유지한다.
- 골드와 보석은 분리된 프레임으로 표시하고 아이콘과 수치 간격을 작게 유지한다.
- 게임 오버와 스테이지 클리어는 이미지 기반 버튼과 프레임 UI를 사용한다.
- HUD 같은 레이어의 요소는 겹치지 않게 배치한다.

## VFX, 오디오, 피드백
- 공격 결과는 전투 로그, 타격 피드백, 상태 변화로 즉시 전달한다.
- 소환, 마법, 선택, 처치, 클리어, 실패 이벤트는 짧은 효과음으로 반응한다.
- 오디오는 게임 판단을 방해하지 않도록 짧고 명확한 큐 중심으로 사용한다.

## 적용 리소스
| 파일 | 원본 팩 | 원본 파일 | 용도 |
| --- | --- | --- | --- |
| `ui-click.ogg` | Kenney Interface Sounds | `Audio/click_001.ogg` | 탭과 교체 클릭 |
| `card-select.ogg` | Kenney Interface Sounds | `Audio/pluck_001.ogg` | 카드 선택 |
| `summon-confirm.ogg` | Kenney Interface Sounds | `Audio/confirmation_001.ogg` | 소환 확정 |
| `magic-cast.ogg` | Kenney Digital Audio | `Audio/phaseJump1.ogg` | 마법 시전 |
| `hit.ogg` | Kenney Digital Audio | `Audio/zap1.ogg` | 공격 적중 |
| `ko.ogg` | Kenney Digital Audio | `Audio/lowDown.ogg` | 적 처치 |
| `stage-clear.ogg` | Kenney Digital Audio | `Audio/powerUp1.ogg` | 스테이지 클리어 |
| `failure.ogg` | Kenney Interface Sounds | `Audio/error_001.ogg` | 게임 오버 |

라이선스: Kenney 공식 페이지 기준 Creative Commons CC0. 상세 매핑은 `src/assets/audio/kenney/README.md`에 기록한다.

## 공유용 이미지
- `docs/PokerStrike_gameplay_preview.png`
- `docs/PokerStrike_01_플레이예시.png`

## 빌드, 테스트, 릴리스
| 목적 | 명령 |
| --- | --- |
| 전체 테스트 | `npm test` |
| 웹 빌드 | `npm run build` |
| portable 패키징 | `npm run dist` |

## 업데이트 내역
### 2026-07-15 v0.4.0 Kenney SFX 적용
- Kenney Interface Sounds와 Digital Audio의 CC0 효과음을 `src/assets/audio/kenney/`에 프로젝트 역할명으로 배치했다.
- 적용 큐는 UI 클릭, 카드 선택, 소환 확인, 마법 시전, 공격 적중, 적 처치, 스테이지 클리어, 게임 오버다.
- `GameScene.preload()`에서 오디오 에셋을 선로딩하고, `UIScene`과 `GameScene`의 주요 입력, 전투, 결과 이벤트에서 `playAudioCue()`를 호출한다.
- `tests/assets/AudioAssetKeys.test.js`, `tests/audio/AudioCuePlayer.test.js`, `tests/audio/AudioIntegration.test.js`로 키 매핑, 재생 가드, 씬 연결을 검증한다.

### 2026-07-15 v0.3.0 핸드 선택 보상 반응
- 소환 전투 피드백에 포커 족보의 공격 역할, 문양 효과, 보너스 골드 연결 문구를 추가했다.
- BattleFeedback과 SummonPayoffCue 테스트로 카드 선택과 전투 결과 연결을 검증했다.

### 2026-06-30 v0.2.0 Hand-to-Strike Impact Feedback
- 선택한 핸드가 전투에서 강한지 결과 배너에서 즉시 읽히도록 개선했다.
- 전투 피드백 배너 폭과 문구 배치를 조정했다.

## 다음 우선순위
1. 실제 플레이에서 효과음 볼륨 균형을 확인하고 과한 큐를 교체한다.
2. BGM은 AI 생성 후보와 CC0 루프 후보를 나란히 비교해 한 곡만 임시 적용한다.
3. 스테이지별 웨이브 수와 보상 선택지를 늘려 20분 세션 밀도를 높인다.
