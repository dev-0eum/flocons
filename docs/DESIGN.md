# flocons — 제품 / 아키텍처 설계

> 한국어 사용자를 위한 프랑스어 단어 학습 앱. 스와이프형 카드 + 간격반복(SRS).
> 본 문서는 자율 개발 하네스가 따르는 **단일 진실 소스(SSOT)** 다. 구현 결정이 바뀌면 이 문서를 먼저 갱신한다.

---

## 1. 개요

- **이름**: flocons (프랑스어 "눈송이")
- **사용자**: 프랑스어를 배우는 한국어 모어 화자 (개인 사용)
- **기준 언어**: 한국어 (KR) · **학습 언어**: 프랑스어 (FR)
- **레퍼런스 UX**: `example/IMG_9544.PNG` — 단어 카드, AI 이미지, 발음, 진행도, "알고 있어요/학습할게요" 분류
- **핵심 가치**: 맥락 예문 + 발음으로 단어를 "스와이프"하며 빠르게 분류·복습

## 2. 핵심 UX 흐름

1. 레벨(CEFR A1~)별 덱을 연다.
2. 카드를 한 장씩 본다: 이미지 · 단어(관사 포함) · 품사 · 한국어 뜻 · 예문(FR/KR) · 발음.
3. 두 가지로 분류한다:
   - **알고 있어요** → 덱에서 빠지거나 긴 간격으로
   - **학습할게요** → SRS 복습 큐에 들어가 짧은 간격으로 재등장
4. 상단: 남은/제외 수, 진행도(`10/46`), 되돌리기(undo), 메뉴.
5. 북마크로 따로 모아 복습.

## 3. 화면 (라우트)

| 라우트 | 화면 | 내용 |
|---|---|---|
| `/` | 홈/레벨 선택 | 레벨별 진행도, 오늘 복습할 카드 수, 학습 시작 |
| `/learn` | 학습 덱 | 레퍼런스 스크린샷의 메인 카드 화면 (스와이프) |
| `/review` | 복습 | SRS 마감(due) 카드만 복습 |
| `/bookmarks` | 북마크 | 저장한 단어 모음 |
| `/stats` | 통계 | 연속 학습(streak), 학습 단어 수, 레벨 진척 |
| `/settings` | 설정 | **API 키 입력**, TTS 음성/속도, 레벨, 데이터 초기화 |

## 4. 데이터 모델

```ts
// 콘텐츠(불변, 데이터셋/AI가 제공)
interface Word {
  id: string;            // 안정적 ID (예: "fr-a1-crime")
  lemma: string;         // "crime"
  article: string | null;// "le" | "la" | "l'" | "les" | null
  gender: 'm' | 'f' | null;
  pos: 'n' | 'v' | 'adj' | 'adv' | 'prep' | 'pron' | 'conj' | 'num' | 'det' | 'intj' | 'phrase';
  krMeaning: string;     // "범죄"
  level: 'A1'|'A2'|'B1'|'B2'|'C1';
  exampleFr: string;     // "La police enquête sur un crime dans le quartier."
  exampleKr: string;     // "경찰이 동네에서 일어난 범죄를 수사하고 있어요."
  imageUrl?: string | null; // 없으면 카테고리 플레이스홀더
  imagePrompt?: string | null; // 선택. 이미지 생성 모델용 프롬프트(영어 권장). 키 있으면 AIImageProvider가 렌더, 없으면 무시
  tags?: string[];
}

// 사용자 학습 상태(가변, 로컬 저장)
interface CardState {
  wordId: string;
  status: 'new' | 'learning' | 'known';
  box: number;           // Leitner 박스 (0~4)
  dueAt: number;         // epoch ms
  reps: number;
  lapses: number;
  bookmarked: boolean;
  lastReviewedAt?: number;
}
```

- 학습 상태는 **AsyncStorage**(또는 expo-sqlite, 규모 커지면)로 영속.
- API 키는 **expo-secure-store**(평문 저장 금지, 절대 커밋 금지).

## 5. 콘텐츠 아키텍처 — 키 입력 / 폴백 (핵심 결정)

`ContentProvider` 인터페이스로 추상화하고 런타임에 구현체를 선택한다.

```ts
interface ContentProvider {
  getWords(level: Level): Promise<Word[]>;     // 덱 채우기
  enrich?(word: Word): Promise<Word>;          // 예문/대체 예문 보강 (선택)
  generateImage?(word: Word): Promise<string>; // 이미지 URL (선택)
}
```

- **StaticContentProvider (기본, 키 불필요)**: 앱에 번들된 큐레이션 JSON(`src/data/*.json`)을 읽는다. 오프라인·무료·결정적. **항상 동작하는 베이스라인.**
- **AIContentProvider (Anthropic 키 입력 시)**: Claude로 예문·번역을 실시간/사전 보강. 결과는 로컬 캐시.
- **AIImageProvider (이미지 생성 키 입력 시)**: 단어별 분위기 이미지를 생성·캐시. 없으면 카테고리 색/그라데이션 플레이스홀더.

**선택 규칙**

```
키 있음  → AI Provider 사용, 실패 시 자동으로 Static 폴백
키 없음  → Static Provider (= "1번 방식")
키 삭제  → 즉시 Static 으로 회귀 (앱은 키 없이도 완전히 동작)
```

발음(TTS)은 **두 경로 공통으로 무료 온디바이스** `expo-speech` (`fr-FR`). 유료 TTS 키가 있으면 그때 고품질 음성으로 확장.

## 6. 간격반복(SRS)

- v1: **Leitner 5-box** (단순·견고). 정답이면 박스 +1(간격↑), 틀리면 박스 0(간격 리셋).
- 간격 예시: box0=즉시, box1=1일, box2=3일, box3=7일, box4=16일.
- 추후 SM-2(ease factor)로 교체 가능하도록 `srs/` 모듈로 격리.

## 7. 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 런타임 | Expo SDK 55 (핀) + TypeScript | 아이폰 Expo Go 실행. SDK 56은 릴리스 직후라 iOS Expo Go 미지원 → 55 핀(ADR-010). 개발 대상 iOS, web은 검증용 |
| 라우팅 | expo-router | 파일 기반 |
| 상태 | Zustand + persist(AsyncStorage) | 가볍고 충분 |
| 제스처/애니메이션 | react-native-gesture-handler + reanimated | 스와이프 카드 |
| 발음 | expo-speech | 무료 fr-FR |
| 비밀키 | expo-secure-store | API 키 |
| 테스트 | Jest + @testing-library/react-native | |
| 검증 | `tsc --noEmit`, `eslint`, `jest`, `expo export` | 하네스 게이트 |

## 8. 프로젝트 구조 (목표)

```
flocons/
  app/                 # expo-router 화면 (index, learn, review, bookmarks, stats, settings)
  src/
    components/        # Card, ActionButtons, TopBar, ProgressBar ...
    content/           # ContentProvider, static.ts, ai.ts, image.ts, index.ts(선택)
    srs/               # leitner.ts, scheduler.ts
    store/             # deckStore, settingsStore (zustand)
    data/              # 번들 정적 데이터셋 (a1.json ...)
    theme/             # 색/타이포/간격
    lib/               # tts.ts, secureKeys.ts, storage.ts
  assets/
  docs/                # DESIGN / ROADMAP / HARNESS
  __tests__/
```

## 9. 디자인/테마

- 레퍼런스 기준 **라이트 테마** 우선, 강조 버튼은 검정. 다크 테마는 후순위.
- 관사 색 구분(남성 le=파랑 계열, 여성 la=분홍 계열 등)으로 성(gender) 직관화.
- 햅틱(스와이프 확정 시), 접근성(대비/폰트 스케일) 고려.

## 10. 시드 데이터셋 (키 없이 출발)

- 키가 없으므로 **초기 정적 데이터셋을 직접 큐레이션**한다 (Claude가 작성: 관사·품사·한국어 뜻·예문 FR/KR).
- v1: A1 핵심어 약 150개로 시작 → 이후 A2/B1 확장.
- 이미지: v1은 카테고리 플레이스홀더, 이미지 키 생기면 AI 이미지로 교체.
- `content-gen` 에이전트는 각 카드의 `imagePrompt`(텍스트)를 생성해 둔다. 실제 이미지 픽셀은 **이미지 생성용 별도 API 키가 있을 때 `AIImageProvider`가 렌더**하며, 그 전에는 카테고리 플레이스홀더를 쓴다(텍스트 콘텐츠와 달리 이미지 생성에는 별도 키·비용이 필요).

## 11. 비목표 / 가정 (변경 가능 — 하네스 시작 전 검토용)

- (가정) 상태관리 Zustand, SRS는 Leitner, 내비 expo-router, v1 이미지 플레이스홀더, 라이트 테마 우선.
- (비목표 v1) 계정/클라우드 동기화, 소셜, 결제, 안드로이드 전용 최적화.
- **(v1 스코프, 2026-06-09 결정) 개발/빌드 대상은 iOS만** — Android는 사용자 지시 시 착수. web 번들은 시뮬레이터 없는 자동 검증 용도로만(제품 타깃 아님). 배포는 RN/iOS(EAS, Operations).
- 위 가정 중 바꾸고 싶은 게 있으면 본 문서를 수정한 뒤 하네스를 시작한다.

## 12. 차기 방향 — 누적 학습 구조 (✅ 승인된 백로그 2026-06-13 · 미구현)

> ✅ **상태: post-v1 Inception 라운드에서 백로그 승인됨(2026-06-13, 0eum), 아직 미구현.** v1(M0~M12, Construction)은 완료됐고, 본 절은 그 위에 얹는 **차기(post-v1) 방향**이다. §11이 v1 비목표로 둔 "결제"를 일회성 IAP(§12.2)로 재검토. 확정 Unit(UoW-13~19)·ADR-011~016은 [ai-dlc/inception/post-v1/](../ai-dlc/inception/post-v1/), 진행 상태는 [ai-dlc/STATUS.md](../ai-dlc/STATUS.md). 각 Unit은 Construction 체크포인트 A·B에서 별도 승인.

### 12.1 5층 누적 구조 (단어 → 문장 → 문법 → 응용 → 활용)

브랜드명 flocons("눈송이")의 핵심 은유를 학습 구조로 코드화한다 — 흩어진 단어가 굳어 결정·격자·설경으로 **쌓이는** 수직 진척.

| 층 | 메타포 | 무엇 | 페다고지 근거 |
|---|---|---|---|
| **단어** (현행 무료 코어) | 눈송이 → 결정 | 스와이프 카드 + Leitner SRS (현재 앱) | 수용 큐 |
| **문장** | 첫 결정 | *이미 익힌 단어*로 만든 i+1 문장(미지 단어 1~2개). 자유작문 아닌 **재사용 가능한 어휘적 청크**(le/la+명사·고빈도 동사구) | Lewis 어휘적 접근 / MARSEARS / Refold "미지 1~2개" |
| **문법** | 정렬된 격자 | 청크에서 **사후 추출한 패턴**(성·관사·활용·엘리지옹)을 cloze(빈칸 산출)로. CEFR A1/A2/B1 게이팅 | Bunpro cloze / Ellis 암묵 습득→명시화 |
| **응용** | 쌓아 올리기 | 가이드된 능동 산출(빈칸·문장 재배열·KR→FR 미니 번역). BYOK 키 시 AI가 **산출 교정 피드백** | Swain 출력 가설 / 수용→산출 전이(Teng & Xu) |
| **활용** | 설경 | 주제별 자유 산출. 산출물이 "설경 한 폭"으로 영구 보존 | productive mastery |

**구현 원칙** (검증된 선례 기반):
- **DAG + soft-gate**: 5층은 선행 의존 그래프(skill tree=DAG). 하위층 SRS 굳기(Leitner box)가 상위층을 **추천·강조로 soft-unlock** 한다. WaniKani식 경직된 hard-lock은 리뷰 부채·번아웃을 낳으므로 채택하지 않는다 — 일일 상한·유연 페이스·비선형 자유 열람 보장(Duolingo 단일 강제 경로의 반면교사).
- **굳기 척도 재사용**: 기존 `srs/leitner` box를 "결정이 굳는 정도"로 재사용. 진척 지표는 XP가 아니라 **"산출 가능한 청크·문장 수"**.
- **비강압 진척**(Forest 모델): 복습을 미뤄도 구조가 무너지지 않고 "흐려졌다 다시 선명"해지는 부드러운 감쇠. 이미 굳은 결정은 사라지지 않는다(영구 보존). 스트릭·푸시·FOMO 없음(Duolingo 안티테제 유지).
- **i+1 운영**: 학습자가 이미 익힌 단어 풀(`cardStore` 파생)을 기준으로 "새 단어 1~2개짜리 문장"만 노출. 채집 부담은 큐레이션으로 제거.

**데이터 모델 영향** (제안 — 모두 선택 필드로 후방 호환):
- `Word`에 `grammarPattern?: string`(문법 층 태그)와 예문의 청크/타깃 토큰 하이라이트 메타(`chunks?`/`targetTokens?`).
  - ⚠️ **정정(2026-06-13 Inception 라운드 mob 리뷰)**: 현행 `WordCard`는 예문을 단순 `<Text>`로 렌더하고 "볼드 타깃" 하이라이트는 **코드에 존재하지 않는다**. 따라서 이 메타·렌더는 *재사용이 아니라 신규 하이라이트 인프라 구축*이다(공수 재산정 반영).
- 산출 과제 타입(빈칸/재배열/번역)과 자유 산출물(로컬 저장, AsyncStorage)용 신규 스키마.
- 층 게이팅용 셀렉터는 `srs/`에 순수 함수로 격리(영속/마이그레이션 영향 최소화). 단 진척 상태(산출 가능 청크/문장 수, 층 unlock) 영속에는 신규 스토어(예: `progressStore`)와 데이터 초기화 연동이 필요(순수 셀렉터만으로 끝나지 않음).

> 본 §12의 Unit 분해(UoW-13~19)·확정 ID·의존성·아키텍처 결정(ADR-011~016)은 [ai-dlc/inception/post-v1/](../ai-dlc/inception/post-v1/) 라운드 산출물에서 다룬다(✅ 승인 2026-06-13).

### 12.2 수익화 — depth-paywall + buy-once (post-v1 제안)

> §11이 v1 비목표로 둔 "결제"를 차기에 재검토. **누적 구조 자체를 유료 표면으로 삼되 콘텐츠를 인질로 잡지 않고 "깊이"에 과금**한다.

- **무료(영구)**: 단어 층 전체 — 185단어 카드·Leitner SRS·TTS·북마크·통계·오프라인·기본 시각화 + 문장 층 첫 레슨 미리보기. **인질 페이월 금지.**
- **flocons 결정 평생 해금** (1순위 상품): 문장(전체)·문법·응용·활용 + 격자·설경 심화. **구독 아닌 일회성**(StoreKit 비소비성 IAP + Restore Purchases, 무계정 복원). 제안가 ₩29,000(출시·겨울 ₩19,000). 가격 동결 공개 서약(Anki식).
- **보조**: 테마 콘텐츠 팩(여행/비즈니스, ₩4,900~9,900) · ❄️ 후원 IAP.
- **왜 buy-once인가**: WaniKani Lifetime·AnkiMobile 일회성·Obsidian 로컬 우선 선례 / 한국 구독 피로·"디지털 월세" 거부 / 무계정·로컬 구조(구독 가치 약함) / 갱신 없음 = 개정 전자상거래법(2025.2)·공정위 다크패턴 지침(2025.10) 리스크 구조적 회피.
- **절대 금지**(non-negotiables): 광고 · 데이터/키 판매·공유 · 무료 핵심 인질 · 스트릭/푸시/FOMO/죄책감 페이월 · 다크패턴 · 계정 강제 · **BYOK를 매출원/유료 품질 게이트로 사용**(키 없는 사용자의 폴백 품질 신뢰 훼손 방지).
- **선행 조건**: IAP는 Expo Go에서 불가 → **EAS prebuild**(Operations)가 Phase 1의 전제. 미구현 층 선판매 금지(팔 물건을 먼저 만든다). 무료/유료 경계는 카드에서 **투명 표시**.
- **현실 기대치**: Education freemium 전환 중앙값 ~2%, 상위 P90만 매출 8배 — "소수 진성 학습자의 평생구매"가 1인 앱의 현실 경로(Anki·Kagi 증명). 광고로 깔때기 넓히기 금지 → 유기적 유입 + 깊이 판매.

> 가격(₩19,000~29,000)은 USD 선례 + 한국 시장 맥락 기반 **가늠치**이며 한국 프랑스어 학습자 실측 WTP가 아니다 — 베타 설문·소규모 A/B로 검증 필요.
