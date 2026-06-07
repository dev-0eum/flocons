# Operations — 운영 단계

> AI-DLC 3단계 중 **마지막 단계**. Construction에서 승인·완료된 앱을 **빌드/배포(EAS)** 하고, 검증 게이트를 **CI로 자동화**하며, **관측성(로깅·크래시·분석)** 과 **런북(릴리스·롤백·사고 대응)** 을 갖춘다.
> 핵심 원칙 **"AI proposes, human disposes"**: cloud-dev 리드 mob은 인프라·파이프라인·런북을 *제안*하고, 사람은 체크포인트에서 *구속력 있는 결정*을 내린다. **실제 인프라/CI 변경은 체크포인트 승인 후에만** 한다.

근거 문서(작업 전 반드시 읽기): [docs/DESIGN.md](../../docs/DESIGN.md) · [docs/ROADMAP.md](../../docs/ROADMAP.md) · [docs/HARNESS.md](../../docs/HARNESS.md)

---

## 이 단계가 하는 일

빌드/배포 · CI/CD · IaC · 관측성 · 런북을 다룬다. flocons는 **Expo(최신 SDK) + TypeScript** 앱이므로 운영의 1차 도구는 **EAS(Expo Application Services)** 다.

- **빌드/배포**: EAS Build로 iOS/Android 빌드, EAS Submit로 스토어 제출, EAS Update로 OTA 업데이트.
- **CI**: 검증 게이트(typecheck/lint/test, UI/번들 영향 시 expo export)를 PR/푸시마다 자동 실행.
- **관측성**: 로깅·크래시 리포팅·핵심 학습 지표(분석). 단, **API 키·개인정보·학습 내용은 절대 외부로 보내지 않는다**(프라이버시 우선).
- **런북**: 릴리스/롤백/사고 대응 절차를 사람이 따라 할 수 있게 문서화.
- **향후 클라우드 동기화**: v1 비목표([docs/DESIGN.md](../../docs/DESIGN.md) §11). 백로그로만 기록하고 이 단계에서 임의 구현하지 않는다.

> 운영 단계는 [docs/HARNESS.md](../../docs/HARNESS.md)의 **검증 게이트를 우회/완화하지 않는다.** CI는 그 게이트를 사람 대신 자동화할 뿐이다.

## Mob 구성 (이 단계)

- **cloud-dev** — 리드. 빌드/배포(EAS), CI, IaC, 관측성, 향후 클라우드 동기화를 설계·제안.
- **qa-dev** — 검증 게이트 자동화·릴리스 테스트·회귀 방지 관점.
- **code-review** — 파이프라인/스크립트/설정 변경 리뷰. 직접 수정하지 않고 정확성·단순화·일관성을 지적.
- **back-dev** (필요 시) — 앱 로직/서비스 계층이 관측성·환경변수·시크릿 접근과 얽힐 때 합류.

## 산출물 4종

이 폴더는 [/operations](../../.claude/commands/operations.md) 커맨드가 채운다. 각 템플릿을 복사/채워 다음 파일을 만든다.

| # | 산출물 | 템플릿 | 내용 |
|---|---|---|---|
| 1 | 인프라/환경/시크릿 | [01-infrastructure.template.md](01-infrastructure.template.md) | EAS 프로필, 환경(dev/preview/prod), 시크릿 관리(expo-secure-store, .env 커밋 금지) |
| 2 | CI/CD | [02-cicd.template.md](02-cicd.template.md) | 검증 게이트 자동화(typecheck/lint/test/expo export), EAS 빌드/제출/업데이트 |
| 3 | 관측성 | [03-observability.template.md](03-observability.template.md) | 로깅·크래시 리포팅·핵심 분석 지표 + 프라이버시 경계 |
| 4 | 런북 | [04-runbook.template.md](04-runbook.template.md) | 릴리스·롤백·사고 대응 절차 |

## 진행 방식

1. cloud-dev 리드 mob이 위 4종을 *제안*으로 작성한다(파일·설정·스크립트 계획 포함, 코드/시크릿 실제 적용은 아직 하지 않음).
2. qa-dev가 게이트 자동화의 빈틈을, code-review가 설정/스크립트의 정확성을 검토한다.
3. 마지막에 **반드시 멈추고** 사람에게 **실제 인프라/CI 변경 승인**을 요청한다.
4. 이때 [ai-dlc/STATUS.md](../STATUS.md)의 Operations 상태를 `⏸️ Awaiting Approval`로 둔다.
5. 사람이 승인하면 `✅ Approved`로 바꾸고, **그 후에만** 실제 변경(파이프라인 추가, EAS 프로필 적용 등)을 진행한다. **승인 전에는 환경/시크릿/CI를 건드리지 않는다.**

## 승인 체크포인트

> ⏸️ **Operations 변경 체크포인트** — 사람이 다음을 승인해야 실제 변경을 시작한다.
> 1. **인프라/환경/시크릿 계획** (01-infrastructure) — 환경 구분·시크릿 경계
> 2. **CI/CD 파이프라인** (02-cicd) — 검증 게이트 자동화·EAS 빌드/배포 트리거
> 3. **관측성·런북** (03-observability + 04-runbook) — 무엇을 수집/수집하지 않을지, 사고 시 누가 무엇을 하는지
>
> 수정 요청이 있으면 STATUS를 `🔁 Changes Requested`로 두고 해당 산출물을 갱신한 뒤 다시 승인을 요청한다.

상태 기호: ⬜ Pending · 🔵 In Progress · ⏸️ Awaiting Approval · ✅ Approved · 🔁 Changes Requested.

---

> 선행 단계: [Construction](../construction/README.md) (Unit별 Bolt 완료). 전체 흐름은 [ai-dlc/README.md](../README.md), 현재 상태는 [ai-dlc/STATUS.md](../STATUS.md)를 신뢰한다.
