# Bolt 기록 — `UoW-03-learn-deck`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md).
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-03-learn-deck` |
| **이름** | 학습 덱 화면 (메인 · 스와이프 카드) |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M3 |
| **리드** | **front-dev** (화면·제스처·애니메이션) |
| **멤버** | back-dev(덱 상태 로직) · qa-dev(인터랙션/로직 테스트) · code-review |
| **상태** | 🔵 In Progress (체크포인트 A ✅ — 구현 중) |
| **시작/완료** | 2026-06-09 / (미정) |
| **의존성** | UoW-01 (✅ 디자인 시스템) · UoW-02 (✅ 콘텐츠) |

> DoD 요약: `/learn`에서 좌/우 스와이프로 카드 분류(`onClassify`)+다음 카드 전환 · undo 복원 · 덱 소진 시 빈/완료 상태 · 진행도/제외수 표시 · 인터랙션/로직 테스트 · 검증 게이트 4종 green. (학습 상태 **영속은 UoW-05**, 인메모리만.)

---

## 1) 논리 설계 (제안)

> front-dev 리드 mob. 근거: [docs/DESIGN.md §2 UX](../../docs/DESIGN.md)·[§3 화면](../../docs/DESIGN.md), 레퍼런스 `example/IMG_9544.PNG`, [ai-dlc/00-tech-stack.md](../../ai-dlc/00-tech-stack.md). **버전 민감 API는 Context7로 확인**(아래). 이 단계 **코드 미작성**.

### 목표
번들 A1 단어(UoW-02)를 UoW-01 컴포넌트로 조립해, **스와이프로 분류하는 메인 학습 화면**을 만든다. 좌=알고있어요 / 우=학습할게요(Q1). 학습 상태 **영속·SRS 스케줄은 UoW-05**이고 여기선 **인메모리 덱**만(분류/진행/undo).

### Context7 확인 (reanimated/gesture-handler)
- **Reanimated 4.x** → babel 플러그인은 **`react-native-worklets/plugin`**(구 `react-native-reanimated/plugin` 대체, plugins 배열 **마지막**). 출처: swmansion 공식 문서.
- 제스처: `react-native-gesture-handler`의 `Gesture.Pan()` + `<GestureDetector>`로 `Animated.View` 감싸기. 루트에 **`GestureHandlerRootView`** 필요.
- 애니메이션: `useSharedValue`(translateX) + `useAnimatedStyle`(translate+rotate) + `withSpring` + `runOnJS`(분류 콜백을 JS 스레드로).

### 신규 의존성 (expo install — SDK55 호환 버전)
- `react-native-reanimated`(~4.x) · `react-native-gesture-handler`(~2.x) · `react-native-worklets`(reanimated 4 peer).
- `babel.config.js`에 `'react-native-worklets/plugin'` 추가(마지막). → **babel 변경이라 jest/expo 영향**, 게이트로 검증.

### 파일 변경 계획 (제안 — 코드 미작성)
| 파일 | 변경 | 내용 |
|---|---|---|
| `babel.config.js` | 수정 | `react-native-worklets/plugin` 추가 |
| `app/_layout.tsx` | 수정 | 루트를 `GestureHandlerRootView`로 래핑 |
| `src/lib/deck.ts` | 신규 | **순수 덱 상태 로직**(reducer): `classify(known/learn)`·`undo`·진행도·제외수·소진. 제스처 없이 단위 테스트 가능 |
| `src/lib/toWordCardData.ts` | 신규 | `Word → WordCardData` 매핑(글루 계층 — content가 components에 역의존하지 않게; code-review 권고로 content→lib 정정) |
| `src/components/SwipeDeck.tsx` | 신규 | `Gesture.Pan`+reanimated 스와이프 스택. props: `card`(렌더), `onSwipeLeft/Right`. 임계값 넘으면 분류 콜백 |
| `app/learn.tsx` | 수정(현재 placeholder) | 덱 로딩(`StaticContentProvider.getWords('A1')`) + `TopBar`+`SwipeDeck(WordCard)`+`ActionButtons` 조립, `useReducer(deck)`로 상태, undo/빈 상태 |
| `jest.setup.ts` | 수정 | reanimated 공식 jest mock + gesture-handler jest 설정 |
| `__tests__/...` | 신규 | `deck.ts` 로직(분류/undo/소진) + `/learn` 인터랙션(버튼 분류·undo·빈 상태) |

### 데이터 흐름
`StaticContentProvider.getWords('A1')` → `Word[]` → `useReducer(deck)` 인메모리 덱 → 현재 카드 `Word → WordCardData`(toWordCardData) → `SwipeDeck`/`WordCard` 렌더. 스와이프/버튼 → `classify` → 다음 카드. undo → 직전 복원. (분류 결과의 **영속/SRS는 UoW-05**에서 deckStore로.)

### 리스크 / 대안 / 미해결 질문 (체크포인트 A 결정 요청)
- **Q-C1 (덱 상태)**: 인메모리 `useReducer`(영속 없음, SRS·persist는 UoW-05) → **권장: 동의.**
- **Q-C2 (레벨 소스)**: 지금은 `'A1'` 고정(레벨 선택 UI는 UoW-11) → **권장: 동의.**
- **Q-C3 (jest 전략)**: reanimated/gesture는 jest에서 raw 제스처 테스트가 어려움 → **순수 `deck.ts` 로직 + 버튼 기반 분류/undo·빈 상태**로 검증(스와이프 제스처 자체는 mock). reanimated 공식 mock + gesture-handler jest 설정 사용 → **권장: 동의.**
- **Q-C4 (의존성)**: reanimated 4 + gesture-handler + worklets 추가 + babel 플러그인 → **권장: 동의**(스와이프에 필수).
- **리스크**: reanimated 4 babel(worklets) + jest-expo 상호작용으로 게이트가 깨질 수 있음(스캐폴드에서 reanimated를 미룬 이유). 완화: Context7 확인된 정확한 플러그인·mock 사용, 게이트 연속 실패 2~3회 시 보고(HARNESS §7). 레퍼런스의 레벨 캡션·뒤로가기·체크배지는 이 화면 셸에서 일부 반영(데이터 의존 강조는 후순위).

### ⏸️ 체크포인트 A — 설계 승인
- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-09
- 코멘트: Q-C1~C4 권장값대로 승인 (인메모리 덱, A1 고정, jest는 로직+버튼, reanimated4+gesture+worklets+babel).

---

## 2) 구현
승인된 설계대로 구현:
- **순수 덱 로직** `src/lib/deck.ts` — `DeckState` + reducer(load/classify/undo) + selectors(currentWord/isDone/excludedCount/progress). 좌=known(알고있어요)/우=learn(학습할게요, Q1). 영속/SRS는 UoW-05.
- **매핑** `src/lib/toWordCardData.ts` — `Word → WordCardData`(글루 계층, content↔components 단방향).
- **스와이프** `src/components/SwipeDeck.tsx` — `Gesture.Pan`+`GestureDetector`+reanimated 4(`useSharedValue`/`useAnimatedStyle`/`withSpring`/`runOnJS`), 임계값 28%.
- **화면** `app/learn.tsx` — A1 로딩(`StaticContentProvider`) → `TopBar`+`SwipeDeck(WordCard)`+`ActionButtons`, `useReducer(deck)`, loading/done 상태, undo.
- **루트** `app/_layout.tsx` — `GestureHandlerRootView` 래핑. **deps** reanimated 4.2.1 + gesture-handler 2.30.1 + worklets 0.7.4 + babel `react-native-worklets/plugin`. **jest**는 reanimated 비로드(SwipeDeck mock, Q-C3).

후속 인계(code-review): getWords 실패 폴백(catch+error variant)·빈 덱 empty variant → UoW-09/UoW-11.

## 3) 테스트 (qa-dev) — 검증 게이트 ([HARNESS §3](../../docs/HARNESS.md)) 전부 green
- [x] `npm run typecheck` — PASS
- [x] `npm run lint` — PASS
- [x] `npm run test` — PASS (11 suites / **32 tests**: deck 로직 + /learn 인터랙션(로드→분류→완료·undo) + 기존)
- [x] `npx expo export -p ios` — PASS (4.3MB Hermes 번들, reanimated/gesture 포함 — 스와이프 번들 무결성 확인)

## 4) 리뷰 (code-review)
**Approved (머지 가능)** — blocker 없음. deck reducer 정확·Q1 방향 전 경로 일관·reanimated 4 패턴/버전 정합·jest 전략(Q-C3) 수용. **반영**: §1 경로 정정(toWordCardData→`src/lib/`). **유예/인계**: getWords catch+error variant·빈 덱 empty variant → UoW-09/UoW-11. nit(스와이프 1프레임 점프·단일 카드)는 수동/후속.

## 5) Unit 완료
### ⏸️ 체크포인트 B — Unit 완료 승인
- [x] 게이트 4종 통과 · [x] code-review 머지 가능
- 결정: ⏸️ Awaiting Approval (사람 승인 대기) → 승인 시 STATUS ✅ + 커밋·푸시(사용자)
### 커밋 / 푸시 (사용자 수행)
- 제안 메시지: `feat: learn deck screen with swipe-to-classify (reanimated + gesture-handler) [UoW-03]`
