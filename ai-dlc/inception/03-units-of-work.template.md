# 03 — Unit of Work 백로그

> Inception 산출물 #3 (체크포인트의 핵심 승인 대상). 유저 스토리/요구사항을 **독립적으로 설계·구현·테스트 가능한 작업 단위(Unit of Work)** 로 쪼갠다.
> 각 Unit은 Construction에서 [/construction &lt;unit-id&gt;](../../.claude/commands/construction.md)로 Bolt(시간-압축 반복 사이클)를 돈다.
> 작성: **app-pm** 리드 mob, code-review 리뷰. `<...>`는 자리표시자, `TODO`는 채울 항목.

작성일: `<YYYY-MM-DD>` · 상태: `<⬜ Pending | 🔵 In Progress | ⏸️ Awaiting Approval | ✅ Approved | 🔁 Changes Requested>`

---

## Unit ID 규약

`UoW-<NN>-<slug>` (예: `UoW-03-learn-deck`). NN은 권장 작업 순서, slug는 영문 kebab-case.

## 담당 mob 리드 규칙

Unit 성격에 따라 결정한다 — UI → **front-dev**, 로직/서비스 → **back-dev**, 데이터/영속화 → **db-dev**, 인프라/배포 → **cloud-dev**. 멤버에는 항상 **qa-dev**(테스트)와 **code-review**(리뷰 게이트)가 포함된다.

상태 기호: ⬜ Pending · 🔵 In Progress · ⏸️ Awaiting Approval · ✅ Approved · 🔁 Changes Requested.

---

## 백로그 (제안 — 승인 필요)

아래 행들은 [docs/ROADMAP.md](../../docs/ROADMAP.md) M0~M12에서 도출한 **시드 제안**이다. 실제 범위·순서·분해 단위는 이 표를 사람이 검토·수정한 뒤 Inception 종료 체크포인트에서 확정한다.

| ID | 이름 | 설명 | 의존성 | mob 리드 | 수용 기준(요약) | 상태 |
|---|---|---|---|---|---|---|
| UoW-00-scaffold | 스캐폴드 & 툴링 | Expo+TS 초기화, ESLint/Prettier, Jest, tsconfig strict, `verify` 스크립트, `.gitignore` | — | cloud-dev | `<typecheck/lint/test 모두 통과, 스모크 1개>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-01-design-system | 디자인 시스템 & 베이스 컴포넌트 | `theme/` 토큰, TopBar, WordCard, ActionButtons + 렌더/스냅샷 테스트 | UoW-00 | front-dev | `<정적 props 렌더, 스냅샷 통과>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-02-content-layer | 콘텐츠 계층 + 정적 데이터셋 | `Word`/`CardState` 타입, `ContentProvider`+`StaticContentProvider`, A1 시드(~150) + 유효성 테스트 | UoW-00 | db-dev | `<필수 필드/중복ID/관사·성 정합성 테스트 통과>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-03-learn-deck | 학습 덱 화면(메인) | `/learn` 라우트, 스와이프 카드(gesture-handler+reanimated), 진행도/제외수/undo, 빈 덱 처리 | UoW-01, UoW-02 | front-dev | `<좌/우 스와이프 분류, undo, 인터랙션 테스트>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-04-tts | 발음(TTS) | `lib/tts.ts` expo-speech 래퍼(fr-FR), 단어/예문 재생, 속도/음성 반영 | UoW-01 | back-dev | `<단어/예문 각각 재생, 설정값 반영>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-05-srs | SRS 엔진 + 영속화 | `srs/leitner.ts` 박스/간격/스케줄, `store/deckStore`(zustand+persist) | UoW-02 | back-dev | `<분류 결과가 CardState에 반영·복원, 단위 테스트>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-06-review-stats | 복습 화면 + 통계 | `/review`(due 카드 큐잉), `/stats`(streak/단어수/레벨) | UoW-05 | front-dev | `<날짜 경계/타임존 처리 테스트>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-07-bookmarks | 북마크 | 카드 북마크 토글(영속), `/bookmarks` 목록 + 바로 복습 | UoW-05 | back-dev | `<토글 영속, 목록에서 복습 진입>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-08-settings-keys | 설정 & API 키 입력(폴백 골격) | `/settings`(TTS/레벨/초기화), 키 입력→expo-secure-store, 키 존재 여부 노출 | UoW-05 | front-dev | `<키 저장/삭제, 키 없으면 Static 선택>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-09-ai-provider | AIContentProvider(Anthropic) | Anthropic 호출 래퍼(예문/번역 보강)+캐시, 키 없음/에러 시 Static 폴백 | UoW-02, UoW-08 | back-dev | `<키 토글에 따라 경로 전환(네트워크 모킹)>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-10-images | 이미지 | 카테고리 플레이스홀더(그라데이션/색), `AIImageProvider`(이미지 키 뒤)+캐시 | UoW-02, UoW-08 | front-dev | `<키 없으면 플레이스홀더, 있으면 생성·캐시>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-11-onboarding-polish | 온보딩 & 폴리시 | 첫 실행 온보딩/레벨 선택, 햅틱·접근성, 빈/완료 상태 | UoW-03, UoW-06 | front-dev | `<온보딩 흐름, 대비/폰트 스케일>` | ⬜ Pending (제안 — 승인 필요) |
| UoW-12-expand | 확장 & 마감 | A2/B1 데이터셋, 테스트 보강, README 사용법/실행법 | UoW-02 | db-dev | `<데이터셋 유효성, 커버리지 점검>` | ⬜ Pending (제안 — 승인 필요) |
| TODO | `<신규 Unit>` | `<설명>` | `<의존성>` | `<리드>` | `<수용 기준>` | ⬜ Pending (제안 — 승인 필요) |

## Unit 상세 (선택 — 큰 Unit만)

필요하면 아래 블록을 복제해 Unit별 상세를 적는다. (간단한 Unit은 위 표만으로 충분.)

### UoW-`<NN>`-`<slug>`

- 포함 스토리: `<US-01, US-02 ...>`
- 산출 파일(예상): `<예: app/learn.tsx, src/components/SwipeCard.tsx ...>`
- 수용 기준: `<상세 — Given/When/Then 또는 체크리스트>`
- 검증 게이트 비고: `<UI/번들 영향 → expo export 필요 여부 등>`
- 리스크/의존성 메모: `<...>`

---

> 이 백로그는 Inception 종료 체크포인트에서 **기술 스택과 함께 사람 승인 대상**이다. 승인 시 각 행의 "(제안 — 승인 필요)" 표시를 제거하고 상태를 정리한다. [README.md](README.md) · [ai-dlc/STATUS.md](../STATUS.md) 참고.
