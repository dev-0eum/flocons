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
| 런타임 | Expo (latest SDK) + TypeScript | 아이폰 Expo Go 실행, iOS/Android 공용 |
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
- 위 가정 중 바꾸고 싶은 게 있으면 본 문서를 수정한 뒤 하네스를 시작한다.
