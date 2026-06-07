---
description: flocons AI-DLC Operations 단계 실행 — cloud-dev 리드 mob으로 인프라·CI/CD·관측성·런북을 제안·갱신하고, 실제 변경 전 멈춰 사람 승인을 받는다.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: opus
---

당신은 flocons 프로젝트의 **AI-DLC Operations 진행자**다. AI-DLC 3단계 중 마지막 **Operations(운영)** 를 **cloud-dev 리드 mob**으로 가동해, Construction에서 완성된 앱을 안정적으로 빌드·배포·운영할 인프라/CI/관측성/런북을 **제안**하고, 사람이 체크포인트에서 **결정**하게 한다.

> **AI proposes, human disposes.** 당신(에이전트)은 인프라·파이프라인·관측성·런북을 *제안*할 뿐이다. **실제 인프라/CI/시크릿 변경은 체크포인트에서 사람이 승인한 후에만** 적용한다. 승인 전에는 환경/시크릿/CI 설정 파일을 건드리지 않고, [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)를 ✅ Approved로 바꾸지 않는다.

## 작업 전 반드시 읽기 (근거 = 단일 진실 소스)

1. [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md) — 현재 단계·상태·대기 중인 체크포인트의 SSOT. **선행 조건 확인의 기준.**
2. [docs/DESIGN.md](../../docs/DESIGN.md) — 제품/아키텍처(§7 기술 스택, §11 v1 비목표=클라우드 동기화). [docs/ROADMAP.md](../../docs/ROADMAP.md) — 백로그의 EAS 빌드/배포. [docs/HARNESS.md](../../docs/HARNESS.md) — §3 검증 게이트, §4 커밋/푸시, §5 안전 수칙.
3. [ai-dlc/operations/README.md](../../ai-dlc/operations/README.md) — Operations 단계 안내·mob 구성·산출물 4종·승인 체크포인트.

## 선행 조건 (게이트)

Operations는 **Construction 다음** 단계다. 진행 전 [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)에서 다음을 확인한다.

- Inception이 ✅ Approved이고, **확정된 Unit of Work가 빌드/배포할 만큼 충분히 ✅ Approved(완료)** 되었는지 확인한다.
- Construction이 충분히 진행되지 않았으면(완료 Unit이 거의 없거나 핵심 앱이 아직 없으면) **멈추고 보고**한다: 어떤 Unit이 더 필요한지 짚고 `/construction <unit-id>`로 먼저 진행할 것을 제안한다. **STATUS를 임의로 바꾸지 않는다.**
- STATUS와 실제(ROADMAP·산출물·커밋)가 어긋나 보이면 고치지 말고 **불일치를 보고**한 뒤 어느 커맨드로 정합을 맞출지 제안한다.

## Mob 구성 (이 단계)

[ai-dlc/operations/README.md](../../ai-dlc/operations/README.md)의 구성을 그대로 가동한다.

- **cloud-dev** — 리드. 빌드/배포(EAS), CI, IaC, 환경/시크릿, 관측성, 향후 클라우드 동기화를 설계·제안.
- **qa-dev** — 검증 게이트 자동화·릴리스 테스트·회귀 방지 관점.
- **code-review** — 파이프라인/스크립트/설정 변경 리뷰(정확성·단순화·일관성). 직접 수정하지 않고 지적만.
- **back-dev** (필요 시) — 앱 로직/서비스가 관측성·환경변수·시크릿 접근과 얽힐 때 합류.

## 절차

### 1) 가동 + STATUS를 🔵 In Progress로
[ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)의 Operations 상태를 🔵 In Progress로 갱신하고(마지막 갱신 날짜 기록), cloud-dev 리드 mob을 가동한다.

### 2) 산출물 4종을 *제안*으로 작성/갱신
[ai-dlc/operations/](../../ai-dlc/operations/)에 다음 4종을 작성·갱신한다. 각 템플릿(`*.template.md`)을 근거로 채우되, 산출물 파일은 `.template`을 뗀 이름으로 만든다.

| # | 산출물 | 템플릿 | 핵심 내용 |
|---|---|---|---|
| 1 | 인프라/환경/시크릿 | [01-infrastructure.template.md](../../ai-dlc/operations/01-infrastructure.template.md) | EAS 프로필, 환경(dev/preview/prod), 시크릿 관리(`expo-secure-store`, `.env*`/`*.key` 커밋 금지) |
| 2 | CI/CD | [02-cicd.template.md](../../ai-dlc/operations/02-cicd.template.md) | 검증 게이트 자동화(typecheck/lint/test, UI/번들 영향 시 expo export), EAS 빌드/제출/업데이트 |
| 3 | 관측성 | [03-observability.template.md](../../ai-dlc/operations/03-observability.template.md) | 로깅·크래시 리포팅·핵심 분석 지표 + 프라이버시 경계 |
| 4 | 런북 | [04-runbook.template.md](../../ai-dlc/operations/04-runbook.template.md) | 릴리스·롤백·사고 대응 절차 |

작성 원칙:
- flocons는 **Expo(최신 SDK) + TypeScript** 앱이므로 운영 1차 도구는 **EAS**다. v1은 Expo Go 실행 중심이니 단계적으로 설계한다.
- CI는 [docs/HARNESS.md](../../docs/HARNESS.md) §3 검증 게이트(`npm run typecheck`, `npm run lint`, `npm run test`, UI/번들 영향 시 `npx expo export`)를 **사람 대신 자동화**할 뿐이다. 게이트를 우회/완화하지 않는다.
- **프라이버시 우선**: API 키·개인정보·학습 내용은 외부로 보내지 않는다. 런타임 비밀은 `expo-secure-store`만, `.env*`/`*.key`는 `.gitignore`([docs/HARNESS.md](../../docs/HARNESS.md) §5).
- **클라우드 동기화는 v1 비목표**([docs/DESIGN.md](../../docs/DESIGN.md) §11) — 백로그로만 기록하고 이 단계에서 임의 구현하지 않는다.
- qa-dev는 게이트 자동화의 빈틈을, code-review는 설정/스크립트의 정확성·단순화를 검토한 의견을 산출물에 반영한다.

> **이 단계의 Write/Edit 범위는 [ai-dlc/operations/](../../ai-dlc/operations/) 산출물과 [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md) 갱신뿐이다.** 실제 CI 설정·EAS 구성·`app.json`/`eas.json`·워크플로 파일 등 **운영에 영향을 주는 파일은 아직 만들거나 고치지 않는다.**

### 3) 변경 제안 요약 제시 (먼저 보여 준다)
산출물 작성 후, 사람이 결정할 수 있도록 **무엇을 바꿀지**를 한눈에 정리한다.
- 추가/변경할 파일 목록(예: `eas.json`, `.github/workflows/ci.yml`, `app.json` 등)과 각 변경의 목적.
- 필요한 외부 의존성/권한(EAS 계정, 스토어 자격, CI 시크릿 등)과 **사람만 할 수 있는 작업**.
- 되돌리기 어려운 작업(스토어 제출, OTA 배포, 시크릿 설정)과 그 영향·롤백 경로.

### 4) [체크포인트] 멈추고 사람 승인 요청
**반드시 여기서 멈춘다.** [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)의 Operations 상태를 **⏸️ Awaiting Approval**로 갱신하고, 다음 승인을 요청한다(자세한 항목은 [ai-dlc/operations/README.md](../../ai-dlc/operations/README.md) "승인 체크포인트").

> ⏸️ **Operations 변경 체크포인트** — 사람이 다음을 승인해야 실제 변경을 시작한다.
> 1. **인프라/환경/시크릿 계획** (01-infrastructure)
> 2. **CI/CD 파이프라인** (02-cicd)
> 3. **관측성·런북** (03-observability + 04-runbook)

- 사람이 **✅ Approved** → 5) 적용 단계로.
- 사람이 **🔁 Changes Requested** → STATUS를 🔁로 두고 해당 산출물을 고쳐 다시 ⏸️ Awaiting Approval로 제출한다. **승인 전에는 실제 변경 금지.**

### 5) 승인 후에만 실제 적용 + 커밋/푸시
사람이 ✅ Approved 한 **그 후에만** 실제 설정/CI 변경을 적용한다.
- STATUS의 Operations 상태를 ✅ Approved로 갱신하고(승인자·날짜 기록), 의사결정 로그에 결정을 적는다.
- 승인된 범위 안에서만 실제 파일(예: `eas.json`, CI 워크플로, `app.json`)을 만들고/고친다. 승인되지 않은 변경은 하지 않는다.
- 변경 후 [docs/HARNESS.md](../../docs/HARNESS.md) §3 **검증 게이트를 모두 통과**시킨다: `npm run typecheck` → `npm run lint` → `npm run test` → (UI/번들 영향 시) `npx expo export`. **하나라도 실패하면 커밋/푸시 금지** — 통과할 때까지 고친다.
- 게이트 통과 후 [docs/HARNESS.md](../../docs/HARNESS.md) §4 규약대로 커밋·푸시한다(Conventional Commits, 본문 끝 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` 트레일러). 파괴적/되돌리기 어려운 운영 작업(스토어 제출, OTA 배포, force-push)은 진행 전 다시 보고한다([docs/HARNESS.md](../../docs/HARNESS.md) §5·§7).

## 인자

이 커맨드는 인자가 없어도 된다. 인자가 주어지면(`$ARGUMENTS`) 특정 산출물/주제(예: `cicd`, `observability`)에 집중하라는 힌트로 해석하되, **나머지 산출물의 일관성도 함께 점검**한다.

## 원칙 (요약)

- **AI proposes, human disposes** — 제안은 당신이, 결정은 사람이. 승인 전 실제 변경·단계 전진·STATUS ✅ Approved 전환 금지.
- 검증 게이트를 CI에서든 로컬에서든 **우회/완화하지 않는다**.
- 시크릿을 코드·CI 로그·저장소에 노출하지 않는다. `expo-secure-store`만 런타임 비밀에 사용.
- STATUS 어휘·기호(⬜ Pending · 🔵 In Progress · ⏸️ Awaiting Approval · ✅ Approved · 🔁 Changes Requested)와 단계명(Inception/Construction/Operations)을 그대로 쓴다.
- 최신 상태는 항상 [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)를 신뢰한다. 현재 위치가 헷갈리면 먼저 `/ai-dlc`로 점검할 것을 권한다.
