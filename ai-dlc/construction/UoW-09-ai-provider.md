# Bolt 기록 — `UoW-09-ai-provider`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md)이며, 이 파일이 갱신되면 STATUS의 해당 Unit 행도 함께 맞춘다.
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [로드맵](../../docs/ROADMAP.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-09-ai-provider` |
| **이름** | AIContentProvider(Anthropic) + 캐시 + Static 폴백 |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M9 |
| **리드** | **back-dev** (서비스 계층) |
| **멤버** | db-dev(캐시 영속) + content-gen(enrich 프롬프트 규약) + qa-dev + code-review |
| **상태** | ✅ Approved (체크포인트 B — 2026-06-11) |
| **시작일 / 완료일** | 2026-06-10 / 2026-06-11 |

> 의존성: UoW-02 ✅(ContentProvider·Word) · UoW-08 ✅(secureKeys·hasKey·selectProvider 골격) · DoD 요약: 키 토글 경로 전환을 가짜 클라이언트(성공/타임아웃/4xx/5xx)로 테스트 · 키 미노출 · 실패 시 Static 폴백 · 게이트 4종 green.

---

## 1) 논리 설계 (제안)

> back-dev 리드 mob. 근거: [docs/DESIGN.md §5 선택 규칙/폴백](../../docs/DESIGN.md) · [ADR-006(캐시 키 = wordId+level+providerVersion)](../inception/04-architecture-decision.md) · [ADR-009(클라이언트 택일은 UoW-09에서 문서 확인 후)](../inception/04-architecture-decision.md) · **claude-api 스킬(2026-05-26 캐시)로 최신 API 확인 완료**. 코드 미작성.

### 목표
Anthropic 키가 있으면 단어 카드의 **대체 예문(FR/KR)을 Claude로 보강(enrich)**·캐시하고, 키가 없거나 호출이 실패하면 **자동으로 Static 데이터로 폴백**한다(DESIGN §5 — "앱은 키 없이도 완전히 동작").

### 1-0. ADR-009 결정 제안 — 공식 SDK `@anthropic-ai/sdk` 채택
claude-api 스킬 확인 결과로 ADR-009의 미결(택일)을 해소한다:
- **공식 TS SDK가 기본** (스킬 Output Requirement — TS 프로젝트에서 raw fetch는 비권장). typed 에러(`Anthropic.APIError` 계열)·자동 재시도·`timeout` 옵션 제공.
- **주입 경계 유지(ADR-009 전제)**: SDK 생성자의 **`fetch` 옵션**으로 HTTP 계층을 주입할 수 있어, 가짜 fetch(성공/타임아웃/4xx/5xx)로 DoD 테스트가 그대로 가능.
- RN/Expo Go 호환: SDK는 fetch 기반(순수 JS). 클라이언트 사이드 실행이므로 `dangerouslyAllowBrowser: true`가 필요(BYOK — 사용자가 자기 키를 secure-store에 넣는 구조라 적합). 스트리밍은 사용하지 않음(짧은 단발 호출). 번들 무결성은 `npx expo export` 게이트로 검증.
- **요청 형태(스킬 확인)**: `messages.create({ model, max_tokens: 1024, system, messages, output_config: { format: { type: 'json_schema', schema } } })`. 구조화 출력으로 JSON 보장. **`temperature`/`top_p` 금지**(Opus 4.8에서 400), `thinking`은 생략(단순 생성 작업).

### 1-1. `src/content/enrichClient.ts` (신규, back-dev)
- 타입: `EnrichedExample { exampleFr: string; exampleKr: string }` · 인터페이스 **`EnrichClient { enrich(word: Word): Promise<EnrichedExample> }`** (주입 경계).
- **`AnthropicEnrichClient implements EnrichClient`**: 생성자 `{ getApiKey: () => Promise<string|null>, fetch?: Fetch }`.
  - `enrich()` 호출 시마다 `getApiKey()`(= `secureKeys.getKey('anthropic')`)로 키를 **호출 직전에만** 조회(메모리 체류 최소화, ADR-004). 키 없으면 즉시 throw(`NoApiKeyError`) → 상위 폴백.
  - SDK 클라이언트는 호출 시 생성: `new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1, timeout: 15_000, fetch })`.
  - system 프롬프트: flocons-content 스킬 규약(관사-성 일치·엘리지옹·CEFR 레벨·한국어 번역 톤)을 요약한 고정 문자열. user 메시지에 단어 정보(lemma·article·pos·level·기존 예문)를 담아 **기존과 다른** 대체 예문 1개 요청.
  - 키 원문은 로그·예외 메시지·캐시 어디에도 넣지 않는다.
- 모델 상수 `AI_MODEL` — **Q-J1에서 결정**.

### 1-2. `src/content/AIContentProvider.ts` (신규, back-dev)
- `ContentProvider` 구현. 생성자 주입: `(client: EnrichClient, fallback: StaticContentProvider)`.
- `getWords(level)` — **Static에 위임**(덱 데이터셋은 정적 큐레이션 유지, DESIGN §10). AI는 enrich만 담당.
- `enrich(word)` — ① 캐시 조회 → 있으면 적용 ② 없으면 `client.enrich()` → 성공 시 캐시 저장·적용 ③ **모든 실패(키 없음/타임아웃/4xx/5xx/파싱)는 원본 word 그대로 반환** = Static 폴백(DESIGN §5; 에러를 화면에 전파하지 않음).
- 캐시(db-dev, ADR-006): AsyncStorage 키 **`flocons:enrich:v1:{wordId}:{level}:{providerVersion}`**, `PROVIDER_VERSION = 1`(프롬프트/스키마 변경 시 증가 → 자연 무효화). TTL 없음 — "데이터 초기화"·키 삭제 회귀로만 관리(ADR-006).

### 1-3. `selectProvider` 실연결 (src/content/selectProvider.ts 수정)
- UoW-08 골격의 TODO 해소: `createProvider('ai')` → `new AIContentProvider(new AnthropicEnrichClient({ getApiKey: () => getKey('anthropic') }), new StaticContentProvider())`. `'static'`은 기존대로.
- 선택 규칙·회귀(`selectProviderKind`)는 무변경 — 기존 테스트 유지, 'ai' 인스턴스 단언만 갱신.

### 1-4. 화면 전환 (front-dev 보조 — Q-J3)
- learn/review/bookmarks/stats의 `new StaticContentProvider()` 4곳을 공용 헬퍼 **`src/lib/content.ts`의 `currentProvider(): ContentProvider`** (= `createProvider(selectProviderKind(getSettings()))`)로 교체. `getWords`는 AI여도 Static 위임이라 **동작 불변**(기존 화면 테스트가 회귀 가드) — 키 토글 시 provider 경로가 실제로 전환된다.
- **enrich의 UI 소비(카드에서 "다른 예문 보기")는 비범위** — UoW-11 폴리시에서 배선(Q-J4). 이번 Unit은 서비스 계층 완성 + 테스트.

### 변경 파일 계획 (코드 미작성)
| 파일(예정) | 변경 종류 | 메모 |
|---|---|---|
| `package.json` | 수정 | `@anthropic-ai/sdk` 의존성 추가 (ADR-009 결정) |
| `src/content/enrichClient.ts` | 신규 | EnrichClient 인터페이스 + AnthropicEnrichClient(SDK, fetch 주입) |
| `src/content/AIContentProvider.ts` | 신규 | enrich+캐시+전실패 폴백, getWords는 Static 위임 |
| `src/content/selectProvider.ts` | 수정 | 'ai' 골격 → 실제 AIContentProvider 조립 |
| `src/content/index.ts` | 수정 | 신규 export |
| `src/lib/content.ts` | 신규 | currentProvider() — 설정 기반 provider 선택 헬퍼 |
| `app/learn.tsx` · `app/review.tsx` · `app/(tabs)/bookmarks.tsx` · `app/(tabs)/stats.tsx` | 수정 | StaticContentProvider 직생성 → currentProvider() (동작 불변) |
| `__tests__/content/AIContentProvider.test.ts` | 신규 | 성공(보강+캐시 저장)·캐시 적중(클라이언트 1회)·키 없음/타임아웃/4xx/5xx → 원본 폴백·getWords 위임 |
| `__tests__/content/enrichClient.test.ts` | 신규 | 가짜 fetch로 요청 형태(모델·output_config)·키 미노출·에러 매핑 |
| `__tests__/content/selectProvider.test.ts` | 수정 | 'ai' → AIContentProvider 인스턴스 |

### 데이터 흐름
키 입력(UoW-08) → hasKey → `selectProviderKind` 'ai' → `currentProvider()` = AIContentProvider. `enrich(word)` → 캐시 miss → `AnthropicEnrichClient`(getKey → SDK `messages.create`, 구조화 출력) → `EnrichedExample` → 캐시 put → 보강된 Word. 실패/키 삭제 → 원본 word(=Static 콘텐츠) — 앱은 항상 동작.

### 리스크 / 대안 / 미해결 질문 (체크포인트 A)
- **Q-J1 (모델)**: ① `claude-opus-4-8` ($5/$25 per MTok — 스킬 기본 권장, 최고 품질) ② `claude-haiku-4-5` ($1/$5, 200K — 짧은 예문 생성에 충분, 구조화 출력 지원). 짧은 다국어 문장 생성 + BYOK(사용자 비용) 특성상 **권장: ② haiku-4-5** — 단, 비용보다 예문 품질이 우선이면 ①. **사람 결정 필요.**
- **Q-J2 (ADR-009 확정)**: 공식 SDK `@anthropic-ai/sdk` + `fetch` 주입(위 1-0) → **권장: 동의.** (대안: raw fetch — 스킬 가이드 위배·typed 에러/재시도 자작 부담.)
- **Q-J3 (화면 전환 포함)**: 4개 화면의 provider 직생성을 `currentProvider()`로 교체(동작 불변, 경로 전환 활성화) → **권장: 동의.**
- **Q-J4 (enrich UI 소비)**: 이번 Unit 비범위, UoW-11에서 "다른 예문 보기" 배선 → **권장: 동의.**
- **Q-J5 (enrich 산출)**: 대체 예문 1개(`exampleFr`+`exampleKr`)로 한정(스키마 단순·캐시 단순) → **권장: 동의.**
- 리스크: SDK의 RN 호환 — fetch 기반 순수 JS라 가능성 높으나, `npx expo export`(번들)로 1차 검증하고 Expo Go 실기 확인은 사용자 수동 항목으로 기록. 실패 시 폴백이 있어 앱 동작은 무영향.
- 리스크: jest에서 SDK import — Node 환경 정상 동작(공식 지원). 네트워크는 가짜 fetch로 차단.
- 보안: 키는 `getKey` 콜백으로 호출 직전 조회, SDK 인스턴스는 호출 단위 생성·미보관. 테스트 스냅샷에 키 미포함 단언.

### ⏸️ 체크포인트 A — 설계 승인

> AI는 위 설계를 *제안*한다. 사람이 승인해야 2) 구현으로 넘어간다.

- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-10
- 코멘트 / 변경 요청: Q-J1~J5 전부 권장값대로 승인 (Q-J1 = `claude-haiku-4-5`, ADR-009 = 공식 SDK 확정).

---

## 2) 구현

승인된 설계대로. 단 **번들 이슈 1건을 구현 노트 ①로 해결**(설계의 "RN 호환 리스크" 항목이 실현된 케이스).

### 변경 파일 목록 (실제)
| 파일 | 변경 종류 | 요약 |
|---|---|---|
| `package.json` / `package-lock.json` | 수정 | `@anthropic-ai/sdk@^0.104.1` 추가 (ADR-009 확정) |
| `src/content/enrichClient.ts` | 신규 | EnrichClient 인터페이스 + AnthropicEnrichClient — 호출 직전 getApiKey, SDK 호출단위 생성(`dangerouslyAllowBrowser`·maxRetries 1·timeout 15s·fetch 주입), `output_config.format` json_schema, `AI_MODEL='claude-haiku-4-5'`(Q-J1), NoApiKeyError |
| `src/content/AIContentProvider.ts` | 신규 | getWords=Static 위임, enrich=캐시 우선(`flocons:enrich:v1:{id}:{level}:{ver}`) + 전실패 원본 반환(폴백) |
| `src/content/selectProvider.ts` | 수정 | 'ai' 골격 → AIContentProvider 실조립 (UoW-08 TODO 해소) |
| `src/content/index.ts` | 수정 | 신규 export |
| `src/lib/content.ts` | 신규 | `currentProvider()` — 설정(hasKey) 기반 선택, 호출마다 생성(키 토글 즉시 반영 — 리뷰어 타당 판정) |
| `app/learn.tsx`·`app/review.tsx`·`app/(tabs)/bookmarks.tsx`·`app/(tabs)/stats.tsx` | 수정 | provider 직생성 → `currentProvider()` (동작 불변, Q-J3) |
| `metro.config.js` | 신규 | 구현 노트 ① 참조 |

### 구현 노트
- **① Metro 번들 이슈**: SDK 0.104.x의 client.js가 자격증명 모듈을 정적 require → 내부 node:fs/node:path 참조를 Metro가 정적 스캔해 `expo export` 실패. flocons는 항상 apiKey 명시 주입이라 해당 경로가 런타임에 실행되지 않음을 근거로, **origin이 SDK인 node:* 해석만 빈 모듈로 스텁**하는 metro.config.js 추가(리뷰어가 SDK 소스 추적으로 타당성 검증). Expo Go 실기 동작 확인은 사용자 수동 항목.
- SDK 타입 확인: `output_config.format`·`claude-haiku-4-5`·`fetch` 옵션 모두 0.104.1 타입에 존재(`Anthropic.Fetch` 타입은 미노출 → `typeof globalThis.fetch` 사용).
- Q-J4 준수: enrich는 AIContentProvider 내부에서만 호출 — UI 소비는 UoW-11.

---

## 3) 테스트 (qa-dev)

### 작성/갱신한 테스트
- [x] `__tests__/content/enrichClient.test.ts` (신규) — 가짜 fetch(ADR-009 주입 경계): 키 없음(HTTP 미호출)·성공(모델·구조화 출력·샘플링 파라미터 부재·본문 키 미노출)·4xx 거부·5xx 재시도 후 거부·네트워크 실패 거부
- [x] `__tests__/content/AIContentProvider.test.ts` (신규) — 보강+캐시 저장(ADR-006 키)·캐시 적중(클라이언트 1회)·NoApiKey/전실패 폴백·실패 시 캐시 미저장·getWords Static 위임
- [x] `__tests__/content/selectProvider.test.ts` — 'ai' → AIContentProvider 단언으로 갱신
- [x] 화면 테스트 4종(learn/review/bookmarks/stats) — mock을 `@/lib/content`의 currentProvider로 이동(새 배선 경계와 일치, 기존 단언 전부 유지 = 회귀 가드)

### 검증 게이트 결과 (커밋/푸시 전 필수 · [docs/HARNESS.md](../../docs/HARNESS.md) §3)
- [x] `npm run typecheck` — pass
- [x] `npm run lint` — pass
- [x] `npm run test` — pass (26 suites, 131 tests — 신규/갱신 11개)
- [x] `npx expo export` — pass (metro 스텁 적용 후, 11 라우트)

---

## 4) 리뷰 (code-review)

| # | 위치(파일:라인) | 분류 | 코멘트 | 처리 |
|---|---|---|---|---|
| 1 | `metro.config.js:3-4` | 정확성(문서) | 주석의 원인 서술 부정확("정적 import" → 실제는 credentials 모듈의 동적 참조를 Metro가 정적 스캔) | [x] 반영 — 주석 정정 후 게이트 재통과 |
| 2 | `metro.config.js:11-20` | 단순화 | NODE_BUILTINS 8개 중 실참조는 fs·path뿐 — 방어적 등록이면 의도 명시 필요 | [x] 반영 — 의도 주석 추가 |
| 3 | `enrichClient.ts:97-103` | 정확성 | 구조화 출력 응답 파싱(text 블록)은 현재 유효하나 SDK 응답 형태 변화 시 위험 — 인지용 메모 | [x] 보류(기록 — PROVIDER_VERSION·테스트로 감지 가능) |
| 4 | `src/lib/content.ts` | 효율 | 호출마다 인스턴스 생성 — 키 토글 즉시 반영을 위한 의도된 설계, 메모이즈가 오히려 위험 | [x] 보류(리뷰어 "변경 불요" 판정) |
| 5 | `enrichClient.ts` | 일관성 | SDK logger 기본값(console) — RN에서 ANTHROPIC_LOG env 설정될 일 없어 실무 무위험 | [x] 보류(nit) |

- 리뷰어 심층 검증: SDK 0.104.1 타입 정합(output_config/모델/옵션), 보안 PASS(키 비보관·비로그·테스트 단언), 폴백 PASS(전 경로 수렴·손상 캐시 무효화), **metro 스텁 타당성 PASS**(apiKey 명시 주입 시 credentials 경로 미실행을 SDK 소스로 확인).
- 리뷰 결론: **머지 가능** (블로커 0)

---

## 5) Unit 완료

### ⏸️ 체크포인트 B — Unit 완료 승인
- [x] 검증 게이트 4종 통과 확인
- [x] code-review 머지 가능
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-11

### 커밋 / 푸시 기록 ([docs/HARNESS.md](../../docs/HARNESS.md) §4 규약)
- [x] STATUS 갱신 · [x] 커밋 · [x] 푸시 (사용자 수행)
- 커밋 해시: `95adc04` (`feat: AIContentProvider (Anthropic enrich) with cache and static fallback [UoW-09]`)

### 마무리
- 후속 작업 / 다음 Unit: `UoW-10-images`. 이월: enrich UI 소비(UoW-11), Expo Go 실기 동작 확인(사용자 수동).
