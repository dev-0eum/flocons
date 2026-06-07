# 02 — CI/CD

> Operations 산출물 #2. [docs/HARNESS.md](../../docs/HARNESS.md) §3의 **검증 게이트를 CI로 자동화**하고, **EAS 빌드/제출/업데이트** 파이프라인을 정의한다.
> 작성: **cloud-dev** 리드 mob (qa-dev 게이트 검증 · code-review 리뷰).
> 근거: [docs/HARNESS.md](../../docs/HARNESS.md) §3·§4 · [ai-dlc/00-tech-stack.md](../00-tech-stack.md) · [01-infrastructure.template.md](01-infrastructure.template.md).
> `<...>`는 자리표시자, `TODO`는 채워야 할 항목이다. 채운 뒤 표시자와 본 안내 블록을 정리한다.
> **실제 파이프라인 추가는 [README.md](README.md)의 승인 체크포인트 이후에만 한다. 게이트를 우회/완화하지 않는다.**

작성일: `<YYYY-MM-DD>` · 작성: cloud-dev + Operations mob · 상태: `<⬜ Pending | 🔵 In Progress | ⏸️ Awaiting Approval | ✅ Approved | 🔁 Changes Requested>`

---

## 1. 한 줄 요약

`<무엇을 언제 트리거해 어떤 게이트를 자동 실행하고, 통과 시 무엇을 빌드/배포하는지 한 문장>`

## 2. CI 플랫폼

- 도구: `<예: GitHub Actions / EAS Workflows>`
- 트리거: `<예: push(main) / pull_request / tag v*>`
- TODO: `<동시성/취소 정책, 캐시 전략>`

## 3. 검증 게이트 자동화 (필수)

> [docs/HARNESS.md](../../docs/HARNESS.md) §3와 **동일한 순서·명령**. 하나라도 실패하면 파이프라인을 멈추고 빌드/배포로 넘어가지 않는다.

| 단계 | 명령 | 실패 시 |
|---|---|---|
| typecheck | `npm run typecheck` (`tsc --noEmit`) | `<중단>` |
| lint | `npm run lint` (eslint) | `<중단>` |
| test | `npm run test` (jest) | `<중단>` |
| export(번들 스모크) | `npx expo export` — **UI/번들 영향 시** | `<중단>` |

- 게이트 우회 금지: `<테스트 skip / lint 비활성화로 통과시키기 금지 — HARNESS §3>`
- 캐시: `<예: node_modules / jest 캐시 — 게이트 결과를 바꾸지 않는 선에서만>`
- TODO: `<커버리지 임계치 등 추가 게이트가 있으면 기술>`

## 4. CI 워크플로 스켈레톤 (계획)

> 파이프라인 정의 **계획**. 승인 전에는 파일을 실제로 만들지 않는다.

```yaml
# .github/workflows/ci.yml (제안 — 승인 후 적용)
name: ci
on:
  pull_request:
  push:
    branches: [ main ]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4   # with: { node-version: <N>, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      # - run: npx expo export        # <UI/번들 영향 시>
```

## 5. EAS 빌드 / 제출 / 업데이트 (계획)

| 작업 | 명령(예) | 트리거 | 환경/프로필 |
|---|---|---|---|
| 빌드 | `eas build --profile <preview|production>` | `<예: tag v* / 수동>` | [01-infrastructure](01-infrastructure.template.md) §4 |
| 제출 | `eas submit --profile <production>` | `<예: 릴리스 승인 후 수동>` | `<스토어 자격증명 — 시크릿>` |
| OTA 업데이트 | `eas update --branch <채널>` | `<예: JS 전용 변경>` | `<채널 정책>` |

- 빌드 자격증명/토큰: **EAS Secrets / CI 시크릿에서만** 주입(로그 출력 금지) — [01-infrastructure](01-infrastructure.template.md) §5.
- 게이트와의 관계: **검증 게이트 통과 → 빌드 → (승인) 제출.** 게이트 실패 시 빌드 단계로 진입하지 않는다.
- TODO: `<버전/빌드넘버 자동 증가, 변경 로그 자동화>`

## 6. 릴리스 흐름 (요약)

```
PR/푸시 ──▶ 검증 게이트(typecheck/lint/test[/export]) ──▶ 통과 ──▶ EAS 빌드 ──▶ [사람 승인] ──▶ 제출/업데이트
                         │ 실패
                         └─▶ 중단 (수정에 집중, 빌드/배포 금지)
```

상세 릴리스/롤백 절차는 [04-runbook.template.md](04-runbook.template.md).

## 7. 리스크 / 미해결 질문

| ID | 항목 | 영향 | 완화책 / 결정 필요 |
|---|---|---|---|
| OPS-CI-01 | `<예: CI에서 expo export 시간/안정성>` | `<상/중/하>` | `<예: 조건부 실행>` |
| TODO | | | |

---

> 다음 산출물: [03-observability.template.md](03-observability.template.md) → [04-runbook.template.md](04-runbook.template.md). 이전: [01-infrastructure.template.md](01-infrastructure.template.md).
> 이 문서는 Operations 변경 체크포인트에서 사람 승인 대상이다. [README.md](README.md) 참고.
