# PokerStrike UI 리소스 목록

## 현재 적용된 PNG UI

- 원본 참고 시트: `src/assets/ui/pokerstrike-ui-kit-v1.png`
- 새 생성 UI 시트 분할 결과: `src/assets/ui/generated/`
- 런타임 로더: `src/assets/art/AssetKeys.js`

## 버튼/프레임 PNG

- `src/assets/ui/generated/button-action-gold.png` - 소환 버튼
- `src/assets/ui/generated/button-action-cyan.png` - 교체 버튼
- `src/assets/ui/generated/button-action-purple.png` - 마법 버튼
- `src/assets/ui/generated/button-action-disabled.png` - 비활성 액션 버튼 예비 리소스
- `src/assets/ui/generated/button-upgrade-green.png` - HP/본진 회복 계열 강화 버튼
- `src/assets/ui/generated/button-upgrade-orange.png` - 공격/문양 골드 강화 버튼
- `src/assets/ui/generated/button-upgrade-blue.png` - 보석/유틸 강화 버튼
- `src/assets/ui/generated/button-danger-red.png` - 위험/초기화 계열 예비 버튼
- `src/assets/ui/generated/tab-active.png` - 활성 탭
- `src/assets/ui/generated/tab-inactive.png` - 비활성 탭
- `src/assets/ui/generated/panel-resource.png` - 골드/보석 자원 패널
- `src/assets/ui/generated/badge-wave.png` - 웨이브 배지

## 코드 적용 위치

- `src/ui/CardUI.js` - 하단 마법/소환/교체 액션 버튼
- `src/scenes/UIScene.js` - 카드패/업그레이드/강화 목록 탭, 강화 버튼
- `src/ui/HUD.js` - 자원 패널, 웨이브 배지
- `scripts/render-pokerstrike-play-preview.py` - 문서용 플레이 예시 이미지

## 적용 원칙

- 버튼 PNG에는 텍스트를 굽지 않고, Phaser 텍스트를 위에 얹는다.
- 리소스가 로드되지 않은 경우 기존 사각형/획 기반 UI로 폴백한다.
- 호버 상태는 이미지 alpha/scale 또는 기존 stroke/fill 변경으로 표현한다.
- 작은 버튼은 텍스트가 프레임 장식과 겹치지 않도록 중앙 텍스트 영역을 우선한다.
