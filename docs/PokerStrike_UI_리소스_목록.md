# PokerStrike UI 리소스 목록

## 생성 리소스

- 원본 시트: `src/assets/ui/pokerstrike-ui-kit-v1.png`
- 문서 미리보기: `docs/assets/pokerstrike-ui-kit-v1.png`
- 용도: 버튼, HUD 프레임, 모달 프레임, 탭, 카드 장식, 재화 아이콘을 실제 UI 적용 전에 잘라 쓰기 위한 마스터 리소스 시트

![PokerStrike UI Kit](assets/pokerstrike-ui-kit-v1.png)

## 우선 적용 대상

| 우선순위 | UI | 현재 위치 | 필요한 리소스 | 비고 |
| --- | --- | --- | --- | --- |
| 1 | 하단 액션 버튼 | `src/ui/CardUI.js` | 소환/교체/마법 대형 버튼 3종 | 텍스트는 Phaser에서 올리고, 배경만 이미지화 |
| 2 | 업그레이드 버튼 | `src/scenes/UIScene.js` | HP/ATK/유틸 소형 버튼 3종 | 보석/골드 강화 버튼에 우선 적용 |
| 3 | 하단 HUD 프레임 | `src/ui/HUD.js` | 하단 패널, 리소스 패널, 웨이브 배지 | 기존 사각형 패널을 이미지 프레임으로 교체 |
| 4 | 웨이브/자원 표시 | `src/ui/HUD.js` | 긴 자원 바, 원형 웨이브 배지, 골드/보석 아이콘 | 골드/보석 시인성 개선 |
| 5 | 강화 선택 모달 | `src/scenes/GameScene.js` | 선택지 카드형 프레임, 모달 프레임 | 강화 선택지 가독성 개선 |
| 6 | 튜토리얼/결과 모달 | `src/scenes/UIScene.js`, `src/scenes/GameScene.js` | 대형 다이얼로그 프레임 3종 | 업그레이드 안내, 스테이지 클리어, 게임오버 |
| 7 | 카드 UI 장식 | `src/ui/CardUI.js` | 카드 프레임, 코너 장식, 구분선 | 현재 카드 레이아웃 유지 후 외곽 장식만 교체 |

## 리소스 분류

- `action-button-gold`: 소환 버튼 배경
- `action-button-cyan`: 교체 버튼 배경
- `action-button-purple`: 마법 버튼 배경
- `upgrade-button-green`: HP 강화 버튼 배경
- `upgrade-button-orange`: ATK 강화 버튼 배경
- `upgrade-button-blue`: 유틸/보석 강화 버튼 배경
- `hud-bottom-frame`: 하단 카드/탭 영역 프레임
- `resource-frame`: 골드/보석 표시 프레임
- `wave-badge-frame`: 웨이브 표시 배지
- `modal-frame-gold`: 중요 안내/클리어 모달
- `modal-frame-blue`: 일반 정보 모달
- `modal-frame-purple`: 마법/강화 모달
- `tab-active`, `tab-inactive`: 카드패/업그레이드/강화 목록 탭 배경
- `card-frame-gold`, `card-frame-silver`, `card-frame-purple`: 카드/선택지 장식 프레임
- `divider-gold`, `divider-blue`, `divider-purple`: 영역 구분선
- `corner-bracket-*`: 작은 패널 코너 장식
- `coin-icon`, `gem-icon-*`: 재화 및 속성 보조 아이콘

## 적용 메모

- 현재 시트는 투명 배경 스프라이트가 아니라 마스터 시트다. 실제 적용 시에는 필요한 영역을 잘라 개별 PNG 또는 texture atlas로 분리한다.
- 버튼 내부 텍스트는 이미지에 굽지 않고 기존 Phaser 텍스트를 유지한다.
- 눌림/비활성/호버 상태는 우선 색조, 알파, 스케일로 처리하고 필요하면 후속 시트에서 상태별 이미지를 추가한다.
- 리소스 적용 순서는 액션 버튼 → HUD 프레임 → 모달 프레임 순서가 가장 효과가 크다.
