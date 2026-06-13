# 03 — Unit of Work 백로그 · post-v1 라운드

> Inception 산출물 #3 (체크포인트 핵심 승인 대상). 누적 학습 구조 + 수익화를 **독립적으로 설계·구현·테스트 가능한 Unit**으로 쪼갠다.
> 각 Unit은 Construction에서 [/construction &lt;unit-id&gt;](../../../.claude/commands/construction.md)로 Bolt를 돈다. 작성: **app-pm** 리드 mob, code-review 리뷰(2026-06-13, 코드 근거).

작성일: 2026-06-13 · 상태: ✅ Approved (2026-06-13, 0eum)

상태 기호: ⬜ Pending · 🔵 In Progress · ⏸️ Awaiting Approval · ✅ Approved · 🔁 Changes Requested.

---

## Unit ID 확정 + 가번호 매핑

> DESIGN §12 / ROADMAP "차기(post-v1)"의 가번호 **N1~N6**를 본 라운드에서 확정 ID **UoW-13~19**로 옮긴다(설경 Unit을 엔진/시각화로 분리해 6→7개). NN = **권장 작업 순서**(v1 규약 계승). 승인 시 ROADMAP/DESIGN의 N표기를 아래 표로 일괄 치환한다.

| 확정 ID | 가번호 | 층(메타포) | 한 줄 |
|---|---|---|---|
| UoW-13-sentence-layer | N1 | 문장 (첫 결정) | 익힌 단어로 i+1 청크 문장 |
| UoW-14-soft-gate-engine | N5(a) | 전체구조 (격자 로직) | 5층 DAG soft-gate 엔진(무의존, 순수) |
| UoW-15-grammar-cloze | N2 | 문법 (정렬된 격자) | 청크 패턴 → cloze 빈칸 산출 |
| UoW-16-apply-production | N3 | 응용 (쌓아 올리기) | 가이드 산출 + BYOK 교정 피드백 |
| UoW-17-usage-output | N4 | 활용 (설경) | 자유 작문 + 설경 편입 |
| UoW-18-snowscape-viz | N5(b) | 전체구조 (시각화) | 눈송이→결정→격자→설경 진척 시각화 |
| UoW-19-monetization-iap | N6 | 수익화 | 평생 해금 IAP(Operations 선행) |

## 담당 mob 리드 규칙

UI → **front-dev**, 로직/서비스 → **back-dev**, 데이터/영속화 → **db-dev**, 인프라/배포 → **cloud-dev**. 멤버에 항상 **qa-dev**(테스트) + **code-review**(리뷰 게이트). 콘텐츠 Unit은 **content-gen** 포함.

---

## 백로그 (제안 — 승인 필요)

| ID | 이름 | 설명 | 의존성 | mob 리드 | 수용 기준(요약) | 상태 |
|---|---|---|---|---|---|---|
| UoW-13-sentence-layer | 문장 층 | 익힌 단어 풀(`box≥임계` 파생) 기반 i+1 문장(청크 중심, 미지 1~2개). **신규 하이라이트 인프라**(볼드 재사용 아님) + 신규 라우트. 첫 레슨 무료. BYOK 생성/정적 폴백 | UoW-02(content), UoW-05(srs) | back-dev (+front-dev, content-gen) | i+1 문장 노출·청크 강조·빈 상태 폴백·정적 동작, 단위 테스트 | ⬜ Pending |
| UoW-14-soft-gate-engine | soft-gate 엔진 | 5층 DAG unlock 상태를 Leitner box 위 **순수 함수**(`srs/softGate.ts`)로. 진척 메트릭 "산출 가능 청크/문장 수". 신규 `progressStore`(persist+migrate, 데이터 초기화 연동). hard-lock 없음 | UoW-13 | back-dev (+db-dev) | unlock 상태 enum 결정성·경계 테스트, 진척 카운터 영속·복원 | ⬜ Pending |
| UoW-15-grammar-cloze | 문법 cloze | 청크 패턴(성·관사·활용·엘리지옹)을 cloze(토큰 마스킹 **순수 함수** `srs/cloze.ts`)로. `grammarPattern?` 태그(enum). CEFR/box soft-gate | UoW-13 | back-dev (+content-gen, front-dev) | 토큰 경계 정확 마스킹·중복 토큰 처리·게이트, 순수함수 테스트 | ⬜ Pending |
| UoW-16-apply-production | 응용 산출 | 가이드 산출(빈칸·재배열·KR→FR). enrich와 **분리된** `FeedbackClient`(교정 전용), 키 없으면 정답+해설 폴백. ⚠️ classifyCard 신호 오염 금지(별도 카운터) | UoW-15 | back-dev (+front-dev, content-gen) | 3과제 타입 판정·피드백·SRS 분리, 폴백 품질, 모킹 테스트 | ⬜ Pending |
| UoW-17-usage-output | 활용 자유 산출 | 주제 작문 + 산출물 로컬 보존(`outputStore`, 용량 한도) + 자가평가 + (BYOK) 피드백(UoW-16 재사용). 설경 편입 | UoW-16, UoW-14 | front-dev (+db-dev, content-gen) | 작문 저장·복원·자가평가·피드백·설경 카운터 연결 | ⬜ Pending |
| UoW-18-snowscape-viz | 설경 시각화 | 눈송이→결정→격자→설경 진척 시각화(기본 무료). **RN View/그라데이션 1차**, react-native-svg는 검증 게이트 통과 시 선택. 부드러운 감쇠, 비선형 열람 | UoW-14 (+13,15) | front-dev | 진척 시각화 렌더·reduce-motion·a11y, (svg 시) Context7+export+성능 | ⬜ Pending |
| UoW-19-monetization-iap | 수익화(depth-paywall) | 평생 해금 비소비성 IAP + Restore(무계정, `entitlementStore`). 정직 페이지·페이월 경계. **hard-dep: Operations EAS prebuild + 팔 층(13~17) 완료 + Apple Developer Program** | UoW-13~17, **Operations(EAS prebuild)** | cloud-dev (+back-dev, front-dev) | 엔타이틀먼트·복원·경계 모킹 테스트(코드부) / 스토어·디바이스(Operations부) | ⬜ Pending |

## 권장 순서 & 단계적 승인 (제안)

> code-review 권고: 6~7 Unit을 한 번에 승인하면 체크포인트 부담이 크고, UoW-13이 후속 층의 콘텐츠·하이라이트 기반을 깐다. **Phase 1만 먼저 확정**하는 단계적 승인을 권장(Q-P5).

- **Phase 1 — 첫 깊이 가치**: `UoW-13`(문장) → `UoW-14`(soft-gate 엔진). 무키·Expo Go 가능. Day0 가치("한 단어가 문장으로") 증명.
- **Phase 2 — 산출 전이 + 시각화**: `UoW-15`(문법) → `UoW-16`(응용) → `UoW-17`(활용) → `UoW-18`(설경 시각화, 층이 충분해진 뒤). 무키·Expo Go 가능.
- **Phase 3 — 수익화**: `UoW-19`. **Operations(EAS prebuild) + Phase 1~2 완료 + 외부 인간 의존(Apple Developer Program) 선행.** 항상 최후미.

의존 사슬: 13 → {14, 15} → 16 → 17 ; 18 ← {14,13,15} ; 19 ← {13~17, Operations}.

---

## Unit 상세 (큰 Unit)

### UoW-13-sentence-layer

- 포함 스토리: US-P1
- 산출 파일(예상): `src/store/cardStore.ts`(`masteredWordIds(threshold)` 셀렉터), `src/content/types.ts`(`Sentence` 타입, `Word.chunks?`/`targetTokens?`), `src/content/ContentProvider.ts`(`getSentences?`), `StaticContentProvider`/`AIContentProvider`, `src/components/SentenceCard.tsx`(신규), `app/sentence.tsx`(신규 라우트), content-gen 정적 Sentence 데이터셋
- 수용 기준: box≥임계 풀 파생(순수), i+1(미지 1~2개) 선택, 청크 하이라이트 **신규 렌더**, 콜드 스타트 빈 상태, 키 없을 때 정적 동작, 첫 레슨 무료 경계(소유 Unit=13)
- 리스크/메모: "볼드 재사용" 아님 → 토큰 식별 + 리치 텍스트 신규(ADR-013). threshold 하드코딩 금지(설정 가능). chunkTokens 백필은 content-gen(A1 우선 가능, Q-P8)

### UoW-14-soft-gate-engine

- 포함 스토리: US-P5(엔진 부분)
- 산출 파일(예상): `src/srs/softGate.ts`(신규 순수: 입력 `Record<string,CardState>`+층 임계맵 → unlock enum `locked|preview|unlocked`), `src/store/progressStore.ts`(신규, persist+migrate, 키 `flocons:progress:v1`), 데이터 초기화 연동
- 수용 기준: leitner `INTERVAL_DAYS`/`MAX_BOX` 참조, 진척 카운터 파생(masteredWordIds 위), unlock 결정성·경계(now==dueAt 등) 테스트, rehydrate/reset 배선
- 리스크/메모: 시각화(SVG)와 **분리**(시각화는 UoW-18). hard-lock 아님 — UX는 "추천/흐림"

### UoW-19-monetization-iap

- 포함 스토리: US-P6
- 산출 파일(예상): `src/store/entitlementStore.ts`(키 `flocons:entitlement:v1`, `crystalUnlocked`/`unlockedAt`/`receiptToken`), `src/lib/iap.ts`(래퍼), `isLayerAccessible(layer, unlocked)` 순수함수, `app/paywall.tsx`(정직 페이지), `app.json`(EAS 설정), Operations 산출물(prebuild·스토어)
- 수용 기준(코드부): 엔타이틀먼트 상태·페이월 경계·복원 흐름 **모킹** 테스트, 무료 핵심 인질 없음 검증 / (Operations부): EAS prebuild·App Store Connect 상품·Sandbox 복원
- 리스크/메모: Expo Go에서 end-to-end 불가 → Operations 선행(R-P3). IAP 라이브러리·CNG·가격 검증은 Q-P7. non-negotiables(광고·데이터판매·BYOK유료화·구독 금지) 준수

---

> 이 백로그는 post-v1 Inception 종료 체크포인트에서 **기술 스택([../../00-tech-stack.md](../../00-tech-stack.md)) + 아키텍처 결정([04-architecture-decision.md](04-architecture-decision.md))과 함께 사람 승인 대상**이다. 승인 시 각 행 "(제안 — 승인 필요)" 표시를 제거하고 [ai-dlc/STATUS.md](../../STATUS.md)에 Unit 행을 등재한다. [../README.md](../README.md) 참고.
