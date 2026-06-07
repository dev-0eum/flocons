# 01 — 요구사항 (Requirements)

> Inception 산출물 #1. flocons가 *무엇을 / 왜* 하는지, 어떤 제약·가정·리스크 위에서 동작하는지를 합의한다.
> 작성: **app-pm** 리드 mob (back-dev · front-dev · db-dev · cloud-dev 의견, code-review 리뷰).
> 근거: [docs/DESIGN.md](../../docs/DESIGN.md) · [docs/ROADMAP.md](../../docs/ROADMAP.md).
> `<...>`는 자리표시자, `TODO`는 채워야 할 항목이다. 채운 뒤 표시자와 본 안내 블록을 정리한다.

작성일: `<YYYY-MM-DD>` · 작성: app-pm + Inception mob · 상태: `<⬜ Pending | 🔵 In Progress | ⏸️ Awaiting Approval | ✅ Approved | 🔁 Changes Requested>`

---

## 1. 한 줄 요약

`<이 제품이 누구의 어떤 문제를 어떻게 해결하는지 한 문장>`

## 2. 대상 사용자 / 맥락

- 주 사용자: `<예: 프랑스어를 배우는 한국어 모어 화자 (개인 사용)>`
- 사용 맥락: `<예: 모바일(iOS, Expo Go), 오프라인 가능, 짧은 세션 반복>`
- TODO: `<2차 사용자/엣지 케이스가 있으면 기술>`

## 3. 목표 (Goals)

무엇을 달성하면 성공인가. 측정 가능하게.

- G1: `<예: 키 없이도 완전히 동작하는 정적 데이터셋 기반 학습 흐름 제공>`
- G2: `<예: 스와이프 분류 → SRS 복습 큐 반영이 영속적으로 동작>`
- G3: `<...>`
- TODO: `<목표 추가>`

## 4. 비목표 (Non-Goals)

명시적으로 *이번 범위 밖*인 것. (DESIGN.md §11 참고)

- NG1: `<예: 계정/클라우드 동기화>`
- NG2: `<예: 소셜/결제>`
- NG3: `<예: 안드로이드 전용 최적화 / 다크 테마(후순위)>`
- TODO: `<비목표 추가>`

## 5. 기능 요구사항 (Functional)

| ID | 요구사항 | 우선순위 | 근거(DESIGN/ROADMAP) |
|---|---|---|---|
| FR-01 | `<예: 레벨별 덱을 열어 카드를 스와이프로 분류>` | `<P0 / P1 / P2>` | `<DESIGN §2>` |
| FR-02 | `<예: 무료 온디바이스 발음(expo-speech, fr-FR)>` | `<...>` | `<DESIGN §5>` |
| FR-03 | `<...>` | `<...>` | `<...>` |
| TODO | `<요구사항 행 추가>` | | |

## 6. 비기능 요구사항 (Non-Functional)

- 성능: `<예: 카드 전환/스와이프 60fps, 콜드 스타트 <Ns>`
- 오프라인: `<예: 키 없이 전체 기능 동작(정적 폴백)>`
- 보안/프라이버시: `<예: API 키는 expo-secure-store에만, 평문/커밋 금지>`
- 접근성: `<예: 대비/폰트 스케일, 햅틱 피드백>`
- TODO: `<추가>`

## 7. 제약 (Constraints)

- 기술: `<예: Expo(최신 SDK) + TypeScript, expo-router, Zustand>` — 상세 [ai-dlc/00-tech-stack.md](../00-tech-stack.md)
- 운영: `<예: 검증 게이트(typecheck/lint/test/expo export) 통과 필수>` — [docs/HARNESS.md](../../docs/HARNESS.md) §3
- 비용: `<예: 기본 무료 경로, 유료 키는 선택>`
- TODO: `<제약 추가>`

## 8. 가정 (Assumptions)

검증되지 않았지만 일단 참으로 두는 것. (DESIGN.md §11)

- A1: `<예: 상태관리 Zustand, SRS는 Leitner, 내비 expo-router>`
- A2: `<예: v1 이미지는 플레이스홀더, 라이트 테마 우선>`
- TODO: `<가정 추가 — 깨지면 어떤 산출물에 영향?>`

## 9. 리스크 (Risks)

| ID | 리스크 | 영향 | 가능성 | 완화책 |
|---|---|---|---|---|
| R-01 | `<예: AI Provider 응답 지연/오류>` | `<상/중/하>` | `<상/중/하>` | `<예: Static 자동 폴백 + 로컬 캐시>` |
| R-02 | `<...>` | | | |
| TODO | `<리스크 추가>` | | | |

## 10. 미해결 질문 (Open Questions)

사람 결정이 필요한 항목. 체크포인트에서 함께 묻는다.

- Q1: `<...>`
- TODO: `<질문 추가>`

---

> 다음 산출물: [02-user-stories.template.md](02-user-stories.template.md) → [03-units-of-work.template.md](03-units-of-work.template.md) → [04-architecture-decision.template.md](04-architecture-decision.template.md).
> 이 문서는 Inception 종료 체크포인트에서 사람 승인 대상이다. [README.md](README.md) 참고.
