# PokerStrike 작업 규칙

## 빌드 및 실행파일 배치

실행파일 생성은 사용자가 명시적으로 요청한 릴리스·배포 작업에서만 수행한다. 일반 기능·UI 수정에서는 `npm run dist`, `electron-builder`, 포터블 EXE 생성을 실행하지 않는다.

### 빌드 명령어

```bash
cd C:/Development/16_PS && npm run dist
```

`npm run dist` = `vite build && electron-builder` (한 번에 처리)

일반 검증은 가능한 범위에서 `npm test`, `npm run build`, 문법 검사로 끝낸다. 기존 EXE를 복사·덮어쓰기·삭제하지 않는다.

### 실행파일 배치
- 빌드 출력: `C:/Development/16_PS/release/PokerStrike_v{버전}_portable.exe`
- 루트에도 동일하게 배치: `C:/Development/16_PS/PokerStrike_v{버전}_portable.exe`
- 이전 버전 루트 파일은 삭제

### 버전 관리
- 사용자가 릴리스를 요청했을 때만 `C:/Development/16_PS/package.json`의 `version` 패치 버전을 증가한 뒤 빌드한다.

## 기획서 최신화

기능 추가/변경 후 반드시 업데이트:
- `docs/PokerStrike_기획서.md`
- `docs/PokerStrike_기획서.html`
## 아트 리소스 생성 규칙

- 몬스터, 타워, 캐릭터, 배경, 이펙트처럼 게임 안에서 실제 그래픽 품질이 중요한 리소스는 PNG 래스터 이미지로 생성한다.
- 사용자가 명시적으로 SVG를 요청하지 않는 한, 게임 아트 리소스를 SVG 도형 조합으로 대체하지 않는다.
- SVG는 UI 아이콘, 단순 벡터 심볼, 개발용 임시 표시처럼 벡터가 더 적합한 경우에만 사용한다.
- PNG 리소스는 실제 게임 내 표시 크기보다 크게 제작하고, 게임에서는 축소 표시해서 선명도를 확보한다.
