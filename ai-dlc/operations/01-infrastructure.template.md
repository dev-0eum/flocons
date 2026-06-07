# 01 — 인프라 / 환경 / 시크릿 (Infrastructure)

> Operations 산출물 #1. flocons를 빌드/배포할 **환경**과 **시크릿** 경계를 정의한다.
> 작성: **cloud-dev** 리드 mob (qa-dev · code-review, 필요 시 back-dev).
> 근거: [docs/DESIGN.md](../../docs/DESIGN.md) §5·§7 · [docs/HARNESS.md](../../docs/HARNESS.md) §5 · [ai-dlc/00-tech-stack.md](../00-tech-stack.md).
> `<...>`는 자리표시자, `TODO`는 채워야 할 항목이다. 채운 뒤 표시자와 본 안내 블록을 정리한다.
> **실제 적용(EAS 프로필 생성·환경 설정)은 [README.md](README.md)의 승인 체크포인트 이후에만 한다.**

작성일: `<YYYY-MM-DD>` · 작성: cloud-dev + Operations mob · 상태: `<⬜ Pending | 🔵 In Progress | ⏸️ Awaiting Approval | ✅ Approved | 🔁 Changes Requested>`

---

## 1. 한 줄 요약

`<이 앱을 어떤 플랫폼에 어떤 환경 구분으로 빌드/배포하는지 한 문장>`

## 2. 대상 플랫폼

- iOS: `<예: Expo Go(개발) → EAS Build(배포)>`
- Android: `<예: 동일 코드베이스 공용>`
- TODO: `<웹 등 추가 타깃이 있으면 기술>`

## 3. 환경 (Environments)

| 환경 | 용도 | 빌드 채널 / 프로필 | 콘텐츠 경로(Static/AI) |
|---|---|---|---|
| development | `<로컬 개발 / Expo Go>` | `<예: eas profile "development">` | `<예: 키 없음 → Static>` |
| preview | `<내부 테스트 / 사전 배포>` | `<예: eas profile "preview">` | `<...>` |
| production | `<스토어 배포>` | `<예: eas profile "production">` | `<...>` |
| TODO | | | |

## 4. EAS 구성 (계획)

> `eas.json`의 빌드 프로필 **계획**. 승인 전에는 파일을 실제로 만들지 않는다.

```jsonc
// eas.json (제안 — 승인 후 적용)
{
  "build": {
    "development": { /* <개발 클라이언트/시뮬레이터 옵션> */ },
    "preview":     { /* <내부 배포 옵션> */ },
    "production":  { /* <스토어 빌드 옵션> */ }
  }
  // "submit": { ... }  // <스토어 제출은 02-cicd / 04-runbook 참고>
}
```

- 빌드 트리거: `<예: 수동(eas build) / CI 태그 푸시>` — 상세 [02-cicd.template.md](02-cicd.template.md)
- OTA 업데이트: `<예: EAS Update 채널 운영 / 사용 안 함>`
- TODO: `<런타임 버전 정책, 빌드 캐시 등>`

## 5. 시크릿 / 환경변수 관리 (핵심)

> **재확인 ([docs/HARNESS.md](../../docs/HARNESS.md) §5 · [docs/DESIGN.md](../../docs/DESIGN.md) §5):**
> - **런타임 API 키(Anthropic/이미지/유료 TTS)는 사용자가 설정 화면에서 입력하며 `expo-secure-store`에만 저장한다.** 코드·데이터·번들·커밋에 넣지 않는다.
> - **`.env*`, `*.key`는 절대 커밋하지 않는다**(`.gitignore`에 포함 — 점검 항목).
> - 빌드/CI에서 비밀이 필요하면 **EAS Secrets / CI 시크릿 스토어**에만 둔다(로그에 출력 금지).

| 비밀/변수 | 저장 위치 | 누가 주입 | 커밋? |
|---|---|---|---|
| Anthropic API 키(런타임) | `expo-secure-store` | 사용자(설정 화면) | ❌ 절대 금지 |
| 이미지 생성 키(런타임) | `expo-secure-store` | 사용자(설정 화면) | ❌ 절대 금지 |
| 빌드/제출 자격증명(예: EAS 토큰) | `<EAS Secrets / CI 시크릿>` | `<운영자/CI>` | ❌ |
| 공개 설정값(비밀 아님) | `<app.config / 환경별 상수>` | `<빌드 시>` | `<문서화>` |
| TODO | | | |

- `.gitignore` 점검: `<node_modules / .expo / dist / .env* / *.key 포함 확인>`
- 비밀 노출 시 대응: `<키 폐기·회전 절차 — 04-runbook 사고 대응 참고>`

## 6. IaC / 자산 (있으면)

- `<예: 클라우드 리소스 없음(온디바이스 전용). 향후 동기화 시 IaC로 기술>`
- TODO: `<리소스가 생기면 정의/버전관리 방식>`

## 7. 리스크 / 미해결 질문

| ID | 항목 | 영향 | 완화책 / 결정 필요 |
|---|---|---|---|
| OPS-INF-01 | `<예: 스토어 자격증명 관리 주체>` | `<상/중/하>` | `<사람 결정 필요>` |
| TODO | | | |

---

> 다음 산출물: [02-cicd.template.md](02-cicd.template.md) → [03-observability.template.md](03-observability.template.md) → [04-runbook.template.md](04-runbook.template.md).
> 이 문서는 Operations 변경 체크포인트에서 사람 승인 대상이다. [README.md](README.md) 참고.
