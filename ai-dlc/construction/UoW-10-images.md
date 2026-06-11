# Bolt 기록 — `UoW-10-images`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md)이며, 이 파일이 갱신되면 STATUS의 해당 Unit 행도 함께 맞춘다.
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [로드맵](../../docs/ROADMAP.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-10-images` |
| **이름** | 카테고리 플레이스홀더(필수) + AIImageProvider 골격(옵셔널) |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M10 |
| **리드** | **back-dev** (이미지 서비스 로직) |
| **멤버** | front-dev(WordCard 배선) + content-gen(imagePrompt — 데이터셋에 기생성됨) + qa-dev + code-review |
| **상태** | ⏸️ Awaiting Approval (체크포인트 B) |
| **시작일 / 완료일** | 2026-06-11 / (미정) |

> 의존성: UoW-02 ✅(Word.imagePrompt·tags) · UoW-08 ✅(hasImageKey) · DoD 요약: 키 없으면 플레이스홀더 · 키 있으면 생성·캐시·폴백(가짜 클라이언트 검증) · 게이트 4종 green.

---

## 1) 논리 설계 (제안)

> back-dev 리드 mob. 근거: [ADR-007(이미지 2단계: 플레이스홀더 필수 / AIImageProvider 옵셔널·후순위)](../inception/04-architecture-decision.md) · [docs/DESIGN.md §5·§9·§10](../../docs/DESIGN.md) · [inception/03-units-of-work.md UoW-10](../inception/03-units-of-work.md). 코드 미작성.

### 목표
모든 카드가 이미지 영역을 **결정적 카테고리 플레이스홀더**로 채우고(무키, v1 필수), 이미지 생성 키가 있으면 `imagePrompt`를 소비하는 **AIImageProvider 경로(캐시·실패 폴백)**가 동작하도록 골격을 완성한다.

### 핵심 관찰
- 데이터셋(a1.json)에 `imagePrompt`(영어 생성 프롬프트)와 `tags`(한국어 카테고리, 예: "인사")가 **이미 전 단어에 존재**(UoW-02 content-gen 산출).
- [WordCard](../../src/components/WordCard.tsx)는 `imageSource` prop과 빈 플레이스홀더 View를 이미 갖고 있다 — 색·이니셜만 입히면 된다.
- **Anthropic API는 이미지 생성을 제공하지 않는다** — "이미지 생성 키"는 별도 벤더(미정)의 키다. ADR-007이 (2)를 "옵셔널·후순위"로 명시했고 DoD도 "가짜 클라이언트 검증"까지만 요구한다.

### 1-1. (필수) 카테고리 플레이스홀더 — 결정적 매핑
- `src/theme/colors.ts` 수정 — `imagePalette: string[]`(파스텔 8색, 라이트 테마 §9 조화) 토큰 추가.
- `src/lib/wordImage.ts` (신규, 순수) — `placeholderFor(word): { color: string; label: string }`:
  - **키 = `tags[0] ?? pos`** 를 문자열 해시 → `imagePalette` 인덱스(결정적 — 같은 카테고리는 항상 같은 색).
  - `label` = lemma 첫 글자 대문자(악상 유지, 예: "É").
  - **그라데이션 대신 단색** — `expo-linear-gradient` 의존성 추가 없이(ADR-007의 "색/그라데이션" 중 색 채택, Q-K2).
- `src/components/WordCard.tsx` 수정 — `imageFallback?: { color: string; label: string }` prop 추가(프리젠테이셔널 유지). `imageSource` 없을 때 색 배경 + 큰 이니셜 렌더(장식 요소 — `accessibilityElementsHidden` 유지).
- `src/components/DeckSession.tsx` 수정 — `imageFallback={placeholderFor(word)}` + 이미지 해상 결과(1-2) 배선.

### 1-2. (옵셔널 골격) AIImageProvider — 키 시 생성·캐시·폴백
- `src/content/imageClient.ts` (신규) — `ImageClient { generateImage(word): Promise<string /* URL */> }` 인터페이스 + `NoImageKeyError`. **실제 벤더 구현은 보류**(Q-K1) — 벤더 결정(별도 키·비용) 전까지 프로덕션 조립은 "키 있어도 생성 시도 없음"이 아니라, 주입된 클라이언트가 없으면 즉시 폴백하는 구조로 정직하게 동작.
- `src/content/AIImageProvider.ts` (신규) — `resolve(word): Promise<string | null>`:
  - 해상 순서(Q-K4): ① `word.imageUrl`(데이터셋 제공 시) → ② 캐시(`flocons:image:v1:{wordId}:{ver}`) → ③ `hasImageKey`·클라이언트 있으면 `generateImage`(imagePrompt 소비) → 캐시 저장 → URL → ④ 전부 실패/없음 → **null = 플레이스홀더 폴백**.
  - 캐시는 **URL 문자열만** 저장(base64 dataURI는 AsyncStorage 부담 — Q-K3).
- `src/store/hooks.ts` 또는 `src/lib/wordImage.ts` — `useWordImage(word): string | null` 훅: hasImageKey 구독 + 비동기 해상(언마운트 가드). 키 없으면 동기적으로 null(비용 0).

### 변경 파일 계획 (코드 미작성)
| 파일(예정) | 변경 종류 | 메모 |
|---|---|---|
| `src/theme/colors.ts` | 수정 | imagePalette 8색 토큰 |
| `src/lib/wordImage.ts` | 신규 | placeholderFor(순수·결정적) + useWordImage 훅 |
| `src/content/imageClient.ts` | 신규 | ImageClient 인터페이스 (벤더 구현 보류 — Q-K1) |
| `src/content/AIImageProvider.ts` | 신규 | 해상 순서·캐시·폴백 |
| `src/content/index.ts` | 수정 | 신규 export |
| `src/components/WordCard.tsx` | 수정 | imageFallback prop(색+이니셜) |
| `src/components/DeckSession.tsx` | 수정 | useWordImage + imageFallback 배선 |
| `__tests__/lib/wordImage.test.ts` | 신규 | 결정성(동일 입력=동일 출력)·팔레트 범위·tags 없을 때 pos 폴백·이니셜 |
| `__tests__/content/AIImageProvider.test.ts` | 신규 | imageUrl 우선·키 없음 null·가짜 클라이언트 생성+캐시(1회 호출)·실패 null·실패 시 캐시 미저장 |
| `__tests__/components/WordCard.test.tsx` | 수정 | imageFallback 렌더(이니셜 표시) |
| `__tests__/learn.test.tsx` | 회귀 | 기존 단언 유지(플레이스홀더 추가가 흐름 불변) |

### 데이터 흐름
카드 표시 → `useWordImage(word)`: imageUrl/캐시/생성(키+클라이언트) 해상 → 있으면 `imageSource`, 없으면(null) `placeholderFor(word)`의 색+이니셜. 키 삭제 → hasImageKey false → 즉시 플레이스홀더 회귀(DESIGN §5와 동일 패턴).

### 리스크 / 대안 / 미해결 질문 (체크포인트 A)
- **Q-K1 (실벤더 보류)**: 이미지 생성 벤더(별도 키·비용) 미정 — 이번 Unit은 인터페이스·캐시·폴백·배선 + **가짜 클라이언트 검증**까지(DoD 충족). 실벤더 연동은 벤더 결정 후 후속 Unit → **권장: 동의.** (대안: OpenAI Images 연동 — 새 BYOK·의존성, ADR-007 "후순위"와 상충.)
- **Q-K2 (플레이스홀더 형태)**: `tags[0] ?? pos` 해시 → 파스텔 단색 + lemma 이니셜 (그라데이션 의존성 미추가) → **권장: 동의.**
- **Q-K3 (캐시 형식)**: URL 문자열만 캐시(대용량 base64 비저장) → **권장: 동의.**
- **Q-K4 (해상 순서)**: imageUrl → 캐시 → 생성(키) → 플레이스홀더 → **권장: 동의.**
- 리스크: useWordImage의 카드 전환당 비동기 해상 — 키 없으면 즉시 null이라 현 단계 비용 0. 키 경로는 캐시가 1차 방어.

### ⏸️ 체크포인트 A — 설계 승인

> AI는 위 설계를 *제안*한다. 사람이 승인해야 2) 구현으로 넘어간다.

- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-11
- 코멘트 / 변경 요청: Q-K1~K4 전부 권장값대로 승인 (실벤더 보류 — 골격+가짜 클라이언트까지).

---

## 2) 구현

승인된 설계대로 (이탈 1건 — 구현 노트 ② 참조):

### 변경 파일 목록 (실제)
| 파일 | 변경 종류 | 요약 |
|---|---|---|
| `src/theme/colors.ts` | 수정 | `imagePalette` 파스텔 8색 토큰 |
| `src/lib/wordImage.ts` | 신규 | `placeholderFor`(tags[0]??pos 해시 → 색+이니셜, 결정적) + `useWordImage`(hasImageKey 구독·비동기 해상·언마운트 가드) |
| `src/content/imageClient.ts` | 신규 | ImageClient 인터페이스 (실벤더 보류 — Q-K1) |
| `src/content/AIImageProvider.ts` | 신규 | resolve(Q-K4 순서)·URL만 캐시(Q-K3)·전실패 null·`wordImageProvider`(클라이언트 null 싱글턴) |
| `src/content/index.ts` | 수정 | 신규 export |
| `src/components/WordCard.tsx` | 수정 | `imageFallback` prop — 플레이스홀더 색+이니셜(장식, 접근성 숨김 유지) |
| `src/components/DeckSession.tsx` | 수정 | useWordImage + imageSource/imageFallback 배선 (훅은 조기 return 이전) |

### 구현 노트
- **① 캐시-키 의미(리뷰 확정)**: Q-K4 순서상 키 삭제 후에도 **이미 생성된 캐시 이미지는 계속 표시**된다 — 캐시는 "이미 생성·결제된 자원의 재사용", 키 부재는 "신규 생성 차단"이라 의도된 동작(리뷰어 동의). 현재는 클라이언트 null이라 캐시 자체가 비어 실효 영향 0.
- **② 설계 대비 이탈**: `NoImageKeyError`는 미도입 — 실벤더 클라이언트가 없는 현재 도입하면 미사용 코드. 벤더 결정 시 클라이언트와 함께 추가(리뷰어 타당 판정).
- 데이터셋에 `imageUrl`이 없으므로 현재 전 단어가 플레이스홀더 경로 — 의도된 v1 동작(ADR-007 (1)).

---

## 3) 테스트 (qa-dev)

### 작성/갱신한 테스트
- [x] `__tests__/lib/wordImage.test.ts` (신규) — 결정성·동일 카테고리 동일 색·팔레트 범위·tags 없을 때 pos 폴백·이니셜 악상(É)
- [x] `__tests__/content/AIImageProvider.test.ts` (신규) — 해상 순서 5케이스(imageUrl 우선/키 없음/클라이언트 없음/생성+캐시/캐시 적중 1회) + 실패 폴백·캐시 미저장 (가짜 클라이언트 — DoD)
- [x] `__tests__/components/WordCard.test.tsx` — imageFallback 이니셜 렌더(장식 요소라 includeHiddenElements 조회)
- [x] 기존 learn/review 테스트 — 회귀 가드 유지 (실 싱글턴 경유에도 act 경고 없음 — 리뷰어 확인)

### 검증 게이트 결과 (커밋/푸시 전 필수 · [docs/HARNESS.md](../../docs/HARNESS.md) §3)
- [x] `npm run typecheck` — pass
- [x] `npm run lint` — pass
- [x] `npm run test` — pass (28 suites, 143 tests — 신규/갱신 12개)
- [x] `npx expo export` — pass

---

## 4) 리뷰 (code-review)

| # | 위치(파일:라인) | 분류 | 코멘트 | 처리 |
|---|---|---|---|---|
| 1 | `AIImageProvider.ts:13-14` | 일관성 | 키의 `v1`(네임스페이스)과 IMAGE_CACHE_VERSION(파이프라인) 역할 구분 주석 부재 | [x] 반영 — 주석 1줄 추가 후 게이트 재통과 |
| 2 | `wordImage.ts` vs `WordCard.tsx` | 단순화 | ImageFallback 타입과 prop 인라인 선언 중복 — 프리젠테이셔널 분리 철학상 의도된 중복 | [x] 보류(nit — WordCardData 분리와 동일 원칙) |
| 3 | `AIImageProvider.ts:23-25` | 정확성 | 키 삭제 후 캐시 이미지 유지 — Q-K4 의도 동작으로 리뷰어 확정, 기록 요청 | [x] 반영 — 구현 노트 ①에 기록 |
| 4 | `WordCard.tsx:88` | 효율 | 동적 색 인라인 스타일 — 불가피·무시 가능 | [x] 보류(nit) |

- 리뷰어 검증: 훅 순서/참조 안정성/act 안전성/접근성 숨김/콘텐츠 계층 동형성 전부 통과. 설계 이탈(NoImageKeyError 미도입) 타당 판정.
- 리뷰 결론: **머지 가능** (블로커 0)

---

## 5) Unit 완료

### ⏸️ 체크포인트 B — Unit 완료 승인
- [ ] 검증 게이트 4종 통과 확인
- [ ] code-review 머지 가능
- 결정: <✅ Approved | 🔁 Changes Requested>
- 승인자: <이름> · 날짜: <YYYY-MM-DD>

### 커밋 / 푸시 기록 ([docs/HARNESS.md](../../docs/HARNESS.md) §4 규약)
- [ ] STATUS 갱신 · [ ] 커밋 · [ ] 푸시
- 커밋 해시: <짧은 해시>

### 마무리
- 후속 작업 / 다음 Unit: <...>
