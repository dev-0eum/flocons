# Bolt 기록 — `UoW-07-bookmarks`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md)이며, 이 파일이 갱신되면 STATUS의 해당 Unit 행도 함께 맞춘다.
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [로드맵](../../docs/ROADMAP.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-07-bookmarks` |
| **이름** | 북마크 토글 + `/bookmarks` 목록 + 목록→복습 |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M7 |
| **리드** | **front-dev** (토글 UI·목록 화면) |
| **멤버** | db-dev(영속 `CardState.bookmarked`) + qa-dev + code-review |
| **상태** | ✅ Approved (체크포인트 B — 2026-06-10) |
| **시작일 / 완료일** | 2026-06-10 / 2026-06-10 |

> 의존성: UoW-01 ✅(WordCard 북마크 props) · UoW-05 ✅(cardStore 영속) · DoD 요약: 토글이 영속 상태와 일치 · `/bookmarks` 목록은 북마크만 표시 · 목록에서 복습 시작 가능 · 게이트 4종 green.

---

## 1) 논리 설계 (제안)

> front-dev 리드 mob. 근거: [docs/DESIGN.md §2-5](../../docs/DESIGN.md)("북마크로 따로 모아 복습") · [§4 CardState.bookmarked](../../docs/DESIGN.md) · [inception/03-units-of-work.md UoW-07](../inception/03-units-of-work.md)("WordCard/TopBar 북마크 토글(콜백), /bookmarks 목록, 거기서 복습"). 코드 미작성.

### 목표
카드에서 단어를 북마크해 영속 보관하고, `/bookmarks` 탭에서 모아 보고 거기서 바로 복습을 시작한다.

### 핵심 관찰
- [WordCard](../../src/components/WordCard.tsx)는 **UoW-01에서 이미** `bookmarked`/`onToggleBookmark` props와 북마크 아이콘(접근성 라벨 포함)을 갖고 있다 — 콜백 배선만 하면 된다. TopBar에는 별도 토글을 추가하지 않는다(카드 위 토글로 충분, 03-units의 "WordCard/TopBar"는 택일로 해석).
- `CardState.bookmarked`는 스키마(DESIGN §4)에 이미 있고 `newCardState`가 false로 초기화한다 — **저장 스키마 변경 없음**(`flocons:cards:v1` 유지, 마이그레이션 불필요).
- `schedule()`은 `...prev` 스프레드라 분류해도 bookmarked가 보존된다(테스트로 고정).

### 1-1. cardStore 확장 (db-dev)
- `toggleBookmark(wordId)` — 카드 없으면 `newCardState(wordId)`에서 시작해 `bookmarked` 반전. 기존 `persistNow()`+`emit()` 재사용. **미분류 단어를 북마크해도 SRS에는 영향 없음**(status 'new'·reps 0 유지, dueAt 0이지만 복습 큐 합류는 분류 후처럼 자연스럽게… → Q-H3 참고).
- `bookmarkedWordIds(): string[]` — `dueWordIds`와 대칭인 selector.

### 1-2. DeckSession 배선 (front-dev)
- `useCards()` 구독 추가 → 현재 카드의 `bookmarked={cards[word.id]?.bookmarked ?? false}`, `onToggleBookmark={() => toggleBookmark(word.id)}`.
- learn·review **두 화면이 자동으로** 토글을 얻는다(공용 컨테이너의 이점).

### 1-3. `/bookmarks` 목록 (app/(tabs)/bookmarks.tsx)
- `useCards()` + `getWords('A1')` → `bookmarked` 단어만 FlatList.
- 행: 관사 색 headword + 한국어 뜻 + **북마크 해제 토글**(즉시 목록에서 제거 — 영속 상태와 일치 DoD). 행 탭 동작은 v1 없음(Q-H4).
- 0건 → `StateView variant="empty"` ("북마크한 단어가 없어요.").
- 상단/하단 **"북마크 복습"** CTA → 복습 시작(1-4).

### 1-4. 목록→복습 — `/review?mode=bookmarks` 재사용 (Q-H1)
- `app/review.tsx`가 `useLocalSearchParams()`로 `mode`를 읽어:
  - 기본(파라미터 없음): 기존 due 큐 (UoW-06 동작 그대로).
  - `mode=bookmarks`: 큐 = **북마크 전체**(due 무관 — Q-H2), 빈 상태 문구 "북마크한 단어가 없어요.", doneMessage "북마크 복습을 마쳤어요! 🎉".
- 별도 라우트 신설 없이 풀스크린 복습 UX(DeckSession)를 재사용. 복습 중 분류는 동일하게 SRS 갱신.

### 변경 파일 계획 (코드 미작성)
| 파일(예정) | 변경 종류 | 메모 |
|---|---|---|
| `src/store/cardStore.ts` | 수정 | toggleBookmark · bookmarkedWordIds (스키마 무변경) |
| `src/components/DeckSession.tsx` | 수정 | useCards 구독 + WordCard 북마크 props 배선 |
| `app/(tabs)/bookmarks.tsx` | 수정 | 플레이스홀더 → 목록 + 해제 토글 + 복습 CTA |
| `app/review.tsx` | 수정 | `mode=bookmarks` 분기 (기본 동작 불변) |
| `__tests__/store/cardStore.test.ts` | 수정 | toggleBookmark(생성/반전/영속 라운드트립)·bookmarkedWordIds·분류 시 bookmarked 보존 |
| `__tests__/bookmarks.test.tsx` | 신규 | 북마크만 목록·빈 상태·해제 시 제거·복습 CTA 라우팅 |
| `__tests__/review.test.tsx` | 수정 | mode=bookmarks 큐잉 + 기본 모드 회귀 |
| `__tests__/learn.test.tsx` | 수정 | 카드 토글 → 영속 반영 단언 추가(선택) |

### 데이터 흐름
토글(WordCard/목록 행) → `toggleBookmark` → `cards[wordId].bookmarked` 갱신·persist → subscribe → learn/review 카드 아이콘·/bookmarks 목록 동기화. 복습 CTA → `/review?mode=bookmarks` → `bookmarkedWordIds()` 필터 → DeckSession.

### 리스크 / 대안 / 미해결 질문 (체크포인트 A)
- **Q-H1 (복습 라우팅)**: `/review?mode=bookmarks` 파라미터 재사용 → **권장: 동의.** (대안: 별도 라우트 — 중복이라 비권장.)
- **Q-H2 (북마크 복습 큐 범위)**: 북마크 **전체**(due 무관, "따로 모아 복습"의 의도) → **권장: 동의.** (대안: 북마크 중 due만 — 복습할 게 자주 0건이라 비권장.)
- **Q-H3 (미분류 단어 북마크)**: CardState 생성하되 SRS 값은 건드리지 않음(status 'new'·reps 0). 단, `dueAt 0`이라 **기본 due 큐(`/review`)에 잡히지 않도록 due 판정을 "분류 이력 있는 카드(reps>0)"로 한정** — `dueWordIds`·`dueCount`에 `reps > 0` 조건 추가(북마크만 한 카드가 due로 새는 회귀 방지, UoW-06 테스트 갱신) → **권장: 동의.**
- **Q-H4 (목록 행 동작)**: 행 = 표시 + 해제 토글만, 행 탭 무동작(v1) → **권장: 동의.**
- 리스크: `useLocalSearchParams` 버전 민감 — context7 비가용 시 설치 타입+typecheck로 검증(UoW-05/06과 동일).
- 리스크: Q-H3는 UoW-06 산출물(`dueWordIds`/`dueCount`) 수정을 포함 — 기존 테스트가 회귀 가드, 변경분 테스트 추가.

### ⏸️ 체크포인트 A — 설계 승인

> AI는 위 설계를 *제안*한다. 사람이 승인해야 2) 구현으로 넘어간다.

- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-10
- 코멘트 / 변경 요청: Q-H1~H4 전부 권장값대로 승인.

---

## 2) 구현

승인된 설계대로 (설계 이탈 없음):

### 변경 파일 목록 (실제)
| 파일 | 변경 종류 | 요약 |
|---|---|---|
| `src/store/cardStore.ts` | 수정 | toggleBookmark(SRS 무영향, ...prev 보존)·bookmarkedWordIds 추가, dueWordIds에 `reps>0` 조건(Q-H3) |
| `src/srs/stats.ts` | 수정 | dueCount에 `reps>0` 조건 (dueWordIds와 동일 기준) |
| `src/components/DeckSession.tsx` | 수정 | useCards 구독 + WordCard `bookmarked`/`onToggleBookmark` 배선 — learn·review 동시 적용 |
| `app/review.tsx` | 수정 | `useLocalSearchParams`로 `mode=bookmarks` 분기(큐=북마크 전체, 전용 빈/완료 문구). 기본 due 모드 불변 |
| `app/(tabs)/bookmarks.tsx` | 수정 | 플레이스홀더 → FlatList 목록(관사 색 headword+뜻+해제 토글) + "북마크 복습" CTA(`router.push({pathname:'/review', params:{mode:'bookmarks'}})`) |

### 구현 노트
- context7 MCP 비가용 — `useLocalSearchParams`는 설치 타입+typecheck로 검증(`mode`가 `string[]`이면 비교가 false → 기본 모드로 안전).
- 저장 스키마 무변경(`flocons:cards:v1` 유지) — 마이그레이션 불필요.
- TopBar에는 토글을 추가하지 않음(WordCard 토글로 충분 — 설계 §1 핵심 관찰).

---

## 3) 테스트 (qa-dev)

### 작성/갱신한 테스트
- [x] `__tests__/store/cardStore.test.ts` — toggleBookmark(생성·SRS 무영향·반전)·bookmarkedWordIds·분류 시 bookmarked 보존·북마크만 카드 due 제외(Q-H3)·토글 영속 라운드트립
- [x] `__tests__/srs/stats.test.ts` — dueCount `reps>0`(기존 fixture에 reps 추가로 회귀 가드 유지 + 신규 케이스)
- [x] `__tests__/review.test.tsx` — mode=bookmarks 큐잉(due 무관)·빈 상태·전용 완료 문구 + 기본 모드 Q-H3 회귀
- [x] `__tests__/bookmarks.test.tsx` (신규) — 북마크만 목록·빈 상태·해제 시 즉시 제거(영속 일치)·복습 CTA 라우팅
- [x] `__tests__/learn.test.tsx` — 카드 북마크 토글 → 영속 반영 단언 추가

### 검증 게이트 결과 (커밋/푸시 전 필수 · [docs/HARNESS.md](../../docs/HARNESS.md) §3)
- [x] `npm run typecheck` — pass
- [x] `npm run lint` — pass
- [x] `npm run test` — pass (20 suites, 100 tests — 신규/갱신 15개)
- [x] `npx expo export` — pass

---

## 4) 리뷰 (code-review)

| # | 위치(파일:라인) | 분류 | 코멘트 | 처리 |
|---|---|---|---|---|
| 1 | `app/(tabs)/bookmarks.tsx:78` | 일관성 | CTA 시각 라벨은 `북마크 복습 (N)`, accessibilityLabel은 `북마크 복습` — 미세 차이나 안정적 라벨로서 의도적 | [x] 보류(리뷰어도 현행 유지 무방 판단) |
| 2 | `app/(tabs)/bookmarks.tsx:75` | 일관성 | 행 해제 아이콘 채움 고정 — "해제" 단일 동작이라 의미상 적합 | [x] 보류(문제 없음 확인) |

- 설계 준수: Q-H1~H4 전부 승인값대로 구현(리뷰어 검증). reps>0 회귀(분류 카드 누락) 없음 — schedule이 reps를 항상 증가시킴.
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
- 커밋 해시: `476af6f` (`feat: bookmark toggle, bookmarks list, and bookmark review mode [UoW-07]`)

### 마무리
- 후속 작업 / 다음 Unit: `UoW-08-settings-keys`.
