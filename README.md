# flocons ❄️

한국어 모어 화자를 위한 **프랑스어 단어 학습** 모바일 앱 (Expo / React Native + TypeScript).

카드를 스와이프해 "알고 있어요 / 학습할게요"로 분류하면, 간격반복(SRS, Leitner 5-box)이 복습 시점을 잡아 주고, 무료 온디바이스 TTS(fr-FR)로 발음까지 들을 수 있어요. **API 키 없이도 완전히 동작**하며, Anthropic 키를 넣으면 AI가 대체 예문을 만들어 줍니다.

## 핵심 기능

- **스와이프 학습 덱** — 단어·관사(성별 색 구분)·품사·뜻·예문(FR/KR)·발음, 되돌리기(undo)
- **간격반복 복습** — Leitner 5-box(0/1/3/7/16일), due 카드만 복습 큐에
- **레벨** — A1·A2·B1 시드 데이터셋 내장 (총 185단어, 온보딩/설정에서 선택)
- **북마크** — 카드에서 저장, 목록에서 모아 보고 바로 복습
- **통계** — 연속 학습(streak)·학습 단어 수·레벨 진척·오늘 복습할 카드
- **AI 보강 (선택)** — Anthropic 키 입력 시 카드의 ↻ 버튼으로 새 예문 생성(캐시·실패 시 정적 폴백)
- **폴리시** — 첫 실행 온보딩, 햅틱, 스크린리더용 분류 커스텀 액션

## 실행법

요구사항: Node ≥ 22, iPhone의 [Expo Go](https://expo.dev/go) (Expo SDK 55).

```bash
npm install
npx expo start        # 터미널의 QR 코드를 iPhone 카메라로 스캔 → Expo Go에서 실행
```

> 개발 대상은 iOS입니다. `npx expo start --web`은 개발 미리보기 용도로만 사용해요.

## 검증법

커밋 전 반드시 모두 통과해야 하는 게이트입니다 ([docs/HARNESS.md](docs/HARNESS.md) §3):

```bash
npm run verify        # typecheck(tsc) + lint(eslint) + test(jest)
npx expo export       # 번들 무결성 스모크 (UI/번들 영향 시)
```

## API 키 (선택 — BYOK)

앱 내 **설정 → API 키**에 본인의 Anthropic API 키를 입력하면 AI 예문 보강이 켜집니다.

- 키 원문은 기기 보안 저장소(`expo-secure-store`)에만 저장되고, 앱 상태·로그·코드 어디에도 남지 않아요.
- 키를 삭제하면 즉시 정적 데이터셋으로 회귀하며, **키 없이도 모든 기능이 동작**합니다.
- 절대 키를 코드·커밋에 넣지 마세요 ([docs/HARNESS.md](docs/HARNESS.md) §5).

## 프로젝트 구조

```
app/                 # expo-router 화면 (홈·온보딩·learn·review·bookmarks·stats·settings)
src/
  components/        # 디자인 시스템(WordCard·TopBar 등) + DeckSession(학습/복습 공용)
  content/           # ContentProvider 추상화 (Static / AI enrich / 이미지 골격)
  srs/               # Leitner 엔진·통계 (순수 함수)
  store/             # cardStore·settingsStore·studyLog (모듈 상태 + AsyncStorage)
  lib/               # tts·haptics·secureKeys·wordImage·dates 등 글루
  data/              # 시드 데이터셋 (a1/a2/b1.json — 정규 Word 스키마)
  theme/             # 색·타이포·간격 토큰
__tests__/           # Jest + @testing-library/react-native
docs/                # DESIGN(SSOT)·ROADMAP·HARNESS
ai-dlc/              # AI-DLC 진행 기록 (STATUS = 진행 SSOT)
```

## 스크린샷

_(추가 예정 — Expo Go 실기 캡처)_

## 문서

- 제품/아키텍처 설계(SSOT): [docs/DESIGN.md](docs/DESIGN.md)
- 로드맵: [docs/ROADMAP.md](docs/ROADMAP.md)
- 개발 하네스(게이트·커밋 규약): [docs/HARNESS.md](docs/HARNESS.md)
- AI-DLC 진행 보드: [ai-dlc/STATUS.md](ai-dlc/STATUS.md)
