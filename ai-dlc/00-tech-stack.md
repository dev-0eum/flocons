# 00 · 기술 스택 제안서 (Tech Stack Proposal)

> **단계**: Inception · **산출물 유형**: 아키텍처 결정 (기술 스택) · **상태**: ✅ Approved (2026-06-09, 0eum) — Inception 체크포인트 승인. 세부 결정·근거는 [inception/04-architecture-decision.md](inception/04-architecture-decision.md)(ADR-001~010). **expo-haptics(Q2)·Expo SDK 55 핀(ADR-010)** 반영.
> **원칙**: 이 문서는 **AI가 제안(propose)** 한 초안이다. 구속력 있는 확정은 **사람의 승인(dispose)** 이후에만 발생한다. 승인 전에는 STATUS를 ✅ Approved 로 바꾸지 않으며, Inception 다음 산출물/Construction 으로 진행하지 않는다.

관련 문서: [docs/DESIGN.md](../docs/DESIGN.md) · [docs/ROADMAP.md](../docs/ROADMAP.md) · [docs/HARNESS.md](../docs/HARNESS.md) · [ai-dlc/STATUS.md](STATUS.md) · [ai-dlc/README.md](README.md)

근거: [docs/DESIGN.md](../docs/DESIGN.md) **§7 기술 스택**, **§5 콘텐츠 아키텍처(키 폴백)**, **§6 간격반복(SRS)**, **§10 시드 데이터셋**. 이 제안은 위 설계의 결정을 충실히 옮기고 *대안/리스크*를 덧붙인 것이며, 설계 자체를 바꾸지 않는다.

---

## 1. 제안 스택 (영역 / 선택 / 이유 / 대안)

| 영역 | 선택 | 이유 | 대안 (검토했으나 미채택) |
|---|---|---|---|
| 런타임 | **Expo SDK 55 (핀) + TypeScript** | 아이폰 Expo Go 즉시 실행, 네이티브 빌드 부담 최소. **SDK 56은 릴리스 직후라 iOS Expo Go 미지원 → 55.0.26 핀**(ADR-010). 개발 대상 iOS(web 검증용). | 베어 React Native, Flutter, SDK 56(Expo Go 미호환) |
| 라우팅 | **expo-router** | 파일 기반 라우팅이 [docs/DESIGN.md §3](../docs/DESIGN.md) 의 화면 구조(`/`, `/learn`, `/review`, `/bookmarks`, `/stats`, `/settings`)와 1:1로 매핑되어 단순. | React Navigation 수동 구성 (보일러플레이트↑) |
| 상태 관리 | **Zustand + persist (AsyncStorage)** | 가볍고 보일러플레이트가 적음. `CardState` 영속/복원에 persist 미들웨어가 자연스러움. 개인 앱 규모에 충분. | Redux Toolkit (과함), React Context only (영속/구독 비용↑) |
| 제스처 / 애니메이션 | **react-native-gesture-handler + reanimated** | 스와이프형 단어 카드(좌/우 = 학습/알고있음)의 60fps 제스처·전환에 사실상 표준. | PanResponder + Animated (성능/표현력 한계) |
| 발음 (TTS) | **expo-speech (`fr-FR`)** | **무료·온디바이스**. 키 없이 항상 동작하는 베이스라인 발음. 두 콘텐츠 경로 공통. | 유료 클라우드 TTS (비용/키 의존 — 후순위 확장으로 보류) |
| 비밀키 저장 | **expo-secure-store** | API 키를 OS 보안 저장소에 보관. 평문 저장·커밋 금지 원칙([docs/HARNESS.md §5](../docs/HARNESS.md)) 준수. | AsyncStorage 평문(보안 위반), env 하드코딩(금지) |
| 로컬 영속화 | **AsyncStorage** (규모 커지면 **expo-sqlite** 로 이관 가능) | 학습 상태(`CardState`)와 캐시에 충분. SQLite 는 데이터셋·쿼리 규모가 커질 때 옵션으로 격리. | 처음부터 SQLite (초기 복잡도↑, v1 과함) |
| 콘텐츠 (정적) | **StaticContentProvider** + 번들 JSON (`src/data/*.json`) | 오프라인·무료·결정적. **키 없이도 완전 동작하는 베이스라인**([docs/DESIGN.md §5](../docs/DESIGN.md)). | 원격 콘텐츠 우선(오프라인/무료 가치 상실) |
| 콘텐츠 (AI) | **AIContentProvider** (Anthropic / Claude, 키 입력 시) | 예문·번역 실시간/사전 보강 후 로컬 캐시. 키 있을 때만 활성, 실패 시 Static 폴백. | 처음부터 AI 의존(키 없는 사용자 차단 — 비채택) |
| 이미지 | **카테고리 플레이스홀더**(v1) → **AIImageProvider**(이미지 키 시) | v1 은 그라데이션/색 플레이스홀더로 무키 동작, 이미지 키 생기면 생성·캐시로 교체. | v1부터 이미지 생성(비용/키 의존) |
| SRS | **Leitner 5-box** (`srs/` 모듈로 격리) | 단순·견고. box0=즉시 … box4=16일. 추후 SM-2 교체 가능하도록 모듈 분리([docs/DESIGN.md §6](../docs/DESIGN.md)). | 처음부터 SM-2(ease factor) (초기 복잡도↑) |
| 테스트 | **Jest + @testing-library/react-native** | RN 표준 조합. SRS/Provider 단위 + 컴포넌트 렌더 테스트. | Detox E2E(v1 과함, 후순위) |
| 검증 게이트 | **`tsc --noEmit` · `eslint` · `jest` · `expo export`** | [docs/HARNESS.md §3](../docs/HARNESS.md) 게이트와 동일. 하나라도 실패 시 커밋/푸시 금지. | — (게이트 우회/완화 금지) |

> 위 표는 [docs/DESIGN.md §7](../docs/DESIGN.md) 의 스택 전체를 옮기고, 설계 §5/§6/§10 에서 파생되는 콘텐츠·SRS·이미지 결정을 함께 명시한 것이다.

---

## 2. 핵심 아키텍처 결정 요약

이 스택을 떠받치는 결정 네 가지. 모두 [docs/DESIGN.md](../docs/DESIGN.md) 에 근거하며, "로컬 우선·키 없이 완전 동작"을 공통 축으로 한다.

### 2.1 콘텐츠 Provider 추상화 + 키 기반 폴백
- `ContentProvider` 인터페이스(`getWords` / `enrich?` / `generateImage?`)로 콘텐츠 소스를 추상화하고 **런타임에 구현체를 선택**한다.
- 선택 규칙:
  - **키 있음** → AI Provider 사용, **실패 시 자동으로 Static 폴백**.
  - **키 없음** → Static Provider("1번 방식").
  - **키 삭제** → 즉시 Static 으로 회귀.
- 효과: AI는 *옵션 강화*일 뿐, **앱의 정상 동작이 키에 의존하지 않는다.**

### 2.2 SRS — Leitner 5-box
- 정답 → 박스 +1(간격↑), 오답 → 박스 0(리셋). box0=즉시, box1=1일, box2=3일, box3=7일, box4=16일.
- `srs/` 모듈로 격리해 추후 **SM-2 로 무중단 교체** 가능.

### 2.3 온디바이스 TTS
- 발음은 두 콘텐츠 경로 공통으로 **무료 온디바이스 `expo-speech` (`fr-FR`)**.
- 유료 TTS 키가 생기면 고품질 음성으로 *확장*(현재 범위 밖).

### 2.4 로컬 우선 · 키 없이 동작
- 학습 상태(`CardState`)는 **AsyncStorage** 로컬 영속(규모 시 expo-sqlite).
- API 키는 **expo-secure-store** 에만 보관, 평문 저장·커밋 금지.
- 시드 데이터셋(A1 핵심어 ~150개)을 번들해 **첫 실행부터 오프라인·무키로 완전 동작**.

---

## 3. 리스크 / 오픈 이슈

| # | 리스크 / 오픈 이슈 | 영향 | 완화 / 결정 필요 |
|---|---|---|---|
| R1 | **Expo Go 의 네이티브 모듈 한계** — 일부 라이브러리/유료 TTS 는 dev build/EAS 가 필요할 수 있음 | TTS 확장·일부 기능 | v1 은 Expo Go 호환 범위(expo-speech 등)로 한정. EAS 는 Operations 단계 검토. |
| R2 | **AI 콘텐츠 비결정성·비용·지연** — Claude 응답 변동/요금/네트워크 지연 | AI 경로 UX | 결과 **로컬 캐시** + 실패 시 Static 폴백. 키 없는 경로가 항상 베이스라인. |
| R3 | **시드 데이터셋 품질** — 관사/성/품사/예문(FR·KR) 정합성, 중복 ID | 학습 정확성 | 데이터셋 유효성 테스트(필수 필드·중복 ID·관사·성 정합성)로 게이트. (db-dev 큐레이션) |
| R4 | **AsyncStorage → SQLite 이관 시점** — 데이터/쿼리 규모 증가 기준 미정 | 영속화 확장 | v1 은 AsyncStorage. 이관 기준은 데이터셋 확장(UoW-12) 시 재평가. |
| R5 | **expo-secure-store 키 취급** — 평문 노출·실수 커밋 위험 | 보안 | secure-store 전용, `.env*`/`*.key` gitignore, 코드/데이터/커밋에 키 금지. |
| R6 | **SRS v1(Leitner) 단순성** — 장기 학습 곡선에는 SM-2 가 더 적합할 수 있음 | 복습 품질 | v1 은 Leitner 로 출발, `srs/` 격리로 SM-2 교체 경로 확보. |
| R7 | **이미지 부재(v1)** — 플레이스홀더만으로 학습 몰입 저하 가능 | UX 폴리시 | v1 카테고리 플레이스홀더, 이미지 키 시 AIImageProvider 교체(UoW-10). |
| R8 | **테스트 범위 합의** — 어디까지 자동 테스트할지(컴포넌트/제스처/네트워크 모킹) | 검증 비용 | SRS·Provider 단위 + 핵심 컴포넌트 렌더 우선. E2E(Detox)는 후순위. (qa-dev) |

---

## 4. 승인 체크포인트 (Approval Checkpoint)

**상태**: ⬜ Pending — 아직 `/inception` 미실행. 이 제안서는 `/inception` 실행 시 ⏸️ Awaiting Approval 로 제출되어 아래 승인 체크포인트를 거친다. (진행 상태의 단일 진실 소스는 [ai-dlc/STATUS.md](STATUS.md) — 초기값 Inception ⬜ Pending.)

이 문서는 Inception 단계의 **기술 스택 제안서**다. "AI proposes, human disposes" 원칙에 따라, 위 스택·아키텍처 결정·리스크는 **제안**이며 아래 승인이 있어야 확정된다.

- **이 스택을 승인하면** Inception 다음 산출물(요구사항 → 유저 스토리 → Unit of Work 백로그 → 아키텍처 결정 확정) 작업으로 진행하며, 이후 사람이 **Unit of Work 백로그 + 기술 스택**을 함께 승인하는 체크포인트를 거쳐 Construction 으로 넘어간다.
- **수정이 필요하면** 상태를 🔁 Changes Requested 로 두고, 어떤 항목(영역/선택/리스크)을 바꿀지 적어 달라. 반영 후 다시 ⏸️ Awaiting Approval 로 제출한다.
- 승인 전에는 [ai-dlc/STATUS.md](STATUS.md) 의 Inception 상태를 ✅ Approved 로 바꾸지 않는다.

### 승인 (사람이 체크)

- [ ] **이 기술 스택 제안을 승인한다** — 위 §1 스택 / §2 아키텍처 결정 / §3 리스크를 확인했고, Inception 다음 단계로 진행하는 데 동의한다.
- [ ] (선택) 수정 요청 — 아래에 변경할 항목을 적는다:

```
(수정 요청 메모: 영역/선택/이유/리스크 중 무엇을 어떻게 바꿀지)
```

> 승인자: ________________ · 날짜: ____-__-__
```

---

## 5. post-v1 라운드 — 스택 추가 (✅ 승인, 2026-06-13)

> ✅ 아래는 **post-v1 Inception 라운드**(누적 구조 + 수익화)의 스택 추가로, 2026-06-13 백로그·스택 승인에 포함됐다(개별 도입은 각 Unit 체크포인트에서). §1~§4(v1)는 ✅ Approved로 그대로 둔다. 근거 ADR: [inception/post-v1/04-architecture-decision.md](inception/post-v1/04-architecture-decision.md) (ADR-011~016). 상태의 SSOT는 [STATUS.md](STATUS.md).

| 영역 | 추가/검토 | 관련 ADR | 비고 |
|---|---|---|---|
| 진척/산출/엔타이틀먼트 영속 | 신규 스토어(모듈 상태 + AsyncStorage persist, v1 패턴 계승) | ADR-012 | zustand 미사용, `version`+`migrate`, 키 `flocons:<domain>:v1` |
| 예문 하이라이트 / cloze / soft-gate | `Word.chunks?`/`targetTokens?`/`grammarPattern?` 선택 필드 + `srs/cloze.ts`·`srs/softGate.ts` 순수함수 | ADR-013, ADR-011 | **신규 인프라**(볼드 재사용 아님), 단일 스키마 PR(db-dev) |
| BYOK 산출 피드백 | 신규 `FeedbackClient`(enrich와 분리) | ADR-014 | 키 없으면 정적 폴백, classifyCard 신호 오염 금지 |
| 설경 시각화 | RN View/그라데이션 1차 / `react-native-svg` 선택(게이트) | ADR-015 | Expo Go 호환(`expo install`)·Context7·`expo export`·디바이스 검증 |
| 결제(IAP) | 비소비성 IAP + Restore(무계정), 라이브러리 **미정**(react-native-iap vs RevenueCat) | ADR-016 | **EAS prebuild(Operations) 선행** — Expo Go 불가. 구독 미채택 |

**스택 리스크 추가**: R9 react-native-svg ↔ reanimated 4/newArch 호환(Context7 검증), R10 IAP는 Expo Go→EAS 비가역 워크플로 전환(CNG vs bare 결정), R11 신규 스토어 증가 → 패턴 명문화(`src/store/STORE_PATTERN.md`) 권장. 상세는 [post-v1/01-requirements.md §9](inception/post-v1/01-requirements.md).
