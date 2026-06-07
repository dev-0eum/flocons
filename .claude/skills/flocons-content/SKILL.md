---
name: flocons-content
description: 프랑스어 단어/예문/카드 콘텐츠를 만들거나, 시드 데이터셋(JSON)을 추가/검증하거나, AIContentProvider용 콘텐츠 생성 프롬프트를 작성할 때 사용. flocons의 정규 Word JSON 스키마로 콘텐츠를 생성·검증한다 (관사-성 일치, 엘리지옹, 품사 태그, 한국어 번역, CEFR 레벨 예문, id 규약, scripts/validate.mjs 검증).
allowed-tools: Read, Write, Edit, Bash
---

# flocons-content — 프랑스어 단어 카드 콘텐츠 생성·검증

flocons(한국어 모어 화자용 프랑스어 학습 앱)의 단어 카드 콘텐츠를 **정규 Word 스키마**로 생성하고 검증한다.
이 스킬은 db-dev의 시드 데이터셋(`src/data/*.json`) 구축과, 향후 `AIContentProvider`(키 입력 시 실시간 보강)용 콘텐츠 생성 프롬프트 설계에 재사용된다.

원본 근거: `docs/DESIGN.md` §4(데이터 모델 / Word), §10(시드 데이터셋). 충돌 시 DESIGN.md 가 SSOT.

---

## 1. 정규 Word 스키마

콘텐츠 1건은 아래 `Word` 객체이며, 데이터셋 파일은 `Word[]` 배열이다.

```ts
interface Word {
  id: string;                 // 안정적 ID (예: "fr-a1-crime")
  lemma: string;              // 표제어, 관사 없는 형태. 예: "crime"
  article: string | null;     // "le" | "la" | "l'" | "les" | null
  gender: 'm' | 'f' | null;   // 남성 m / 여성 f / 해당 없음 null
  pos: 'n' | 'v' | 'adj' | 'adv' | 'prep' | 'pron' | 'conj' | 'num' | 'det' | 'intj' | 'phrase'; // 품사
  krMeaning: string;          // 한국어 뜻. 예: "범죄"
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'; // CEFR 레벨
  exampleFr: string;          // 프랑스어 예문 (대상 단어 포함)
  exampleKr: string;          // 위 FR 예문의 정확한 한국어
  imageUrl?: string | null;   // 없으면 카테고리 플레이스홀더 (선택)
  tags?: string[];            // 분류/주제 태그 (선택)
}
```

- 필수 필드: `id`, `lemma`, `article`(null 허용), `gender`(null 허용), `pos`, `krMeaning`, `level`, `exampleFr`, `exampleKr`.
- 선택 필드: `imageUrl`(string | null), `tags`(string[]).
- 정확한 JSON Schema 정의는 `references/word.schema.json` 참조.

---

## 2. 프랑스어 정확성 규칙

### 2.1 관사-성(gender) 일치
- 정관사/부정관사로 성을 표기한다:
  - `le` / `un` → 남성 → `gender: "m"`
  - `la` / `une` → 여성 → `gender: "f"`
- 엘리지옹·복수처럼 성이 관사에서 드러나지 않는 경우 **lemma의 실제 성**으로 직접 정확히 표기한다:
  - `l'` (모음·무음 h 앞 엘리지옹): 관사만으로 성 판별 불가 → 사전적 성을 그대로 `m` 또는 `f`로 기입. (예: `l'eau` → f, `l'arbre` → m)
  - `les` (복수): 성 정보가 가려짐 → 단수 기준 사전적 성을 기입(보통은 단수형 lemma 권장).
- 명사가 아니거나(동사·형용사·부사·전치사·구) 성이 없는 경우: `article: null`, `gender: null`.

### 2.2 엘리지옹 (l')
- 모음(a, e, i, o, u, y) 또는 무음 h(h muet)로 시작하는 단수 명사 앞에서는 `le`/`la`가 아니라 **`l'`** 를 쓴다.
  - 예: `l'ami`(m), `l'école`(f), `l'homme`(m, 무음 h), `l'heure`(f).
- 단, 유음 h(h aspiré)는 엘리지옹하지 않는다: `le héros`, `la honte`. lemma의 h 유형을 확인할 것.
- 예문(`exampleFr`)에서도 동일한 엘리지옹/축약 규칙을 적용한다 (`l'`, `d'`, `qu'`, `j'` 등).

### 2.3 품사 태그 (pos)
- 사용 enum: `n`(명사), `v`(동사 — 보통 부정사형 lemma), `adj`(형용사), `adv`(부사), `prep`(전치사), `pron`(대명사), `conj`(접속사), `num`(수사), `det`(한정사), `intj`(감탄사), `phrase`(관용구/표현).
- 동사 lemma는 부정사형(예: `parler`), 형용사 lemma는 남성 단수형 기본 권장.

---

## 3. 한국어 번역 규약
- `krMeaning`: 자연스럽고 정확한 한국어 뜻. 대표 의미 1~2개로 간결하게. 군더더기 설명 금지.
- `exampleKr`: 해당 `exampleFr`의 의미를 보존하는 **의역**. 직역으로 어색하면 자연스러운 한국어로 풀되 의미·뉘앙스는 유지.
- 대상 단어의 뜻이 예문 한국어 안에서 드러나도록 한다.

---

## 4. 예문 규칙
- 난이도는 `level`(CEFR)에 맞춘다: A1은 짧고 기본 어휘·현재형 위주, 레벨이 올라갈수록 구문/시제 확장.
- `exampleFr`는 자연스럽고 문법적으로 정확한 프랑스어이며, **대상 단어(lemma)를 문맥 속에서 실제로 사용**한다.
- `exampleKr`는 그 FR 문장의 정확한 한국어(§3).
- 한 문장 권장. 고유명사/시사·논쟁적 소재는 피하고 일상·학습 친화적 맥락 사용.

---

## 5. id 규약
- 형식: `fr-<level소문자>-<lemma>` (lemma는 소문자, 공백/아포스트로피는 하이픈으로). 예: `fr-a1-crime`, `fr-a2-ecole`.
- 동일 lemma가 여러 레벨/의미로 충돌하면 접미사로 구분: `fr-a1-crime`, `fr-a1-crime-2`.
- id는 데이터셋 전체에서 **유일**해야 한다.

---

## 6. 출력 & 검증 절차
1. 결과는 위 스키마를 만족하는 **JSON 배열**(`Word[]`)로 작성한다. 보통 `src/data/<level>.json`(예: `a1.json`).
2. 작성 후 반드시 검증한다:
   ```
   node .claude/skills/flocons-content/scripts/validate.mjs <작성한.json>
   ```
   - 의존성 0개의 순수 Node ESM 스크립트.
   - 검사: 필수 필드 존재/타입, `pos`·`level`·`gender` enum, 중복 id, 빈 문자열, 관사-성 정합(`le`/`un`↔m, `la`/`une`↔f **명백한 불일치는 오류**, `l'`/`les` 등 모호 케이스는 경고).
   - 오류가 있으면 사람이 읽을 요약을 출력하고 비정상 종료(exit 1). 모호한 경우는 hard-fail 대신 warning.
3. 오류는 모두 수정 후 재검증한다.

## 7. 금지 사항
- **중복 id 금지.**
- **빈 문자열 금지** (필수 string 필드는 비울 수 없음).
- 관사-성 불일치(`le/un`인데 `f`, `la/une`인데 `m`) 금지.
- enum 외 `pos`/`level`/`gender` 값 금지.

## 8. AIContentProvider 프롬프트 재사용
`AIContentProvider`(키 입력 시)용 생성 프롬프트를 설계할 때도 위 스키마·규칙(§1~§5)을 그대로 시스템 지침으로 사용하고, 생성 결과는 동일하게 `validate.mjs`로 검증한 뒤 캐시한다. 즉 정적 시드와 AI 보강 콘텐츠가 **하나의 스키마/규칙**을 공유한다.
