# 04 — 아키텍처 결정 (ADR)

> Inception 산출물 #4. 단계에서 내린 **구속력 있는 아키텍처/기술 결정**을 ADR(Architecture Decision Record) 형식으로 남긴다.
> 결정의 단일 진실 소스는 [ai-dlc/00-tech-stack.md](../00-tech-stack.md), 본 문서는 그 결정의 *맥락·대안·결과*를 기록한다.
> 작성: **app-pm** 리드 mob (back/front/db/cloud-dev 의견), code-review 리뷰.

작성일: 2026-06-09 · 상태: ✅ Approved (2026-06-09, 0eum)

> ℹ️ `.git` 손상 사고(2026-06-09) 후 재구성됨 — 승인 결정 내용 동일.

---

## ADR-001 — 콘텐츠 계층은 ContentProvider 추상화 + 키 기반 Static 폴백
- 상태: ✅ Approved · 관련 Unit: UoW-02, UoW-08, UoW-09, UoW-10
- 맥락: 키 없이도 완전 동작 + 키 있으면 AI 강화([DESIGN §5](../../docs/DESIGN.md)).
- 결정: `ContentProvider`(`getWords`/`enrich?`/`generateImage?`) 인터페이스. 선택 규칙(키 있음→AI·실패 시 Static / 키 없음→Static / 키 삭제→즉시 Static)을 `settingsStore`의 `hasContentKey`/`hasImageKey`만 입력받는 **`selectProvider` 순수 함수**로 격리.
- 대안: 처음부터 AI 의존(키 없는 사용자 차단) — 비채택.
- 결과: AI는 옵션 강화, 앱 동작이 키에 비의존. 테스트 용이.

## ADR-002 — 상태관리는 Zustand (스토어 분리)
- 상태: ✅ Approved · 관련 Unit: UoW-05, UoW-08
- 결정: Zustand + persist. `deckStore`(CardState)와 `settingsStore`(TTS/레벨/키 존재 여부) 분리.
- 대안: Redux Toolkit(과함), Context(영속/구독 비용). 결과: 보일러플레이트 최소.

## ADR-003 — Zustand persist는 version+migrate+partialize
- 상태: ✅ Approved · 관련 Unit: UoW-05
- 맥락: 클라우드 백업 없음(v1) → 마이그레이션 누락 = 데이터 유실.
- 결정: `version:1` + `migrate` 골격을 v1부터, `partialize`로 가변 상태만 직렬화(콘텐츠/비밀키 제외). 저장 키 네임스페이스(`flocons:deck:v1` 등). 라운드트립·마이그레이션 테스트 DoD.

## ADR-004 — 비밀키는 expo-secure-store 전용, store엔 hasKey만
- 상태: ✅ Approved · 관련 Unit: UoW-08, UoW-09, UoW-10
- 결정: 키 원문은 `expo-secure-store`에만. `store`/`persist`/로그/캐시엔 키를 직렬화하지 않고 `hasKey:boolean`만 노출([HARNESS §5](../../docs/HARNESS.md)).

## ADR-005 — TTS는 expo-speech, UI는 콜백만
- 상태: ✅ Approved · 관련 Unit: UoW-04
- 결정: `lib/tts.ts`(speakWord/speakExample, `fr-FR` 고정, rate/voice 주입). UI 컴포넌트는 콜백만 받고 expo-speech를 직접 import하지 않음(테스트·교체 용이).

## ADR-006 — AI enrich 캐시 키 = wordId+level+providerVersion
- 상태: ✅ Approved · 관련 Unit: UoW-09
- 결정: AsyncStorage 단순 키 캐시. 자동 TTL/무효화는 v1 비목표 — 명시적 "데이터 초기화" + 키 삭제 회귀로만 처리.

## ADR-007 — 이미지는 2단계(플레이스홀더 필수 / AIImageProvider 옵셔널)
- 상태: ✅ Approved · 관련 Unit: UoW-10, UoW-02, UoW-12
- 결정: (1) word→색/그라데이션 결정적 플레이스홀더(무키, v1 필수) (2) 이미지 키 시 `AIImageProvider`가 `imagePrompt` 소비·캐시·실패 시 폴백(옵셔널·후순위). `imagePrompt`는 데이터셋(content-gen)에서 미리 생성.

## ADR-008 — expo-router 레이아웃: (tabs) + 풀스크린 혼합
- 상태: ✅ Approved (Q3 권장값 채택: `(tabs)` 그룹 + 풀스크린 카드 라우트 혼합, 2026-06-09) · 관련 Unit: UoW-00, UoW-03, UoW-06
- 맥락: `/`·`/stats`·`/bookmarks`는 진입형, `/learn`·`/review`는 풀스크린(헤더 숨김).
- 결정: `(tabs)` 그룹 + 일반 stack 라우트(`learn`/`review`/`settings`) 혼합. 대안(전 화면 단일 stack / 전 화면 탭) 비채택.

## ADR-009 — Anthropic 클라이언트 택일은 UoW-09 진입 시 Context7 확인 후
- 상태: ✅ Approved (Q5 결정: SDK vs fetch 택일을 UoW-09로 위임, 주입 경계는 확정, 2026-06-09) · 관련 Unit: UoW-09
- 결정: 공식 SDK(`@anthropic-ai/sdk`) vs `fetch`는 Expo Go 호환성·번들 크기 기준으로 UoW-09 설계 시 Context7로 확인 후 결정. **주입 가능한 경계 유지**가 전제(결정 무관하게 모킹 가능).

## ADR-010 — Expo SDK 55 핀 (Expo Go 호환)
- 상태: ✅ Approved (2026-06-09) · 관련 Unit: UoW-00
- 맥락: `create-expo-app`이 막 `latest`로 풀린 SDK 56을 설치했으나 **iOS Expo Go가 아직 56 미지원**(릴리스 직후 Apple 심사 지연).
- 결정: 직전 안정판 **Expo SDK 55.0.26**으로 `expo install --fix` 전체 정렬(react 19.2.0, RN 0.83.6, expo-router 55.0.16). 56 지원 Expo Go가 풀리면 재평가.
- 결과: 사용자 iPhone Expo Go에서 즉시 실행 가능. 배포 타깃=RN/iOS(Operations), 웹=개발 미리보기.
