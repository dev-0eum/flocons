# Bolt 기록 — `UoW-12-expand`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md)이며, 이 파일이 갱신되면 STATUS의 해당 Unit 행도 함께 맞춘다.
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [로드맵](../../docs/ROADMAP.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-12-expand` |
| **이름** | A2/B1 데이터셋 확장 + README + 커버리지 점검 + SQLite 재평가 (마감) |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M12 |
| **리드** | **db-dev** (데이터셋·영속 재평가) |
| **멤버** | content-gen(A2/B1 생성 — flocons-content 스킬 SSOT) + qa-dev(커버리지) + code-review |
| **상태** | ✅ Approved (체크포인트 B — 2026-06-11) |
| **시작일 / 완료일** | 2026-06-11 / 2026-06-11 |

> 의존성: UoW-02 ✅(스키마·validate·A1) · DoD 요약: a2/b1 validate 오류 0 · A1 id 보존 · 커버리지 점검 · README 실행/검증법 · 게이트 4종 green. **Construction 마지막 Unit.**

---

## 1) 논리 설계 (제안)

> db-dev 리드 mob. 근거: [docs/DESIGN.md §10(시드 데이터셋)·§4(Word 스키마)](../../docs/DESIGN.md) · [ROADMAP M12](../../docs/ROADMAP.md) · [flocons-content 스킬](../../.claude/skills/flocons-content/SKILL.md)(생성 규약 SSOT) · [ADR-003(영속)·ADR-001?](../inception/04-architecture-decision.md). 코드 미작성·데이터 미생성.

### 목표
A2/B1 시드 데이터셋을 A1과 동일한 품질 규약으로 추가해 레벨 선택(UoW-11)을 실콘텐츠로 활성화하고, README·커버리지·SQLite 재평가로 Construction을 마감한다.

### 1-1. A2/B1 데이터셋 (content-gen — flocons-content 스킬 규약)
- **규모(Q-N1)**: A2 60개 + B1 60개 (A1 65와 유사한 시드 규모 — 총 185 단어).
- **id 규약**: `fr-a2-{lemma}` / `fr-b1-{lemma}` (A1 규약 연장). **기존 A1 id는 일절 변경하지 않음**(DoD — CardState·캐시가 id 참조).
- 스키마·품질: 정규 Word 스키마(관사-성 일치·엘리지옹·품사 태그·CEFR 레벨에 맞는 예문 난이도·한국어 구어체 존댓말 번역·imagePrompt·tags) — [word.schema.json](../../.claude/skills/flocons-content/references/word.schema.json) + [validate.mjs](../../.claude/skills/flocons-content/scripts/validate.mjs)로 생성 즉시 검증(오류 0).
- 산출: `src/data/a2.json` · `src/data/b1.json` (신규).
- `src/content/StaticContentProvider.ts` — DATASETS에 A2/B1 등록 → UoW-11의 "준비 중" 빈 상태가 자연 해소.

### 1-2. 데이터셋 테스트 (qa-dev)
- `__tests__/content/a2Dataset.test.ts` · `b1Dataset.test.ts` (신규) — a1Dataset.test와 동형: validateWords 오류 0 · 개수 · id 규약(`fr-a2-`/`fr-b1-` 접두) · id 중복 없음 · 레벨 필드 일치.
- `a1Dataset.test.ts`에 **A1 id 스냅샷 보존 단언** 추가(65개 id 목록 고정 — 회귀 가드).
- StaticContentProvider 테스트 — A2/B1 반환 검증 추가.

### 1-3. README (root README.md — 현재 `# flocons` 한 줄)
- 구성(Q-N3): 소개(무엇/누구를 위한)·핵심 기능(스와이프·SRS·발음·북마크·통계·AI enrich)·**실행법**(요구사항, `npm install`, `npx expo start` — iOS Expo Go)·**검증법**(`npm run verify`, `npx expo export` — HARNESS 게이트)·프로젝트 구조 요약·**API 키(BYOK)** 설정 안내(설정 화면 → secure-store, 키 없이도 완전 동작)·AI-DLC 문서 포인터(docs/·ai-dlc/)·스크린샷 자리(placeholder — 실기 캡처는 사용자 수동 항목).

### 1-4. 커버리지 점검 (qa-dev)
- `npx jest --coverage` 실행 → 수치를 본 기록에 남기고, **의미 있는 갭만** 보강(수치 목표 추구·무의미한 커버리지용 테스트 금지). 예상 갭: 미커버 분기 위주 소규모.

### 1-5. SQLite 이관 재평가 (db-dev — 평가만, Q-N4)
- 결론 제안: **이관 보류** — 총 185 단어(번들 JSON)·CardState/설정/학습일/캐시 키 수백 개 규모에서 AsyncStorage로 충분(쿼리 패턴도 전량 로드 후 메모리 필터). 재검토 트리거: 단어 수천 개 또는 검색/부분 로드 요구 발생 시. 기록 파일과 STATUS 의사결정 로그에 결론만 남기고 expo-sqlite는 도입하지 않음.

### 변경 파일 계획 (코드·데이터 미작성)
| 파일(예정) | 변경 종류 | 메모 |
|---|---|---|
| `src/data/a2.json` · `src/data/b1.json` | 신규 | content-gen 생성, validate.mjs 오류 0 |
| `src/content/StaticContentProvider.ts` | 수정 | DATASETS에 A2/B1 등록 |
| `__tests__/content/a2Dataset.test.ts` · `b1Dataset.test.ts` | 신규 | validate·규약·중복 |
| `__tests__/content/a1Dataset.test.ts` | 수정 | A1 id 보존 스냅샷 |
| `__tests__/content/StaticContentProvider.test.ts` | 수정 | A2/B1 반환 |
| `README.md` | 수정 | 1-3 구성 |
| (커버리지 갭 보강 테스트) | 신규 | 점검 결과에 따라 소규모 |

### 리스크 / 대안 / 미해결 질문 (체크포인트 A)
- **Q-N1 (규모)**: A2 60 + B1 60 → **권장: 동의.** (대안: 각 150 — 생성·검수 비용 대비 시드 목적 초과.)
- **Q-N2 (생성 주체)**: content-gen 에이전트 + flocons-content 스킬 + validate.mjs 즉시 검증 → **권장: 동의.**
- **Q-N3 (README 스크린샷)**: 자리만 마련, 실기 캡처는 사용자 수동(Expo Go) → **권장: 동의.**
- **Q-N4 (SQLite)**: 이관 보류 결론 기록(도입 없음, 재검토 트리거 명시) → **권장: 동의.**
- 리스크: 생성 콘텐츠의 언어 품질(성 일치·엘리지옹·레벨 적합성) — validate.mjs(기계 검증) + 데이터셋 테스트 + code-review 표본 검수로 방어. 오류 발견 시 해당 항목 재생성.

### ⏸️ 체크포인트 A — 설계 승인

> AI는 위 설계를 *제안*한다. 사람이 승인해야 2) 구현으로 넘어간다.

- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-11
- 코멘트 / 변경 요청: Q-N1~N4 전부 권장값대로 승인.

---

## 2) 구현

승인된 설계대로 (이탈 없음):

### 변경 파일 목록 (실제)
| 파일 | 변경 종류 | 요약 |
|---|---|---|
| `src/data/a2.json` · `src/data/b1.json` | 신규 | content-gen 생성 각 60단어 — validate.mjs 오류 0(경고 21건은 l'/les 성 자동판별 불가 정보성 — 리뷰어가 21개 전부 실제 성 정확 확인), A1 lemma 비중복, 전체 185 id 유니크 |
| `src/content/StaticContentProvider.ts` | 수정 | DATASETS에 A2/B1 등록 — UoW-11 "준비 중" 빈 상태 자연 해소 |
| `README.md` | 수정 | 한 줄 → 소개·기능·실행법·검증법·BYOK 키·구조·문서 포인터·스크린샷 자리(실기 캡처는 수동) |

### 구현 노트
- **SQLite 이관 재평가(Q-N4) 결론**: **이관 보류.** 총 185 단어(번들 JSON, 전량 로드 후 메모리 필터)·영속 키 수십~수백 개 규모에서 AsyncStorage 충분. 재검토 트리거: 단어 수천 개 또는 검색/부분 로드 요구 발생 시. expo-sqlite 미도입.
- **커버리지 점검(1-4) 결과**: Statements 93.52% · Branches 83.96% · Functions 97.04% · Lines 96.32% — 신규 로직이 거의 없는 데이터 Unit 특성상 의미 있는 갭 없음, 보강 불요(리뷰어 동의 — 수치 추구 금지 원칙).
- 리뷰 표본 검수에서 발견된 콘텐츠 3건(아래 §4)을 수정 후 validate·게이트 재통과.

---

## 3) 테스트 (qa-dev)

### 작성/갱신한 테스트
- [x] `__tests__/content/a2Dataset.test.ts` (신규) — 60개·validate 0·`fr-a2-` 규약·중복 없음·A1 lemma 비중복
- [x] `__tests__/content/b1Dataset.test.ts` (신규) — 60개·validate 0·`fr-b1-` 규약·중복 없음·A1+A2 lemma 비중복
- [x] `__tests__/content/a1Dataset.test.ts` — **A1 id 65개 고정 스냅샷**(보존 DoD — CardState/캐시 참조 보호)
- [x] `__tests__/content/StaticContentProvider.test.ts` — A2/B1 반환(60/60), 빈 레벨 케이스 B2로 이동

### 검증 게이트 결과 (커밋/푸시 전 필수 · [docs/HARNESS.md](../../docs/HARNESS.md) §3)
- [x] `npm run typecheck` — pass
- [x] `npm run lint` — pass
- [x] `npm run test` — pass (33 suites, 165 tests — 신규/갱신 12개)
- [x] `npx expo export` — pass

---

## 4) 리뷰 (code-review)

| # | 위치 | 분류 | 코멘트 | 처리 |
|---|---|---|---|---|
| 1 | `fr-b1-proposer` | 콘텐츠 | 예문 "de se retrouver" — je+vous 문맥에선 "de nous retrouver"가 정확(문법 오류) | [x] 반영 — 수정 후 validate·게이트 재통과 |
| 2 | `fr-a2-difficile` | 콘텐츠 | 예문 동어반복("쉽지 않은데 어렵다") — 품질 저하 | [x] 반영 — "Cet exercice est plus difficile que je ne pensais."로 교체 |
| 3 | `fr-b1-internet` | 콘텐츠 | "Sans l'internet" 비표준 — 표준 무관사 "Sans Internet"으로 | [x] 반영 |
| 4 | validate 경고 21건 | 정확성 | l'/les 성 자동판별 불가 정보성 경고 — 리뷰어가 21개 단어 실제 성 전수 확인, 전부 정확 | [x] 확인 완료(조치 불요) |

- 리뷰어 검증: A1 무변경(git diff 공백)·교차 id/lemma 중복 0·README 스크립트 대조 일치·표본 외 일반 검수(관사-성·엘리지옹·imagePrompt·번역 톤) 양호.
- 리뷰 결론: **머지 가능** (블로커 0)

---

## 5) Unit 완료

### ⏸️ 체크포인트 B — Unit 완료 승인
- [x] 검증 게이트 4종 통과 확인
- [x] code-review 머지 가능
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-11

### 커밋 / 푸시 기록 ([docs/HARNESS.md](../../docs/HARNESS.md) §4 규약)
- [x] STATUS 갱신 · [x] 커밋 · [x] 푸시 (사용자 수행)
- 커밋 해시: `ded4de2` (`feat: A2/B1 seed datasets (120 words), README, coverage check [UoW-12]`)

### 마무리
- **Construction 단계 완료** (UoW-00~12 전부 ✅) → 다음: Operations (`/operations`)
- 후속 백로그(미착수): README 스크린샷(실기 캡처), SR 커스텀 액션 play/bookmark, TopBar 메뉴 배선, 이미지 실벤더 연동, Expo Go 실기 AI 경로 확인
