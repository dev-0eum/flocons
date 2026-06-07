# AI-DLC 진행 보드 (STATUS)

> flocons 프로젝트의 AI-DLC 진행 상태에 대한 **단일 진실 소스(SSOT)** 다.
> 단계·Unit·체크포인트의 현재 상태는 항상 이 파일에서 확인한다. 상태가 바뀌면 이 파일을 먼저 갱신한다.
> 관련: [README](README.md) · [기술 스택](00-tech-stack.md) · [설계](../docs/DESIGN.md) · [로드맵](../docs/ROADMAP.md) · [하네스](../docs/HARNESS.md)

---

## 현재 위치 (한눈에)

| 항목 | 값 |
|---|---|
| **현재 단계** | Inception |
| **현재 상태** | ⬜ Pending — **"Inception 대기"** |
| **대기 중인 체크포인트** | Inception 시작 대기 (아직 어떤 단계도 시작/승인되지 않음) |
| **다음 액션** | `/inception` 실행 |

> 원칙: **AI proposes, human disposes.** 모든 단계는 체크포인트에서 멈추고 사람 승인을 기다린다. 승인 전에는 다음 단계로 넘어가지 않으며 STATUS를 ✅ Approved로 바꾸지 않는다.

---

## 상태 기호 범례

| 기호 | 상태 | 의미 |
|---|---|---|
| ⬜ | Pending | 대기 — 아직 시작하지 않음 |
| 🔵 | In Progress | 진행 — 작업 중 |
| ⏸️ | Awaiting Approval | 승인 대기 — 산출물 제출 후 사람 결정 대기 |
| ✅ | Approved | 승인됨 — 사람이 구속력 있는 승인을 내림 |
| 🔁 | Changes Requested | 수정 요청 — 사람이 변경을 요구함, 재작업 필요 |

단계 진행 순서: **Inception → Construction → Operations** (순차, 각 단계 끝에 사람 승인 체크포인트).

---

## 단계별 상태

| 단계 | 상태 | 리드 mob | 마지막 갱신 | 승인자 |
|---|---|---|---|---|
| Inception | ⬜ Pending | app-pm | (미정) | (미정) |
| Construction | ⬜ Pending | Unit 성격별 (UI→front-dev / 로직→back-dev / 데이터→db-dev) | (미정) | (미정) |
| Operations | ⬜ Pending | cloud-dev | (미정) | (미정) |

> 날짜 표기: 실제 갱신/승인이 일어나면 `YYYY-MM-DD` 형식으로 기록한다.

---

## Construction — Unit of Work 진행

> ⚠️ **아직 Inception이 승인되지 않아 확정된 Unit of Work가 없다.** 아래 표의 본문은 비어 있다.
> 실제 Unit 목록·범위는 `/inception` 산출물(`inception/03-units-of-work.template.md`)을 사람이 승인하면 이 표에 채워진다.

| Unit ID | 제목 | 리드 | 상태 | 기록 | 마지막 갱신 | 승인자 |
|---|---|---|---|---|---|---|
| _(승인 후 채워짐)_ | — | — | — | — | — | — |

### UoW 후보 (회색/예시 — 미확정, 승인 전까지 행으로 추가하지 않음)

> 아래는 [로드맵](../docs/ROADMAP.md) M0~M12에서 도출한 **출발점 후보**일 뿐이며, 확정은 `/inception`에서 사람 승인으로 한다.

- `UoW-00-scaffold` — 스캐폴드 & 툴링 (M0)
- `UoW-01-design-system` — 디자인 시스템 & 베이스 컴포넌트 (M1)
- `UoW-02-content-layer` — 콘텐츠 계층 + 정적 데이터셋 (M2)
- `UoW-03-learn-deck` — 학습 덱 화면 (M3)
- `UoW-04-tts` — 발음(TTS) (M4)
- `UoW-05-srs` — SRS 엔진 + 영속화 (M5)
- `UoW-06-review-stats` — 복습 화면 + 통계 (M6)
- `UoW-07-bookmarks` — 북마크 (M7)
- `UoW-08-settings-keys` — 설정 & API 키 입력 (M8)
- `UoW-09-ai-provider` — AIContentProvider (M9)
- `UoW-10-images` — 이미지 (M10)
- `UoW-11-onboarding-polish` — 온보딩 & 폴리시 (M11)
- `UoW-12-expand` — 확장 & 마감 (M12)

---

## 대기 중인 체크포인트

| 단계 | 체크포인트 | 상태 | 설명 |
|---|---|---|---|
| Inception | 시작 대기 | ⬜ Pending | 아직 Inception을 시작하지 않았다. **다음 액션: `/inception` 실행** → 요구사항·유저 스토리·Unit of Work·기술 스택을 산출하고, 끝에서 멈춰 **Unit of Work 백로그 + 기술 스택 승인**을 요청한다(STATUS를 ⏸️ Awaiting Approval로 전환). |

> Inception 산출물 승인 체크포인트 = 사람이 **Unit of Work 백로그 + 기술 스택**을 승인. 승인 전 Construction으로 진행 금지.

---

## 의사결정 로그

> 체크포인트에서 사람이 내린 구속력 있는 결정을 시간순으로 기록한다. 아직 결정 없음.

| 날짜 | 단계 | 결정 | 승인자 |
|---|---|---|---|
| (미정) | — | _(아직 결정 없음)_ | (미정) |
