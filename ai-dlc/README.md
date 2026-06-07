# flocons — AI-DLC 작업공간

> flocons에 **AI-DLC(AI-Driven Development Lifecycle)** 를 적용하기 위한 작업공간이다.
> AI 에이전트가 단계별로 **제안**하고, 사람이 체크포인트에서 **결정**한다 — "AI proposes, human disposes".
> 설계의 단일 진실 소스는 [docs/DESIGN.md](../docs/DESIGN.md), 작업 큐는 [docs/ROADMAP.md](../docs/ROADMAP.md), 자율 운영 규칙은 [docs/HARNESS.md](../docs/HARNESS.md) 에 있다.

---

## 1. AI-DLC가 무엇인가

AI-DLC는 개발을 **3단계**로 나누고, 각 단계마다 사람 + 여러 전문 AI 에이전트가 협업하며, 단계 끝에서 **사람 승인 체크포인트**를 두는 방법론이다.

### 3단계 (순차)

```
Inception  ──▶  Construction  ──▶  Operations
 (구상)          (구축)             (운영)
   │                │                  │
 승인 체크포인트   Unit별 체크포인트   승인 체크포인트
```

- **Inception(구상)**: 요구사항·의도를 파악해 유저 스토리로 풀고, 독립적으로 설계·구현·테스트 가능한 작업 단위(**Unit of Work**)를 식별한다. 아키텍처/기술 스택을 확정하고 리스크를 짚는다. → 산출물 = Unit of Work 백로그 + 아키텍처 결정.
- **Construction(구축)**: 확정된 Unit of Work를 하나씩 **Bolt**로 돌며 설계→구현→테스트→리뷰한다.
- **Operations(운영)**: 빌드/배포(EAS), CI/CD, IaC, 관측성, 런북을 다룬다.

### 핵심 개념

- **Mob(몹)**: 사람 한 명과 여러 전문 AI 에이전트가 동시에 한 작업을 다관점으로 협업하는 단위. 단계마다 mob 구성이 정해져 있다(4절).
- **Unit of Work**: 독립적으로 설계·구현·테스트할 수 있는 최소 작업 단위. 예) `UoW-03-learn-deck`. flocons의 시드 후보는 [docs/ROADMAP.md](../docs/ROADMAP.md)의 M0~M12에서 도출한다.
- **Bolt(볼트)**: Construction에서 Unit 하나를 도는 시간-압축 반복 사이클(논리 설계 → 구현 → 테스트 → 리뷰). 주 단위가 아니라 **시간 단위의 속도**로 돈다.
- **AI proposes, human disposes**: AI 에이전트는 계획·옵션·코드를 **제안**하고, 사람은 체크포인트에서 구속력 있는 **결정**을 내린다. 승인 전에는 다음 단계로 넘어가지 않고, STATUS를 ✅ Approved로 바꾸지 않는다.

---

## 2. 폴더 구조

```
ai-dlc/
  README.md            # (이 문서) 작업공간 안내서
  STATUS.md            # 현재 단계·상태·대기 중인 체크포인트 (단일 진실 소스)
  00-tech-stack.md     # 확정 기술 스택 (DESIGN.md §7 근거)
  inception/           # Inception 산출물 + 템플릿
  construction/        # Unit별 Bolt 기록 + 템플릿
  operations/          # 인프라/CI/관측성/런북 산출물 + 템플릿
```

| 경로 | 역할 |
|---|---|
| [STATUS.md](STATUS.md) | 지금 어느 단계에 있고, 무슨 상태이며, 어떤 체크포인트를 기다리는지 기록하는 **상태 보드**. `/ai-dlc`가 이 파일을 읽어 현재 위치를 요약한다. |
| [00-tech-stack.md](00-tech-stack.md) | Expo + TypeScript, expo-router, Zustand, reanimated, expo-speech, expo-secure-store, Jest 등 확정 스택. 근거는 [docs/DESIGN.md](../docs/DESIGN.md) §7. |
| [inception/](inception/) | `/inception`이 채우는 곳. 요구사항·유저 스토리·Unit of Work 백로그·아키텍처 결정 산출물과 그 템플릿. |
| [construction/](construction/) | `/construction <unit-id>`이 Unit별로 남기는 Bolt 기록(`<unit-id>.md`)과 `_unit.template.md`. |
| [operations/](operations/) | `/operations`가 채우는 곳. 인프라·CI/CD·관측성·런북 산출물과 그 템플릿. |

---

## 3. 실행법 (워크플로우)

슬래시 커맨드는 단계별 mob을 자동으로 엮어 준다. 순서는 다음과 같다.

```
/ai-dlc                       # 1. 지금 어디인지 확인 (읽기 전용)
   │
   ▼
/inception                    # 2. 구상 — 요구사항→스토리→Unit of Work→스택
   │  └─ 끝에서 멈춤: ⏸️ Awaiting Approval (백로그 + 스택 승인 요청)
   ▼
[사람 승인]                    # 3. 사람이 백로그 + 기술 스택을 승인
   │
   ▼
/construction <unit-id>       # 4. Unit 하나를 Bolt로 (필요한 Unit 수만큼 반복)
   │  ├─ 체크포인트 A: 설계 승인에서 멈춤
   │  └─ 체크포인트 B: Unit 완료 승인에서 멈춤 → STATUS 갱신
   ▼
/operations                   # 5. 빌드/배포·CI·관측성·런북
      └─ 실제 변경은 체크포인트 승인 후
```

- **`/ai-dlc`** — 현재 위치·다음 단계 점검. [STATUS.md](STATUS.md)를 읽어 현재 단계/상태/대기 중인 체크포인트를 요약하고, 다음에 실행할 커맨드를 제안한다. 파일을 바꾸지 않는 **읽기 중심** 커맨드다.
- **`/inception`** — app-pm 리드 mob으로 Inception을 실행하고 산출물을 [inception/](inception/)에 쓴다. 마지막에 반드시 멈추고 백로그 + 스택 승인을 요청하며 STATUS를 ⏸️ Awaiting Approval로 둔다. 승인 전 Construction으로 진행하지 않는다.
- **`/construction <unit-id>`** — 인자로 받은 Unit 하나를 Bolt로 설계→구현→테스트→리뷰하고 기록은 [construction/](construction/)`<unit-id>.md`에 남긴다. **설계 후(체크포인트 A)** 와 **완료 후(체크포인트 B)** 두 번 멈춘다. 모든 Unit이 끝날 때까지 반복한다.
- **`/operations`** — cloud-dev 리드 mob으로 인프라/CI/관측성을 다루고 산출물을 [operations/](operations/)에 쓴다.

### Bolt 구조 (Construction에서 Unit 1개)

1. **논리 설계**: mob이 인터페이스/데이터 흐름/파일 변경 계획을 제안 → **[체크포인트 A: 설계 승인]**
2. **구현**: 승인된 설계대로 코드 생성
3. **테스트**: qa-dev가 테스트 작성/실행 — 검증 게이트 통과 필수
4. **리뷰**: code-review가 diff 리뷰
5. **[체크포인트 B: Unit 완료 승인]** → STATUS 갱신 후, [docs/HARNESS.md](../docs/HARNESS.md) 규약대로 커밋·푸시

> **검증 게이트**([docs/HARNESS.md](../docs/HARNESS.md)와 동일): `npm run typecheck`, `npm run lint`, `npm run test`, UI/번들 영향 시 `npx expo export`. **하나라도 실패하면 커밋/푸시 금지.**

---

## 4. 전문 에이전트와 단계별 Mob

### 7개 전문 에이전트 ([.claude/agents/](../.claude/agents/))

| 에이전트 | 역할 | 주 활동 단계 |
|---|---|---|
| `app-pm` | 제품/요구사항 오너. 요구사항·유저 스토리·Unit of Work 정의, 우선순위, 스코프 관리 | Inception (리드) |
| `back-dev` | 앱 로직/서비스 계층. ContentProvider, AI 통합(Anthropic), SRS 연동, `lib/` 유틸, 상태 스토어 | Construction |
| `front-dev` | React Native UI. 화면/컴포넌트/제스처(reanimated)/내비(expo-router)/테마/접근성 | Construction |
| `db-dev` | 로컬 영속화(AsyncStorage / expo-secure-store / 추후 expo-sqlite), 데이터 스키마, 시드 데이터셋 큐레이션 | Construction |
| `cloud-dev` | 빌드/배포(EAS), CI, IaC, 관측성, 향후 클라우드 동기화 | Operations (리드) |
| `qa-dev` | 테스트 전략, Jest + @testing-library/react-native, 검증 게이트, 회귀 방지 | Construction & Operations |
| `code-review` | 변경 리뷰(정확성·단순화·일관성·효율), 머지 게이트. 코드를 직접 작성하지 않고 리뷰/지적 | 모든 단계 |

### 단계별 Mob 구성

| 단계 | 리드 | 멤버 | 승인 체크포인트 |
|---|---|---|---|
| **Inception** | `app-pm` | `back-dev` · `front-dev` · `db-dev` · `cloud-dev`(아키텍처/실현가능성) + `code-review`(계획 리뷰) | 사람이 Unit of Work 백로그 + 기술 스택 승인 |
| **Construction** (Unit별) | Unit 성격에 따라 결정 — UI→`front-dev`, 로직/서비스→`back-dev`, 데이터/영속화→`db-dev` | 관련 dev 에이전트 + `qa-dev`(테스트) + `code-review`(리뷰 게이트). **Bolt로 진행** | 체크포인트 A(설계) / 체크포인트 B(Unit 완료) |
| **Operations** | `cloud-dev` | `qa-dev` · `code-review` + 필요 시 `back-dev` | 사람이 실제 인프라/CI 변경 승인 |

---

## 5. 체크포인트 / 승인 흐름

모든 단계는 체크포인트에서 멈추고 **사람의 승인을 기다린다**. AI는 제안만 하고, 결정은 사람이 한다.

### 상태 기호 ([STATUS.md](STATUS.md)와 동일)

| 기호 | 상태 | 의미 |
|---|---|---|
| ⬜ | Pending | 아직 시작하지 않음 |
| 🔵 | In Progress | 진행 중 |
| ⏸️ | Awaiting Approval | 산출물을 내고 사람 승인 대기 |
| ✅ | Approved | 사람이 승인함 |
| 🔁 | Changes Requested | 사람이 수정을 요청함 |

### 흐름

```
🔵 In Progress  ──▶  ⏸️ Awaiting Approval  ──┬──▶  ✅ Approved        (다음 단계/Unit로)
                                            │
                                            └──▶  🔁 Changes Requested  (수정 후 다시 ⏸️)
```

- **Inception 끝**: `/inception`이 백로그 + 스택을 내고 STATUS를 ⏸️ Awaiting Approval로 둔다. 사람이 ✅ Approved 하면 Construction을 시작한다. 🔁 Changes Requested면 산출물을 고쳐 다시 제출한다.
- **Construction (Unit별)**: 체크포인트 A에서 설계 승인을 기다리고, 구현·테스트·리뷰 후 체크포인트 B에서 Unit 완료 승인을 기다린다. B 승인 후에만 STATUS를 갱신하고 커밋·푸시한다.
- **Operations**: 산출물을 내고 승인을 기다린다. **실제 인프라/CI 변경은 체크포인트 승인 후**에만 한다.

### 현재 상태 (초기)

전체 프로젝트는 **"Inception 대기"** 상태다.

| 단계 | 상태 |
|---|---|
| Inception | ⬜ Pending |
| Construction | ⬜ Pending |
| Operations | ⬜ Pending |

> 아직 어떤 단계도 시작/승인되지 않았다. `/ai-dlc`로 현재 위치를 확인한 뒤 `/inception`으로 시작한다. 최신 상태는 항상 [STATUS.md](STATUS.md)를 신뢰한다.
