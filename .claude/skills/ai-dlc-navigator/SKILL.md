---
name: ai-dlc-navigator
description: 사용자가 새 기능이나 요구사항을 자연어로 설명하거나, "지금 뭐 하면 돼", "어디까지 됐어", "다음에 뭐 해야 해", AI-DLC 진행 상황·현재 단계·다음 할 일을 물을 때 사용. ai-dlc/STATUS.md(SSOT)를 읽어 현재 AI-DLC 단계/상태를 파악하고 알맞은 슬래시 커맨드(/ai-dlc, /inception, /construction <unit-id>, /operations)로 안내·연결하는 자연어 진입점.
---

# ai-dlc-navigator — AI-DLC 자연어 진입점

flocons 프로젝트는 **AI-DLC(AI-Driven Development Lifecycle)** 방식으로 진행된다. 실제 단계 작업(요구사항 분석, Unit 구현, 운영)은 모두 슬래시 커맨드(`/ai-dlc`, `/inception`, `/construction <unit-id>`, `/operations`)가 mob을 엮어 수행한다.

이 스킬은 그 커맨드들을 **대체하지 않는다**. 사용자가 기능/요구사항을 자연어로 말하거나 "지금 뭐 하면 돼 / 어디까지 됐어 / 다음에 뭐 해" 같은 진행 상황을 물을 때, 현재 상태를 읽어 **알맞은 커맨드로 안내하고 위임**하는 **자연어 진입점**이다. 안내가 끝나면 실제 작업은 해당 슬래시 커맨드에 맡긴다.

## 절대 준수 — "AI proposes, human disposes"

- 모든 단계/Bolt는 정해진 **체크포인트에서 멈추고 사람 승인을 기다린다.** 임의로 넘기지 않는다.
- 사람 승인 없이 STATUS를 `✅ Approved`로 바꾸지 않는다.
- 이 스킬은 **안내 중심**이며 `ai-dlc/STATUS.md`를 **임의로 변경하지 않는다.** (상태 갱신은 해당 단계 커맨드가 체크포인트 통과 후에 한다.)
- 실제 단계 작업(분석·구현·테스트·리뷰·운영)은 항상 해당 슬래시 커맨드에 **위임**한다. 이 스킬은 직접 코드를 쓰거나 단계를 진행하지 않는다.

## 1단계 — 항상 먼저 STATUS를 읽는다

무엇을 안내하기 전에 **반드시 [ai-dlc/STATUS.md](../../../ai-dlc/STATUS.md)** 를 읽어 현재 단계/상태/대기 중인 체크포인트를 확인한다. STATUS는 진행 상태의 **단일 진실 소스(SSOT)** 다 — 추측하지 말고 항상 이 파일을 신뢰한다.

확인할 항목:
- **현재 단계** (Inception / Construction / Operations)
- **현재 상태** (아래 기호)
- **대기 중인 체크포인트**와 **다음 액션**
- (Construction이면) Unit of Work 진행 표 — 어떤 Unit이 어떤 상태인지

필요하면 보조로 [ai-dlc/README.md](../../../ai-dlc/README.md), [docs/DESIGN.md](../../../docs/DESIGN.md), [docs/ROADMAP.md](../../../docs/ROADMAP.md)(Unit of Work 후보 M0~M12)를 참고한다. 단, 진행 상태의 기준은 언제나 STATUS다.

## 상태 기호 범례 (모든 문서 공통, 그대로 사용)

| 기호 | 상태 | 의미 |
|---|---|---|
| ⬜ | Pending | 대기 — 아직 시작하지 않음 |
| 🔵 | In Progress | 진행 — 작업 중 |
| ⏸️ | Awaiting Approval | 승인 대기 — 산출물 제출 후 사람 결정 대기 |
| ✅ | Approved | 승인됨 — 사람이 구속력 있는 승인을 내림 |
| 🔁 | Changes Requested | 수정 요청 — 사람이 변경을 요구함, 재작업 필요 |

단계 진행 순서: **Inception → Construction → Operations** (순차, 각 단계 끝에 사람 승인 체크포인트).

## 2단계 — 상태 → 권장 커맨드 매핑

STATUS에서 읽은 현재 단계/상태를 아래 표로 매핑해 사용자에게 **다음 액션 한 가지를 명확히 제안**한다.

| 현재 상황 (STATUS 기준) | 권장 커맨드 | 안내 요지 |
|---|---|---|
| 미시작 / Inception ⬜ Pending ("Inception 대기") | [/inception](../../../.claude/commands/inception.md) | 요구사항→유저 스토리→Unit of Work→기술 스택을 산출한다. 끝에서 멈춰 백로그+스택 승인을 요청하며 STATUS를 ⏸️ Awaiting Approval로 둔다. |
| Inception 🔵 In Progress / ⏸️ Awaiting Approval | (대기) — 산출물 검토 후 사람 승인 | 승인 대기 중이면 사람의 결정을 기다린다. 임의로 넘기지 않는다. 🔁 Changes Requested면 산출물을 고쳐 다시 제출(여전히 `/inception` 맥락). |
| Inception ✅ Approved 이후, Unit 구현 단계 | [/construction `<unit-id>`](../../../.claude/commands/construction.md) | 승인된 백로그에서 Unit 하나를 골라 Bolt로 설계→구현→테스트→리뷰. 설계 후(체크포인트 A)·완료 후(체크포인트 B) 두 번 멈춘다. STATUS의 Unit 표에서 ⬜/🔵 Unit을 확인해 `<unit-id>`를 채워 안내한다. |
| Construction 진행 중 (특정 Unit 🔵/⏸️/🔁) | [/construction `<unit-id>`](../../../.claude/commands/construction.md) | 해당 Unit의 Bolt를 이어간다. 체크포인트 A/B에서 멈춰 승인을 기다린다. |
| 모든 Unit ✅ Approved → 운영 단계 | [/operations](../../../.claude/commands/operations.md) | cloud-dev 리드 mob으로 빌드/배포(EAS)·CI·관측성·런북. 실제 인프라/CI 변경은 체크포인트 승인 후에만. |
| 지금 어디인지·다음에 뭘 할지 헷갈릴 때 | [/ai-dlc](../../../.claude/commands/ai-dlc.md) | STATUS를 읽어 현재 단계/상태/대기 체크포인트를 요약하고 다음 커맨드를 제안. **읽기 전용**. |

### 사용자가 새 기능/요구사항을 자연어로 말한 경우

1. 먼저 STATUS를 읽어 현재 단계를 확인한다.
2. **Inception이 아직 ✅ Approved 되지 않았다면** → 그 기능/요구사항을 정식으로 다루는 진입점은 `/inception`이다(요구사항→유저 스토리→Unit of Work로 풀어낸다). `/inception` 실행을 안내한다.
3. **Inception이 ✅ Approved 되어 Construction 중이라면** → 그 기능이 기존 Unit of Work에 해당하는지 STATUS의 Unit 표/[docs/ROADMAP.md](../../../docs/ROADMAP.md) 후보로 살펴보고, 해당 `<unit-id>`로 `/construction <unit-id>`를 안내한다. 기존 백로그에 없는 새 범위라면 임의로 추가하지 말고, 백로그 변경은 사람 승인이 필요하므로 `/inception` 재검토 또는 `/ai-dlc`로 현재 위치 확인을 제안한다.
4. **운영/배포/CI 관련 요청이면** → `/operations`를 안내한다.
5. 어느 쪽인지 모호하면 `/ai-dlc`(읽기 전용 현재 위치 점검)부터 안내한다.

## 3단계 — 위임

- 안내 메시지에는 (1) 지금 STATUS상 어디인지(단계+상태 기호), (2) 대기 중인 체크포인트, (3) **다음에 실행할 정확한 슬래시 커맨드**(필요 시 `<unit-id>` 포함)를 담는다.
- 실제 단계 작업은 그 커맨드가 수행한다. 이 스킬은 STATUS를 바꾸거나 체크포인트를 넘기거나 코드를 작성하지 않는다.
- 상태 기호(⬜🔵⏸️✅🔁)·단계명(Inception / Construction / Operations)·에이전트 name·커맨드 슬래시 표기는 기존 자산과 **정확히 일치**시켜 사용한다.

> 요약: **STATUS를 읽고 → 상태에 맞는 슬래시 커맨드를 안내하고 → 위임한다.** 승인은 사람 몫이며, 이 스킬은 그 흐름을 자연어로 잇는 길잡이일 뿐이다.
