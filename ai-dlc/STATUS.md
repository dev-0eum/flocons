# AI-DLC 진행 보드 (STATUS)

> flocons 프로젝트의 AI-DLC 진행 상태에 대한 **단일 진실 소스(SSOT)** 다.
> 단계·Unit·체크포인트의 현재 상태는 항상 이 파일에서 확인한다. 상태가 바뀌면 이 파일을 먼저 갱신한다.
> 관련: [README](README.md) · [기술 스택](00-tech-stack.md) · [설계](../docs/DESIGN.md) · [로드맵](../docs/ROADMAP.md) · [하네스](../docs/HARNESS.md)

> ℹ️ **2026-06-09 `.git` 손상 사고**: 미커밋 작업(Inception 산출물 + UoW-00 스캐폴드)이 유실되어 재클론 후 재구성함. 내용은 사고 전 승인본과 동일하며, 검증 게이트는 재실행으로 재확인. **교훈: 각 Unit 완료 즉시 커밋한다.**

---

## 현재 위치 (한눈에)

| 항목 | 값 |
|---|---|
| **현재 단계** | Construction |
| **현재 상태** | ⏸️ Awaiting Approval — `UoW-12-expand`(마지막 Unit) 완료 승인(체크포인트 B) 대기 |
| **대기 중인 체크포인트** | `UoW-12-expand` **완료 승인 (체크포인트 B)** — 승인 시 **Construction 단계 완료** |
| **다음 액션** | 체크포인트 B 승인 → STATUS ✅(Unit+Construction) → 커밋 → Operations (`/operations`) |

> 원칙: **AI proposes, human disposes.** 모든 단계는 체크포인트에서 멈추고 사람 승인을 기다린다.

---

## 상태 기호 범례

| 기호 | 상태 | 의미 |
|---|---|---|
| ⬜ | Pending | 대기 — 아직 시작하지 않음 |
| 🔵 | In Progress | 진행 — 작업 중 |
| ⏸️ | Awaiting Approval | 승인 대기 — 산출물 제출 후 사람 결정 대기 |
| ✅ | Approved | 승인됨 — 사람이 구속력 있는 승인을 내림 |
| 🔁 | Changes Requested | 수정 요청 — 재작업 필요 |

단계 진행 순서: **Inception → Construction → Operations**.

---

## 단계별 상태

| 단계 | 상태 | 리드 mob | 마지막 갱신 | 승인자 |
|---|---|---|---|---|
| Inception | ✅ Approved | app-pm | 2026-06-09 | 0eum |
| Construction | 🔵 In Progress | Unit 성격별 (UI→front-dev / 로직→back-dev / 데이터→db-dev) | 2026-06-09 | — |
| Operations | ⬜ Pending | cloud-dev | (미정) | (미정) |

---

## Construction — Unit of Work 진행

> ✅ **Inception 승인됨 (2026-06-09).** 확정 Unit 백로그 — [inception/03-units-of-work.md](inception/03-units-of-work.md). 각 Unit은 [/construction `<unit-id>`](../.claude/commands/construction.md)로 Bolt(체크포인트 A 설계 · B 완료)를 돈다.

| Unit ID | 제목 | 리드 | 상태 | 기록 | 마지막 갱신 | 승인자 |
|---|---|---|---|---|---|---|
| UoW-00-scaffold | 스캐폴드 & 툴링 | back-dev | ✅ Approved | [기록](construction/UoW-00-scaffold.md) | 2026-06-09 | 0eum |
| UoW-01-design-system | 디자인 시스템 & 베이스 컴포넌트 | front-dev | ✅ Approved | [기록](construction/UoW-01-design-system.md) | 2026-06-09 | 0eum |
| UoW-02-content-layer | 콘텐츠 계층 + A1 정적 데이터셋 | db-dev (+content-gen) | ✅ Approved | [기록](construction/UoW-02-content-layer.md) | 2026-06-09 | 0eum |
| UoW-03-learn-deck | 학습 덱 화면(스와이프) | front-dev | ✅ Approved | [기록](construction/UoW-03-learn-deck.md) | 2026-06-09 | 0eum |
| UoW-04-tts | 발음(expo-speech fr-FR) | back-dev | ✅ Approved | [기록](construction/UoW-04-tts.md) | 2026-06-09 | 0eum |
| UoW-05-srs | SRS Leitner + 영속화 | back-dev (+db-dev) | ✅ Approved | [기록](construction/UoW-05-srs.md) | 2026-06-10 | 0eum |
| UoW-06-review-stats | 복습 큐 + 통계 | front-dev (+back-dev) | ✅ Approved | [기록](construction/UoW-06-review-stats.md) | 2026-06-10 | 0eum |
| UoW-07-bookmarks | 북마크 토글/목록 | front-dev (+db-dev) | ✅ Approved | [기록](construction/UoW-07-bookmarks.md) | 2026-06-10 | 0eum |
| UoW-08-settings-keys | 설정 + 키 입력(secure-store) | front-dev (+back/db-dev) | ✅ Approved | [기록](construction/UoW-08-settings-keys.md) | 2026-06-10 | 0eum |
| UoW-09-ai-provider | AIContentProvider(Anthropic) + 폴백 | back-dev | ✅ Approved | [기록](construction/UoW-09-ai-provider.md) | 2026-06-11 | 0eum |
| UoW-10-images | 플레이스홀더 + AIImageProvider | back-dev (+content-gen) | ✅ Approved | [기록](construction/UoW-10-images.md) | 2026-06-11 | 0eum |
| UoW-11-onboarding-polish | 온보딩 + 햅틱/접근성 | front-dev | ✅ Approved | [기록](construction/UoW-11-onboarding-polish.md) | 2026-06-11 | 0eum |
| UoW-12-expand | A2/B1 확장 + README | db-dev (+content-gen) | 🔵 In Progress | [기록](construction/UoW-12-expand.md) | 2026-06-11 | — |

> UoW-00은 검증 게이트 4종(typecheck/lint/test/expo export) green + code-review 머지가능으로 ✅. **커밋·푸시는 사용자가 직접 수행**(`.git` 사고 후 정책).

---

## 대기 중인 체크포인트

| 단계 | 체크포인트 | 상태 | 설명 |
|---|---|---|---|
| Construction | UoW-12 설계 승인 (체크포인트 A) | ✅ Approved (2026-06-11) | Q-N1~N4 권장값대로 승인 — A2/B1 각 60개(content-gen), README, 커버리지 점검, SQLite 이관 보류. |
| Construction | UoW-12 완료 승인 (체크포인트 B) | ⏸️ Awaiting Approval | A2/B1 185단어·README·커버리지(93.5%/84%/97%/96.3%)·SQLite 보류 결론. 게이트 4종 green(33 suites/165 tests), code-review 머지 가능(콘텐츠 3건 수정 반영). **승인 시 Construction 완료.** |

> Inception은 ✅ 승인 완료(2026-06-09). 이후 각 Unit은 체크포인트 A·B에서 사람 승인.

---

## 의사결정 로그

| 날짜 | 단계 | 결정 | 승인자 |
|---|---|---|---|
| 2026-06-09 | Inception | Unit of Work 백로그(UoW-00~12) + 기술 스택 + ADR-001~010 승인. **Q1**=스와이프 좌(알고있어요)/우(학습할게요), **Q2**=expo-haptics 채택, **Q4**=데이터 초기화는 학습 데이터만(키 별도). | 0eum |
| 2026-06-09 | Inception(후속) | **Q3**=레이아웃 `(tabs)`+풀스크린 혼합(ADR-008), **Q5**=Anthropic 클라이언트 택일을 UoW-09에서 Context7 확인 후(ADR-009), **Q6**=이미지 2단계 분리, **Q7**=branch protection은 Operations로. | 0eum |
| 2026-06-09 | Construction(스택) | **Expo SDK 56 → 55 다운그레이드**(ADR-010): SDK56이 막 릴리스돼 iOS Expo Go 미지원 → 55.0.26 정렬. 개발 대상 **iOS만**(android 제거), web=개발 미리보기, 배포 타깃=RN/iOS(Operations). | 0eum |
| 2026-06-09 | Construction | **UoW-00-scaffold ✅ 완료** (체크포인트 B). 게이트 4종 green, code-review 머지가능. (`.git` 사고로 재구성 후 게이트 재확인.) 커밋·푸시는 사용자 수행. 다음: `UoW-01`. | 0eum |
| 2026-06-09 | Construction | **UoW-01-design-system ✅ 완료** (체크포인트 B). 테마 토큰 + 베이스 컴포넌트 5종(props-only), 게이트 4종 green(test 14/14), code-review Approved. 사용자 푸시 완료. 다음: `UoW-02-content-layer`. | 0eum |
| 2026-06-09 | Construction | **UoW-02-content-layer ✅ 완료** (체크포인트 B). Word/CardState 타입 + ContentProvider/StaticContentProvider + validateWords + A1 65단어. 게이트 4종 green(test 25/25), code-review Approved. 사용자 푸시 완료. 다음: `UoW-03-learn-deck`. | 0eum |
| 2026-06-09 | Construction | **UoW-03-learn-deck ✅ 완료** (체크포인트 B, `0d9079a`). 스와이프 카드(reanimated 4+gesture)·덱 reducer·/learn 조립. 게이트 4종 green(test 32/32), code-review Approved. 사용자 푸시 완료. 다음: `UoW-04-tts`. | 0eum |
| 2026-06-09 | Construction | **UoW-04-tts ✅ 완료** (체크포인트 B, `10345f3`). lib/tts(expo-speech fr-FR) + /learn 발음 버튼 배선. 게이트 4종 green(test 35/35), code-review Approved. 사용자 푸시 완료. 다음: `UoW-05-srs`. | 0eum |
| 2026-06-10 | Construction | **UoW-05-srs ✅ 완료** (체크포인트 B, `ebfb1ab` — 사용자 직접 커밋). leitner 순수 엔진 + cardStore + /learn 배선. **zustand 제거**(v5 타입이 tsc 무한 추론 유발) → 모듈 상태+subscribe로 대체(ADR-002 수정, 사용자 결정 A). 게이트 4종 green 재확인(2026-06-10, test 52/52). code-review 에이전트 리뷰는 사용자 결정으로 생략. iCloud `.nosync` 환경 구성(tsconfig preserveSymlinks·jest roots 등) 포함. 다음: `UoW-06-review-stats`. | 0eum |
| 2026-06-10 | Construction | **UoW-06-review-stats ✅ 완료** (체크포인트 B, `e99b644` — 사용자 커밋·푸시). /review due 큐 + /stats(streak·단어 수·진척) + studyLog 영속 + DeckSession 추출. 게이트 4종 green(test 85/85), code-review 머지 가능(블로커 0). 환경: iCloud 충돌 루프로 `.nosync` 심볼릭 링크 폐기 → 실제 node_modules 복원(근본 해결은 프로젝트 iCloud 밖 이동 — 제안됨). 다음: `UoW-07-bookmarks`. | 0eum |
| 2026-06-10 | Construction | **UoW-07-bookmarks ✅ 완료** (체크포인트 B, `476af6f` — 사용자 커밋·푸시). 북마크 토글(DeckSession 배선)·/bookmarks 목록·`/review?mode=bookmarks` 복습. due 판정에 `reps>0` 추가(Q-H3). 게이트 4종 green(test 100/100), code-review 머지 가능(블로커 0). 다음: `UoW-08-settings-keys`. | 0eum |
| 2026-06-10 | Construction | **UoW-08-settings-keys ✅ 완료** (체크포인트 B, `4178df0` — 사용자 커밋·푸시). /settings(속도·레벨·키 입력·초기화) + secureKeys(secure-store 유일 접점) + settingsStore(hasKey 비직렬화·파생) + selectProvider 골격. colors.danger 토큰 추가(리뷰 반영). 게이트 4종 green(test 120/120), code-review 머지 가능(보안 검증 — 키 유출 경로 없음). 이월: /settings 진입 트리거(UoW-11). 다음: `UoW-09-ai-provider`. | 0eum |
| 2026-06-11 | Construction | **UoW-09-ai-provider ✅ 완료** (체크포인트 B, `95adc04` — 사용자 커밋·푸시). @anthropic-ai/sdk 0.104(ADR-009 확정, 모델 claude-haiku-4-5) + AnthropicEnrichClient(구조화 출력, fetch 주입) + AIContentProvider(캐시 ADR-006, 전실패 Static 폴백) + 4개 화면 currentProvider() 전환. SDK의 node:* 참조로 Metro 번들 실패 → metro.config.js origin 스코프 스텁(리뷰어 소스 검증). 게이트 4종 green(test 131/131), code-review 머지 가능(블로커 0). 다음: `UoW-10-images`. | 0eum |
| 2026-06-11 | Construction | **UoW-10-images ✅ 완료** (체크포인트 B, `f29440d` — 사용자 커밋·푸시). 카테고리 플레이스홀더(imagePalette 8색·tags 해시·이니셜) + AIImageProvider 골격(해상 순서·URL 캐시·전실패 폴백, 실벤더 보류 Q-K1). 게이트 4종 green(test 143/143), code-review 머지 가능(블로커 0). 다음: `UoW-11-onboarding-polish`. | 0eum |
| 2026-06-11 | Construction | **UoW-11-onboarding-polish ✅ 완료** (체크포인트 B, `710cfee` — 사용자 커밋·푸시). 홈(진척·due·설정 진입)·온보딩(1페이지+영속 플래그)·레벨 연동(useWords)·햅틱(expo-haptics)·a11y 커스텀 액션·완료 액션·enrich ↻ UI — 이월 3건 흡수. 게이트 4종 green(test 155/155), code-review 머지 가능(블로커 0, 권고 3건 반영). 후속 백로그: SR play/bookmark 액션. 다음: `UoW-12-expand`(마지막). | 0eum |
