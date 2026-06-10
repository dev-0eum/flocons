# Bolt 기록 — `UoW-08-settings-keys`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md)이며, 이 파일이 갱신되면 STATUS의 해당 Unit 행도 함께 맞춘다.
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [로드맵](../../docs/ROADMAP.md) · [하네스](../../docs/HARNESS.md)

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-08-settings-keys` |
| **이름** | 설정 화면 + API 키 입력(secure-store) + Provider 선택 골격 |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M8 |
| **리드** | **front-dev** (/settings UI) |
| **멤버** | back-dev(secureKeys·selectProvider) + db-dev(settingsStore 영속) + qa-dev + code-review |
| **상태** | ⏸️ Awaiting Approval (체크포인트 B) |
| **시작일 / 완료일** | 2026-06-10 / (미정) |

> 의존성: UoW-00 ✅ · UoW-01 ✅ · DoD 요약: 키는 secure-store에만(평문 무노출) · hasKey 갱신 · 키 삭제 시 Static 회귀 · 게이트 4종 green.

---

## 1) 논리 설계 (제안)

> front-dev 리드 mob. 근거: [docs/DESIGN.md §3 /settings·§5 선택 규칙](../../docs/DESIGN.md) · [ADR-002/003(스토어·persist)](../inception/04-architecture-decision.md) · **[ADR-004(키는 secure-store 전용, store엔 hasKey만)](../inception/04-architecture-decision.md)** · [ADR-005(TTS rate/voice는 인자)](../inception/04-architecture-decision.md) · [inception/03-units-of-work.md UoW-08](../inception/03-units-of-work.md). 코드 미작성.

### 목표
`/settings`에서 TTS 속도·레벨·데이터 초기화·API 키를 관리한다. 키 원문은 `expo-secure-store`에만 저장하고(ADR-004), 앱 상태에는 `hasKey:boolean`만 둔다. UoW-09(AIContentProvider)가 꽂힐 **Provider 선택 골격**을 확정한다.

### 1-1. `src/lib/secureKeys.ts` (back-dev) — secure-store 유일 접점
- `KeyId = 'anthropic' | 'image'`. SecureStore 항목명 `flocons.key.anthropic` / `flocons.key.image` — **SecureStore 키는 영숫자·`.`·`-`·`_`만 허용**되므로 AsyncStorage의 `:` 네임스페이스와 달리 점 표기.
- `setKey(id, value)` · `getKey(id)` · `deleteKey(id)` · `hasKey(id): Promise<boolean>` (전부 try/catch — web 등 미지원 플랫폼에서 안전 no-op/false).
- 키 원문은 이 모듈 경계 밖으로 **로그·직렬화·상태 저장 금지**(HARNESS §5).

### 1-2. `src/store/settingsStore.ts` (db-dev) — 모듈 상태 + subscribe (결정 A 패턴)
- 상태: `{ ttsRate: number(기본 1.0), level: Level(기본 'A1'), hasAnthropicKey: boolean, hasImageKey: boolean }`.
- 영속: AsyncStorage `flocons:settings:v1`, `{version:1, state:{ttsRate, level}}` — **hasKey 플래그는 직렬화하지 않고**(ADR-004/003 partialize 정신) 기동 시 secure-store에서 파생(Q-I3).
- 액션: `setTtsRate` · `setLevel` · `saveKey(id, value)`(secureKeys.setKey → hasKey true) · `removeKey(id)`(deleteKey → hasKey false) · `refreshKeyFlags()` · `rehydrateSettings()`(설정 복원 + refreshKeyFlags; app/_layout에서 호출) · `resetSettings()`는 비범위(초기화는 학습 데이터만 — Q4).
- `src/store/hooks.ts`에 `useSettings()` 추가.

### 1-3. TTS 속도 연동 (ADR-005 준수)
- `lib/tts.ts`는 수정하지 않는다(rate는 인자). **DeckSession**이 `useSettings().ttsRate`를 읽어 `speak(text, { rate })`로 전달 — learn·review 동시 적용.

### 1-4. `src/content/selectProvider.ts` (back-dev) — 선택 골격 (DESIGN §5)
- 순수 함수 `selectProviderKind({ hasAnthropicKey }): 'ai' | 'static'` — 키 있으면 'ai', 없으면 'static'. **키 삭제 → 'static' 즉시 회귀**(DoD)를 테스트로 고정.
- `createProvider(kind)`: 'static' → `StaticContentProvider`. 'ai' → **UoW-09 전까지 Static 반환하는 골격**(주석 명시: AIContentProvider·실패 폴백은 UoW-09에서 교체 — Q-I5). `src/content/index.ts`에 export.
- 화면들의 Provider 사용 전환(getWords 호출부 교체)은 UoW-09에서 일괄 — 이번 Unit은 골격+테스트만.

### 1-5. `/settings` 화면 (front-dev, app/settings.tsx — 헤더 표시 stack 라우트)
- **발음**: TTS 속도 프리셋 3단(느리게 0.75 / 보통 1.0 / 빠르게 1.25) Pressable 세그먼트 — 슬라이더 의존성 추가 없음(Q-I1). 음성(voice) 선택은 v1 제외(시스템 기본).
- **레벨**: A1/A2/B1 선택 UI(영속). 학습/복습/통계 화면의 A1 고정 해제는 **UoW-11에서 연동**(Q-I2 — 화면에 주석·문구로 명시).
- **API 키**: Anthropic·이미지 키 각각 — `secureTextEntry` TextInput + 저장/삭제 버튼 + 상태 배지("저장됨"/"없음" — hasKey만). **키 원문은 표시·프리필하지 않고**, 저장 직후 입력칸을 비운다.
- **데이터 초기화**: `Alert.alert` 확인 → `resetCards()` + `resetStudyLog()` (학습 데이터만, 키는 별도 — Inception Q4, Q-I4).

### 1-6. 테스트 기반 (qa-dev)
- [jest.setup.ts](../../jest.setup.ts)의 expo-secure-store mock을 **in-memory Map 기반**으로 강화(현재 고정 null 반환이라 라운드트립 테스트 불가).

### 변경 파일 계획 (코드 미작성)
| 파일(예정) | 변경 종류 | 메모 |
|---|---|---|
| `src/lib/secureKeys.ts` | 신규 | secure-store 래퍼 (유일 접점, try/catch) |
| `src/store/settingsStore.ts` | 신규 | ttsRate·level 영속 + hasKey 파생(비직렬화) |
| `src/store/hooks.ts` | 수정 | useSettings 추가 |
| `src/content/selectProvider.ts` | 신규 | selectProviderKind + createProvider 골격 |
| `src/content/index.ts` | 수정 | selectProvider export |
| `src/components/DeckSession.tsx` | 수정 | speak에 ttsRate 전달 |
| `app/settings.tsx` | 수정 | 플레이스홀더 → 설정 화면 |
| `app/_layout.tsx` | 수정 | rehydrateSettings 추가 |
| `jest.setup.ts` | 수정 | secure-store in-memory mock |
| `__tests__/lib/secureKeys.test.ts` | 신규 | set/get/delete/hasKey 라운드트립 |
| `__tests__/store/settingsStore.test.ts` | 신규 | 설정 영속 라운드트립·hasKey 파생·비직렬화 확인 |
| `__tests__/content/selectProvider.test.ts` | 신규 | kind 매핑·키 삭제 시 static 회귀·골격 Static 반환 |
| `__tests__/settings.test.tsx` | 신규 | 키 저장→배지 갱신·입력칸 클리어·평문 미노출·삭제 회귀·초기화 호출 |
| `__tests__/learn.test.tsx` | 수정 | speak 호출에 rate 전달 단언(선택) |

### 데이터 흐름
키 입력 → `settingsStore.saveKey` → secureKeys(secure-store 저장) + `hasAnthropicKey=true` → `selectProviderKind` 'ai' (UoW-09에서 실제 AI 경로). 키 삭제 → hasKey false → 'static' 회귀. ttsRate → DeckSession `speak(…, {rate})`. 설정(레벨·속도)만 AsyncStorage 영속, 키 원문은 secure-store에만.

### 리스크 / 대안 / 미해결 질문 (체크포인트 A)
- **Q-I1 (TTS 속도 UI)**: 프리셋 3단(0.75/1.0/1.25) — 슬라이더 패키지 미추가. 음성 선택은 v1 제외 → **권장: 동의.**
- **Q-I2 (레벨 설정)**: settingsStore에 `level` 포함(UI·영속), 학습 화면 연동은 UoW-11 → **권장: 동의.** (UoW-11 의존성에 UoW-08이 이미 있음.)
- **Q-I3 (hasKey 파생)**: hasKey는 영속하지 않고 기동 시 secure-store 조회로 파생 → **권장: 동의.**
- **Q-I4 (데이터 초기화 범위)**: cards+studyLog만, 키 제외(Q4 재확인), Alert 확인 후 실행 → **권장: 동의.**
- **Q-I5 (selectProvider 골격)**: 'ai' kind여도 UoW-09 전까지 Static 인스턴스 반환(선택 규칙·회귀 테스트만 확정) → **권장: 동의.**
- 리스크: expo-secure-store는 web 미지원 — 모든 호출 try/catch, 기동 조회는 useEffect 내부라 `expo export` 정적 렌더에서 실행되지 않음(안전). context7 비가용 시 설치 타입+typecheck로 검증(이전 Unit과 동일).
- 리스크: 키 입력 TextInput 값이 컴포넌트 로컬 state에 잠시 존재 — 저장 즉시 클리어, 로그·영속 금지로 한정(불가피한 최소 체류).

### ⏸️ 체크포인트 A — 설계 승인

> AI는 위 설계를 *제안*한다. 사람이 승인해야 2) 구현으로 넘어간다.

- [x] 설계 검토 완료
- 결정: ✅ Approved
- 승인자: 0eum · 날짜: 2026-06-10
- 코멘트 / 변경 요청: Q-I1~I5 전부 권장값대로 승인.

---

## 2) 구현

승인된 설계대로 (설계 이탈 없음):

### 변경 파일 목록 (실제)
| 파일 | 변경 종류 | 요약 |
|---|---|---|
| `src/lib/secureKeys.ts` | 신규 | secure-store 유일 접점 (`flocons.key.*`, 전 호출 try/catch, hasKey만 외부 노출) |
| `src/store/settingsStore.ts` | 신규 | ttsRate·level 영속(`flocons:settings:v1`), hasKey 비직렬화·파생, saveKey/removeKey/refreshKeyFlags/rehydrateSettings |
| `src/content/selectProvider.ts` | 신규 | selectProviderKind(순수) + createProvider 골격('ai'도 UoW-09 전까지 Static — TODO 주석) |
| `src/content/index.ts` | 수정 | selectProvider export |
| `src/store/hooks.ts` | 수정 | useSettings (useSyncExternalStore) |
| `src/components/DeckSession.tsx` | 수정 | `speak(text, {rate: ttsRate})` 전달 (ADR-005 — tts.ts 무수정) |
| `app/settings.tsx` | 수정 | 설정 화면: 속도 프리셋 3단·레벨 세그먼트·KeyField(secureTextEntry, 저장 즉시 클리어, hasKey 배지)·데이터 초기화(Alert) |
| `app/_layout.tsx` | 수정 | rehydrateSettings 추가 |
| `src/theme/colors.ts` | 수정 | `danger` 토큰 추가 (리뷰 권고 반영) |
| `jest.setup.ts` | 수정 | expo-secure-store mock을 in-memory Map으로 강화 |

### 구현 노트
- context7 MCP 비가용 — expo-secure-store·TextInput API는 설치 타입+typecheck로 검증.
- `resetSettingsForTest`(테스트 전용, 메모리만 리셋)를 export — cardStore/studyLog의 reset 관례와 일치(리뷰어 수용).
- (이월) `/settings` 진입 트리거(메뉴/탭 버튼)가 아직 없음 — UoW-08 범위 밖(이전부터 부재), UoW-11 폴리시에서 배선.

---

## 3) 테스트 (qa-dev)

### 작성/갱신한 테스트
- [x] `__tests__/lib/secureKeys.test.ts` — set/get 라운드트립·hasKey 전이·키 id 분리
- [x] `__tests__/store/settingsStore.test.ts` — 직렬화에 키 플래그 미포함(ADR-004 회귀 가드)·설정 라운드트립·손상 무시·hasKey 파생(saveKey/removeKey/rehydrate)·구독 통지
- [x] `__tests__/content/selectProvider.test.ts` — kind 매핑·삭제 시 static 회귀·골격 Static 반환
- [x] `__tests__/settings.test.tsx` — 속도/레벨 반영·키 저장(secure-store 저장+배지+입력칸 클리어+평문 미노출)·삭제 회귀·빈 입력 차단·데이터 초기화(cards/studyLog만, 키 유지)
- [x] `__tests__/learn.test.tsx` — speak에 `rate: 1.0` 전달 단언
- [x] `__tests__/scaffold.test.tsx` — secure-store mock 강화(in-memory 라운드트립)에 맞춰 단언 갱신

### 검증 게이트 결과 (커밋/푸시 전 필수 · [docs/HARNESS.md](../../docs/HARNESS.md) §3)
- [x] `npm run typecheck` — pass
- [x] `npm run lint` — pass
- [x] `npm run test` — pass (24 suites, 120 tests — 신규/갱신 20개)
- [x] `npx expo export` — pass

---

## 4) 리뷰 (code-review)

| # | 위치(파일:라인) | 분류 | 코멘트 | 처리 |
|---|---|---|---|---|
| 1 | `app/settings.tsx:233` | 일관성 | `dangerLabel` 색 `#B91C1C` 하드코딩(코드베이스 유일) → danger 토큰화 권고 | [x] 반영 — `colors.danger` 추가 후 게이트 재통과 |
| 2 | `jest.setup.ts` | 정확성 | mock store가 동일 파일 내 테스트 간 공유 — 현재 beforeEach 격리로 안전 | [x] 보류(nit — 현행 안전) |
| 3 | `app/_layout.tsx` | 일관성 | `/settings` 진입 트리거 부재 — HEAD 이전부터, UoW-08 범위 밖 | [x] 보류(범위 밖 — UoW-11로 이월) |

- 보안 검증(리뷰어): 키 원문이 secure-store 밖(로그/AsyncStorage/상태/화면/테스트)으로 새는 경로 없음 — ADR-004·HARNESS §5 충족. hasKey 비직렬화 회귀 가드 확인. Q-I1~I5 전부 승인값대로 구현.
- 리뷰 결론: **머지 가능** (블로커 0)

---

## 5) Unit 완료

### ⏸️ 체크포인트 B — Unit 완료 승인
- [ ] 검증 게이트 4종 통과 확인
- [ ] code-review 머지 가능
- 결정: <✅ Approved | 🔁 Changes Requested>
- 승인자: <이름> · 날짜: <YYYY-MM-DD>

### 커밋 / 푸시 기록 ([docs/HARNESS.md](../../docs/HARNESS.md) §4 규약)
- [ ] STATUS 갱신 · [ ] 커밋 · [ ] 푸시
- 커밋 해시: <짧은 해시>

### 마무리
- 후속 작업 / 다음 Unit: <...>
