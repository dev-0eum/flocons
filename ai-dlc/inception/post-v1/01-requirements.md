# 01 — 요구사항 (Requirements) · post-v1 라운드

> Inception 산출물 #1 (post-v1 라운드). flocons의 **누적 학습 구조**(단어→문장→문법→응용→활용)와 **브랜드 정합 수익화**가 *무엇을 / 왜* 하는지, 어떤 제약·가정·리스크 위에서 동작하는지 합의한다.
> 작성: **app-pm** 리드 mob (back-dev · front-dev · db-dev · cloud-dev 의견, code-review 리뷰 — 2026-06-13, 실제 코드베이스 근거).
> 근거: [docs/DESIGN.md §12](../../../docs/DESIGN.md) · [docs/ROADMAP.md](../../../docs/ROADMAP.md) "차기(post-v1)" · v1 라운드 [../01-requirements.md](../01-requirements.md).

작성일: 2026-06-13 · 작성: app-pm + Inception mob · 상태: ✅ Approved (2026-06-13, 0eum)

> ℹ️ 이것은 **2차(post-v1) Inception 라운드**다. v1 라운드(UoW-00~12)는 ✅ Approved(2026-06-09)이며 Construction 완료. 본 라운드 산출물은 기존 v1 산출물([../01~04.md](../))을 덮어쓰지 않고 `post-v1/`에 별도로 둔다.

---

## 1. 한 줄 요약

이미 단어 카드(v1)를 쓰는 한국어 모어 학습자가, 익힌 단어가 **문장→문법→응용→활용으로 쌓여 "설경"을 이루는** 누적 구조를 통해 수용에서 산출까지 나아가고, 그 깊은 층을 **구독 없는 평생 1회 해금**으로 지속가능하게 받친다.

## 2. 대상 사용자 / 맥락

- 주 사용자: v1과 동일 — 프랑스어를 배우는 한국어 모어 화자(개인). 페르소나 '서연'(28, 직장인, calm-tech·프라이버시 선호, 구독 피로).
- 사용 맥락: iOS(Expo Go, 추후 UoW-19에서 EAS), 오프라인 가능, 짧은 세션. 이미 단어 층(v1)을 어느 정도 익힌 상태에서 "다음 깊이"로 진입.
- 2차 사용자: 자기 Anthropic 키(BYOK)로 산출 피드백을 쓰는 파워 유저.

## 3. 목표 (Goals)

- G1: 익힌 단어 풀 위에 **i+1 문장(미지 단어 1~2개) 학습**을 제공한다(UoW-13). [DESIGN §12.1]
- G2: 단어→문장→문법→응용→활용을 **DAG + soft-gate**로 잇고, 진척을 "XP가 아닌 산출 가능 청크/문장 수"로 시각화한다(UoW-14/18). hard-lock·스트릭·푸시는 도입하지 않는다.
- G3: 수용에서 멈추지 않고 **능동 산출**(cloze·재배열·번역·자유작문)로 전이를 일으킨다(UoW-15/16/17). BYOK는 산출 교정 피드백에 쓰되 키 없으면 정적 폴백.
- G4: 누적 구조의 **깊은 층을 유료 표면(depth-paywall)**으로, 단 무료 핵심은 영구 무료, 모델은 **구독 아닌 평생 1회 해금**으로 받친다(UoW-19). [DESIGN §12.2]
- G5: 위 전부를 **계정·서버·광고·데이터판매·차단성 푸시 없이** v1 아키텍처(모듈 상태+AsyncStorage, expo-router, 모듈 격리) 위에서 후방 호환으로 구현한다.

## 4. 비목표 (Non-Goals)

DESIGN §11(v1 비목표)을 계승하되, "결제"만 §12.2 범위에서 제한적으로 재검토한다.

- NG1: 계정/로그인 강제, 클라우드 동기화 기본화 — 유지(비목표). (UoW-19 복원은 StoreKit Restore=무계정.)
- NG2: 광고·데이터/키 판매·소셜·랭킹·스트릭/푸시 압박 — 유지(비목표·non-negotiable).
- NG3: **구독(월/연)** — 이번 라운드 비채택. 수익화는 일회성 평생 해금 + 보조 IAP만.
- NG4: BYOK 유료화 / AI를 유료 층의 품질 게이트로 사용 — 금지.
- NG5: Android 전용 최적화·다크 테마(별도 백로그).

## 5. 기능 요구사항 (Functional)

| ID | 요구사항 | 우선순위 | 근거 | 후보 Unit |
|---|---|---|---|---|
| FR-P1 | 익힌 단어 풀(`box≥임계` 파생)로 구성된 i+1 문장(청크 중심, 미지 1~2개) 학습 | P0 | DESIGN §12.1 | UoW-13 |
| FR-P2 | 5층 DAG soft-gate: 하위층 SRS 굳기로 상위층 추천·강조(강제 차단 아님), 비선형 자유 열람 | P0 | DESIGN §12.1 | UoW-14 |
| FR-P3 | 청크에서 추출한 문법 패턴을 cloze(빈칸 산출)로, CEFR 게이팅 | P1 | DESIGN §12.1 | UoW-15 |
| FR-P4 | 가이드 산출(빈칸·재배열·KR→FR 번역) + BYOK 교정 피드백(키 없으면 정답+해설 폴백) | P1 | DESIGN §12.1 | UoW-16 |
| FR-P5 | 주제 자유 작문 + 산출물 로컬 보존 + (BYOK) 피드백, 설경 편입 | P2 | DESIGN §12.1 | UoW-17 |
| FR-P6 | 눈송이→결정→격자→설경 진척 시각화(기본 무료), 부드러운 감쇠 | P1 | DESIGN §12.1 | UoW-18 |
| FR-P7 | 깊은 층 평생 해금 IAP(비소비성) + Restore(무계정), 정직 페이지, 무료 핵심 인질 금지 | P1 | DESIGN §12.2 | UoW-19 |

## 6. 비기능 요구사항 (Non-Functional)

- 오프라인/무키: UoW-13~18은 키·네트워크 없이 동작(BYOK는 옵션 강화, 실패 시 정적 폴백).
- 프라이버시: 학습데이터·산출물·entitlement 전부 로컬(AsyncStorage). 키는 secure-store에만. 로그에 키 원문 금지.
- 후방 호환: Word 신규 필드는 전부 선택(optional). 신규 스토어는 version+migrate. 데이터 없으면 안전 폴백(빈 상태/전체 예문 표시).
- 비강압: 스트릭/푸시/FOMO/죄책감 카피 없음. 진척은 내적 성취(설경)로.
- 접근성: 성별 색구분은 텍스트 병행, reduce-motion 존중, 폰트 스케일.
- 검증: 게이트 4종(typecheck/lint/test/expo export) 유지. 순수 함수(셀렉터·cloze·soft-gate)는 단위 테스트.

## 7. 제약 (Constraints)

- 기술: v1 스택 계승([ai-dlc/00-tech-stack.md](../../00-tech-stack.md)). 신규 후보 `react-native-svg`(선택), IAP 라이브러리(UoW-19, Operations에서 택일).
- **워크플로 분기**: UoW-13~18은 Expo Go 관리형 그대로 가능(`react-native-svg`도 Expo Go 포함 — cloud-dev 확인). **UoW-19(IAP)만 EAS prebuild(Operations) 선행 필수** — Expo Go에서 StoreKit 불가.
- 외부/인간 의존(UoW-19): Apple Developer Program($99/년) 가입, App Store Connect 비소비성 상품 등록, Sandbox 테스터 — 에이전트 대행 불가(HARNESS §7 에스컬레이션).
- 콘텐츠 생산비: 문장/문법/산출/작문 콘텐츠는 content-gen 단계적 큐레이션이 코드 구현과 별도 트랙. 코드 Unit이 콘텐츠에 블로킹되지 않게 분리.
- 운영: 검증 게이트 통과 필수([docs/HARNESS.md §3](../../../docs/HARNESS.md)). 커밋·푸시는 사용자 수행(`.git` 사고 후 정책).

## 8. 가정 (Assumptions)

- A-P1: i+1 "익힌 단어" 임계는 Leitner `box≥2`(learning 진입) 기본 — 체크포인트 A에서 조정 가능(Q-P1).
- A-P2: 설경 시각화는 RN View/그라데이션(Placeholder.tsx 선례)으로 1차 구현 가능 — SVG는 선택적 게이트(Q-P4).
- A-P3: 신규 스토어(progress/output/entitlement)는 v1의 "모듈 상태 + subscribe + AsyncStorage persist" 패턴(ADR-002 계승)을 따른다.
- A-P4: 가격(₩19,000~29,000)은 가늠치 — 실측 WTP 아님(검증은 Q-P7).

## 9. 리스크 (Risks)

| ID | 리스크 | 영향 | 가능성 | 완화책 |
|---|---|---|---|---|
| R-P1 | 콘텐츠 생산비(청크/문법/산출/작문) 과소 산정 → 화면 빈 상태 | 상 | 상 | content-gen 단계적 큐레이션 별도 트랙, "데이터 없으면 폴백"으로 배포 비차단, A1 우선 백필 |
| R-P2 | "볼드 타깃 재사용" 오전제 → UoW-13/15 공수 과소 | 중 | 상(확인됨) | DESIGN §12.1 정정 완료, 하이라이트를 "신규 인프라"로 분해(ADR-013) |
| R-P3 | UoW-19 EAS prebuild는 Expo Go→네이티브 비가역 전환 | 상 | 중 | UoW-13~18 먼저 완성(팔 물건), 19는 Operations와 묶어 최후미, CNG 검토 |
| R-P4 | react-native-svg가 reanimated 4/newArch와 버전 충돌 | 중 | 중 | Context7 SDK55 호환 확인 + expo export green + 디바이스 검증 게이트, RN View 폴백안 |
| R-P5 | 산출 정오답이 classifyCard(SRS 신호)에 섞임 → SRS 오염 | 상 | 중 | 별도 진입점·별도 스토어 카운터(ADR-014, code-review 확인) |
| R-P6 | 6~7 Unit 동시 승인 → 체크포인트 부담·범위 과대 | 중 | 상 | 단계적 승인(Phase 1: UoW-13+14 우선) 권장(Q-P5) |
| R-P7 | 평생 단일 모델의 낮은 절대 LTV / WTP 미검증 | 중 | 중 | 가격 동결 서약, 베타 검증 선행(Q-P7), 보조 IAP(테마 팩) |

## 10. 미해결 질문 (Open Questions) — 체크포인트에서 함께 결정

- Q-P1: i+1 "익힌 단어" 임계 = `box≥2` vs `≥3` vs `≥4`? `reps>0` 게이트 적용? 콜드 스타트(임계 0개) 폴백? **(권장: box≥2)**
- Q-P2: DESIGN §12.1 "볼드 타깃 재사용" → "신규 하이라이트 인프라"로 정정 + UoW-13 공수 재산정 동의? **(이미 정정 반영)**
- Q-P3: Unit ID를 UoW-13~19로 확정하고 ROADMAP/DESIGN의 N1~N6 가번호를 일괄 치환(매핑표 = 본 라운드 [03-units-of-work.md](03-units-of-work.md))하는 데 동의? 치환은 **승인 시점**에 수행.
- Q-P4: 설경 시각화를 UoW-14(soft-gate 엔진, 무의존) / UoW-18(시각화)로 분리, react-native-svg는 검증 게이트 통과 시에만 도입(아니면 RN View)? **(권장: 분리 + RN View 1차)**
- Q-P5: 이번 라운드에서 **7개 전부 승인** vs **Phase 1(UoW-13+14)만 먼저 확정**하고 15~19는 2차 라운드? **(권장: 단계적 — Phase 1 먼저)**
- Q-P6: 진척 상태(progressStore) 영속 키·버전, 데이터 초기화(resetCards 류) 포함 여부?
- Q-P7: UoW-19 — 가격(₩19,000~29,000)은 가늠치. 베타/소규모 검증을 착수 선행 조건으로? IAP 라이브러리(react-native-iap vs RevenueCat), CNG vs bare, Apple Developer Program 가입 의향·시점?
- Q-P8: 부차 — grammarPattern enum(article-gender/verb-conjugation/elision/adjective-agreement) 확정? FeedbackClient를 UoW-16/17 공유(→16이 17 선행)? 청크 백필 A1 우선 vs 전체? 설경 4번째 탭 vs 홈 진입 풀스크린?

---

> 다음 산출물: [02-user-stories.md](02-user-stories.md) → [03-units-of-work.md](03-units-of-work.md) → [04-architecture-decision.md](04-architecture-decision.md).
> 이 문서는 post-v1 Inception 종료 체크포인트에서 사람 승인 대상이다. [../README.md](../README.md) · [ai-dlc/STATUS.md](../../STATUS.md) 참고.
