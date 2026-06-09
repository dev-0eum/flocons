# Bolt 기록 — `UoW-04-tts`

> 상태 SSOT는 [ai-dlc/STATUS.md](../STATUS.md). 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-04-tts` |
| **이름** | 발음 (TTS · expo-speech) |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M4 |
| **리드** | **back-dev** (lib/ 서비스) |
| **멤버** | front-dev(학습 화면 배선) · qa-dev · code-review |
| **상태** | 🔵 In Progress (체크포인트 A ✅ — 구현 중) |
| **시작/완료** | 2026-06-09 / (미정) |
| **의존성** | UoW-00 (✅) · (배선은 UoW-03 /learn ✅ 위에) |

> DoD 요약: `lib/tts.ts`가 expo-speech를 `fr-FR`로 감싸 단어/예문을 재생 · Speech mock 테스트로 텍스트·언어코드·rate 검증 · 설정 기본값 반영(설정 UI는 UoW-08) · 검증 게이트 4종 green.

---

## 1) 논리 설계 (제안)

> back-dev 리드. 근거: [docs/DESIGN.md §5 TTS](../../docs/DESIGN.md), [ADR-005](../inception/04-architecture-decision.md)(UI는 콜백만, expo-speech 직접 import 금지), [00-tech-stack](../00-tech-stack.md). 코드 미작성. (context7 일시 비가용 — expo-speech API는 설치된 타입+typecheck로 검증.)

### 목표
무료 온디바이스 발음을 `lib/tts.ts`로 캡슐화하고, UoW-03 `/learn`의 WordCard 발음 버튼(이미 콜백 존재)에 배선한다. 키·인터넷 불필요.

### 1-1. `src/lib/tts.ts`
- `speak(text: string, opts?: { rate?: number; voice?: string }): void` — `Speech.speak(text, { language: 'fr-FR', rate, voice })`.
- `stop(): void` — `Speech.stop()`.
- 언어 `fr-FR` 고정. rate/voice는 인자(기본값 없음 → 시스템 기본). **설정값 연동은 UoW-08**(settingsStore).
- ADR-005: tts는 expo-speech를 직접 쓰는 **유일** 지점. 컴포넌트는 콜백만.

### 1-2. `/learn` 배선 (app/learn.tsx)
- `headword = word.article ? `${word.article} ${word.lemma}` : word.lemma` (관사+표제어로 성·리에종까지 듣게).
- `WordCard`에 `onPlayWord={() => tts.speak(headword)}`, `onPlayExample={() => tts.speak(word.exampleFr)}` 전달. (현재 미전달 → 이번에 배선.)

### 파일 변경 계획 (코드 미작성)
- `src/lib/tts.ts` (신규)
- `app/learn.tsx` (수정 — 발음 버튼 콜백 배선)
- `__tests__/lib/tts.test.ts` (신규 — Speech mock으로 speak/stop 인자 검증)

### 데이터 흐름
WordCard 발음 버튼 → `/learn` 콜백 → `tts.speak(headword | exampleFr)` → `Speech.speak(..., {language:'fr-FR'})`.

### 리스크 / 미해결 질문 (체크포인트 A)
- **Q-D1 (재생 텍스트)**: 단어 버튼은 **관사+표제어**("le crime")로 재생(성·리에종 학습) → **권장: 동의**. (대안: lemma만.)
- **Q-D2 (rate/voice)**: 지금은 시스템 기본(설정 UI·연동은 UoW-08) → **권장: 동의.**
- **Q-D3 (API 형태)**: `speak(text, opts)`+`stop()`, fr-FR 고정 → **권장: 동의.**
- 리스크: 웹(react-native-web)에서 expo-speech는 Web Speech API로 동작(브라우저 음성 의존) — Expo Go(iOS)가 1차 타깃이라 수용. 게이트는 mock으로 통과.

### ⏸️ 체크포인트 A — 설계 승인
- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-09
- 코멘트: Q-D1(관사+표제어)·Q-D2(시스템 기본 rate)·Q-D3(speak/stop API) 권장값대로 승인.

---

## 2) 구현
승인된 설계대로:
- `src/lib/tts.ts` — `speak(text, { rate?, voice? })` → `Speech.speak(text, { language: 'fr-FR', … })`, `stop()`. expo-speech 단일 지점(ADR-005).
- `app/learn.tsx` — `headword`(관사+표제어, Q-D1) + WordCard `onPlayWord`/`onPlayExample` 배선.
- 후속(code-review nit): headword 조합이 WordCard 표시용과 중복 — 추후 `toHeadword` 헬퍼로 단일화 가능(범위 밖).

## 3) 테스트 (qa-dev) — 검증 게이트 전부 green
- [x] `npm run typecheck` — PASS · [x] `npm run lint` — PASS · [x] `npm run test` — PASS (12 suites / **35 tests**: tts speak/stop 인자 + /learn 발음 wiring) · [x] `npx expo export -p ios` — PASS

## 4) 리뷰 (code-review)
**Approved (머지 가능)** — blocker 없음. fr-FR 고정·옵션 forward·expo-speech 단일 지점(ADR-005)·콜백 규약 충족. **반영**: ADR-005 본문 API명 정정(→`speak/stop`). nit(headword 중복·stop async)은 후속.

## 5) Unit 완료
### ⏸️ 체크포인트 B — Unit 완료 승인
- [x] 게이트 4종 통과 · [x] code-review 머지 가능
- 결정: ⏸️ Awaiting Approval (사람 승인 대기) → 승인 시 STATUS ✅ + 커밋·푸시(사용자)
### 커밋 / 푸시 (사용자 수행)
- 제안 메시지: `feat: TTS pronunciation via expo-speech (fr-FR) wired into learn deck [UoW-04]`
