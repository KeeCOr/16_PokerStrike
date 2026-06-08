# PokerStrike 아트 리소스 목록

## 생성 방식

- 생성 방식: AI 이미지 생성 PNG 시트 제작 후 개별 PNG로 크롭
- 후처리: 크로마키 배경 제거, 256x256 투명 PNG로 정규화
- 적용 위치: `src/assets/art`
- 런타임 로더: `src/assets/art/AssetKeys.js`
- SVG 도형 리소스는 런타임 참조에서 제거했다.

## 몬스터 PNG

- `src/assets/art/monsters/basic.png` - 기본 몬스터
- `src/assets/art/monsters/tank.png` - 중장갑 탱커
- `src/assets/art/monsters/runner.png` - 고속 러너
- `src/assets/art/monsters/aerial.png` - 공중 몬스터
- `src/assets/art/monsters/magicImmune.png` - 마법 면역 몬스터
- `src/assets/art/monsters/splitter.png` - 분열 몬스터
- `src/assets/art/monsters/regen.png` - 재생 몬스터
- `src/assets/art/monsters/freezer.png` - 빙결 몬스터
- `src/assets/art/monsters/boss.png` - 보스 몬스터
- `src/assets/art/monsters/armored.png` - 방어형 장갑 몬스터
- `src/assets/art/monsters/swarm.png` - 군집 몬스터
- `src/assets/art/monsters/berserker.png` - 광전사 몬스터
- `src/assets/art/monsters/shielded.png` - 보호막 몬스터

## 타워 PNG

- `src/assets/art/towers/H.png` - 하트 타워
- `src/assets/art/towers/D.png` - 다이아 타워
- `src/assets/art/towers/C.png` - 클로버 타워
- `src/assets/art/towers/S.png` - 스페이드 타워

## 재생성 절차

1. PNG 시트를 생성한다.
2. 생성된 시트 경로를 `scripts/process-pokerstrike-png-assets.py`의 `MONSTER_SRC`, `TOWER_SRC`에 반영한다.
3. 번들 Python으로 `scripts/process-pokerstrike-png-assets.py`를 실행한다.
4. `npm.cmd test`와 `npm.cmd run dist`를 실행한다.
