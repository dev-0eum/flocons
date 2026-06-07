---
description: AI-DLC Inception(구상)을 실행한다. app-pm 리드 mob으로 요구사항→유저 스토리→Unit of Work 백로그→기술 스택을 산출하고, 끝에서 멈춰 백로그+스택 승인을 사람에게 요청한다.
argument-hint: (인자 없음)
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
model: opus
---

당신은 flocons 프로젝트의 **AI-DLC Inception(구상) 단계**를 구동하는 오케스트레이터다.
**app-pm**을 리드로 하는 Inception mob을 가동해 요구사항·유저 스토리·Unit of Work 백로그·기술 스택을 *제안*으로 산출하고, 마지막에 **반드시 멈추고** 사람에게 승인을 요청한다.

> **핵심 원칙 — "AI proposes, human disposes."**
> 이 커맨드의 모든 산출물은 *제안*이다. 구속력 있는 결정은 단계 끝 체크포인트에서 **사람**이 내린다.
> 사람 승인 전에는 Construction으로 넘어가지 않으며, [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)의 Inception을 ✅ Approved로 바꾸지 않는다.

---

## 0. 시작 전 — 근거 읽기 (필수)

작업 전 다음을 Read로 읽어 모든 산출물의 근거로 삼는다. 임의 추정 대신 이 문서들을 인용한다.

- [docs/DESIGN.md](../../docs/DESIGN.md) — 제품/아키텍처 단일 진실 소스(SSOT). §2 UX 흐름, §4 데이터 모델, §5 콘텐츠 폴백, §6 SRS, §7 기술 스택, §11 비목표/가정.
- [docs/ROADMAP.md](../../docs/ROADMAP.md) — M0~M12 마일스톤(= Unit of Work 시드).
- [docs/HARNESS.md](../../docs/HARNESS.md) — 자율 개발 운영 규약 + 검증 게이트.
- [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md) — 현재 단계/상태. **먼저 읽어 현재 위치를 파악한다.**
- [ai-dlc/00-tech-stack.md](../../ai-dlc/00-tech-stack.md) — 확정 기술 스택(이번에 갱신 검토).
- [ai-dlc/inception/README.md](../../ai-dlc/inception/README.md) — 이 단계 안내 + 템플릿 목록.

## 1. 분기 판단 — 신규 실행 vs 승인 후 재호출

[ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)의 Inception 상태를 보고 둘 중 하나로 동작한다.

- Inception이 **⬜ Pending / 🔵 In Progress / 🔁 Changes Requested** → **§2 신규/재작업 실행**으로 간다.
- Inception이 **⏸️ Awaiting Approval**인데 사람이 이번 메시지에서 "승인"(또는 동등 표현)을 보냈다 → **§4 승인 후 처리**로 간다.
- Inception이 이미 **✅ Approved** → 더 할 일 없음을 알리고, 다음으로 `/construction <unit-id>` 실행을 안내한다(STATUS를 바꾸지 않는다).

승인 여부가 모호하면 임의로 진행하지 말고 사람에게 명확히 묻는다.

## 2. 신규/재작업 실행 — Inception mob 가동

[ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)의 Inception을 **🔵 In Progress**로 갱신하고 시작한다.

### Mob 구성 (이 단계)
- **app-pm** — 리드. 요구사항·유저 스토리·Unit of Work 정의, 우선순위·스코프 관리.
- **back-dev** — 앱 로직/서비스(ContentProvider, AI 통합, SRS, `lib/`, 상태 스토어) 관점의 실현가능성 의견.
- **front-dev** — UI/제스처(reanimated)/내비(expo-router)/테마/접근성 관점의 의견.
- **db-dev** — 로컬 영속화(AsyncStorage/expo-secure-store)·데이터 스키마·시드 데이터셋 관점의 의견.
- **cloud-dev** — 빌드/배포·CI·관측성·향후 동기화 관점의 아키텍처/실현가능성 의견.
- **code-review** — 계획(요구사항·Unit 분해·아키텍처 결정)을 리뷰. 코드는 작성하지 않고 정확성·단순화·일관성을 지적.

진행은 app-pm이 리드한다. 각 dev 에이전트의 관점 의견을 모아 합의로 수렴시키고, code-review에게 계획 리뷰를 받는다.

### 사용자 입력 반영
사용자가 이번 요청에 함께 보낸 의도·제약·추가 요구가 있으면 `docs/`의 근거와 함께 요구사항에 녹인다. 입력이 없으면 `docs/DESIGN.md`·`docs/ROADMAP.md`를 출발점으로 삼는다.

### 산출물 4종 — 템플릿 복제 후 채우기
각 산출물은 대응하는 `*.template.md`를 **복제해** `.md`로 채운다(템플릿 원본은 보존). 모든 교차 링크는 리포지토리 루트 기준 상대경로 마크다운 링크로 쓴다.

1. **요구사항** → [ai-dlc/inception/01-requirements.template.md](../../ai-dlc/inception/01-requirements.template.md)를 복제해 `ai-dlc/inception/01-requirements.md` 작성.
   - 목표/비목표/기능·비기능 요구사항/제약/가정/리스크/미해결 질문. 근거는 `docs/DESIGN.md`(§2·§4·§5·§6·§11)·`docs/ROADMAP.md`로 링크. 비목표는 DESIGN §11(계정/클라우드 동기화·소셜·결제 등)을 지킨다.
2. **유저 스토리** → [ai-dlc/inception/02-user-stories.template.md](../../ai-dlc/inception/02-user-stories.template.md)를 복제해 `ai-dlc/inception/02-user-stories.md` 작성.
   - "`<역할>`로서 `<무엇>`을 하고 싶다, 그래서 `<왜>`" + 수용 기준(Given/When/Then). 핵심 UX(스와이프 분류·SRS 복습·무료 TTS·키 없을 때 정적 폴백)를 사용자 가치로 풀어낸다. 각 스토리에 연관 FR-ID와 후보 Unit ID를 단다.
3. **Unit of Work 백로그** → [ai-dlc/inception/03-units-of-work.template.md](../../ai-dlc/inception/03-units-of-work.template.md)를 복제해 `ai-dlc/inception/03-units-of-work.md` 작성.
   - `docs/ROADMAP.md` M0~M12에서 도출한 시드(`UoW-00-scaffold`~`UoW-12-expand`)를 출발점으로 각 Unit의 ID·제목·설명·의존성·담당 mob 리드(UI→front-dev / 로직·서비스→back-dev / 데이터·영속화→db-dev)·수용기준(DoD)·리스크·상태(초기 ⬜ Pending)를 채운다. 각 Unit은 한 Bolt로 독립적으로 설계·구현·테스트 가능해야 한다.
4. **아키텍처 결정** → [ai-dlc/inception/04-architecture-decision.template.md](../../ai-dlc/inception/04-architecture-decision.template.md)를 복제해 `ai-dlc/inception/04-architecture-decision.md` 작성.
   - mob 의견을 반영한 ADR(맥락/결정/대안/결과). 핵심 결정: ContentProvider 추상화 + 키 유무에 따른 Static/AI 선택과 폴백(DESIGN §5), Leitner SRS의 `srs/` 격리(§6), Zustand+persist 영속화, expo-speech 무료 TTS, expo-secure-store 비밀키.

### 기술 스택 확정 검토
[ai-dlc/00-tech-stack.md](../../ai-dlc/00-tech-stack.md)를 `docs/DESIGN.md` §7과 대조해 **확정 검토·갱신**한다(런타임 Expo+TS, 라우팅 expo-router, 상태 Zustand+persist, 제스처/애니메이션 react-native-gesture-handler+reanimated, 발음 expo-speech fr-FR, 비밀키 expo-secure-store, 테스트 Jest+@testing-library/react-native, 검증 tsc/eslint/jest/expo export). 변경·확정 근거는 04-architecture-decision의 ADR로 기록한다.

> 작성한 4종 산출물과 00-tech-stack.md의 상태 머신 표기(⬜/🔵/⏸️/✅/🔁)와 STATUS 어휘는 [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md) 범례와 정확히 일치시킨다.

## 3. 멈춤 — 승인 체크포인트 (반드시 수행)

산출물을 다 쓴 뒤 **반드시 멈춘다.** 다음을 수행한다.

1. [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md) 갱신:
   - 단계별 상태 표의 **Inception**을 **⏸️ Awaiting Approval**로, "마지막 갱신"을 오늘 날짜(`YYYY-MM-DD`)로.
   - "현재 위치(한눈에)"의 현재 상태/대기 중인 체크포인트/다음 액션을 승인 대기 상태로.
   - "대기 중인 체크포인트" 표를 **Inception 산출물 승인** 대기로 갱신.
   - Construction/Operations는 **⬜ Pending 그대로** 둔다.
2. 사람에게 다음 **두 가지 승인**을 요청한다(이것이 Inception 종료 체크포인트다):
   - (1) **Unit of Work 백로그**([ai-dlc/inception/03-units-of-work.md](../../ai-dlc/inception/03-units-of-work.md)) — 범위·우선순위·분해 단위
   - (2) **기술 스택 + 아키텍처 결정**([ai-dlc/00-tech-stack.md](../../ai-dlc/00-tech-stack.md) + [ai-dlc/inception/04-architecture-decision.md](../../ai-dlc/inception/04-architecture-decision.md))
3. 산출물 위치와 핵심 요약, 미해결 질문을 짧게 제시하고 사람의 결정을 기다린다.

> ⛔ 이 시점에서 **Construction으로 진행하지 않는다.** STATUS의 Inception을 ✅ Approved로 바꾸지 않는다.
> 사람이 수정을 요구하면 STATUS를 **🔁 Changes Requested**로 두고 해당 산출물을 고친 뒤 다시 §3의 승인 요청을 반복한다.

## 4. 승인 후 처리 (사람이 "승인"이라고 답한 경우에만)

사람이 백로그 + 기술 스택을 승인했을 때만 다음을 수행한다.

1. [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md) 갱신:
   - **Inception → ✅ Approved**, "승인자"·"마지막 갱신"(오늘 날짜) 기록, "의사결정 로그"에 승인 결정 1행 추가.
   - **Construction → 준비 상태로** 전환: "Construction — Unit of Work 진행" 표에 승인된 03-units-of-work.md의 Unit들을 행으로 채우고(상태 ⬜ Pending), 단계별 상태 표의 Construction을 다음 단계 시작 가능 상태로 갱신.
   - "현재 위치(한눈에)"의 현재 단계를 Construction으로, 다음 액션을 `/construction <unit-id>`로 갱신.
   - **Operations는 ⬜ Pending 그대로** 둔다.
2. 각 산출물 문서 상단의 상태 표기도 ✅ Approved로 맞춘다.
3. 다음 단계를 안내한다: 첫 Unit(보통 `UoW-00-scaffold`)부터 [/construction](../../.claude/commands/construction.md) `<unit-id>`로 Bolt를 시작한다. Construction은 설계 후(체크포인트 A)와 완료 후(체크포인트 B)에 각각 멈춘다.

## 절대 규칙

- 산출물은 **제안**일 뿐 — 결정은 사람이 한다("AI proposes, human disposes").
- 신규/재작업 실행은 §3에서 **반드시 멈추고** 사람 승인을 기다린다. 승인 전 Construction으로 진행 금지, STATUS를 ✅로 변경 금지.
- 템플릿(`*.template.md`)은 보존하고 복제본(`.md`)을 채운다.
- 상태 기호/어휘·단계명(Inception/Construction/Operations)·에이전트 name·경로는 [ai-dlc/STATUS.md](../../ai-dlc/STATUS.md)·[ai-dlc/README.md](../../ai-dlc/README.md)와 정확히 일치시킨다.
- 이 단계에서는 애플리케이션 코드(`app/`, `src/`)를 작성하지 않고, git 커밋/푸시·의존성 설치·npm/expo 실행을 하지 않는다.
