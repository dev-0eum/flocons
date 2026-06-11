# Bolt 기록 — `UoW-11-onboarding-polish`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md)이며, 이 파일이 갱신되면 STATUS의 해당 Unit 행도 함께 맞춘다.
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [로드맵](../../docs/ROADMAP.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-11-onboarding-polish` |
| **이름** | 홈/온보딩 + 햅틱·접근성·완료 폴리시 (+이월 3건 흡수) |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M11 |
| **리드** | **front-dev** (화면·UX) |
| **멤버** | back-dev(haptics 래퍼·enrich 배선·useWords) + qa-dev + code-review |
| **상태** | ⏸️ Awaiting Approval (체크포인트 B) |
| **시작일 / 완료일** | 2026-06-11 / (미정) |

> 의존성: UoW-01 ✅ · UoW-03 ✅ · UoW-06 ✅ · UoW-08 ✅ (+09/10 산출 활용) · DoD 요약: 온보딩→레벨로 시작 · 햅틱·폰트 스케일·대비·accessibilityAction · 빈/완료 화면 · 게이트 4종 green.

---

## 1) 논리 설계 (제안)

> front-dev 리드 mob. 근거: [docs/DESIGN.md §2·§3(홈="홈/레벨 선택, 레벨별 진행도, 오늘 복습할 카드 수, 학습 시작")·§9](../../docs/DESIGN.md) · [ROADMAP M11](../../docs/ROADMAP.md) · Inception **Q2(expo-haptics 채택)** · 이월: /settings 진입(UoW-08)·enrich UI(UoW-09)·레벨 연동(UoW-08 Q-I2)·getWords 보일러플레이트 통합(UoW-06 리뷰). 코드 미작성.

### 목표
첫 실행 온보딩과 홈 화면으로 진입 동선을 완성하고, 레벨 설정을 실제 화면에 연동하며, 햅틱·접근성·완료 화면 폴리시로 MVP 기능을 마감한다. **MVP의 마지막 기능 Unit** — 묶음이 크므로 A~G로 분해해 순서대로 구현한다.

### A. 홈 화면 (app/(tabs)/index.tsx — 플레이스홀더 → 구현)
- 표시(DESIGN §3): 현재 레벨 + 레벨 진척(known/전체, UoW-06 stats 재사용) · **오늘 복습할 카드 N** · **"학습 시작"**(→ /learn) · due>0이면 **"복습 N장"**(→ /review) · 우상단 **설정 아이콘**(→ /settings — UoW-08 이월 해소, Q-L5).
- 미온보딩이면 `/onboarding`으로 `<Redirect/>` (B 참조).

### B. 첫 실행 온보딩 (app/onboarding.tsx 신규 — 풀스크린 stack)
- **1페이지**(Q-L2): 앱 한 줄 소개(스와이프·SRS·발음) + **레벨 선택 세그먼트**(settingsStore.setLevel) + "시작하기"(setOnboarded → 홈).
- `settingsStore`에 `onboarded: boolean` **영속 필드 추가**(기존 v1 직렬화에 필드 추가 — 후방 호환: 구 저장본은 `?? false`) + **`hydrated: boolean`(비영속)** — rehydrate 완료 전 리다이렉트 오판 방지(홈은 hydrated 전 로딩 표시).

### C. 레벨 연동 (UoW-08 Q-I2 이월 해소 + UoW-06 보일러플레이트 이월 통합)
- `src/lib/content.ts`에 **`useWords(): { words: Word[] | null; level: Level }`** 훅 추가 — settingsStore.level 구독 + `currentProvider().getWords(level)` (4개 화면의 `LEVEL='A1'` 고정·useEffect 보일러플레이트를 1곳으로 통합).
- learn/review/bookmarks/stats를 useWords로 전환.
- **데이터 없는 레벨(A2/B1)**: StaticContentProvider가 빈 배열 반환 → 학습/복습은 `StateView empty` **"이 레벨 콘텐츠는 준비 중이에요"**(Q-L1) — UoW-12에서 데이터 추가 시 자연 활성화.

### D. 햅틱 (Inception Q2 — expo-haptics)
- `expo-haptics`(~55) 의존성 추가. `src/lib/haptics.ts` 래퍼(유일 접점 — ADR-005 패턴, jest mock은 jest.setup에): `tapClassify()`(Light impact) · `tapUndo()`(Selection) · `celebrate()`(Success notification) (Q-L3).
- DeckSession 배선: 분류 시 tapClassify, undo 시 tapUndo, 덱 소진 진입 시 celebrate(1회).

### E. 접근성
- **accessibilityActions**: DeckSession의 카드 컨테이너에 `[{name:'know', label:'알고 있어요'}, {name:'learn', label:'학습할게요'}]` + `onAccessibilityAction` — 스크린리더 사용자가 스와이프 없이 분류(DoD). (ActionButtons는 시각 대안으로 기존 유지.)
- 폰트 스케일: RN Text 기본 `allowFontScaling` 유지 확인(전 컴포넌트 미차단 점검). 대비: 본문 토큰은 WCAG AA 충족(text 16.7:1, textMuted 4.8:1) — 점검 결과만 기록.
- 빈/로딩/에러 상태: StateView 기존 4종 활용 — 홈·온보딩에도 일관 적용.

### F. 완료 화면 폴리시 (ROADMAP "완료 축하")
- StateView의 기존 `actionLabel/onAction` 활용: learn 완료 → due>0이면 "복습하러 가기"(→/review), 아니면 "홈으로" · review 완료 → "홈으로". DeckSession에 `doneAction?: { label, onPress }` prop 추가, 화면이 주입.

### G. enrich UI (UoW-09 이월 — "다른 예문 보기")
- WordCard 예문 영역에 **"새 예문" 버튼(↻)** — `onNewExample?: () => void` prop(옵셔널, 콜백만 — props-only 유지). **hasAnthropicKey일 때만 노출**(Q-L4 — 비용 발생 행동이라 자동 enrich 없음).
- DeckSession: `currentProvider().enrich(word)` 호출 → 보강된 예문을 로컬 state로 교체 표시(카드 전환 시 리셋). 실패는 조용히 원본 유지(UoW-09 폴백).

### 변경 파일 계획 (코드 미작성)
| 파일(예정) | 변경 종류 | 메모 |
|---|---|---|
| `package.json` | 수정 | expo-haptics 추가 (Q2) |
| `jest.setup.ts` | 수정 | expo-haptics mock |
| `src/lib/haptics.ts` | 신규 | 햅틱 래퍼 (유일 접점) |
| `src/lib/content.ts` | 수정 | useWords 훅 (레벨 구독 + 로드 통합) |
| `src/store/settingsStore.ts` | 수정 | onboarded(영속)·hydrated(비영속)·setOnboarded |
| `app/onboarding.tsx` | 신규 | 1페이지 온보딩 |
| `app/_layout.tsx` | 수정 | onboarding 라우트 등록 |
| `app/(tabs)/index.tsx` | 수정 | 홈 구현 + 미온보딩 Redirect + 설정 진입 |
| `app/learn.tsx`·`app/review.tsx`·`app/(tabs)/bookmarks.tsx`·`app/(tabs)/stats.tsx` | 수정 | useWords 전환(레벨 연동) + 완료 action 주입(learn/review) |
| `src/components/DeckSession.tsx` | 수정 | 햅틱·accessibilityActions·doneAction·enrich 배선 |
| `src/components/WordCard.tsx` | 수정 | onNewExample prop(↻ 버튼, 옵셔널) |
| `__tests__/onboarding.test.tsx`·`__tests__/home.test.tsx`·`__tests__/lib/haptics.test.ts` 등 | 신규/수정 | 아래 3) 참조 |

### 리스크 / 대안 / 미해결 질문 (체크포인트 A)
- **Q-L1 (빈 레벨)**: A2/B1 선택 가능 + 데이터 없으면 "준비 중" 빈 상태(UoW-12에서 자연 활성화) → **권장: 동의.** (대안: A1 외 비활성 — UoW-12 후 재작업 필요해 비권장.)
- **Q-L2 (온보딩 형태)**: 1페이지(소개+레벨+시작), AsyncStorage 영속 플래그 → **권장: 동의.** (멀티 슬라이드는 과함.)
- **Q-L3 (햅틱 매핑)**: 분류=Light·undo=Selection·완료=Success → **권장: 동의.**
- **Q-L4 (enrich UI)**: 예문 ↻ 버튼, hasAnthropicKey일 때만 노출, 탭당 1회 호출(자동 enrich 없음) → **권장: 동의.**
- **Q-L5 (/settings 진입)**: 홈 우상단 설정 아이콘 → **권장: 동의.** (TopBar 메뉴 배선은 후속.)
- 리스크: 묶음이 큼(A~G) — 구현은 A→C→B→D→E→F→G 순으로 자체 점검하며 진행, 게이트·리뷰는 일괄. 범위 초과 징후 시 멈추고 보고.
- 리스크: onboarded 플래그 추가로 기존 개발 빌드 사용자는 온보딩을 1회 다시 봄 — 무해(개발 단계).

### ⏸️ 체크포인트 A — 설계 승인

> AI는 위 설계를 *제안*한다. 사람이 승인해야 2) 구현으로 넘어간다.

- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-11
- 코멘트 / 변경 요청: Q-L1~L5 전부 권장값대로 승인.

---

## 2) 구현

승인된 설계대로 A→C→B→D→E→F→G 전부 구현 (이탈 없음):

### 변경 파일 목록 (실제)
| 파일 | 변경 종류 | 요약 |
|---|---|---|
| `package.json` | 수정 | expo-haptics ~55.0.14 (Q2) |
| `jest.setup.ts` | 수정 | expo-haptics mock |
| `src/lib/haptics.ts` | 신규 | tapClassify(Light)·tapUndo(Selection)·celebrate(Success) — 유일 접점 (Q-L3) |
| `src/lib/content.ts` | 수정 | `useWords()` — 레벨 구독+로드 통합(UoW-06 이월 해소), 레벨 전환 리셋 |
| `src/store/settingsStore.ts` | 수정 | onboarded(영속, 구 저장본 `?? false`)·hydrated(비영속, rehydrate 말미 set)·setOnboarded |
| `app/onboarding.tsx` | 신규 | 1페이지: 소개+레벨 세그먼트+시작 (Q-L2) |
| `app/_layout.tsx` | 수정 | onboarding 라우트 등록 |
| `app/(tabs)/index.tsx` | 수정 | 홈: 진척·오늘 due·학습/복습 시작·설정 아이콘(Q-L5, UoW-08 이월 해소)·hydrated 가드·미온보딩 Redirect |
| `app/learn.tsx`·`app/review.tsx` | 수정 | useWords + 빈 레벨 "준비 중"(Q-L1) + doneAction(완료 시점 평가 — F) |
| `app/(tabs)/bookmarks.tsx`·`app/(tabs)/stats.tsx` | 수정 | useWords 전환(레벨 연동) |
| `src/components/DeckSession.tsx` | 수정 | 햅틱 배선·완료 축하 1회·accessibilityActions(know/learn — E)·doneAction 1회 평가·enrich 배선(키 보유 시) |
| `src/components/WordCard.tsx` | 수정 | onNewExample prop(↻ 새 예문 — G) |

### 구현 노트
- **접근성 트레이드오프(E)**: 덱 컨테이너 그룹화로 SR에서 카드 내부 발음/북마크/새 예문 버튼이 숨겨짐 — 분류(커스텀 액션+하단 버튼)와 카드 낭독은 보장. **후속 백로그**: accessibilityActions에 play/bookmark 액션 추가(리뷰어 권고).
- typed routes: `.expo/types/router.d.ts`가 stale 상태였음 — `expo export`가 재생성하며 `/onboarding` 포함 확인(생성 산출물, gitignore).
- enrich 결과는 카드 id 키 로컬 state — 카드 전환 시 자연 미적용, 실패는 원본 유지(UoW-09 폴백).

---

## 3) 테스트 (qa-dev)

### 작성/갱신한 테스트
- [x] `__tests__/learn.test.tsx` (재작성) — 분류 플로우 회귀 + 햅틱(분류/undo/완료) + 완료 액션("복습하러 가기"→/review) + **a11y 커스텀 액션 분류** + **enrich 버튼 노출/미노출·예문 교체**
- [x] `__tests__/home.test.tsx` (신규) — hydrated 전 로딩·미온보딩 Redirect·진척/due/3개 동선·due 0이면 복습 버튼 숨김
- [x] `__tests__/onboarding.test.tsx` (신규) — 레벨 선택 반영·시작 시 onboarded 영속+홈 이동
- [x] `__tests__/empty-level.test.tsx` (신규) — learn/review 빈 레벨 "준비 중" (Q-L1, 리뷰 권고 반영)
- [x] `__tests__/review.test.tsx` — useWords mock 전환 + 완료 "홈으로" 액션(리뷰 권고 반영)
- [x] `__tests__/components/WordCard.test.tsx` — onNewExample 노출/미노출 단위 테스트(리뷰 권고 반영)
- [x] `__tests__/store/settingsStore.test.ts` — onboarded 직렬화·라운드트립·hydrated
- [x] bookmarks/stats 테스트 — useWords mock 전환(단언 유지 = 회귀 가드)

### 검증 게이트 결과 (커밋/푸시 전 필수 · [docs/HARNESS.md](../../docs/HARNESS.md) §3)
- [x] `npm run typecheck` — pass
- [x] `npm run lint` — pass
- [x] `npm run test` — pass (31 suites, 155 tests — 신규/갱신 25+개)
- [x] `npx expo export` — pass (/onboarding 포함 12 라우트)
- 비고: 리뷰 수정 중 empty-level 스위트의 SwipeDeck mock 누락으로 1회 적색 → mock 추가 후 전체 재실행 green.

---

## 4) 리뷰 (code-review)

| # | 위치(파일:라인) | 분류 | 코멘트 | 처리 |
|---|---|---|---|---|
| 1 | `DeckSession.tsx:50-55` | 정확성 | doneAction이 라벨/핸들러에서 2회 평가 — 스냅샷 불일치 이론 가능성 | [x] 반영 — 1회 평가로 메모 |
| 2 | `review.test`·빈 레벨 | 정확성 | doneAction("홈으로")·빈 레벨 분기 미검증 | [x] 반영 — review 완료 액션 + empty-level 스위트 추가 |
| 3 | `WordCard.test` | 일관성 | onNewExample prop 단위 테스트 부재 | [x] 반영 — 노출/미노출 테스트 추가 |
| 4 | `DeckSession.tsx:88-101` | 접근성 | SR에서 발음/북마크/새 예문 접근 불가(그룹화) — 설계 승인된 트레이드오프, play/bookmark 액션 추가 권장 | [x] 보류 — 후속 백로그 기록(마무리 참조) |
| 5 | `index.tsx:15-18` 외 | 정확성(정보) | 미온보딩 시 useWords 1회 트리거(무해)·rehydrate 연속 emit 2회(정상)·enrich `if (w)` 죽은 가드(무해) | [x] 보류(정보성) |

- 리뷰어 검증: hydrated 가드·후방 호환·Q-F2 유지·훅 순서·온보딩 리다이렉트 루프 없음·보안 무변경 전부 통과.
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
