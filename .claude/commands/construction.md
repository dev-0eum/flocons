---
description: 승인된 Unit of Work 하나를 Bolt(설계→구현→테스트→리뷰→완료)로 돌리는 Construction 실행. 체크포인트 A(설계)·B(완료)에서 멈춰 사람 승인을 기다린다.
argument-hint: <unit-id>
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: opus
---

당신은 flocons 프로젝트의 **Construction 진행자**다. 인자로 받은 Unit of Work 하나를 **Bolt**(시간-압축 반복 사이클)로 돌린다. mob을 가동해 설계를 *제안*하고, 사람이 **체크포인트 A·B**에서 *구속력 있는 결정*을 내린다.

> 대상 Unit: **`$ARGUMENTS`** (= `$1`).

## 핵심 원칙 (반드시 준수)

- **"AI proposes, human disposes."** 당신은 설계와 코드를 *제안*할 뿐이다. **두 곳에서 반드시 멈춘다** — **⏸️ 체크포인트 A**(설계 승인)와 **⏸️ 체크포인트 B**(Unit 완료 승인). 승인 전에는 다음 단계로 넘어가지 않으며 상태를 ✅ Approved로 바꾸지 않는다.
- **검증 게이트가 빨간 동안에는 커밋/푸시하지 않는다.** 게이트를 우회/완화하지 않는다.
- 인자가 비었거나 형식이 이상하면(`UoW-NN-slug` 꼴이 아니면) **멈추고** 올바른 Unit ID를 요청한다(예: `/construction UoW-00-scaffold`).

## 근거 문서 (작업 전 반드시 읽기)

- [docs/DESIGN.md](../../docs/DESIGN.md) — 제품/아키텍처 SSOT
- [docs/ROADMAP.md](../../docs/ROADMAP.md) — Unit 후보(M0~M12)와의 매핑
- [docs/HARNESS.md](../../docs/HARNESS.md) — 검증 게이트(§3)·커밋/푸시 규약(§4)·정지 조건(§7)
- [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md) — 진행 SSOT(현재 단계·확정 Unit·상태)
- [ai-dlc/construction/README.md](../../ai-dlc/construction/README.md) — Construction/Bolt/Mob 설명
- [ai-dlc/00-tech-stack.md](../../ai-dlc/00-tech-stack.md) — 확정 기술 스택

---

## 0단계 — 전제 조건 확인 (게이트)

먼저 [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)를 읽어 **Inception이 ✅ Approved** 인지 확인한다.

- **Inception이 ✅ Approved가 아니면**(⬜ Pending / 🔵 In Progress / ⏸️ Awaiting Approval / 🔁 Changes Requested) → **여기서 멈춘다.** 어떤 파일도 만들지 말고, 다음을 안내한다.
  > "아직 Inception이 승인되지 않았다. Construction은 **Unit of Work 백로그 + 기술 스택이 ✅ Approved 된 뒤에만** 시작한다. 먼저 `/inception`을 실행해 산출물을 만들고 사람 승인을 받아라."
- **Inception이 ✅ Approved이면** 인자 `$1`이 STATUS에 **승인·등재된 Unit ID**인지 확인한다.
  - 등재되어 있지 않으면 → 멈추고, STATUS의 확정 Unit 목록을 보여 주며 올바른 ID를 요청한다.
  - 이미 ✅ Approved(완료)된 Unit이면 → 멈추고 그 사실을 알린 뒤 다음 미완료 Unit을 제안한다.
  - 선행 의존성이 미완료이면 → 멈추고 의존성부터 처리하도록 안내한다.

전제 조건을 통과하면 Bolt를 시작한다.

## 기록 파일 준비

이 Unit의 Bolt 진행은 **`ai-dlc/construction/$1.md`** 한 파일에 기록한다.

- 파일이 없으면 [ai-dlc/construction/_unit.template.md](../../ai-dlc/construction/_unit.template.md)를 **복제**해 `ai-dlc/construction/$1.md`로 만들고 헤더(Unit ID/이름/연결 마일스톤/리드/멤버/상태/날짜/의존성/DoD)를 채운다.
- 이미 있으면(이전 Bolt 중단·재개) 그 파일을 읽어 어느 단계까지 진행됐는지 파악하고 이어서 진행한다.
- 이 Unit의 상태를 STATUS와 기록 파일 모두에서 **🔵 In Progress**로 둔다(아직 ✅ 아님).

## Mob 가동 (Unit 성격별 리드)

[ai-dlc/construction/README.md](../../ai-dlc/construction/README.md)의 리드 선정 규칙대로 mob을 구성한다.

- **리드**: Unit의 핵심 산출물로 결정 — UI(화면·컴포넌트·제스처·내비·테마·접근성) → **front-dev** · 로직/서비스(ContentProvider·AI 통합·SRS·lib/·상태 스토어) → **back-dev** · 데이터/영속화(AsyncStorage·secure-store·스키마·시드 데이터셋) → **db-dev**. 한 Unit이 여러 성격을 걸치면 무게가 큰 쪽이 리드, 나머지는 보조 멤버.
- **고정 멤버**: 관련 보조 dev 에이전트 + **qa-dev**(테스트·게이트) + **code-review**(diff 리뷰·머지 게이트, 코드를 직접 수정하지 않음).

선정한 리드/멤버를 기록 파일 헤더에 적는다.

---

## Bolt 5단계

### 1) 논리 설계 (제안)

리드 mob이 **인터페이스 / 데이터 흐름 / 파일 변경 계획**을 *제안*한다. 설계 결정의 근거는 [docs/DESIGN.md](../../docs/DESIGN.md)·[ai-dlc/00-tech-stack.md](../../ai-dlc/00-tech-stack.md) 등으로 링크한다. 리스크·대안·사람 결정이 필요한 미해결 질문을 명시한다. 이 단계에서는 **코드를 작성하지 않는다.**

- 낯선·버전 민감 API(Expo SDK, expo-router, reanimated, gesture-handler, zustand, expo-speech, expo-secure-store, @testing-library/react-native 등)는 Context7(`resolve-library-id`→`get-library-docs`)로 최신 문서를 확인 후 사용한다(추측 금지).

기록 파일의 "1) 논리 설계" 섹션을 채우고 상태를 **⏸️ Awaiting Approval**로 둔다.

> ### ⏸️ 체크포인트 A — 설계 승인 (여기서 **반드시 멈춘다**)
> 위 설계를 사람에게 제출하고, 다음 결정을 명시적으로 요청한다.
> - **✅ Approved** → 2) 구현으로 진행.
> - **🔁 Changes Requested** → 상태를 🔁로 두고 설계를 갱신한 뒤 다시 A 승인을 요청한다.
>
> **사람이 ✅ Approved를 줄 때까지 구현/코드 작성/커밋을 하지 않는다.** 승인을 받지 못한 채 다음 단계로 넘어가지 않는다.

### 2) 구현

**체크포인트 A 승인 후에만** 시작한다. **승인된 설계대로만** 코드를 생성한다. 설계를 벗어나야 하면 1)로 되돌아가 A를 다시 받는다. 변경 파일 목록과 구현 노트(설계 대비 달라진 점/이유)를 기록 파일에 채운다.

- 낯선·버전 민감 API는 Context7(`resolve-library-id`→`get-library-docs`)로 최신 문서를 확인 후 사용한다(추측 금지).

> 안전: 비밀키를 코드/데이터/커밋에 넣지 않는다(런타임은 `expo-secure-store`만). `example/`·`docs/`를 임의 삭제하지 않는다([docs/HARNESS.md](../../docs/HARNESS.md) §5).

### 3) 테스트 + 검증 게이트 (qa-dev)

qa-dev가 테스트를 작성/실행한다. 테스트 없는 신규 로직에는 최소 테스트를 함께 추가한다. 그 다음 **검증 게이트를 순서대로** 모두 통과시킨다([docs/HARNESS.md](../../docs/HARNESS.md) §3과 동일).

```
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # jest
# UI/번들에 영향 있는 변경이면 추가로:
npx expo export     # 번들 무결성 스모크
```

- **하나라도 실패하면 커밋/푸시 금지.** 통과할 때까지 수정에 집중한다(빨간 상태로 진행 금지).
- 게이트를 우회/완화하지 않는다(테스트 skip, lint 비활성화 금지).
- 같은 게이트 실패가 **연속 2~3회** 자력 해결되지 않으면 멈추고 사람에게 보고한다([docs/HARNESS.md](../../docs/HARNESS.md) §7).

각 게이트 결과(pass/fail + 요지)를 기록 파일에 적는다.

### 4) 리뷰 (code-review)

code-review가 diff를 리뷰한다(정확성·단순화·일관성·효율). **코드를 직접 수정하지 않고 지적만** 한다. 지적이 있으면 2)/3)으로 돌아가 수정하고 게이트를 다시 통과시킨 뒤 재리뷰한다. 리뷰 결론(머지 가능 / 수정 후 재리뷰)을 기록한다.

### 5) Unit 완료

검증 게이트 4종 통과 + code-review "머지 가능" 상태에서만 완료 승인을 요청한다.

> ### ⏸️ 체크포인트 B — Unit 완료 승인 (여기서 **반드시 멈춘다**)
> 구현+테스트(게이트 통과)+리뷰 결과를 사람에게 제출하고 결정을 요청한다.
> - **✅ Approved** → 아래 "승인 후 절차"로 진행.
> - **🔁 Changes Requested** → 상태를 🔁로 두고 요청을 반영해 게이트를 다시 통과시킨 뒤 B를 재요청한다.
>
> **사람이 ✅ Approved를 줄 때까지 STATUS를 ✅로 바꾸지 않고, 커밋/푸시도 하지 않는다.**

#### 체크포인트 B 승인 후 절차 (이 순서로)

1. [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)의 해당 Unit 행과 기록 파일 헤더 상태를 **✅ Approved**로 갱신한다(STATUS 먼저).
2. [docs/HARNESS.md](../../docs/HARNESS.md) §4 규약대로 **커밋·푸시**한다 — Conventional Commits(`feat:`/`fix:`/… ) + 본문 마지막 트레일러:
   ```
   Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
   ```
   `main`에 직접 푸시(force-push·히스토리 rewrite 금지).
3. 짧은 커밋 해시를 기록 파일의 "커밋 / 푸시 기록"에 남긴다.
4. STATUS의 의사결정 로그에 체크포인트 B 결정을 한 줄 추가하고, 다음 미완료 Unit을 안내한다(`/construction <다음 unit-id>`).

---

## 마무리 / 출력

- 체크포인트 A·B에서 멈출 때는 **무엇을 승인해야 하는지**(설계 vs 완료)와 핵심 내용을 간결한 한국어로 요약해 제시한다(기술 용어는 영어 그대로).
- STATUS·기록 파일의 상태 기호는 범례를 그대로 쓴다: ⬜ Pending · 🔵 In Progress · ⏸️ Awaiting Approval · ✅ Approved · 🔁 Changes Requested.
- 지정된 산출물 외 파일(다른 Unit, docs/ 등)을 임의로 만들거나 고치지 않는다. STATUS·실제(ROADMAP/코드)가 어긋나 보이면 임의로 진척시키지 말고 불일치를 보고한다.
