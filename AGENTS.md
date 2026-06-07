# flocons — AI-DLC 작업 가이드 (AGENTS.md)

> **flocons** = 한국어 모어 화자를 위한 프랑스어 단어 학습 모바일 앱 (Expo / React Native + TypeScript).
> 스와이프형 단어 카드 + 간격반복(SRS, Leitner) + 무료 온디바이스 발음(expo-speech, fr-FR).
> 콘텐츠는 키가 없으면 번들 정적 데이터셋(StaticContentProvider), 키가 있으면 AI 생성(AIContentProvider)으로 동작하고 실패 시 정적으로 폴백한다.

이 문서는 Claude Code 에이전트가 flocons 리포지토리에서 **AI-DLC(AI-Driven Development Lifecycle)** 방식으로 작업할 때의 **정본 운영 규칙(SSOT)** 이다. 작업 전 항상 아래 포인터를 근거로 삼아라.

## 포인터 (먼저 읽어라)

- 제품/아키텍처 설계 (SSOT): [docs/DESIGN.md](docs/DESIGN.md)
- 로드맵 / 마일스톤 (Unit of Work 후보): [docs/ROADMAP.md](docs/ROADMAP.md)
- 자율 개발 운영 매뉴얼 (검증 게이트·커밋·푸시): [docs/HARNESS.md](docs/HARNESS.md)
- AI-DLC 작업공간 개요: [ai-dlc/README.md](ai-dlc/README.md)
- **진행 상태 단일 진실 소스(SSOT)**: [ai-dlc/STATUS.md](ai-dlc/STATUS.md)
- 확정 기술 스택: [ai-dlc/00-tech-stack.md](ai-dlc/00-tech-stack.md)

## AI-DLC 진행 규칙

### 3단계 (순차, 각 단계 끝에 사람 승인 체크포인트)

```
Inception  →  Construction  →  Operations
 (구상)        (구축, Bolt)      (운영)
```

- **Inception(구상)**: 요구사항/의도 → 유저 스토리 → Unit of Work 식별 → 아키텍처/기술 스택 확정 → 리스크 식별. 산출물 = Unit of Work 백로그 + 아키텍처 결정.
- **Construction(구축)**: 각 Unit of Work를 **Bolt**(시간-압축 반복 사이클: 논리 설계 → 구현 → 테스트 → 리뷰)로 돈다.
- **Operations(운영)**: 빌드/배포(EAS), CI/CD, IaC, 관측성, 런북.

### 핵심 원칙 — "AI proposes, human disposes"

에이전트는 계획·옵션·코드를 **제안**하고, 사람은 체크포인트에서 **구속력 있는 결정**을 내린다.

- 모든 단계/Bolt는 정해진 체크포인트에서 **반드시 멈추고** 사람 승인을 기다린다.
- 승인 전에는 다음 단계로 진행하지 않으며, STATUS를 `✅ Approved`로 바꾸지 않는다.
- 승인 대기 중에는 STATUS를 `⏸️ Awaiting Approval`로 둔다.

### STATUS는 진행 상태의 단일 진실 소스

현재 어느 단계인지, 무엇이 대기 중인지, 다음에 무엇을 할지는 항상 [ai-dlc/STATUS.md](ai-dlc/STATUS.md)에서 읽는다. 단계가 진척되거나 체크포인트를 통과하면 STATUS를 먼저 갱신한다.

**상태 기호** (모든 문서 공통):

| 기호 | 상태 |
|---|---|
| ⬜ | Pending (대기) |
| 🔵 | In Progress (진행) |
| ⏸️ | Awaiting Approval (승인 대기) |
| ✅ | Approved (승인됨) |
| 🔁 | Changes Requested (수정 요청) |

> 초기 상태: 전체 프로젝트는 "Inception 대기" — Inception / Construction / Operations 모두 `⬜ Pending`. 아직 어떤 단계도 시작/승인되지 않았다.

### 어떤 상황에 어떤 슬래시 커맨드를 쓰는가

| 상황 | 커맨드 | 동작 |
|---|---|---|
| 지금 어디인지·다음에 뭘 할지 모를 때 | [/ai-dlc](.claude/commands/ai-dlc.md) | STATUS를 읽어 현재 단계/상태/대기 체크포인트를 요약하고 다음 커맨드를 제안. **읽기 전용** (파일 변경 없음). |
| Inception을 시작/진행할 때 | [/inception](.claude/commands/inception.md) | app-pm 리드 mob으로 요구사항→유저 스토리→Unit of Work→기술 스택 확정. 산출물은 `ai-dlc/inception/`. 마지막에 멈추고 백로그+스택 승인 요청, STATUS를 `⏸️ Awaiting Approval`로. |
| 승인된 Unit 하나를 구현할 때 | [/construction `<unit-id>`](.claude/commands/construction.md) | 해당 Unit을 Bolt로 설계→구현→테스트→리뷰. 기록은 `ai-dlc/construction/<unit-id>.md`. 설계 후(체크포인트 A)와 완료 후(체크포인트 B) 두 번 멈춘다. |
| 인프라/CI/관측성을 다룰 때 | [/operations](.claude/commands/operations.md) | cloud-dev 리드 mob. 산출물은 `ai-dlc/operations/`. 실제 변경은 체크포인트 승인 후. |

## 단계별 Mob 연결

Mob = 사람 + 여러 전문 AI 에이전트가 한 작업을 다관점으로 협업하는 단위. 에이전트는 [.claude/agents/](.claude/agents/)에 정의되어 있다.

| 단계 | 리드 | 멤버 | 승인 체크포인트 |
|---|---|---|---|
| **Inception** | `app-pm` | `app-pm` + `back-dev` + `front-dev` + `db-dev` + `cloud-dev`(아키텍처/실현가능성 의견). `code-review`가 계획 리뷰. | 사람이 Unit of Work 백로그 + 기술 스택 승인 |
| **Construction** (Unit별) | Unit 성격에 따라 결정 (UI → `front-dev`, 로직/서비스 → `back-dev`, 데이터/영속화 → `db-dev`) | 리드 + 관련 dev 에이전트 + `qa-dev`(테스트) + `code-review`(리뷰 게이트) | 체크포인트 A(설계 승인), 체크포인트 B(Unit 완료 승인) |
| **Operations** | `cloud-dev` | `cloud-dev` + `qa-dev` + `code-review` + 필요 시 `back-dev` | 실제 인프라/CI 변경 전 사람 승인 |

**에이전트 로스터** (정확한 name으로만 지칭):
`app-pm` · `back-dev` · `front-dev` · `db-dev` · `cloud-dev` · `qa-dev` · `code-review`

## 검증 게이트 / 커밋·푸시

검증 게이트와 커밋·푸시 규약은 [docs/HARNESS.md](docs/HARNESS.md)를 따른다.

- Bolt의 테스트 단계와 Unit 완료(체크포인트 B) 전, 아래 게이트를 **순서대로 모두 통과**해야 한다:
  ```
  npm run typecheck   # tsc --noEmit
  npm run lint        # eslint
  npm run test        # jest
  npx expo export     # UI/번들 영향 시 추가
  ```
- 하나라도 실패하면 **커밋/푸시 금지** — 통과할 때까지 수정에 집중한다. 게이트를 우회/완화하지 않는다.
- 커밋·푸시는 체크포인트 B 승인 후, [docs/HARNESS.md](docs/HARNESS.md) §4 규약(Conventional Commits + 트레일러)대로 한다.

## 스킬 (Skills)

프로젝트 전용 스킬은 [.claude/skills/](.claude/skills/)에 정의되어 있다. 아래 상황에서 자동 발동하며, 슬래시 커맨드를 **대체하지 않고 보완**한다.

| 스킬 | 목적 | 발동 시점 | 경로 |
|---|---|---|---|
| `flocons-content` | 프랑스어 단어 카드 콘텐츠를 정규 JSON 스키마로 **생성·검증**한다 (db-dev 시드 데이터셋 구축, AIContentProvider 프롬프트 설계에 재사용). | 프랑스어 단어/예문/카드 콘텐츠를 만들거나, 시드 데이터셋(JSON)을 추가/검증하거나, AIContentProvider용 콘텐츠 생성 프롬프트를 작성할 때. | [.claude/skills/flocons-content/SKILL.md](.claude/skills/flocons-content/SKILL.md) |
| `ai-dlc-navigator` | [ai-dlc/STATUS.md](ai-dlc/STATUS.md)(SSOT)를 읽어 현재 AI-DLC 단계/상태를 파악하고 알맞은 슬래시 커맨드로 안내·연결하는 **자연어 진입점**. | 사용자가 새 기능/요구사항을 설명하거나 AI-DLC 진행 상황·다음 할 일("지금 뭐 하면 돼/어디까지 됐어")을 물을 때. | [.claude/skills/ai-dlc-navigator/SKILL.md](.claude/skills/ai-dlc-navigator/SKILL.md) |

- `flocons-content`는 정규 Word 스키마([docs/DESIGN.md](docs/DESIGN.md) §4 근거)와 프랑스어 정확성 규칙(관사-성 일치, 엘리지옹, 품사 태그), 한국어 번역 규약을 따라 스키마를 만족하는 JSON 배열을 만들고, 부속 스크립트 [.claude/skills/flocons-content/scripts/validate.mjs](.claude/skills/flocons-content/scripts/validate.mjs)와 스키마 [.claude/skills/flocons-content/references/word.schema.json](.claude/skills/flocons-content/references/word.schema.json)로 검증한다.
- `ai-dlc-navigator`는 **항상 먼저 STATUS를 읽고**, "AI proposes, human disposes"를 준수하여 STATUS를 임의로 변경하거나 체크포인트를 넘기지 않으며, 실제 단계 작업은 해당 슬래시 커맨드(`/ai-dlc`·`/inception`·`/construction <unit-id>`·`/operations`)에 위임한다.

## MCP / 외부 도구 (Context7)

외부 라이브러리 문서 조회를 위해 **Context7 MCP** 를 [.mcp.json](.mcp.json)에 구성한다 (`mcpServers.context7`, `npx -y @upstash/context7-mcp`).

- 제공 도구(Claude Code에서):
  - `mcp__context7__resolve-library-id` — 라이브러리 이름을 Context7 라이브러리 ID로 식별.
  - `mcp__context7__get-library-docs` — 식별된 라이브러리의 토픽 문서 조회.
- **사용 정책**: dev 에이전트(`front-dev` / `back-dev` / `db-dev` / `qa-dev`)는 버전에 민감하거나 낯선 라이브러리 API(예: Expo SDK, expo-router, react-native-reanimated, react-native-gesture-handler, zustand, expo-speech, expo-secure-store, @testing-library/react-native)를 사용하기 **전에** Context7로 최신 문서를 확인한다 — 먼저 `resolve-library-id`로 라이브러리를 식별한 뒤 `get-library-docs`로 해당 토픽 문서를 조회한다. **추측 대신 문서 확인.** `code-review`는 의심스러운/구버전 API 사용을 발견하면 dev에게 Context7 재확인을 요청한다.
- **첫 로드 시 신뢰 승인**: Claude Code가 처음 [.mcp.json](.mcp.json)을 로드할 때 사용자는 `context7` 서버 신뢰(승인)를 **한 번** 해야 한다.
- **비밀키**: 선택적 `CONTEXT7_API_KEY`는 **환경변수로만** 둔다. [.mcp.json](.mcp.json)을 포함한 어떤 파일·커밋에도 키를 넣지 않는다.

## 절대 규칙

- **승인 전 단계/Bolt 진행 금지**: 체크포인트에서 멈추고 사람 승인을 기다린다. 승인 없이 STATUS를 `✅ Approved`로 바꾸지 않는다.
- **비밀키 커밋 금지**: API 키/토큰을 코드·데이터·커밋에 절대 넣지 않는다. 런타임은 `expo-secure-store`만 사용. `.env*`, `*.key`는 `.gitignore`. Context7의 `CONTEXT7_API_KEY`도 환경변수로만 둔다.
- 검증 게이트 실패 상태(빨간 상태)로 커밋/푸시하지 않는다.
- `example/`(레퍼런스 이미지)·`docs/`·`ai-dlc/` 산출물은 임의로 삭제하지 않는다. 사용자가 만든 파일을 설명과 다르게 덮어쓰지 않는다 — 발견 시 멈추고 보고한다.
- 진행 상태가 헷갈리면 먼저 [/ai-dlc](.claude/commands/ai-dlc.md)로 STATUS를 확인한다.

---

**언어**: 한국어 1차 (기술 용어는 영어 그대로). 단계명은 Inception / Construction / Operations 영문 그대로 쓴다.
