# Bolt 기록 — `UoW-05-srs`

> 상태 SSOT는 [ai-dlc/STATUS.md](../STATUS.md). 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-05-srs` |
| **이름** | SRS 엔진(Leitner) + 영속화 |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M5 |
| **리드** | **back-dev** (SRS·스토어) |
| **멤버** | db-dev(영속·마이그레이션) · front-dev(/learn 배선) · qa-dev · code-review |
| **상태** | ✅ Approved (체크포인트 B — 2026-06-10) |
| **시작/완료** | 2026-06-09 / 2026-06-10 |
| **의존성** | UoW-02 (✅ Word/CardState 타입) · 배선은 UoW-03 /learn ✅ |

> DoD 요약: `srs/leitner.ts` 순수 함수가 box별 간격(0/1/3/7/16일)을 `now` 주입 기준 결정적 계산 · 분류 결과가 `CardState`(box/dueAt/reps/lapses/status)에 반영 · 영속(AsyncStorage) **라운드트립·마이그레이션 테스트** · 검증 게이트 4종 green.

---

## 1) 논리 설계 (제안)

> back-dev 리드 mob. 근거: [docs/DESIGN.md §6 SRS](../../docs/DESIGN.md)·[§4 CardState](../../docs/DESIGN.md), [ADR-002 Zustand](../inception/04-architecture-decision.md)·[ADR-003 persist version/migrate/partialize](../inception/04-architecture-decision.md). 코드 미작성. (context7 비가용 — zustand persist API는 설치 타입+typecheck로 검증.)

### 목표
"학습할게요"로 분류한 단어가 **간격반복(Leitner)** 으로 다시 뜨고, 학습 상태가 **앱 재시작 후에도 복원**되게 한다. 이것으로 MVP 핵심 루프(스와이프·발음·복습·영속) 완성.

### 1-1. SRS 엔진 `src/srs/leitner.ts` (순수)
- `INTERVAL_DAYS = [0, 1, 3, 7, 16]` (box0~4, DESIGN §6).
- `nextBox(box, correct)`: correct → `min(box+1, 4)`, incorrect → `0`.
- `schedule(prev: CardState | undefined, correct: boolean, now: number): CardState` — box 갱신, `dueAt = now + INTERVAL_DAYS[box]*86400000`, `reps+1`, `lapses += correct?0:1`, `status`(new→learning, box==4 → known), `lastReviewedAt = now`. **now 주입**으로 결정적.
- **분류→correct 매핑**: `known`(알고있어요)=correct(승급), `learn`(학습할게요)=incorrect(box0·곧 다시).

### 1-2. 영속 스토어 `src/store/cardStore.ts` (zustand + persist)
- 상태: `cards: Record<wordId, CardState>`.
- 액션: `classify(wordId, classification, now)` → `leitner.schedule`로 CardState 갱신, `reset()`(데이터 초기화), `getCard(wordId)`/`dueWordIds(now)` selector.
- persist(ADR-003): `createJSONStorage(() => AsyncStorage)`, **key `flocons:cards:v1`**, `version: 1` + `migrate` 골격, `partialize`로 `cards`만 직렬화.
- (네이밍) ADR-002의 "deckStore"는 UoW-03 인메모리 `src/lib/deck.ts`(세션 덱)와 혼동되어 **`cardStore`(CardState 영속)** 로 명명 — Q-E1.

### 1-3. 어댑터 `src/lib/storage.ts`
- `asyncJSONStorage = createJSONStorage(() => AsyncStorage)` 등 zustand persist용 저장소를 한 곳에서 노출(스토어들이 공유).

### 1-4. /learn 배선 (app/learn.tsx)
- 분류 시 인메모리 덱(UoW-03, 세션 진행) **그대로** + `cardStore.classify(word.id, value, Date.now())` 추가 호출(영속 SRS). 둘은 책임 분리(세션 순서 vs 영속 상태).
- (복습 화면 `/review`의 due 큐 소비는 UoW-06.)

### 파일 변경 계획 (코드 미작성)
- `src/srs/leitner.ts`(신규) · `src/store/cardStore.ts`(신규) · `src/lib/storage.ts`(신규) · `app/learn.tsx`(수정 — classify에 cardStore 연동) · `__tests__/srs/leitner.test.ts`·`__tests__/store/cardStore.test.ts`(신규)
- **deps**: `zustand` 설치(미설치). async-storage 보유.

### 데이터 흐름
분류 → `cardStore.classify` → `leitner.schedule(prev, correct, now)` → `cards[wordId]` 갱신 → persist(AsyncStorage). 재시작 → rehydrate. UoW-06이 `dueWordIds(now)`로 복습 큐.

### 리스크 / 미해결 질문 (체크포인트 A)
- **Q-E1 (스토어명)**: 영속 CardState 스토어 = **`cardStore`**(ADR-002 "deckStore"는 deck.ts와 혼동 → 개명) → **권장: 동의.**
- **Q-E2 (분류 매핑)**: known=correct(승급)/learn=incorrect(box0) → **권장: 동의.**
- **Q-E3 (간격·status)**: box 0/1/3/7/16일, status new→learning, box4=known → **권장: 동의.**
- **Q-E4 (배선)**: /learn은 인메모리 덱(세션) + cardStore(영속) 이중 → **권장: 동의.**
- **Q-E5 (persist)**: zustand persist + AsyncStorage, key `flocons:cards:v1`, version1+migrate+partialize(cards만) → **권장: 동의.**
- 리스크: zustand persist 비동기 rehydrate의 jest 테스트 까다로움 → **순수 leitner 전수 테스트 + cardStore classify/reset + 라운드트립(직렬화→새 스토어 rehydrate) 테스트**로 커버(AsyncStorage는 jest mock 보유).

### ⏸️ 체크포인트 A — 설계 승인
- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-09
- 코멘트: Q-E1~E5 권장값대로 승인(cardStore 명, known=correct/learn=incorrect, 0/1/3/7/16일, /learn 이중 배선, persist v1).

---

## 2) 구현
승인된 설계 기반, 단 **zustand 제거**(아래 설계 대비 참조):
- `src/srs/leitner.ts` — 순수 SRS. `INTERVAL_DAYS [0,1,3,7,16]`·`MAX_BOX`·`nextBox`·`intervalMs`(클램프)·`newCardState`·`schedule(prev, correct, now)`. now 주입=결정적.
- `src/store/cardStore.ts` — **모듈 상태 + subscribe 패턴 + AsyncStorage 직접 호출** (zustand 미사용). `classifyCard/resetCards/rehydrateCardStore`, key `flocons:cards:v1`, `version:1` 직렬화(`PersistedData`)로 migrate 골격 유지. `isCorrect`(known=true)·`getCards`·`getCard`·`dueWordIds(now)`·`subscribeCards` 헬퍼.
- `app/learn.tsx` — 분류 4곳(swipe L/R·버튼)을 `handleClassify(value)`로 통합: `classifyCard(word.id, value, Date.now())`(영속) + `dispatch`(세션).
- `app/_layout.tsx` — 앱 시작 시 `rehydrateCardStore()` 호출.
- **설계 대비 ①(zustand 제거)**: zustand v5 타입이 tsc 무한 추론(typecheck hang)을 유발해 **zustand+persist 대신 의존성 없는 모듈 상태+subscribe로 대체** (2026-06-10 사용자 결정 A, ADR-002 수정). UI 반응 구독이 필요해지면(UoW-06) `useSyncExternalStore`로 연결.
- **설계 대비 ②**: zustand 제거로 `src/lib/storage.ts`(persist 어댑터)는 불필요 → 미생성.
- **설계 대비 ③**: `schedule`는 `prev: CardState`를 필수로 받고 "없으면 새 카드" 생성은 `classifyCard`가 `newCardState`로 처리(순수성 유지).
- **알려진 한계(설계 범위 밖)**: undo는 세션 덱만 되돌리고 영속 SRS는 되돌리지 않음 → 재분류 시 box 중복 승급 가능. 코드 주석에 명시, 필요 시 후속 Unit에서 처리.

## 3) 테스트 (qa-dev)
- 작성: `__tests__/srs/leitner.test.ts`(전수) · `__tests__/store/cardStore.test.ts`(classify/reset/라운드트립 — `rehydrateCardStore` API 기준)
- [x] `npm run typecheck` — pass · [x] `npm run lint` — pass · [x] `npm run test` — pass (14 suites, 52 tests) · [x] `npx expo export` — pass
- 게이트 재확인일: **2026-06-10** (iCloud `.nosync` 환경 재구성 후 전체 재실행. tsconfig `preserveSymlinks`/`exclude`, eslint ignores, jest `roots`, .gitignore가 이 환경에 의존)

## 4) 리뷰 (code-review)
- code-review 에이전트 리뷰는 **사용자 결정으로 생략** — 사용자가 직접 확인 후 커밋(2026-06-10)으로 종결.

## 5) Unit 완료
### ⏸️ 체크포인트 B — Unit 완료 승인
- [x] 게이트 4종 통과 · code-review 생략(사용자 결정) · 결정: **✅ Approved**
- 승인자: 0eum · 날짜: 2026-06-10 · 코멘트: 사용자 직접 커밋으로 완료 확정.
### 커밋 / 푸시 (사용자 수행)
- 커밋 해시: `ebfb1ab` (메시지: `UoW-05-srs`, 사용자 직접 커밋. 푸시는 사용자 관리)
