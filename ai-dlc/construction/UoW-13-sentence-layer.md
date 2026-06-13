# Bolt 기록 — `UoW-13-sentence-layer`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md)이며, 이 파일이 갱신되면 STATUS의 해당 Unit 행도 함께 맞춘다.
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [post-v1 Inception](../inception/post-v1/) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-13-sentence-layer` |
| **이름** | 문장 층 — 익힌 단어로 만드는 i+1 청크 문장 (① 첫 결정) |
| **연결** | DESIGN §12.1 누적 구조 (post-v1) · ROADMAP "차기(post-v1)" |
| **리드** | back-dev (로직/콘텐츠 흐름) |
| **멤버** | front-dev(SentenceCard·라우트) · content-gen(시드 문장) · qa-dev · code-review |
| **상태** | ⏸️ Awaiting Approval (체크포인트 A) |
| **시작일 / 완료일** | 2026-06-13 / (미정) |

> 의존성: UoW-02(content-layer ✅), UoW-05(srs ✅) · **DoD 요약**: 익힌 단어 풀(box≥2) 기준 i+1 문장(미지 1~2개)을 큐레이션 정적 데이터로 노출하고, 타깃 토큰이 강조되며, TTS로 듣고, 콜드 스타트/빈 상태가 안전하게 폴백된다. 순수 함수(선택·하이라이트)는 단위 테스트 통과. 게이트 4종 green.

---

## 1) 논리 설계 (제안)

### 핵심 설계 결정 (mob 합의 + 코드 근거)

- **D1 — `Sentence`를 1급 콘텐츠 타입으로 분리** (Word 스키마 *미변경*). mob 초안은 `Word.exampleFr`에 청크/타깃 메타를 덧씌우는 방향이었으나, 코드 검증 결과 `Word.exampleFr`는 단일 예문 문자열이고 하이라이트 메타가 없다([WordCard.tsx:145](../../src/components/WordCard.tsx), [toWordCardData.ts](../../src/lib/toWordCardData.ts), [types.ts:30](../../src/content/types.ts)). 문장 학습 데이터를 `Word`에 끼워 넣으면 `word.schema.json`(`additionalProperties:false`)·185단어 백필·검증을 모두 건드린다. → **문장은 별도 `Sentence` 타입 + 별도 데이터셋**으로 두어 `Word`/스키마/검증을 0으로 건드린다(후방 호환·리스크↓, ADR-013의 "신규 인프라" 취지 유지).
- **D2 — 하이라이트는 신규 순수 함수** (ADR-013). `Sentence.highlights`(타깃 표면형)를 `textFr`에서 토큰 경계로 매칭해 강조 세그먼트를 만드는 순수 함수. 중복 토큰(예: `le`) 오마스킹 방지를 위해 표면형 + 첫 토큰경계 매칭.
- **D3 — i+1 선택은 순수 함수**. `masteredWordIds(cards, threshold=2)`(box≥2 = Q-P1 승인값) → `selectSentences(all, mastered)`가 미지 단어 수 1~2개인 문장만, 미지 적은 순으로. 콜드 스타트(mastered 0개) → 적격 0 → 빈 상태 폴백.
- **D4 — 문장 덱은 "읽기·듣기" 네비게이션** (SRS 분류 없음). 스와이프=알아요/배울래요(`classifyCard`)는 *단어* 전용 SRS 신호다([cardStore.ts:42](../../src/store/cardStore.ts)) — 문장에 그 의미가 없으므로 섞지 않는다. 문장 진척("산출 가능 문장 수")은 **UoW-14(soft-gate 엔진)**가 담당. UoW-13은 다음/이전·완료 상태만.
- **D5 — AI(BYOK) 문장 생성은 이 Bolt 범위 밖**(후속). 이 Bolt는 정적 큐레이션 i+1 경험으로 Day0 가치("한 단어가 문장으로")를 증명. `getSentences?`는 Static 구현, `AIContentProvider`는 Static에 위임(enrich 패턴과 동형, [AIContentProvider.ts:22](../../src/content/AIContentProvider.ts)).
- **D6 — 페이월 미적용**(전체 무료). UoW-19(IAP) 미구현이므로 UoW-13은 전부 무료로 동작. "첫 레슨 무료 경계"는 UoW-13이 *소유 지점만 표시*하고 실제 게이팅은 UoW-19에서 래핑.

### 인터페이스 / 데이터 흐름

```
[src/data/sentences-a1.json]  (content-gen 시드)
        │ StaticContentProvider.getSentences(level)
        ▼
[Sentence[]] ──┐
               │  selectSentences(all, masteredWordIds(useCards(), 2))   ← 순수
[cardStore] ───┘                     │
                                     ▼
                         [eligible Sentence[]] → useSentenceDeck()
                                     ▼
        app/sentence.tsx → SentenceCard(segments = highlightSegments(textFr, highlights))
                                     │  onPlay → lib/tts.speak(textFr, {rate})
```

신규 타입(제안):
```ts
// content/types.ts
export interface Sentence {
  id: string;            // "fr-a1-s-0001"
  level: Level;
  textFr: string;        // "Le chat dort sur le canapé."
  textKr: string;
  wordIds: string[];     // 문장이 쓰는 Word.id (i+1 판정)
  highlights: { wordId: string; surface: string }[]; // 강조 타깃(미지 후보) 표면형
}
// ContentProvider 에 선택 메서드 추가
getSentences?(level: Level): Promise<Sentence[]>;
```

순수 함수(제안):
```ts
// srs/sentenceSelect.ts
masteredWordIds(cards: Record<string,CardState>, threshold=2): Set<string>  // box>=threshold
unknownCount(s: Sentence, mastered: Set<string>): number                     // wordIds ∖ mastered
selectSentences(all: Sentence[], mastered: Set<string>, opts={min:1,max:2}): Sentence[]
// lib/sentenceHighlight.ts
highlightSegments(textFr: string, surfaces: string[]): { text: string; highlight: boolean }[]
```

### 변경 파일 계획

| 파일(예정) | 변경 | 메모 |
|---|---|---|
| `src/content/types.ts` | 수정 | `Sentence` 인터페이스 추가 (Word 불변) |
| `src/content/ContentProvider.ts` | 수정 | `getSentences?(level)` 선택 메서드 |
| `src/content/StaticContentProvider.ts` | 수정 | `getSentences` 구현(레벨별 sentence 데이터) |
| `src/content/AIContentProvider.ts` | 수정 | `getSentences` → fallback 위임(AI 생성 후속) |
| `src/content/index.ts` | 수정 | `Sentence` export |
| `src/data/sentences-a1.json` | 신규 | content-gen 시드(A1 ~24문장, 기존 a1 단어 id 참조) |
| `src/srs/sentenceSelect.ts` | 신규 | `masteredWordIds`·`unknownCount`·`selectSentences` (순수) |
| `src/lib/sentenceHighlight.ts` | 신규 | `highlightSegments` (순수, 토큰 경계 매칭) |
| `src/lib/sentenceDeck.ts` | 신규 | `useSentenceDeck()` (useWords·useCards 패턴) |
| `src/components/SentenceCard.tsx` | 신규 | 프리젠테이셔널(콜백만), 하이라이트 렌더 + TTS |
| `app/sentence.tsx` | 신규 | 풀스크린 라우트(다음/이전·완료·빈 상태) |
| `app/_layout.tsx` | 수정 | `<Stack.Screen name="sentence" headerShown:false>` 등록 |
| `app/(tabs)/index.tsx` | 수정 | 홈에 "문장으로" 진입 |
| `__tests__/srs/sentenceSelect.test.ts` | 신규 | i+1 경계·콜드스타트·threshold |
| `__tests__/lib/sentenceHighlight.test.ts` | 신규 | 토큰경계·중복토큰·미존재 표면형 |
| `__tests__/components/SentenceCard.test.tsx` | 신규 | 렌더·하이라이트·콜백·a11y |
| `__tests__/data/sentences.test.ts` | 신규 | sentence 데이터 유효성(필수필드·wordIds가 실제 Word id·중복 id) |

### 리스크 / 대안 / 미해결 질문

- **리스크**: (R1) 시드 문장이 적으면 box≥2 단어가 적은 초기에 적격 문장이 0~소수 → "빈 상태"가 자주 보임. 완화: 시드를 고빈도 A1 단어 위주로 구성, 콜드 스타트 카피를 안내형으로. (R2) `highlightSegments` 토큰 매칭의 프랑스어 구두점/엘리지옹(`l'`) 경계 — 표면형 정확 일치 + 단어 경계 정규식으로 처리, 테스트로 가드. (R3) 데이터 유효성: `wordIds`가 실제 Word id를 가리키는지 — 데이터 테스트로 가드.
- **검토한 대안**: (A) `Word.exampleFr`에 청크 메타 덧씌우기 → 스키마/185단어 백필/검증 변경 유발로 비채택(D1). (B) 문장도 스와이프 SRS 분류 → 문장엔 알아요/배울래요 의미 불명확 + classifyCard 오염, 비채택(D4). (C) AI 생성 포함 → Bolt 비대화, 후속 분리(D5).
- **새 의존성 / Context7**: 신규 라이브러리 없음(기존 expo-router·expo-speech·테마·Ionicons 재사용, 스와이프/reanimated 불필요 — 다음/이전 Pressable). 버전 민감 신규 API 미사용 → Context7 조회 불요(추후 페이저/제스처 추가 시 확인).
- **미해결 질문(체크포인트 A)**:
  - Q-A1: 이 Bolt 범위 = 정적 i+1 문장 + 하이라이트 + 화면(AI BYOK 생성은 후속 분리)? **(권장: 예)**
  - Q-A2: `Word`/`word.schema.json` 미변경, 문장 메타는 `Sentence` 타입에 격리? **(권장: 예 — 후방호환·리스크↓)**
  - Q-A3: i+1 임계 box≥2(Q-P1 승인값), 미지 단어 허용 1~2개? **(권장: 예)**
  - Q-A4: 문장 덱은 SRS 분류 없이 "읽기·듣기" 네비게이션(진척 기록은 UoW-14)? **(권장: 예)**
  - Q-A5: 시드 분량 A1 ~24문장으로 시작(A2/B1 후속 content 트랙)? 진입은 홈 카드?
  - Q-A6: UoW-13은 전체 무료로 출시(페이월 게이팅은 UoW-19에서 래핑)? **(권장: 예)**

### ⏸️ 체크포인트 A — 설계 승인

> AI는 위 설계를 *제안*한다. 사람이 승인해야 2) 구현으로 넘어간다.

- [ ] 설계 검토 완료
- 결정: <✅ Approved | 🔁 Changes Requested>
- 승인자: <이름> · 날짜: 2026-06-__
- 코멘트 / 변경 요청: <...>

---

## 2) 구현

> **체크포인트 A 승인 후에만** 작성한다.

### 변경 파일 목록 (실제)
| 파일 | 변경 종류 | 요약 |
|---|---|---|
| (승인 후 채움) | | |

### 구현 노트
- (승인 후 채움)

---

## 3) 테스트 (qa-dev)

### 작성/갱신한 테스트
- [ ] (승인 후 채움)

### 검증 게이트 결과 (커밋/푸시 전 필수 · [docs/HARNESS.md](../../docs/HARNESS.md) §3)
- [ ] `npm run typecheck` — 결과: <pass | fail>
- [ ] `npm run lint` — 결과: <pass | fail>
- [ ] `npm run test` — 결과: <pass | fail>
- [ ] `npx expo export` (UI/번들 영향 → 필요) — 결과: <pass | fail>

---

## 4) 리뷰 (code-review)

| # | 위치 | 분류 | 코멘트 | 처리 |
|---|---|---|---|---|
| (승인·구현 후) | | | | |

- 리뷰 결론: <머지 가능 | 수정 후 재리뷰>

---

## 5) Unit 완료

### ⏸️ 체크포인트 B — Unit 완료 승인
- [ ] 검증 게이트 4종 통과 확인
- [ ] code-review 머지 가능
- 결정: <✅ Approved | 🔁 Changes Requested>
- 승인자: <이름> · 날짜: 2026-06-__

### 커밋 / 푸시 기록 ([docs/HARNESS.md](../../docs/HARNESS.md) §4)
- [ ] STATUS Unit 행 상태 갱신
- [ ] 커밋 — 메시지: `feat: 문장 층(i+1 청크 문장·하이라이트·TTS) [UoW-13]`
- [ ] `origin/main` 푸시 (사용자 수행)
- 커밋 해시: `<짧은 해시>`

### 마무리
- 후속: AI(BYOK) 문장 생성, A2/B1 시드 확장, UoW-14(soft-gate 진척 연동). 다음 Unit: `UoW-14-soft-gate-engine`.
