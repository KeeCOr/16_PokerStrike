# PokerStrike 아트 리소스 목록

- v0.1.57: 전투 피드백 배너는 기존 `battle-label-frame.png`를 재사용해 소환/마법/처치 결과를 하단 패널 위에 표시한다.
- v0.1.66: `battle-label-frame.png`를 어두운 카지노 판타지 UI 톤의 골드 트림 배너 프레임으로 교체했다. 중앙 텍스트 영역은 어둡고 단순하게 유지해 520x34 전투 피드백 배너에서도 한 줄 메시지가 읽히도록 했다.

## 생성 방식

- 게임 안에서 품질이 중요한 리소스는 PNG 래스터 이미지로 생성한다.
- 생성된 시트는 크로마키 배경을 제거하고, 개별 투명 PNG로 분할한다.
- 런타임 로더는 `src/assets/art/AssetKeys.js`에서 모든 게임 아트 PNG를 preload한다.
- SVG는 게임 아트 대체재로 사용하지 않고, 단순 UI 아이콘이나 개발용 표시가 필요한 경우에만 사용한다.

## 환경 PNG

- `src/assets/art/environment/board-tile.png` - 기본 보드 타일
- `src/assets/art/environment/board-tile-alt.png` - 교차 배치용 어두운 보드 타일
- `src/assets/art/environment/obstacle-stone.png` - 석재 장애물
- `src/assets/art/environment/obstacle-barricade.png` - 목재/철제 바리케이드 장애물
- `src/assets/art/environment/spawn-gate.png` - 적 스폰 포털
- `src/assets/art/environment/base-core.png` - 플레이어 본진 코어
- `src/assets/art/environment/base-shield.png` - 본진 방어판 보조 리소스
- `src/assets/art/environment/battle-label-frame.png` - 전투 메시지/결과 배너 프레임, `ENV_TEXTURES.BATTLE_LABEL_FRAME` 런타임 키로 로드

## 몬스터 PNG

- `src/assets/art/monsters/basic.png` - 기본 몬스터
- `src/assets/art/monsters/tank.png` - 탱커 몬스터
- `src/assets/art/monsters/runner.png` - 고속 몬스터
- `src/assets/art/monsters/aerial.png` - 공중 몬스터
- `src/assets/art/monsters/magicImmune.png` - 마법 면역 몬스터
- `src/assets/art/monsters/splitter.png` - 분열 몬스터
- `src/assets/art/monsters/regen.png` - 재생 몬스터
- `src/assets/art/monsters/freezer.png` - 빙결 몬스터
- `src/assets/art/monsters/boss.png` - 보스 몬스터
- `src/assets/art/monsters/armored.png` - 방어형 몬스터
- `src/assets/art/monsters/swarm.png` - 군집 몬스터
- `src/assets/art/monsters/berserker.png` - 광전사 몬스터
- `src/assets/art/monsters/shielded.png` - 보호막 몬스터

## 타워 PNG

- `src/assets/art/towers/H.png` - 하트 타워, 단순형 화염 실루엣
- `src/assets/art/towers/D.png` - 다이아 타워, 단순형 빙결 실루엣
- `src/assets/art/towers/C.png` - 클로버 타워, 단순형 둔기/방어 약화 실루엣
- `src/assets/art/towers/S.png` - 스페이드 타워, 단순형 저격 실루엣

## VFX PNG

- `src/assets/art/vfx/fire-projectile.png` - 하트/화염 투사체
- `src/assets/art/vfx/fire-impact.png` - 하트/화염 명중 효과
- `src/assets/art/vfx/ice-projectile.png` - 다이아/빙결 투사체
- `src/assets/art/vfx/ice-impact.png` - 다이아/빙결 명중 효과
- `src/assets/art/vfx/club-projectile.png` - 클로버/방어 약화 투사체
- `src/assets/art/vfx/armor-break-impact.png` - 방어 약화 명중 효과
- `src/assets/art/vfx/spade-projectile.png` - 스페이드/저격 투사체
- `src/assets/art/vfx/pierce-impact.png` - 관통 명중 효과
- `src/assets/art/vfx/aura-ring.png` - 강화 오라 효과
- `src/assets/art/vfx/magic-burst.png` - 마법 발동 효과
- `src/assets/art/vfx/hit-spark.png` - 범용 명중 스파크
- `src/assets/art/vfx/shield-ripple.png` - 보호막 파문 효과

## 재생성 절차

1. PNG 시트를 생성한다.
2. 몬스터/기본 타워 일괄 재생성은 `scripts/process-pokerstrike-png-assets.py`를 실행한다.
3. 타워만 교체할 때는 `scripts/process-pokerstrike-tower-assets.py`를 실행한다.
4. VFX는 `scripts/process-pokerstrike-vfx-assets.py`를 실행한다.
5. 보드/본진/장애물/UI 버튼은 `scripts/process-pokerstrike-board-ui-assets.py`를 실행한다.
6. `scripts/render-pokerstrike-play-preview.py`로 문서용 플레이 예시를 다시 만든다.
7. `npm.cmd test`와 `npm.cmd run dist`로 검증한다.
## 이동 가능 타일 파생 PNG

- `src/assets/art/environment/board-tile-move.png` - 이동 가능 구역용 저채도/저명도 기본 타일
- `src/assets/art/environment/board-tile-alt-move.png` - 이동 가능 구역용 저채도/저명도 교차 타일


