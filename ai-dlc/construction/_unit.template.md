<!--
  Construction Bolt 기록 템플릿 (Unit 1개)
  사용법: 이 파일을 ai-dlc/construction/<unit-id>.md 로 복사해 채운다 (예: UoW-03-learn-deck.md).
  근거: Construction/Bolt 설명은 ai-dlc/construction/README.md, 검증 게이트는 docs/HARNESS.md §3.
  원칙 "AI proposes, human disposes": 체크포인트 A(설계)·B(완료)에서 멈추고 사람 승인을 기다린다.
  자리표시자 < ... > 는 실제 값으로 바꾸고, 체크박스 [ ] 는 완료 시 [x] 로 바꾼다.
-->

# Bolt 기록 — `<UoW-NN-slug>`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md)이며, 이 파일이 갱신되면 STATUS의 해당 Unit 행도 함께 맞춘다.
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [로드맵](../../docs/ROADMAP.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `<UoW-NN-slug>` (예: `UoW-03-learn-deck`) |
| **이름** | <한 줄 제목> |
| **연결 마일스톤** | <docs/ROADMAP.md M? (예: M3 — 학습 덱 화면)> |
| **리드** | <front-dev | back-dev | db-dev — Unit 성격으로 결정> |
| **멤버** | <보조 dev 에이전트> + qa-dev + code-review |
| **상태** | <⬜ Pending | 🔵 In Progress | ⏸️ Awaiting Approval | ✅ Approved | 🔁 Changes Requested> |
| **시작일 / 완료일** | <YYYY-MM-DD> / <YYYY-MM-DD 또는 (미정)> |

> 의존성: <선행 Unit ID 목록 또는 "없음"> · 완료 정의(DoD) 요약: <이 Unit이 끝났다고 말할 수 있는 조건>

---

## 1) 논리 설계 (제안)

> mob이 인터페이스 / 데이터 흐름 / 파일 변경 계획을 *제안*한다. 설계 결정의 근거는 [docs/DESIGN.md](../../docs/DESIGN.md) 등으로 링크한다.

### 인터페이스 / 데이터 흐름
- <추가/변경할 타입·인터페이스·함수 시그니처>
- <데이터가 흐르는 경로 (예: StaticContentProvider → deckStore → WordCard)>

### 변경 파일 계획
| 파일(예정) | 변경 종류 | 메모 |
|---|---|---|
| `<src/...>` | <신규 | 수정 | 삭제> | <무엇을/왜> |

### 리스크 / 대안 / 미해결 질문
- 리스크: <...>
- 검토한 대안: <...>
- 사람 결정이 필요한 미해결 질문: <... 또는 "없음">

### ⏸️ 체크포인트 A — 설계 승인

> AI는 위 설계를 *제안*한다. 사람이 승인해야 2) 구현으로 넘어간다. 수정 요청이면 상태를 🔁 Changes Requested로 두고 설계를 갱신한 뒤 다시 승인을 요청한다.

- [ ] 설계 검토 완료
- 결정: <✅ Approved | 🔁 Changes Requested>
- 승인자: <이름> · 날짜: <YYYY-MM-DD>
- 코멘트 / 변경 요청: <...>

---

## 2) 구현

> **체크포인트 A 승인 후에만** 작성한다. 승인된 설계대로만 구현한다. 설계를 벗어나야 하면 1)로 돌아가 A를 다시 받는다.

### 변경 파일 목록 (실제)
| 파일 | 변경 종류 | 요약 |
|---|---|---|
| `<src/...>` | <신규 | 수정 | 삭제> | <한 줄 요약> |

### 구현 노트
- <설계 대비 달라진 점/이유, 발견한 제약, 후속 작업으로 미룬 항목 등>

---

## 3) 테스트 (qa-dev)

> qa-dev가 테스트를 작성/실행한다. 테스트 없는 신규 로직은 최소 테스트를 함께 추가한다.

### 작성/갱신한 테스트
- [ ] `<__tests__/... 또는 *.test.ts(x)>` — <무엇을 검증>

### 검증 게이트 결과 (커밋/푸시 전 필수 · [docs/HARNESS.md](../../docs/HARNESS.md) §3)

> 게이트를 우회/완화하지 않는다. 하나라도 실패하면 커밋/푸시 금지 — 통과할 때까지 수정.

- [ ] `npm run typecheck` (tsc --noEmit) — 결과: <pass | fail + 요지>
- [ ] `npm run lint` (eslint) — 결과: <pass | fail + 요지>
- [ ] `npm run test` (jest) — 결과: <pass | fail + 요지>
- [ ] `npx expo export` (UI/번들 영향 시) — 결과: <pass | fail | N/A>

---

## 4) 리뷰 (code-review)

> code-review가 diff를 리뷰한다(정확성·단순화·일관성·효율). 코드를 직접 수정하지 않고 지적만 한다. 지적이 있으면 2)/3)으로 돌아가 수정 후 게이트를 다시 통과시킨다.

| # | 위치(파일:라인) | 분류 | 코멘트 | 처리 |
|---|---|---|---|---|
| 1 | `<파일:라인>` | <정확성 | 단순화 | 일관성 | 효율> | <지적 내용> | <[ ] 반영 / [ ] 보류(사유)> |

- 리뷰 결론: <머지 가능 | 수정 후 재리뷰>

---

## 5) Unit 완료

### ⏸️ 체크포인트 B — Unit 완료 승인

> 검증 게이트 전부 통과 + code-review 머지 가능 상태에서만 사람에게 완료 승인을 요청한다. 승인 후에야 STATUS를 갱신하고 커밋·푸시한다(순서: STATUS 갱신 → 커밋·푸시). 승인 전에는 ✅ Approved로 바꾸지 않는다.

- [ ] 검증 게이트 4종 통과 확인
- [ ] code-review 머지 가능
- 결정: <✅ Approved | 🔁 Changes Requested>
- 승인자: <이름> · 날짜: <YYYY-MM-DD>
- 코멘트 / 변경 요청: <...>

### 커밋 / 푸시 기록 ([docs/HARNESS.md](../../docs/HARNESS.md) §4 규약)

> 체크포인트 B 승인 후 수행. Conventional Commits 형식 + `Co-Authored-By` 트레일러. main 직접 푸시.

- [ ] [ai-dlc/STATUS.md](../STATUS.md)의 해당 Unit 행 상태 갱신
- [ ] 커밋 완료 — 메시지: `<feat: ... | fix: ... | ...>`
- [ ] `origin/main` 푸시 완료
- 커밋 해시: `<짧은 해시>`

### 마무리
- 후속 작업 / 다음 Unit: <...>
