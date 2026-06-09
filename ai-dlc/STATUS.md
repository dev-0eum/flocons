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
| **현재 상태** | 🔵 In Progress — `UoW-00-scaffold` ✅ 완료, 다음 Unit 대기 |
| **대기 중인 체크포인트** | `UoW-01-design-system` 설계 승인 (체크포인트 A) |
| **다음 액션** | `/construction UoW-01-design-system` · (선행: UoW-00 커밋·푸시는 사용자가 수행) |

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
| UoW-01-design-system | 디자인 시스템 & 베이스 컴포넌트 | front-dev | ⬜ Pending | — | — | — |
| UoW-02-content-layer | 콘텐츠 계층 + A1 정적 데이터셋 | db-dev (+content-gen) | ⬜ Pending | — | — | — |
| UoW-03-learn-deck | 학습 덱 화면(스와이프) | front-dev | ⬜ Pending | — | — | — |
| UoW-04-tts | 발음(expo-speech fr-FR) | back-dev | ⬜ Pending | — | — | — |
| UoW-05-srs | SRS Leitner + 영속화 | back-dev (+db-dev) | ⬜ Pending | — | — | — |
| UoW-06-review-stats | 복습 큐 + 통계 | front-dev (+back-dev) | ⬜ Pending | — | — | — |
| UoW-07-bookmarks | 북마크 토글/목록 | front-dev (+db-dev) | ⬜ Pending | — | — | — |
| UoW-08-settings-keys | 설정 + 키 입력(secure-store) | front-dev (+back/db-dev) | ⬜ Pending | — | — | — |
| UoW-09-ai-provider | AIContentProvider(Anthropic) + 폴백 | back-dev | ⬜ Pending | — | — | — |
| UoW-10-images | 플레이스홀더 + AIImageProvider | back-dev (+content-gen) | ⬜ Pending | — | — | — |
| UoW-11-onboarding-polish | 온보딩 + 햅틱/접근성 | front-dev | ⬜ Pending | — | — | — |
| UoW-12-expand | A2/B1 확장 + README | db-dev (+content-gen) | ⬜ Pending | — | — | — |

> UoW-00은 검증 게이트 4종(typecheck/lint/test/expo export) green + code-review 머지가능으로 ✅. **커밋·푸시는 사용자가 직접 수행**(`.git` 사고 후 정책).

---

## 대기 중인 체크포인트

| 단계 | 체크포인트 | 상태 | 설명 |
|---|---|---|---|
| Construction | UoW-01 설계 승인 (체크포인트 A) | ⬜ Pending | `/construction UoW-01-design-system` 실행 시 논리 설계를 제안하고 체크포인트 A에서 멈춰 승인을 요청. 이후 구현→게이트→체크포인트 B. |

> Inception은 ✅ 승인 완료(2026-06-09). 이후 각 Unit은 체크포인트 A·B에서 사람 승인.

---

## 의사결정 로그

| 날짜 | 단계 | 결정 | 승인자 |
|---|---|---|---|
| 2026-06-09 | Inception | Unit of Work 백로그(UoW-00~12) + 기술 스택 + ADR-001~010 승인. **Q1**=스와이프 좌(알고있어요)/우(학습할게요), **Q2**=expo-haptics 채택, **Q4**=데이터 초기화는 학습 데이터만(키 별도). | 0eum |
| 2026-06-09 | Inception(후속) | **Q3**=레이아웃 `(tabs)`+풀스크린 혼합(ADR-008), **Q5**=Anthropic 클라이언트 택일을 UoW-09에서 Context7 확인 후(ADR-009), **Q6**=이미지 2단계 분리, **Q7**=branch protection은 Operations로. | 0eum |
| 2026-06-09 | Construction(스택) | **Expo SDK 56 → 55 다운그레이드**(ADR-010): SDK56이 막 릴리스돼 iOS Expo Go 미지원 → 55.0.26 정렬. 개발 대상 **iOS만**(android 제거), web=개발 미리보기, 배포 타깃=RN/iOS(Operations). | 0eum |
| 2026-06-09 | Construction | **UoW-00-scaffold ✅ 완료** (체크포인트 B). 게이트 4종 green, code-review 머지가능. (`.git` 사고로 재구성 후 게이트 재확인.) 커밋·푸시는 사용자 수행. 다음: `UoW-01`. | 0eum |
