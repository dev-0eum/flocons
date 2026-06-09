# 03 — Unit of Work 백로그

> Inception 산출물 #3 (체크포인트의 핵심 승인 대상). 유저 스토리/요구사항을 **독립적으로 설계·구현·테스트 가능한 작업 단위(Unit of Work)** 로 쪼갠다.
> 각 Unit은 Construction에서 [/construction `<unit-id>`](../../.claude/commands/construction.md)로 Bolt(시간-압축 반복 사이클)를 돈다.
> 작성: **app-pm** 리드 mob, code-review 리뷰.

작성일: 2026-06-09 · 상태: ✅ Approved (2026-06-09, 0eum)

> ℹ️ 본 파일은 `.git` 손상 사고(2026-06-09) 후 재구성됨 — 내용은 사고 전 승인본과 동일.

---

## Unit ID 규약

`UoW-<NN>-<slug>` (예: `UoW-03-learn-deck`). NN은 권장 작업 순서, slug는 영문 kebab-case.

## 담당 mob 리드 규칙

Unit 성격에 따라 결정한다 — UI → **front-dev**, 로직/서비스 → **back-dev**, 데이터/영속화 → **db-dev**, 인프라/배포 → **cloud-dev**. 멤버에는 항상 **qa-dev**(테스트)와 **code-review**(리뷰 게이트)가 포함된다.

상태 기호: ⬜ Pending · 🔵 In Progress · ⏸️ Awaiting Approval · ✅ Approved · 🔁 Changes Requested.

---

## 백로그 (✅ 승인됨 — 2026-06-09)

| ID | 이름 | 설명 | 의존성 | mob 리드 | 수용 기준(DoD 요약) | 상태 |
|---|---|---|---|---|---|---|
| UoW-00-scaffold | 스캐폴드 & 툴링 | Expo+TS 초기화, expo-router 골격, ESLint/Prettier, Jest + 네이티브 모듈 mock, tsconfig strict, `verify` 스크립트, `.gitignore`, Node 핀, SDK 호환 버전 핀 | — | **back-dev** | typecheck/lint/test green, 네이티브 mock 스모크 통과, .gitignore 충족 | ✅ Approved |
| UoW-01-design-system | 디자인 시스템 & 베이스 컴포넌트 | `theme/` 토큰(라이트·articleColor m/f), TopBar/WordCard/ActionButtons/ProgressBar + 상태 슬롯 + 렌더/스냅샷 테스트. props-only | UoW-00 | **front-dev** | 정적 props 렌더가 레퍼런스 레이아웃 표현, 관사 색+텍스트, 스냅샷/게이트 통과 | ⬜ Pending |
| UoW-02-content-layer | 콘텐츠 계층 + A1 정적 데이터셋 | `Word`/`CardState` 타입(§4), `ContentProvider`+`StaticContentProvider`, A1 시드(~150), 유효성 테스트(validate.mjs를 jest로) | UoW-00 | **db-dev** (+content-gen) | 타입이 word.schema.json과 1:1, a1.json validate 오류 0, 게이트 통과 | ⬜ Pending |
| UoW-03-learn-deck | 학습 덱 화면(메인) | `/learn`, 스와이프 카드(gesture-handler+reanimated), 진행도/제외수/undo(인메모리), 빈 덱 처리 | UoW-01, UoW-02 | **front-dev** | 좌/우 스와이프로 onClassify+전환, undo 복원, 빈 상태, 인터랙션 테스트, 게이트 통과 | ⬜ Pending |
| UoW-04-tts | 발음(TTS) | `lib/tts.ts` expo-speech 얇은 래퍼(fr-FR), speakWord/speakExample, 설정 rate/voice 주입 | UoW-00 | **back-dev** | Speech mock으로 텍스트·언어코드·rate 검증, 설정 기본값 반영, 게이트 통과 | ⬜ Pending |
| UoW-05-srs | SRS 엔진 + 영속화 | `srs/leitner.ts` 순수 함수(now 주입·간격 상수), `store/deckStore`(zustand+persist/AsyncStorage, version+migrate+partialize), `lib/storage.ts` | UoW-02 | **back-dev** (+db-dev) | leitner 결정적 단위 테스트(0/1/3/7/16일), 분류→CardState, 라운드트립·마이그레이션 테스트, 게이트 통과 | ⬜ Pending |
| UoW-06-review-stats | 복습 화면 + 통계 | `/review`(due 카드만 /learn 덱 재사용), `/stats`(streak/단어수/레벨), 날짜 경계/타임존 | UoW-03, UoW-05 | **front-dev** (+back-dev) | due 카드만 큐잉, 0건 시 빈/완료, stats 정확, 날짜 경계 테스트, 게이트 통과 | ⬜ Pending |
| UoW-07-bookmarks | 북마크 | WordCard/TopBar 북마크 토글(콜백), `/bookmarks` 목록, 거기서 복습, 영속 CardState.bookmarked | UoW-01, UoW-05 | **front-dev** (+db-dev) | 토글이 영속 상태와 일치, 목록은 북마크만, 목록→복습, 게이트 통과 | ⬜ Pending |
| UoW-08-settings-keys | 설정 & API 키 입력(폴백 골격) | `/settings`(TTS/레벨/초기화 UI), 키 입력(secureTextEntry)→`lib/secureKeys.ts`(expo-secure-store), settingsStore에 hasKey만, selectProvider 골격 | UoW-00, UoW-01 | **front-dev** (+back-dev/db-dev) | 키는 secure-store에만(평문 무노출), hasKey 갱신, 삭제 시 Static 회귀, 게이트 통과 | ⬜ Pending |
| UoW-09-ai-provider | AIContentProvider(Anthropic) | 주입형 HTTP 클라이언트, enrich 결과 캐시(wordId+level+providerVersion), 키없음/에러 시 Static 폴백, selectProvider 순수 함수 | UoW-02, UoW-08 | **back-dev** | 키 토글 경로 전환을 가짜 클라이언트(성공/타임아웃/4xx/5xx)로 테스트, 키 미노출, 게이트 통과 | ⬜ Pending |
| UoW-10-images | 이미지 | (1) 카테고리 플레이스홀더(결정적 매핑, 무키, v1 필수) (2) AIImageProvider(이미지 키 시, imagePrompt 소비, 캐시, 실패 시 폴백) | UoW-02, UoW-08 | **back-dev** (+content-gen) | 키 없으면 플레이스홀더, 키 있으면 생성·캐시·폴백(가짜 클라이언트 검증), 게이트 통과 | ⬜ Pending |
| UoW-11-onboarding-polish | 온보딩 & 폴리시 | 첫 실행 온보딩/레벨 선택, 햅틱(expo-haptics)·접근성(대비/폰트/스와이프 라벨), 빈/완료 축하 | UoW-01, UoW-03, UoW-06, UoW-08 | **front-dev** | 온보딩→레벨로 시작, 햅틱·폰트 스케일·WCAG AA·accessibilityAction, 빈/완료 화면, 게이트 통과 | ⬜ Pending |
| UoW-12-expand | 확장 & 마감 | A2/B1 데이터셋(동일 스키마/validate, id 규약), 기존 A1 id 보존, 테스트 보강, README, SQLite 이관 재평가 | UoW-02 | **db-dev** (+content-gen) | a2/b1 validate 오류 0, A1 id 보존, 커버리지, README 실행/검증법, 게이트 통과 | ⬜ Pending |

> **의존성 그래프(요약)**: UoW-00이 전 Unit 선행. UoW-02는 UoW-05/03/09/10/12의 데이터 계약 선행. UoW-09는 UoW-08(키 플래그) 선행. UoW-10은 (1)플레이스홀더/(2)AI 렌더 2단계(후자 옵셔널·후순위). 순환 없음(DAG).

## 시드 대비 변경 사항 (Inception mob 반영)
- **UoW-00 리드 `cloud-dev` → `back-dev`**: 스캐폴드 핵심이 네이티브 mock·`verify` 스크립트라 back-dev 영역. CI 워크플로는 Operations로 격리.
- **UoW-07 리드 `back-dev` → `front-dev`(+db-dev)**: 산출 대부분이 토글 UI/목록.
- **UoW-08 의존성 `UoW-05` → `UoW-00, UoW-01`**: 설정은 SRS 비의존, 스캐폴드+디자인 시스템만 선행.
- **UoW-10 리드 `front-dev` → `back-dev`(+content-gen)**: 플레이스홀더·AIImage 캐시/폴백이 서비스 로직, imagePrompt가 데이터셋 의존.
- **UoW-11 의존성에 `UoW-01`(디자인 시스템)·`UoW-08`(settingsStore) 추가**: 온보딩/레벨 선택이 디자인 시스템·설정 스토어 사용. 02 US-10과 일치.
- **UoW-04 의존성 `UoW-01` → `UoW-00`**: tts 래퍼는 서비스 모듈이라 디자인 시스템과 독립.
