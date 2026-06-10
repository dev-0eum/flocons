# Bolt 기록 — `UoW-06-review-stats`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md)이며, 이 파일이 갱신되면 STATUS의 해당 Unit 행도 함께 맞춘다.
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [로드맵](../../docs/ROADMAP.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-06-review-stats` |
| **이름** | 복습 화면(/review due 큐) + 통계(/stats) |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M6 |
| **리드** | **front-dev** (화면·조립) |
| **멤버** | back-dev(stats·studyLog 순수 로직) + qa-dev + code-review |
| **상태** | ✅ Approved (체크포인트 B — 2026-06-10) |
| **시작일 / 완료일** | 2026-06-10 / 2026-06-10 |

> 의존성: UoW-03 ✅(덱 UI) · UoW-05 ✅(cardStore·dueWordIds) · DoD 요약: `/review`가 due 카드만 큐잉(0건 시 빈/완료 상태) · `/stats`가 streak·학습 단어 수·레벨 진척을 정확히 표시 · 날짜 경계/타임존 테스트 · 게이트 4종 green.

---

## 1) 논리 설계 (제안)

> front-dev 리드 mob. 근거: [docs/DESIGN.md §3 화면](../../docs/DESIGN.md)(/review = "SRS 마감(due) 카드만 복습", /stats = "streak·학습 단어 수·레벨 진척") · [§6 SRS](../../docs/DESIGN.md) · [inception/03-units-of-work.md UoW-06](../inception/03-units-of-work.md)("due 카드만 /learn 덱 재사용"). 코드 미작성.

### 목표
"학습할게요"로 분류한 카드가 SRS 간격대로 `/review`에 다시 나타나고, `/stats`에서 학습 현황(streak·단어 수·레벨 진척)을 확인할 수 있게 한다.

### 1-1. 핵심 발견 — streak에는 "학습한 날" 기록이 필요
`CardState.lastReviewedAt`은 카드별 최신값만 남아 **과거 활동일이 유실**된다(같은 카드를 다시 보면 덮어씀). 정확한 streak(연속 학습일)은 카드 상태에서 역산할 수 없으므로 **학습한 날짜의 영속 로그**를 신설한다.

- `src/store/studyLog.ts` (신규, back-dev) — cardStore와 동일한 **모듈 상태 + subscribe + AsyncStorage 직접** 패턴(UoW-05 결정 A와 일관).
  - 상태: `days: Set<string>` (로컬 날짜 키 `"YYYY-MM-DD"`).
  - `recordStudyDay(now)` · `getStudyDays()` · `subscribeStudyLog()` · `rehydrateStudyLog()` · `resetStudyLog()`(UoW-08 데이터 초기화용 export만).
  - 저장 키 `flocons:study-days:v1`, `{version: 1, state: {days: string[]}}` — **기존 `flocons:cards:v1` 스키마 무변경**(마이그레이션 불필요).

### 1-2. 날짜/통계 순수 함수 (back-dev)
- `src/lib/dates.ts` (신규) — `localDateKey(now): string`(로컬 타임존 기준 YYYY-MM-DD), `prevDateKey(key): string`(달력 기준 하루 전 — `Date` 필드 연산으로 DST 안전). now 주입=결정적.
- `src/srs/stats.ts` (신규) — 전부 순수:
  - `countByStatus(cards)` → `{new, learning, known}`.
  - `dueCount(cards, now)` — `dueAt <= now`인 카드 수.
  - `levelProgress(knownCount, totalWords)` → 0~1.
  - `streakDays(days: ReadonlySet<string>, now: number)` — **오늘 학습했으면 오늘 포함 역산, 오늘 미학습이면 어제부터 역산**(오늘은 아직 기회가 있으므로 streak 미단절 — Q-F1).

### 1-3. 덱 화면 재사용 — `DeckSession` 추출 (front-dev)
`/review`는 "/learn 덱 재사용"이 명세(03-units 35행)다. [app/learn.tsx](../../app/learn.tsx)의 조립부(TopBar+SwipeDeck+WordCard+ActionButtons+deckReducer+classify 배선)를 컨테이너 컴포넌트로 추출해 중복을 없앤다.

- `src/components/DeckSession.tsx` (신규) — props: `words: Word[]`, `doneMessage?: string`. 내부에서 deckReducer·`handleClassify`(=`classifyCard` + `recordStudyDay` + dispatch)·tts 배선. **studyLog 기록 지점을 이 한 곳으로 통일.**
- `app/learn.tsx` (수정) — 데이터 로드(StaticContentProvider A1) 후 `<DeckSession words={...}/>` 렌더. 동작 불변(기존 `__tests__/learn.test.tsx`가 회귀 가드).

### 1-4. `/review` 화면 (app/review.tsx)
- 마운트 시 `now = Date.now()` **1회 고정** → `getWords('A1')` 로드 → `dueWordIds(now)`에 포함된 단어만 필터 → `<DeckSession/>`.
- due 0건 → `StateView variant="empty"` ("지금 복습할 카드가 없어요") · 큐 소진 → `variant="done"`. (레벨은 /learn과 동일하게 A1 고정 — 레벨 선택은 UoW-11.)
- 복습 중 분류도 동일하게 `classifyCard`로 SRS 갱신(알고있어요=승급·간격↑, 학습할게요=box0).

### 1-5. `/stats` 화면 (app/(tabs)/stats.tsx)
- 구독: `src/store/hooks.ts` (신규) — `useCards()`/`useStudyDays()` = **`useSyncExternalStore`**(React 19 내장)로 cardStore·studyLog 구독 (UoW-05 cardStore 주석이 예약한 연결 방식).
- 표시(DESIGN §3): **streak**(N일 연속) · **학습 단어 수**(reps>0 카드 수, learning/known 내역) · **레벨 진척**(A1: known/전체 단어 수 — 분모는 `getWords('A1').length`) · **오늘 복습할 카드**(dueCount) + "복습하기" 버튼 → `router.push('/review')` (현재 /review 진입점이 없으므로 이 버튼이 유일한 동선).
- UI는 테마 토큰(colors/spacing/typography) 기반의 단순 통계 행 — 새 디자인 시스템 컴포넌트는 만들지 않음(화면 내부 구현).

### 1-6. 루트 배선 (app/_layout.tsx 수정)
- 시작 시 `rehydrateStudyLog()` 추가 호출(기존 `rehydrateCardStore()` 옆).

### 변경 파일 계획 (코드 미작성)
| 파일(예정) | 변경 종류 | 메모 |
|---|---|---|
| `src/lib/dates.ts` | 신규 | localDateKey/prevDateKey (로컬 타임존, 순수) |
| `src/srs/stats.ts` | 신규 | countByStatus·dueCount·levelProgress·streakDays (순수) |
| `src/store/studyLog.ts` | 신규 | 학습일 영속 로그 (key `flocons:study-days:v1`) |
| `src/store/hooks.ts` | 신규 | useCards/useStudyDays (useSyncExternalStore) |
| `src/components/DeckSession.tsx` | 신규 | /learn 조립부 추출 + classify·studyLog 배선 |
| `app/learn.tsx` | 수정 | DeckSession 사용으로 단순화 (동작 불변) |
| `app/review.tsx` | 수정 | 플레이스홀더 → due 큐 복습 화면 |
| `app/(tabs)/stats.tsx` | 수정 | 플레이스홀더 → 통계 화면 (+복습하기 CTA) |
| `app/_layout.tsx` | 수정 | rehydrateStudyLog 추가 |
| `__tests__/lib/dates.test.ts` | 신규 | 날짜 키·자정 경계 |
| `__tests__/srs/stats.test.ts` | 신규 | streak(연속/단절/오늘 미학습)·dueCount 경계(dueAt==now)·countByStatus |
| `__tests__/store/studyLog.test.ts` | 신규 | record/라운드트립/reset |
| `__tests__/review.test.tsx` | 신규 | due만 큐잉·0건 빈 상태·분류 시 SRS 갱신 |
| `__tests__/stats.test.tsx` | 신규 | 수치 렌더·복습하기 CTA |

### 데이터 흐름
분류(learn/review) → `DeckSession.handleClassify` → `classifyCard`(SRS 영속) + `recordStudyDay`(학습일 영속) → subscribe → `useCards`/`useStudyDays` → /stats 갱신. /review 마운트 → `dueWordIds(now)` 필터 → due 카드만 덱.

### 리스크 / 대안 / 미해결 질문 (체크포인트 A)
- **Q-F1 (streak 정의)**: 오늘 학습 시 오늘 포함, 오늘 미학습 시 어제까지 역산(미단절 표시) → **권장: 동의.** (대안: 오늘 미학습이면 0 — 가혹해서 비권장.)
- **Q-F2 (due 스냅샷)**: /review 큐는 마운트 시 now 1회 고정(복습 중 새 due 카드가 끼어들지 않음) → **권장: 동의.**
- **Q-F3 (학습 단어 수 정의)**: "학습 단어 수" = reps>0(한 번이라도 분류한 단어), known·learning은 내역으로 병기 → **권장: 동의.**
- **Q-F4 (DeckSession 추출)**: /learn 조립부 리팩터 포함(중복 제거, 기존 테스트가 회귀 가드) → **권장: 동의.** (대안: /review에 복붙 — 비권장.)
- **Q-F5 (studyLog 분리 저장)**: cards v1 스키마 무변경, 별도 키 `flocons:study-days:v1` → **권장: 동의.**
- 리스크: 날짜 경계/타임존 — 테스트는 `new Date(y,m,d,h,m)` 로컬 생성자로 타임스탬프를 만들어 러너 타임존과 무관하게 결정적으로 검증(DoD의 날짜 경계 테스트). DST는 달력 연산(prevDateKey)으로 회피.
- 리스크: undo 시 studyLog/SRS 미롤백(UoW-05 알려진 한계와 동일 범위) — streak은 "그날 학습함" 기록이라 실용상 무해. 기록만 남김.
- (구현 단계에서 expo-router `router.push`·`useSyncExternalStore`·@testing-library/react-native 최신 API를 Context7로 확인 후 사용.)

### ⏸️ 체크포인트 A — 설계 승인

> AI는 위 설계를 *제안*한다. 사람이 승인해야 2) 구현으로 넘어간다.

- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-10
- 코멘트 / 변경 요청: Q-F1~F5 전부 권장값대로 승인.

---

## 2) 구현

승인된 설계대로 (설계 대비 이탈 없음):

### 변경 파일 목록 (실제)
| 파일 | 변경 종류 | 요약 |
|---|---|---|
| `src/lib/dates.ts` | 신규 | localDateKey/prevDateKey — 로컬 타임존 달력 연산(DST 안전), 순수 |
| `src/srs/stats.ts` | 신규 | countByStatus·studiedCount(reps>0)·dueCount(dueAt<=now)·levelProgress(클램프)·streakDays(Q-F1) |
| `src/store/studyLog.ts` | 신규 | 학습일 영속 로그. key `flocons:study-days:v1`, version 1, cardStore와 동일 패턴 |
| `src/store/hooks.ts` | 신규 | useCards/useStudyDays — useSyncExternalStore(서버 스냅샷 인자 포함, expo export 정적 렌더 대비) |
| `src/components/DeckSession.tsx` | 신규 | learn.tsx 조립부 추출. classifyCard+recordStudyDay+dispatch 단일 배선 지점 |
| `app/learn.tsx` | 수정 | 로드 후 `<DeckSession/>` 렌더로 단순화 (동작 불변) |
| `app/review.tsx` | 수정 | 플레이스홀더 → due 큐 복습. 마운트 시 now 1회 고정(Q-F2), 0건 시 empty |
| `app/(tabs)/stats.tsx` | 수정 | 플레이스홀더 → 통계(streak·학습 단어 수·A1 진척·오늘 due) + 복습하기 CTA(`router.push('/review')`) |
| `app/_layout.tsx` | 수정 | 시작 시 rehydrateStudyLog 추가 |

### 구현 노트
- context7 MCP 비가용(UoW-05 때와 동일) — expo-router·useSyncExternalStore·RNTL은 설치 타입 + typecheck + 기존 테스트 패턴으로 검증.
- DeckSession은 컨테이너(스토어·tts 배선 포함)이므로 디자인 시스템 배럴(`@/components`)에 넣지 않고 직접 import (SwipeDeck과 동일 취급).
- StatRow는 stats 화면 내부 전용(디자인 시스템 컴포넌트 아님 — 설계 1-5 그대로).

---

## 3) 테스트 (qa-dev)

### 작성/갱신한 테스트
- [x] `__tests__/lib/dates.test.ts` — 날짜 키·자정 경계·월/연/윤년 경계 (로컬 생성자로 타임존 무관 결정적)
- [x] `__tests__/srs/stats.test.ts` — streak(오늘 포함/미단절/단절/빈 로그/월 경계)·dueCount 경계(dueAt==now)·countByStatus·levelProgress(분모 0·클램프)
- [x] `__tests__/store/studyLog.test.ts` — 기록/중복 no-op/누적·직렬화 포맷·라운드트립·손상 무시·reset
- [x] `__tests__/review.test.tsx` — due만 큐잉·0건 빈 상태·분류 시 SRS 승급+완료 상태
- [x] `__tests__/stats.test.tsx` — 수치 렌더(50%·1일·2개·1장)·빈 상태 0·복습하기 CTA(router.push 스파이)
- [x] `__tests__/learn.test.tsx` — 갱신: 전역 스토어 격리(resetCards/resetStudyLog beforeEach, code-review 권고 반영). 기존 단언은 회귀 가드로 유지

### 검증 게이트 결과 (커밋/푸시 전 필수 · [docs/HARNESS.md](../../docs/HARNESS.md) §3)
- [x] `npm run typecheck` — pass
- [x] `npm run lint` — pass
- [x] `npm run test` — pass (19 suites, 85 tests — 신규 33개)
- [x] `npx expo export` — pass (stats/review 포함 11 라우트)
- 비고: 게이트 도중 iCloud가 `node_modules` 심볼릭 링크를 두 차례 `node_modules 2`로 개명하는 충돌 루프 발생 → **실제 디렉토리로 복원** 후 4종 전체 재실행으로 최종 green 확인 (2026-06-10). 코드와 무관한 환경 이슈.

---

## 4) 리뷰 (code-review)

| # | 위치(파일:라인) | 분류 | 코멘트 | 처리 |
|---|---|---|---|---|
| 1 | `__tests__/learn.test.tsx` | 일관성 | DeckSession이 전역 스토어에 기록하나 reset beforeEach 없음(현 단언엔 영향 없음) | [x] 반영 — resetCards/resetStudyLog 추가 후 게이트 재통과 |
| 2 | `app/(tabs)/stats.tsx:18` | 정확성 | 렌더마다 `Date.now()` 재계산 — 스냅샷 참조 안정성엔 무영향, 실용상 무해 | [x] 보류(권고 — 리뷰어도 수정 불필요 판단) |
| 3 | `app/review.tsx` 외 | 단순화 | 3개 화면의 getWords 로드 보일러플레이트 중복 — 지금 추출은 과설계, UoW-11(레벨 상태)에서 통합 권고 | [x] 보류(UoW-11로 이월) |

- 설계 준수: Q-F1~F5 전부 구현·테스트 일치 확인(리뷰어 검증).
- 리뷰 결론: **머지 가능** (블로커 0)

---

## 5) Unit 완료

### ⏸️ 체크포인트 B — Unit 완료 승인
- [x] 검증 게이트 4종 통과 확인
- [x] code-review 머지 가능
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-10

### 커밋 / 푸시 기록 ([docs/HARNESS.md](../../docs/HARNESS.md) §4 규약)
- [x] STATUS 갱신 · [x] 커밋 · [x] 푸시 (사용자 수행)
- 커밋 해시: `e99b644` (`feat: review queue (due cards) + stats screen with streak log [UoW-06]`)

### 마무리
- 후속 작업 / 다음 Unit: `UoW-07-bookmarks`. 이월 항목: 화면별 getWords 로드 보일러플레이트 통합(UoW-11), undo의 영속 SRS 미롤백(알려진 한계).
