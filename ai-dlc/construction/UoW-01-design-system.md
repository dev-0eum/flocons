# Bolt 기록 — `UoW-01-design-system`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md).
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-01-design-system` |
| **이름** | 디자인 시스템 & 베이스 컴포넌트 |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M1 |
| **리드** | **front-dev** (UI/테마/컴포넌트/접근성) |
| **멤버** | qa-dev(렌더/스냅샷 테스트) · code-review(리뷰 게이트) |
| **상태** | ✅ Approved (체크포인트 B — 완료, 푸시됨) |
| **시작/완료** | 2026-06-09 / (미정) |
| **의존성** | UoW-00 (✅ 완료) |

> DoD 요약: 정적 props 렌더가 `example/IMG_9544.PNG` 레이아웃을 표현 · 관사 색 + 텍스트 병행(접근성) · 컴포넌트 렌더/스냅샷 테스트 · 검증 게이트 4종 green · 모든 컴포넌트 **props-only(스토어 무지)**.

---

## 1) 논리 설계 (제안)

> front-dev 리드. 근거: [docs/DESIGN.md §3 화면](../../docs/DESIGN.md)·[§9 디자인/테마](../../docs/DESIGN.md), 레퍼런스 `example/IMG_9544.PNG`, [ai-dlc/00-tech-stack.md](../../ai-dlc/00-tech-stack.md). 이 단계 **코드 미작성**.

### 목표
UoW-03(학습 덱)·이후 화면이 조립해 쓸 **테마 토큰 + 프리젠테이셔널 베이스 컴포넌트**를 만든다. 모두 **props-only**(데이터/스토어/네비 무지)라 정적 props로 렌더·스냅샷 테스트 가능. 실데이터 연결은 UoW-02/03.

### 1-1. 테마 (`src/theme/`)
- `colors.ts` — 라이트 테마(레퍼런스 기준 배경 흰색, 강조 버튼 검정). 시맨틱 토큰: `background`/`surface`/`text`/`textMuted`/`border`/`accent`(검정)/`onAccent`(흰색). **관사-성 색**: `articleMasculine`(파랑 계열), `articleFeminine`(로즈 계열), `articleNeutral`(회색).
- `typography.ts` — `title`/`word`(큰 단어)/`body`/`caption` 크기·굵기·행간.
- `spacing.ts` — 간격 스케일(4·8·12·16·24·32) + `radius`(카드/버튼 곡률).
- `index.ts` — `theme = { colors, typography, spacing, radius }` 배럴 + `articleColor(gender)` 헬퍼.
- v1 **라이트 테마만**(다크는 후순위, DESIGN §9). 색은 토큰으로 격리해 추후 테마 전환 용이.

### 1-2. 베이스 컴포넌트 (`src/components/`) — 전부 props-only
| 컴포넌트 | props(요지) | 역할 (레퍼런스 매핑) |
|---|---|---|
| `WordCard` | `data: WordCardData` · `bookmarked` · `imageSource?` · `onPlayWord`·`onPlayExample`·`onToggleBookmark` 콜백 | 카드 본문: 이미지 영역(또는 플레이스홀더 슬롯) · 관사 색 입힌 단어 · 품사 배지 · 한국어 뜻 · 예문 FR/KR · 발음 버튼 2개 · 북마크 |
| `TopBar` | `excludedCount`·`progressCurrent`·`progressTotal`·`onUndo`·`onMenu` | 상단: 제외 수 · 진행도(10/46) · undo · 메뉴 |
| `ActionButtons` | `onKnow`·`onLearn` | "알고 있어요"(좌) / "학습할게요"(우), Q1 결정 반영 |
| `ProgressBar` | `current`·`total` | 진행 막대 |
| `StateView` | `variant: 'empty'|'loading'|'error'|'done'` · `message?`·`onAction?` | 빈/로딩/에러/완료 보조 상태 |

- `WordCardData`(프리젠테이셔널 타입, **UoW-02의 `Word`와 분리**): `{ lemma, article, gender, pos, krMeaning, exampleFr, exampleKr }`. → UoW-01이 콘텐츠 계층(UoW-02)에 의존하지 않게 디커플. UoW-03에서 `Word → WordCardData` 매핑.
- **접근성**: 관사 색만으로 성을 표현하지 않고 텍스트(le/la 등)·`accessibilityLabel` 병행(색맹 대비). 버튼/아이콘 `accessibilityRole`·`accessibilityLabel`. 폰트 스케일 대응(고정 px 지양, 토큰 사용).
- 발음/북마크/undo/메뉴는 **콜백만** 받는다(ADR-005 정신: 컴포넌트는 expo-speech/스토어 직접 import 금지).

### 1-3. 아이콘
- `@expo/vector-icons`(Expo 번들, Ionicons 등)로 발음(waveform/volume)·북마크·undo·메뉴·trash 아이콘. → **미설치 시 `expo install @expo/vector-icons`** (구현 시 Context7로 버전·아이콘명 확인).

### 파일 변경 계획 (제안 — 코드 미작성)
- `src/theme/{colors,typography,spacing,index}.ts`
- `src/components/{WordCard,TopBar,ActionButtons,ProgressBar,StateView}.tsx` + `index.ts`(배럴)
- `__tests__/components/*.test.tsx` (각 컴포넌트 렌더/스냅샷 — qa-dev)
- (의존성) 필요 시 `@expo/vector-icons` 추가

### 데이터 흐름
- 없음(프리젠테이셔널). 콜백으로 상호작용을 위임. 실제 데이터/핸들러는 UoW-03(덱)·UoW-05(SRS) 연결.

### 리스크 / 대안 / 미해결 질문 (체크포인트 A 결정 요청)
- **Q-A1 (아이콘)**: `@expo/vector-icons`(Ionicons) 사용 동의? (대안: 텍스트/이모지 — 품질↓) → **권장: 동의.**
- **Q-A2 (WordCard 타입)**: `WordCardData`를 components 로컬 프리젠테이셔널 타입으로 두고 UoW-02 `Word`와 분리(디커플) 동의? → **권장: 동의.**
- **Q-A3 (팔레트 방향)**: 라이트 테마 · 강조 버튼 검정 · 관사색 m=파랑/f=로즈/null=회색. 구체 색값은 토큰에서 조정 가능. → **권장: 이 방향으로 진행, 색값은 구현 후 미세조정.**
- 리스크: 레퍼런스 스크린샷의 정확한 여백/폰트는 근사치로 구현 후 UoW-03 통합 시 조정. reanimated/제스처는 범위 밖(UoW-03).

### ⏸️ 체크포인트 A — 설계 승인
- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-09
- 코멘트: Q-A1(@expo/vector-icons)·Q-A2(WordCardData 분리)·Q-A3(팔레트 방향) 권장값대로 승인.

---

## 2) 구현
승인된 설계대로 구현(코드):
- **테마** `src/theme/{colors,typography,spacing,index}.ts` — 라이트 토큰 + `articleColor(gender)`(m=파랑/f=로즈/null=회색, Q-A3).
- **컴포넌트** `src/components/` (전부 props-only): `WordCard`(이미지 슬롯·관사색 단어·품사 배지·뜻·예문 FR/KR·발음 2버튼·북마크) · `TopBar`(제외수·진행도·undo·메뉴) · `ActionButtons`(알고있어요/학습할게요) · `ProgressBar` · `StateView`(empty/loading/error/done) + 배럴 `index.ts`.
- **아이콘** `@expo/vector-icons`(Ionicons, Q-A1) — jest는 `jest.setup.ts`에서 stub mock.
- 접근성: 관사 색 + 텍스트(le/la) 병행, `accessibilityRole`/`Label`, 품사는 라벨에서 한국어로 읽힘(스크린리더), 폰트 토큰.
- `WordCardData`는 components 로컬 타입(UoW-02 `Word`와 분리, Q-A2).

**유예(범위 분리 → 화면/데이터 단계, code-review SHOULD-3/NIT-1)**: 레퍼런스의 "레벨 N·입문" 캡션·좌상단 뒤로가기·진행도 체크 배지는 화면 셸(UoW-03)에서, 예문 키워드 볼드 강조는 `Word` 스키마(UoW-02)와 함께 UoW-03에서 조립.

## 3) 테스트 (qa-dev) — 검증 게이트 ([HARNESS §3](../../docs/HARNESS.md)) 전부 green
- [x] `npm run typecheck` — PASS
- [x] `npm run lint` — PASS (0 error; `jest.setup.ts` require warning 3건은 비차단)
- [x] `npm run test` — PASS (6 suites / **14 tests**: 컴포넌트 5종 렌더·콜백·역할 + 스캐폴드)
- [x] `npx expo export -p ios` — PASS (Hermes 번들 생성)

## 4) 리뷰 (code-review)
**Approved (머지 가능)** — blocker 없음. **반영**: SHOULD-1(접근성 — 품사 accessibilityLabel 한국어화)·SHOULD-2(디자인 시스템 배럴에서 `Placeholder` 분리). **유예/인계**: SHOULD-3·NIT-1(레벨 캡션·뒤로가기·체크배지·예문 강조 → UoW-02/03), NIT-4(jest.setup `require` warning → 추후 eslint override 검토). NIT-3(STATUS 표) 반영.

## 5) Unit 완료
### ⏸️ 체크포인트 B — Unit 완료 승인
- [x] 게이트 4종 통과 · [x] code-review 머지 가능
- 결정: ✅ Approved (0eum, 2026-06-09) — 사용자 커밋·푸시 완료
### 커밋 / 푸시 (사용자 수행)
- 제안 메시지: `feat: design system + base components (theme, WordCard, TopBar, ActionButtons) [UoW-01]`
