# Bolt 기록 — `UoW-02-content-layer`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md).
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-02-content-layer` |
| **이름** | 콘텐츠 계층 + A1 정적 데이터셋 |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M2 |
| **리드** | **db-dev** (데이터 스키마·시드 데이터셋·영속 계약) |
| **멤버** | **content-gen**(A1 단어 데이터 생성, `flocons-content` 스킬 규칙) · back-dev(ContentProvider 인터페이스) · qa-dev(유효성 테스트) · code-review |
| **상태** | ✅ Approved (체크포인트 B — 완료, 푸시됨) |
| **시작/완료** | 2026-06-09 / (미정) |
| **의존성** | UoW-00 (✅ 완료) |

> DoD 요약: `Word`/`CardState` 타입이 `word.schema.json`과 1:1 · `ContentProvider`+`StaticContentProvider` · A1 시드 데이터셋(`src/data/a1.json`) validate 오류 0 · 유효성 테스트가 `npm run test`에 포함 · 검증 게이트 4종 green.

---

## 1) 논리 설계 (제안)

> db-dev 리드 mob. 근거: [docs/DESIGN.md §4 데이터 모델](../../docs/DESIGN.md)·[§5 콘텐츠 폴백](../../docs/DESIGN.md)·[§10 시드](../../docs/DESIGN.md), `flocons-content` 스킬([SKILL.md](../../.claude/skills/flocons-content/SKILL.md) + [word.schema.json](../../.claude/skills/flocons-content/references/word.schema.json) + [validate.mjs](../../.claude/skills/flocons-content/scripts/validate.mjs)), [ADR-001](../inception/04-architecture-decision.md). 이 단계 **코드 미작성**. 버전 민감 RN API 없음(타입+JSON+순수 로직).

### 목표
"키 없이도 동작하는 베이스라인" 콘텐츠 계층을 만든다 — 정규 `Word` 타입, `ContentProvider` 추상화, 번들 JSON을 읽는 `StaticContentProvider`, 그리고 **A1 시드 데이터셋**. UoW-03(덱)·UoW-05(SRS)·UoW-09(AI)·UoW-10(이미지)이 이 위에 올라간다.

### 1-1. 타입 (`src/content/types.ts`)
- `Word` — **`word.schema.json`과 1:1** (DESIGN §4): `id, lemma, article(string|null), gender('m'|'f'|null), pos, krMeaning, level, exampleFr, exampleKr, imageUrl?, imagePrompt?, tags?`.
- `Pos` — `n|v|adj|adv|prep|pron|conj|num|det|intj|phrase` (스키마 enum과 동일). **콘텐츠 계층의 정본**(WordCard의 프리젠테이셔널 `Pos`와는 Q-A2대로 분리; UoW-03에서 매핑).
- `Level` — `'A1'|'A2'|'B1'|'B2'|'C1'`.
- `CardState` (DESIGN §4) — `wordId, status('new'|'learning'|'known'), box, dueAt, reps, lapses, bookmarked, lastReviewedAt?`. **타입만 정의**(SRS 로직은 UoW-05).

### 1-2. Provider (`src/content/`)
- `ContentProvider.ts` — `interface ContentProvider { getWords(level: Level): Promise<Word[]>; enrich?(word): Promise<Word>; generateImage?(word): Promise<string>; }` (DESIGN §5).
- `StaticContentProvider.ts` — 번들 JSON(`src/data/<level>.json`)을 읽어 `getWords(level)` 반환. `enrich`/`generateImage` 미구현(옵셔널) → **항상 동작하는 베이스라인**. 키 유무와 무관.
- `index.ts` — 배럴.

### 1-3. 유효성 검증 (`src/content/validateWords.ts` + 테스트)
- `validateWords(data: unknown): { errors: string[]; warnings: string[] }` — 순수 함수. `flocons-content`의 `validate.mjs`와 **동일 규칙**(필수 필드·타입, pos/level/gender enum, 중복 id, 빈 문자열, 관사-성 정합). 앱이 런타임/테스트에서 쓰는 정본.
- qa-dev 테스트: `a1.json`을 `validateWords`로 검사해 **오류 0** 단언 + `StaticContentProvider.getWords('A1')`가 배열 반환·필드 형태 확인.

### 1-4. A1 시드 데이터셋 (`src/data/a1.json`) — content-gen
- `content-gen`이 `flocons-content` 스킬 규칙(관사-성, 엘리지옹, 품사, 한국어 번역, 예문 FR/KR, id `fr-a1-<lemma>`)으로 생성 → `validate.mjs`/`validateWords`로 게이트.
- 핵심 A1 주제: 인사·숫자·요일/시간·가족·음식·색·기본 동사·일상 사물 등.
- `imagePrompt`는 일부만 채우거나 생략(이미지 키 없으면 플레이스홀더, UoW-10).

### 파일 변경 계획 (제안 — 코드 미작성)
- `src/content/{types,ContentProvider,StaticContentProvider,validateWords,index}.ts`
- `src/data/a1.json` (content-gen 생성)
- `__tests__/content/*.test.ts` (validateWords·a1.json·StaticContentProvider)

### 데이터 흐름
- `StaticContentProvider.getWords('A1')` → `a1.json` → `Word[]`. UoW-03이 `Word → WordCardData` 매핑해 카드 렌더. UoW-05가 `CardState`로 학습 상태 관리.

### 리스크 / 대안 / 미해결 질문 (체크포인트 A 결정 요청)
- **Q-B1 (데이터셋 규모)**: A1 단어 수. (a) DESIGN대로 **~150개**(배치 생성·검증, 시간·검수↑) vs (b) **핵심 ~60개 먼저**(파이프라인 검증 + 덱 사용 가능), 나머지는 UoW-12 확장. → **권장: (b) ~60개 먼저.** 품질(관사-성 정확도)을 확보하며 빠르게 덱을 굴리고, UoW-12에서 150+로.
- **Q-B2 (Pos 분리)**: 콘텐츠 `Pos`를 WordCard의 프리젠테이셔널 `Pos`와 분리(Q-A2 일관) → **권장: 동의**(UoW-03에서 매핑).
- **Q-B3 (검증 위치)**: 앱에 `validateWords.ts`(런타임/테스트 정본)를 두고 스킬 `validate.mjs`(저작 CLI)와 같은 규칙 공유 → **권장: 동의.** (리스크: 두 곳 규칙 드리프트 → 규칙을 주석으로 상호 참조.)
- **리스크 R-03 (프랑스어 정확성)**: 명사 성/관사·엘리지옹 오류 가능. 완화: `validate.mjs` 게이트(관사-성 불일치=오류) + content-gen이 모호한 성은 신중 처리. 데이터 형태 결정은 `Word` 스키마와 함께.

### ⏸️ 체크포인트 A — 설계 승인
- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-09
- 코멘트: 권장값 승인 — Q-B1=**A1 ~60개 먼저**(150+는 UoW-12), Q-B2(Pos 분리), Q-B3(validateWords 공유).

---

## 2) 구현
승인된 설계대로 구현:
- **타입** `src/content/types.ts` — `Word`(word.schema.json·DESIGN §4와 1:1, imagePrompt 포함)·`CardState`(타입만)·`Pos`(콘텐츠 정본, WordCard와 분리 Q-B2)·`Gender`·`Level`.
- **Provider** `ContentProvider.ts`(인터페이스) + `StaticContentProvider.ts`(번들 `@/data/<level>.json` → 키 없이 동작 베이스라인, 없는 레벨 `[]`) + 배럴 `index.ts`.
- **검증** `validateWords.ts` — 스킬 `validate.mjs`와 동일 규칙. code-review MED 반영(article 빈 문자열 검사 추가로 규칙 동등화).
- **A1 시드** `src/data/a1.json` — content-gen 생성 **65개**(인사·숫자·시간·가족·음식·색·신체·집·동사·형용사·대명사 등). `validate.mjs` 오류 0 / 경고 4(l' 엘리지옹, 성 직접 확인). code-review LOW 반영(ami 태그·s'il vous plaît 뜻·bouche register).

## 3) 테스트 (qa-dev) — 검증 게이트 ([HARNESS §3](../../docs/HARNESS.md)) 전부 green
- [x] `npm run typecheck` — PASS
- [x] `npm run lint` — PASS
- [x] `npm run test` — PASS (9 suites / **25 tests**: validateWords·a1.json 유효성·StaticContentProvider + 기존)
- [x] `npx expo export -p ios` — PASS

## 4) 리뷰 (code-review)
**Approved (머지 가능)** — blocker 없음. 데이터 전수 점검(성·관사·엘리지옹·예문·번역) 명백한 오류 0. **반영**: MED(validateWords article 빈 문자열 → `validate.mjs`와 규칙 동등) + LOW 3건(ami 태그·s'il vous plaît 뜻·bouche register) + 검증 테스트 2케이스 추가.

## 5) Unit 완료
### ⏸️ 체크포인트 B — Unit 완료 승인
- [x] 게이트 4종 통과 · [x] code-review 머지 가능
- 결정: ✅ Approved (0eum, 2026-06-09) — 사용자 커밋·푸시 완료
### 커밋 / 푸시 (사용자 수행)
- 제안 메시지: `feat: content layer (Word/CardState types, ContentProvider, StaticContentProvider) + A1 seed [UoW-02]`
