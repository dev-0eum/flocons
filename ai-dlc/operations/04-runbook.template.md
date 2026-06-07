# 04 — 런북 (Runbook)

> Operations 산출물 #4. **릴리스 · 롤백 · 사고 대응**을 사람이 그대로 따라 할 수 있게 절차화한다.
> 작성: **cloud-dev** 리드 mob (qa-dev 릴리스 테스트 · code-review, 필요 시 back-dev).
> 근거: [docs/HARNESS.md](../../docs/HARNESS.md) §3·§4·§5 · [01-infrastructure.template.md](01-infrastructure.template.md) · [02-cicd.template.md](02-cicd.template.md) · [03-observability.template.md](03-observability.template.md).
> `<...>`는 자리표시자, `TODO`는 채워야 할 항목이다. 채운 뒤 표시자와 본 안내 블록을 정리한다.
> **절차의 파괴적 단계(제출·롤백·키 폐기 등)는 [README.md](README.md)의 승인 체크포인트 이후에만 실행한다.**

작성일: `<YYYY-MM-DD>` · 작성: cloud-dev + Operations mob · 상태: `<⬜ Pending | 🔵 In Progress | ⏸️ Awaiting Approval | ✅ Approved | 🔁 Changes Requested>`

---

## 1. 한 줄 요약

`<누가 무엇을 켜져 있을 때 따라 하는 런북인지 한 문장>`

## 2. 연락/책임 (Ownership)

| 역할 | 담당 | 비고 |
|---|---|---|
| 릴리스 결정 | `<사람 — AI proposes, human disposes>` | `<체크포인트 승인 주체>` |
| 운영 실행 | `<예: cloud-dev mob 제안 → 사람 실행>` | |
| TODO | | |

## 3. 릴리스 절차 (Release)

> 사전 조건: **검증 게이트 통과**([02-cicd](02-cicd.template.md) §3) + 사람 승인.

1. [ ] `<릴리스 범위/변경 로그 확인 — ROADMAP 체크 상태>`
2. [ ] `<검증 게이트 통과 확인: typecheck / lint / test / (필요시) expo export>`
3. [ ] `<버전/빌드넘버 증가>`
4. [ ] `<EAS 빌드: eas build --profile production>` — [02-cicd](02-cicd.template.md) §5
5. [ ] `<preview/내부 테스트로 스모크 확인>`
6. [ ] **[사람 승인]** `<스토어 제출/OTA 배포 결정>`
7. [ ] `<제출: eas submit / 업데이트: eas update>`
8. [ ] `<배포 후 관측성 확인: 크래시-프리율 등>` — [03-observability](03-observability.template.md) §5
9. [ ] `<릴리스 기록(태그/해시/날짜) 남기기>`

## 4. 롤백 절차 (Rollback)

> 트리거: `<예: 크래시 급증 / 핵심 흐름 회귀>`

| 배포 유형 | 롤백 방법 | 소요 |
|---|---|---|
| OTA(EAS Update) | `<예: 직전 정상 update로 채널 롤백 / publish 되돌리기>` | `<분>` |
| 스토어 빌드 | `<예: 직전 정상 빌드 재제출 / 단계적 출시 중단>` | `<시간~일>` |

1. [ ] `<영향 범위·사용자 비율 파악>`
2. [ ] **[사람 승인]** `<롤백 결정>`
3. [ ] `<롤백 실행 (위 표)>`
4. [ ] `<롤백 검증: 정상 동작/지표 회복 확인>`
5. [ ] `<원인 분석은 6절 사후 분석으로>`

## 5. 사고 대응 (Incident Response)

> 사고 = `<예: 크래시-프리율 임계 이하 / 데이터 손상 / 비밀 노출>`.

| 심각도 | 정의 | 1차 대응 |
|---|---|---|
| SEV1 | `<앱 사용 불가/데이터 손실>` | `<즉시 롤백 검토 + 사람 보고>` |
| SEV2 | `<핵심 흐름 일부 손상>` | `<핫픽스 또는 롤백>` |
| SEV3 | `<경미/우회 가능>` | `<다음 릴리스에 수정>` |

대응 단계:

1. [ ] **감지** — `<관측성 알림/사용자 보고>` ([03-observability](03-observability.template.md))
2. [ ] **분류** — `<심각도 판정>`
3. [ ] **완화** — `<롤백(4절) 또는 핫픽스>` · **[사람 승인]**
4. [ ] **검증** — `<게이트 통과 + 지표 회복>`
5. [ ] **기록** — `<타임라인/조치>`

### 5.1 비밀 노출 특례

> API 키/토큰이 코드·커밋·로그에 노출된 정황 시.

1. [ ] `<해당 키 즉시 폐기/회전>` ([01-infrastructure](01-infrastructure.template.md) §5)
2. [ ] `<노출 경로 차단 (.gitignore/시크릿 점검)>`
3. [ ] `<영향 평가 및 사람 보고>` — [docs/HARNESS.md](../../docs/HARNESS.md) §5·§7

## 6. 사후 분석 (Postmortem)

- 무엇이/언제/왜: `<...>`
- 영향: `<사용자/데이터>`
- 재발 방지: `<예: 회귀 테스트 추가(qa-dev), CI 게이트 보강>`
- TODO: `<액션 아이템 + 담당>`

## 7. 리스크 / 미해결 질문

| ID | 항목 | 영향 | 완화책 / 결정 필요 |
|---|---|---|---|
| OPS-RUN-01 | `<예: 스토어 심사 지연 시 롤백 한계>` | `<상/중/하>` | `<예: OTA 우선 운영>` |
| TODO | | | |

---

> 이전: [03-observability.template.md](03-observability.template.md). Operations 산출물 전체: [README.md](README.md).
> 이 문서는 Operations 변경 체크포인트에서 사람 승인 대상이다.
