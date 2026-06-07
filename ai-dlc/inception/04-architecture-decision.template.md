# 04 — 아키텍처 결정 (ADR)

> Inception 산출물 #4. 단계에서 내린 **구속력 있는 아키텍처/기술 결정**을 ADR(Architecture Decision Record) 형식으로 남긴다.
> 결정 자체의 단일 진실 소스는 [ai-dlc/00-tech-stack.md](../00-tech-stack.md), 본 문서는 그 결정의 *맥락·대안·결과*를 기록한다.
> 작성: **app-pm** 리드 mob (back-dev · front-dev · db-dev · cloud-dev 의견), code-review 리뷰. 근거: [docs/DESIGN.md](../../docs/DESIGN.md) §5·§7.
> `<...>`는 자리표시자, `TODO`는 채울 항목. ADR 하나당 아래 블록 1개. 결정마다 복제해서 쓴다.

작성일: `<YYYY-MM-DD>` · 상태: `<⬜ Pending | 🔵 In Progress | ⏸️ Awaiting Approval | ✅ Approved | 🔁 Changes Requested>`

---

## ADR-`<NNN>` — `<결정 제목, 예: 콘텐츠 계층은 ContentProvider 추상화 + Static 폴백>`

- 상태: `<⏸️ Awaiting Approval | ✅ Approved | 🔁 Changes Requested>`
- 결정일: `<YYYY-MM-DD>` · 관련 Unit: `<UoW-02-content-layer, UoW-09-ai-provider>`

### 맥락 (Context)

`<왜 이 결정이 필요한가. 어떤 제약/요구사항/문제 상황인지. 예: 키 없이도 항상 동작해야 하고, 키가 있으면 AI 보강을 쓰고 싶다.>`

### 결정 (Decision)

`<무엇을 하기로 했는가. 단정형으로. 예: ContentProvider 인터페이스로 추상화하고 런타임에 Static/AI 구현체를 선택, AI 실패 시 Static 자동 폴백.>`

### 대안 (Alternatives considered)

- 대안 A: `<설명>` — `<채택 안 한 이유>`
- 대안 B: `<설명>` — `<채택 안 한 이유>`
- TODO: `<대안 추가>`

### 결과 (Consequences)

- 긍정: `<예: 오프라인/무료 베이스라인 보장, 테스트 용이(결정적)>`
- 부정/비용: `<예: 두 경로 유지보수, 폴백 로직 테스트 필요>`
- 후속 작업/영향 Unit: `<...>`

---

## ADR-`<NNN+1>` — `<결정 제목>`

- 상태: `<...>` · 결정일: `<YYYY-MM-DD>` · 관련 Unit: `<...>`

### 맥락
`<...>`

### 결정
`<...>`

### 대안
- `<...>`

### 결과
- `<...>`

---

## 기술 스택 확정 (요약)

전체 표는 [ai-dlc/00-tech-stack.md](../00-tech-stack.md)에 있다. 여기서는 Inception에서 *확정/변경*한 항목만 ADR과 연결해 적는다.

| 영역 | 선택 | 관련 ADR | 비고 |
|---|---|---|---|
| 런타임 | `<Expo(latest SDK) + TypeScript>` | `<ADR-NNN>` | `<...>` |
| 라우팅 | `<expo-router>` | `<...>` | |
| 상태 | `<Zustand + persist(AsyncStorage)>` | `<...>` | |
| 제스처/애니메이션 | `<gesture-handler + reanimated>` | `<...>` | |
| 발음 | `<expo-speech (fr-FR, 무료)>` | `<...>` | |
| 비밀키 | `<expo-secure-store>` | `<...>` | |
| 테스트 | `<Jest + @testing-library/react-native>` | `<...>` | |
| 검증 게이트 | `<tsc --noEmit / eslint / jest / expo export>` | `<...>` | [docs/HARNESS.md](../../docs/HARNESS.md) §3 |
| TODO | `<변경/추가 항목>` | | |

---

> 이 문서(+ [00-tech-stack.md](../00-tech-stack.md))는 Inception 종료 체크포인트에서 **Unit 백로그와 함께 사람 승인 대상**이다. "AI proposes, human disposes" — 승인 전에는 상태를 `✅ Approved`로 바꾸지 않는다. [README.md](README.md) · [ai-dlc/STATUS.md](../STATUS.md) 참고.
