# Inception — 구상 단계

> AI-DLC 3단계 중 **첫 단계**. 무엇을 만들지/왜 만드는지를 합의하고, 독립적으로 설계·구현·테스트할 수 있는 **Unit of Work** 단위로 쪼갠 뒤, 아키텍처와 기술 스택을 확정한다.
> 핵심 원칙 **"AI proposes, human disposes"**: 에이전트는 요구사항·스토리·Unit 백로그·아키텍처를 *제안*하고, 사람은 단계 끝 체크포인트에서 *구속력 있는 결정*을 내린다.

근거 문서(작업 전 반드시 읽기): [docs/DESIGN.md](../../docs/DESIGN.md) · [docs/ROADMAP.md](../../docs/ROADMAP.md) · [docs/HARNESS.md](../../docs/HARNESS.md)

---

## 이 단계가 하는 일

요구사항/의도 파악 → 유저 스토리 → Unit of Work 식별 → 아키텍처/기술 스택 확정 → 리스크 식별.
산출물은 다음 단계인 **Construction**의 입력이 된다. 각 Unit은 Construction에서 [/construction](../../.claude/commands/construction.md) 커맨드로 Bolt(시간-압축 반복 사이클)를 돈다.

## Mob 구성 (이 단계)

- **app-pm** — 리드. 요구사항·유저 스토리·Unit of Work 정의, 우선순위·스코프 관리.
- **back-dev** — 앱 로직/서비스 계층 관점(ContentProvider, AI 통합, SRS, lib/, 상태 스토어)의 실현가능성 의견.
- **front-dev** — UI/제스처/내비/테마/접근성 관점의 실현가능성 의견.
- **db-dev** — 로컬 영속화·데이터 스키마·시드 데이터셋 관점의 의견.
- **cloud-dev** — 빌드/배포·CI·관측성·향후 동기화 관점의 아키텍처/실현가능성 의견.
- **code-review** — 계획(요구사항·Unit 분해·아키텍처 결정)을 리뷰. 코드를 작성하지 않고 정확성·단순화·일관성을 지적.

## 산출물 4종

이 폴더는 [/inception](../../.claude/commands/inception.md) 커맨드가 채운다. 각 템플릿을 복사/채워 다음 파일을 만든다.

| # | 산출물 | 템플릿 | 내용 |
|---|---|---|---|
| 1 | 요구사항 | [01-requirements.template.md](01-requirements.template.md) | 목표/비목표/제약/가정/리스크 |
| 2 | 유저 스토리 | [02-user-stories.template.md](02-user-stories.template.md) | "...로서 ...하고 싶다, 그래서 ..." + 수용 기준(Given/When/Then) |
| 3 | Unit of Work 백로그 | [03-units-of-work.template.md](03-units-of-work.template.md) | ID/이름/설명/의존성/담당 mob 리드/수용기준/상태 |
| 4 | 아키텍처 결정 | [04-architecture-decision.template.md](04-architecture-decision.template.md) | ADR(맥락/결정/대안/결과) + 기술 스택 확정 근거 |

기술 스택의 단일 진실 소스는 [ai-dlc/00-tech-stack.md](../00-tech-stack.md)다. ADR은 그 결정의 *근거*를 기록한다.

## 진행 방식

1. app-pm 리드 mob이 위 4종을 *제안*으로 작성한다.
2. code-review가 계획을 리뷰한다.
3. 마지막에 **반드시 멈추고** 사람에게 **Unit of Work 백로그 + 기술 스택 승인**을 요청한다.
4. 이때 [ai-dlc/STATUS.md](../STATUS.md)의 Inception 상태를 `⏸️ Awaiting Approval`로 둔다.
5. 사람이 승인하면 `✅ Approved`로 바꾸고 Construction으로 진행한다. **승인 전에는 Construction으로 넘어가지 않는다.**

## 승인 체크포인트

> ⏸️ **Inception 종료 체크포인트** — 사람이 다음 두 가지를 승인해야 단계가 닫힌다.
> 1. **Unit of Work 백로그** (03-units-of-work) — 범위·우선순위·분해 단위
> 2. **기술 스택 + 아키텍처 결정** (00-tech-stack + 04-architecture-decision)
>
> 수정 요청이 있으면 STATUS를 `🔁 Changes Requested`로 두고 해당 산출물을 갱신한 뒤 다시 승인을 요청한다.

상태 기호: ⬜ Pending · 🔵 In Progress · ⏸️ Awaiting Approval · ✅ Approved · 🔁 Changes Requested.
