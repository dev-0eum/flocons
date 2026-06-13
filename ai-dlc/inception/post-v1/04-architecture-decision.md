# 04 — 아키텍처 결정 (ADR) · post-v1 라운드

> Inception 산출물 #4 (post-v1). 누적 구조 + 수익화의 **구속력 있는 아키텍처/기술 결정**을 ADR로 남긴다(제안 — 사람 승인 대기).
> 결정의 단일 진실 소스는 [ai-dlc/00-tech-stack.md](../../00-tech-stack.md), 본 문서는 *맥락·대안·결과*. v1 ADR-001~010은 [../04-architecture-decision.md](../04-architecture-decision.md). 본 라운드는 **ADR-011부터** 잇는다.
> 작성: app-pm 리드 mob(back/front/db/cloud-dev 의견), code-review 리뷰(2026-06-13, 코드 근거).

작성일: 2026-06-13 · 상태: ✅ Approved (2026-06-13, 0eum)

---

## ADR-011 — 누적 구조 = 5층 DAG + soft-gate (hard-lock 아님)

- 상태: ✅ Approved · 관련 Unit: UoW-13, UoW-14
- 맥락: 단어→문장→문법→응용→활용을 "쌓이는 구조"로([DESIGN §12.1](../../../docs/DESIGN.md)). WaniKani식 의존성 게이팅은 동기부여에 강하나 hard-lock + 누적 리뷰가 번아웃·정체를 낳음.
- 결정: 5층을 선행 의존 DAG로 모델링하고, 하위층 SRS 굳기(Leitner `box`)가 상위층을 **soft-unlock**(추천·강조)한다. 강제 차단(hard-lock) 없음, 비선형 자유 열람 보장. unlock 판정은 `src/srs/softGate.ts` **순수 함수**(`Record<string,CardState>` + 층 임계맵 → `locked|preview|unlocked`)로 격리. 진척 지표는 XP가 아닌 "산출 가능 청크/문장 수"(`masteredWordIds` 위 파생). 비강압(Forest식): 미루면 "흐려졌다 다시 선명", 굳은 항목 영구 보존, 스트릭/푸시 없음.
- 대안: (A) WaniKani식 hard-lock — 번아웃·자율성 박탈로 비채택. (B) 게이팅 없는 자유 진입 — "쌓임" 서사·페다고지(i+1) 약화로 비채택.
- 결과: (+) 메타포=시스템 규칙, 비강압 유지. (−) "추천만/잠금 표시" UX 정책 합의 필요(front-dev). leitner.ts에 직접 의존하나 순수 격리로 테스트 용이.

## ADR-012 — 신규 영속 스토어는 v1 모듈 상태 패턴 계승 (zustand 미사용)

- 상태: ✅ Approved · 관련 Unit: UoW-14, UoW-17, UoW-19
- 맥락: v1은 zustand v5 tsc 무한 추론 이슈로 "모듈 상태 + subscribe + useSyncExternalStore + AsyncStorage persist" 패턴 채택(ADR-002 수정, 2026-06-10). 신규 상태(진척·산출물·엔타이틀먼트) 필요.
- 결정: 신규 스토어 `progressStore`(`flocons:progress:v1`)·`outputStore`(`flocons:usage:v1`)·`entitlementStore`(`flocons:entitlement:v1`)를 **동일 패턴**으로. 각 `version`+`migrate`+`partialize`(가변만). 데이터 초기화(resetCards 류)에 진척/산출물 포함 여부 명시(Q-P6). 키 네임스페이스 `flocons:<domain>:v1` 일관.
- 대안: zustand 재도입 — v1에서 제거한 이유 유효, 비채택. 단일 거대 스토어 — 관심사 분리·초기화 정책 위해 도메인별 분리.
- 결과: (+) 패턴 일관·후방 호환. (−) 스토어 증가 → `src/store/STORE_PATTERN.md`로 패턴 명문화 권장(back-dev). cardStore 변경 시 progress 재계산 트리거 설계 필요.

## ADR-013 — 예문 하이라이트는 신규 인프라 (볼드 타깃 "재사용" 아님)

- 상태: ✅ Approved · 관련 Unit: UoW-13, UoW-15
- 맥락: DESIGN §12.1 초안이 "기존 볼드 타깃 재사용"을 전제했으나, **코드 검증 결과 존재하지 않음** — `WordCard.tsx`는 예문을 단순 `<Text>`로, `toWordCardData.ts`는 토큰/스팬 메타 없이 매핑(code-review blocker A).
- 결정: 하이라이트는 **신규 구축**한다. (a) 예문 내 타깃 토큰 위치 식별(토크나이즈/스팬, 토큰 경계 정확 매칭 — 중복 토큰 `le` 오마스킹 방지), (b) 리치 텍스트 렌더(`SentenceCard`의 청크 강조). `Word`에 선택 필드 `chunks?`/`targetTokens?`/`grammarPattern?` 추가(전부 optional, `word.schema.json` `additionalProperties:false` 아래 **db-dev가 단일 스키마 PR로 관리**). cloze 마스킹은 `srs/cloze.ts` 순수 함수.
- 대안: 런타임 LLM 토크나이즈 — 무키 동작·결정성 위반, 비채택. 데이터에 사전 마스킹 — 유연성↓, 청크 메타로 대체.
- 결과: (+) 무키·결정적·테스트 용이. (−) UoW-13 공수 재산정(과소 산정 정정). content-gen 백필(청크/grammarPattern) 병행 필요.

## ADR-014 — BYOK 산출 피드백은 enrich와 분리된 FeedbackClient

- 상태: ✅ Approved · 관련 Unit: UoW-16, UoW-17
- 맥락: 현 `EnrichClient.enrich(word)→EnrichedExample`은 "대체 예문 1개" 전용(ENRICH_SCHEMA·SYSTEM_PROMPT 예문 생성용). 산출 교정은 입력(학습자 산출물+정답)·출력(교정 피드백)이 다름. classifyCard는 스와이프 분류 전용 SRS 진입점.
- 결정: enrich와 **분리된** `FeedbackClient`(`evaluate(task, learnerOutput)→FeedbackResult{isCorrect, explanation, correctedOutput}`) 신규. 별도 팩토리(selectProvider도 enrich 전용). 키 없거나 실패 시 정적 정답+해설 폴백. **산출 정오답을 `classifyCard`에 전달 금지** — 별도 진척 카운터(ADR-012)에만. UoW-16/17이 FeedbackClient 공유(→16이 17 선행, Q-P8). reorder는 토큰 배열 비교, 키 없는 폴백 품질 확보.
- 대안: enrich 클라이언트 확장 재사용 — API 계약 상이로 결합도↑, 비채택. SRS에 산출 신호 통합 — SRS 오염, **금지**(code-review·cloud-dev 확인).
- 결과: (+) SRS 무결성·BYOK 유료화 금지(non-negotiable) 정합·옵션 강화. (−) Anthropic 호출 유틸 일부 중복(무리한 공통화 지양).

## ADR-015 — 설경 시각화: RN View 1차, react-native-svg는 선택적 게이트 / 엔진·시각화 분리

- 상태: ✅ Approved · 관련 Unit: UoW-14(엔진), UoW-18(시각화)
- 맥락: 설경 Unit은 (a) soft-gate 로직(순수·무의존)과 (b) 시각화(렌더)라는 성격이 다른 두 덩어리. react-native-svg는 미설치(단, cloud-dev: Expo SDK가 포함 → `expo install`로 Expo Go 호환, prebuild 불필요). reanimated 4/newArch 버전 민감.
- 결정: Unit을 **UoW-14(soft-gate 엔진, 무의존, 먼저)** / **UoW-18(설경 시각화, 나중)** 로 분리. 시각화 1차는 **RN View/그라데이션**(`Placeholder.tsx` 선례)로 무의존 구현. react-native-svg는 **검증 게이트**(Context7 SDK55 호환 + `expo install` + `expo export` green + 디바이스 프레임 검증) 통과 시에만 도입.
- 대안: 처음부터 SVG 강제 — 핵심 경로를 의존성 리스크로 막음, 비채택.
- 결과: (+) svg 리스크가 누적 구조 핵심 경로를 막지 않음, 엔진 선행 가치. (−) 시각화 표현이 1차엔 제한적일 수 있음(층 충분해진 뒤 UoW-18에서 고도화).

## ADR-016 — 수익화 = buy-once 비소비성 IAP + Restore(무계정), EAS prebuild hard-dependency

- 상태: ✅ Approved · 관련 Unit: UoW-19
- 맥락: [DESIGN §12.2](../../../docs/DESIGN.md) depth-paywall + 구독 아닌 평생 1회. 현재 100% 관리형(ios/·eas.json·bundleIdentifier 전무). StoreKit IAP는 Expo Go 불가(네이티브). 무계정 원칙.
- 결정: 깊은 층 전체를 여는 **단일 비소비성 IAP "결정 평생 해금"** + **Restore Purchases**(계정 없이 영수증 복원). `entitlementStore`에 `crystalUnlocked` 영속, `isLayerAccessible(layer, unlocked)` 순수 함수로 paywall 격리(soft-gate(ADR-011)와 **별개** — 학습 진척 vs 구매 권한). 무료 핵심(단어층·SRS·TTS·통계·오프라인) **영구 무료·인질 금지**, 문장 첫 레슨 무료 미리보기(경계 소유 Unit=13). non-negotiables: 광고·데이터판매·BYOK유료화·구독 **금지**. **hard-dependency: Operations EAS prebuild + UoW-13~17 완료 + Apple Developer Program($99/년)·App Store Connect 상품 등록**(HARNESS §7 인간 에스컬레이션). IAP 라이브러리(react-native-iap vs RevenueCat)·CNG vs bare·가격(₩19,000~29,000 가늠치) 검증은 Operations/체크포인트에서 확정(Q-P7).
- 대안: 구독(월/연) — 한국 구독 피로·컴플라이언스·브랜드 충돌, 비채택(NG3). 클라우드 싱크 유료 — 무계정 위반, 보류. B2B — 아키텍처 상이, 보류.
- 결과: (+) 브랜드 4기둥·한국 정서·규제(전자상거래법 2025.2/공정위 2025.10) 정합. (−) 절대 LTV 낮음(가격 동결 서약으로 자기구속), Operations 의존·외부 인간 작업 필수 → 항상 최후미.

---

## 기술 스택 확정 (post-v1 추가/검토 요약)

전체 표는 [00-tech-stack.md](../../00-tech-stack.md). 본 라운드에서 *추가/검토*한 항목만:

| 영역 | 선택/검토 | 관련 ADR | 비고 |
|---|---|---|---|
| 진척/산출/엔타이틀먼트 상태 | 신규 스토어(모듈 상태+AsyncStorage persist, v1 패턴) | ADR-012 | zustand 미사용, version+migrate |
| 예문 하이라이트/cloze | `Word.chunks?`/`targetTokens?`/`grammarPattern?` + `srs/cloze.ts`·`srs/softGate.ts` 순수함수 | ADR-013, ADR-011 | 신규 인프라(재사용 아님) |
| BYOK 피드백 | 신규 `FeedbackClient`(enrich와 분리) | ADR-014 | 키 없으면 정적 폴백 |
| 설경 시각화 | RN View 1차 / `react-native-svg` 선택(게이트) | ADR-015 | Expo Go 호환·`expo install`·Context7 검증 |
| 결제 | 비소비성 IAP + Restore, IAP 라이브러리 **미정** | ADR-016 | **EAS prebuild(Operations) 선행** |
| 검증 게이트 | v1과 동일(tsc/eslint/jest/expo export) | — | 신규 라우트→export 포함, 순수함수 jest |

---

> 이 문서(+ [00-tech-stack.md](../../00-tech-stack.md))는 post-v1 Inception 종료 체크포인트에서 **Unit 백로그와 함께 사람 승인 대상**이다. "AI proposes, human disposes" — 승인 전 상태를 ✅ Approved로 바꾸지 않는다. [../README.md](../README.md) · [ai-dlc/STATUS.md](../../STATUS.md) 참고.
