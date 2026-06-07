# Construction — 구축 단계

> AI-DLC 3단계 중 **두 번째 단계**. Inception에서 사람이 승인한 **Unit of Work**들을 하나씩 **Bolt**(시간-압축 반복 사이클)로 돌며 설계·구현·테스트·리뷰한다.
> 핵심 원칙 **"AI proposes, human disposes"**: 에이전트는 Bolt 안에서 설계와 코드를 *제안*하고, 사람은 **체크포인트 A(설계 승인)** 와 **체크포인트 B(Unit 완료 승인)** 에서 *구속력 있는 결정*을 내린다. 승인 전에는 다음 단계로 넘어가지 않으며 상태를 ✅ Approved로 바꾸지 않는다.

근거 문서(작업 전 반드시 읽기): [docs/DESIGN.md](../../docs/DESIGN.md) · [docs/ROADMAP.md](../../docs/ROADMAP.md) · [docs/HARNESS.md](../../docs/HARNESS.md)
관련: [ai-dlc/STATUS.md](../STATUS.md) · [기술 스택](../00-tech-stack.md) · [Inception](../inception/README.md) · [Operations](../operations/README.md)

---

## 전제 조건

> ⚠️ Construction은 **Inception 산출물(Unit of Work 백로그 + 기술 스택)이 사람에게 ✅ Approved 된 뒤에만** 시작한다.
> [ai-dlc/STATUS.md](../STATUS.md)에서 Inception이 `✅ Approved`인지, 그리고 확정된 Unit 목록을 확인한 뒤 진행한다. 승인 전에는 어떤 Unit도 시작하지 않는다.

---

## 이 단계가 하는 일

승인된 Unit of Work를 **한 번에 하나씩** 골라 Bolt로 돈다. 각 Unit은 독립적으로 설계·구현·테스트할 수 있는 작업 단위이며, 한 Bolt를 통과하면 [docs/HARNESS.md](../../docs/HARNESS.md) 규약대로 커밋·푸시하고 다음 Unit으로 넘어간다.

Unit 후보의 출발점은 [docs/ROADMAP.md](../../docs/ROADMAP.md) M0~M12에서 도출한 `UoW-00-scaffold`~`UoW-12-expand`이며, 실제 확정·우선순위는 Inception 체크포인트에서 사람 승인으로 정해진다.

## Mob 구성 (Unit별)

Construction의 mob은 **Unit 성격에 따라 리드가 달라진다.**

| Unit 성격 | 리드 | 예시 Unit |
|---|---|---|
| UI(화면·컴포넌트·제스처·내비·테마·접근성) | **front-dev** | UoW-01-design-system, UoW-03-learn-deck, UoW-06-review-stats, UoW-11-onboarding-polish |
| 로직/서비스(ContentProvider·AI 통합·SRS·lib/·상태 스토어) | **back-dev** | UoW-02-content-layer, UoW-04-tts, UoW-05-srs, UoW-09-ai-provider |
| 데이터/영속화(AsyncStorage·secure-store·스키마·시드 데이터셋) | **db-dev** | UoW-08-settings-keys, UoW-10-images, UoW-12-expand |

> 리드 선정 규칙: Unit의 **핵심 산출물이 무엇이냐**로 정한다. UI가 핵심이면 front-dev, 로직/서비스가 핵심이면 back-dev, 데이터/영속화가 핵심이면 db-dev. 한 Unit이 여러 성격을 걸치면 가장 무게가 큰 쪽이 리드를 맡고 나머지는 멤버로 참여한다. (스캐폴드 성격의 UoW-00 등 경계가 모호한 Unit은 Inception 백로그에서 리드를 명시한다.)

각 Unit mob의 고정 멤버:

- **(리드) 관련 dev 에이전트** — 위 규칙으로 결정.
- **관련 보조 dev 에이전트** — Unit이 걸치는 다른 계층(예: UI Unit이 스토어를 건드리면 back-dev 참여).
- **qa-dev** — 테스트 전략·작성·실행, 검증 게이트, 회귀 방지.
- **code-review** — diff 리뷰 / 머지 게이트. 코드를 직접 수정하지 않고 정확성·단순화·일관성·효율을 지적한다.

## Bolt 구조 (Unit 1개를 도는 5단계)

각 Unit은 다음 5단계를 순서대로 통과한다. 두 번 멈춘다 — **체크포인트 A**(설계 후)와 **체크포인트 B**(완료 후).

1. **논리 설계** — mob이 인터페이스/데이터 흐름/파일 변경 계획을 *제안*한다.
   → **⏸️ 체크포인트 A: 설계 승인.** 사람이 설계를 승인해야 구현으로 넘어간다.
2. **구현** — 승인된 설계대로만 코드를 생성한다. 설계를 벗어나는 변경이 필요하면 1단계로 되돌아가 다시 A 승인을 받는다.
3. **테스트** — qa-dev가 테스트를 작성/실행한다. 아래 **검증 게이트**를 모두 통과해야 한다.
4. **리뷰** — code-review가 diff를 리뷰한다. 지적이 있으면 수정 후 게이트를 다시 통과시킨다.
5. **Unit 완료** — → **⏸️ 체크포인트 B: Unit 완료 승인.** 사람이 승인하면 [ai-dlc/STATUS.md](../STATUS.md)의 해당 Unit 상태를 갱신하고, 그 다음 [docs/HARNESS.md](../../docs/HARNESS.md) 규약대로 커밋·푸시한다(커밋 해시를 기록 파일에 남긴다).

> 순서 주의: **STATUS 갱신 → 커밋·푸시**. 체크포인트 B 승인 전에는 커밋/푸시하지 않으며 STATUS를 ✅ Approved로 바꾸지 않는다.

## 검증 게이트 (커밋/푸시 전 필수, 순서대로)

[docs/HARNESS.md](../../docs/HARNESS.md) §3과 동일하다.

```
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # jest
# UI/번들에 영향 있는 변경이면 추가로:
npx expo export     # 번들 무결성 스모크
```

- **하나라도 실패하면 커밋/푸시 금지.** 통과할 때까지 수정에 집중한다.
- 게이트를 우회/완화하지 않는다(테스트 skip, lint 비활성화로 통과시키기 금지).
- 같은 게이트 실패가 연속 2~3회 자력 해결되지 않으면 멈추고 사람에게 보고한다([docs/HARNESS.md](../../docs/HARNESS.md) §7).

## `/construction <unit-id>` 사용법

[/construction](../../.claude/commands/construction.md) 커맨드는 **인자로 Unit ID 하나**를 받아 그 Unit의 Bolt를 돈다.

```
/construction UoW-00-scaffold
```

- 인자 `<unit-id>`는 [ai-dlc/STATUS.md](../STATUS.md)에 승인·등재된 Unit ID여야 한다(예: `UoW-03-learn-deck`).
- 커맨드는 설계 후(**체크포인트 A**)와 완료 후(**체크포인트 B**) 두 번 멈추고 사람 승인을 기다린다.
- 검증 게이트를 통과하지 못하면 커밋/푸시로 진행하지 않는다.

## Unit 기록 — `<unit-id>.md`

각 Unit의 Bolt 진행은 이 폴더의 파일 하나에 기록한다.

- 파일명: `ai-dlc/construction/<unit-id>.md` (예: `ai-dlc/construction/UoW-03-learn-deck.md`).
- 템플릿: [_unit.template.md](_unit.template.md) 를 복사해 채운다.
- 한 파일이 한 Unit의 Bolt 5단계(논리 설계 / 구현 / 테스트 / 리뷰 / 완료)와 체크포인트 A·B 승인 기록, 그리고 커밋 해시까지 담는다.

상태 기호: ⬜ Pending · 🔵 In Progress · ⏸️ Awaiting Approval · ✅ Approved · 🔁 Changes Requested. (의미는 [ai-dlc/STATUS.md](../STATUS.md) 범례와 동일하게 쓴다.)
