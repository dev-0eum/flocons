# flocons — 로드맵 (하네스 작업 큐)

> 자율 하네스는 **위에서부터 첫 번째 미체크 하위작업**을 골라 구현하고, 검증 게이트를 통과하면 커밋·푸시한 뒤 체크한다.
> 한 하위작업 = 한 커밋(가능하면). 마일스톤은 여러 커밋으로 구성된다.
> 규칙·게이트는 `HARNESS.md` 참고.

체크 표기: `[ ]` 미완료 · `[x]` 완료(커밋 해시 함께 기록).

---

## M0 — 스캐폴드 & 툴링
- [ ] Expo + TypeScript 프로젝트 초기화 (expo-router 템플릿)
- [ ] ESLint + Prettier 설정, `npm run lint`
- [ ] Jest + @testing-library/react-native 설정, `npm run test` (스모크 테스트 1개)
- [ ] `tsconfig` strict, `npm run typecheck`
- [ ] 검증 스크립트 `npm run verify` = typecheck + lint + test
- [ ] `.gitignore` 점검(node_modules/.expo/dist/.env/*.key)
- [ ] 설계 문서 3종 + 초기 스캐폴드 커밋·푸시

## M1 — 디자인 시스템 & 베이스 컴포넌트
- [ ] `theme/` 색·타이포·간격 토큰
- [ ] `TopBar`(제외수·진행도·undo·메뉴)
- [ ] `WordCard`(이미지/단어/품사/뜻/예문) — 정적 props로 렌더
- [ ] `ActionButtons`(알고 있어요 / 학습할게요)
- [ ] 컴포넌트 스냅샷/렌더 테스트

## M2 — 콘텐츠 계층 + 정적 데이터셋
- [ ] `Word`/`CardState` 타입 정의
- [ ] `ContentProvider` 인터페이스 + `StaticContentProvider`
- [ ] A1 시드 데이터셋 `src/data/a1.json` (~150개, 큐레이션)
- [ ] 데이터셋 유효성 테스트(필수 필드/중복 ID/관사·성 정합성)

## M3 — 학습 덱 화면 (메인)
- [ ] `/learn` 라우트 + 덱 로딩(StaticProvider)
- [ ] 스와이프 카드(gesture-handler + reanimated): 좌/우 = 학습/알고있음
- [ ] 진행도·제외수·undo 동작(인메모리)
- [ ] 카드 전환/빈 덱 상태 처리
- [ ] 인터랙션 테스트

## M4 — 발음 (TTS)
- [ ] `lib/tts.ts` expo-speech 래퍼(fr-FR)
- [ ] 단어/예문 각각 재생 버튼
- [ ] 설정의 속도/음성 반영(기본값 우선)

## M5 — SRS 엔진 + 영속화
- [ ] `srs/leitner.ts` 박스/간격/스케줄 + 단위 테스트
- [ ] `store/deckStore` (zustand + persist/AsyncStorage)
- [ ] 분류 결과가 `CardState`에 반영·복원되는지 테스트

## M6 — 복습 화면 + 통계
- [ ] `/review` 마감(due) 카드만 큐잉
- [ ] `/stats` streak·학습 단어 수·레벨 진척
- [ ] 날짜 경계/타임존 처리 테스트

## M7 — 북마크
- [ ] 카드 북마크 토글(영속)
- [ ] `/bookmarks` 목록 + 거기서 바로 복습

## M8 — 설정 & API 키 입력 (폴백 골격)
- [ ] `/settings` 화면(TTS 속도/음성, 레벨, 데이터 초기화)
- [ ] Anthropic / 이미지 키 입력칸 → `expo-secure-store` 저장
- [ ] `settingsStore`에 "키 존재 여부" 노출, Provider 선택 스위치 골격(키 없으면 Static)

## M9 — AIContentProvider (Anthropic, 키 뒤에서)
- [ ] Anthropic 호출 래퍼(예문·번역 보강) + 결과 로컬 캐시
- [ ] 키 없음/에러 시 Static 자동 폴백
- [ ] 키 토글에 따라 경로가 바뀌는지 테스트(네트워크 모킹)

## M10 — 이미지
- [ ] 카테고리 플레이스홀더 시스템(그라데이션/색)
- [ ] `AIImageProvider`(이미지 키 뒤에서) + 캐시, 없으면 플레이스홀더

## M11 — 온보딩 & 폴리시
- [ ] 첫 실행 온보딩/레벨 선택
- [ ] 햅틱·접근성(대비/폰트 스케일)·로딩/에러 상태
- [ ] 빈 상태/완료 축하 화면

## M12 — 확장 & 마감
- [ ] A2/B1 데이터셋 추가
- [ ] 테스트 보강(커버리지 점검)
- [ ] `README` 사용법/스크린샷/실행법 정리

---

## 백로그 (로드맵 소진 후 하네스가 다듬을 후보)
- 다크 테마 · 위젯/알림(복습 리마인더) · 듣기/받아쓰기 모드 · 동사 활용 드릴 · 데이터 내보내기/가져오기 · 클라우드 동기화 · EAS 빌드/배포.

---

## 차기 (post-v1) — 누적 학습 구조 + 수익화 〔✅ Inception 승인 2026-06-13〕

> v1(M0~M12) 완료. 아래는 [DESIGN §12](DESIGN.md) "차기 방향"의 Unit 백로그로, **post-v1 Inception 라운드에서 ✅ 승인(2026-06-13)** 됐다. 확정 ID·상세·ADR은 [ai-dlc/inception/post-v1/](../ai-dlc/inception/post-v1/), 진행 상태는 [ai-dlc/STATUS.md](../ai-dlc/STATUS.md). 각 Unit은 [/construction `<id>`](../.claude/commands/construction.md)로 체크포인트 A·B를 돈다.
>
> 가번호 매핑: N1→**UoW-13**, N5→**UoW-14**(엔진)+**UoW-18**(시각화), N2→**UoW-15**, N3→**UoW-16**, N4→**UoW-17**, N6→**UoW-19**.
> 권장 실행 순서: **Phase 1**(UoW-13 문장 → UoW-14 엔진) → **Phase 2**(15·16·17·18) → **Phase 3**(19, EAS prebuild·Operations 선행).

- [ ] **UoW-13 문장 층 — 어휘적 청크 빌더** (① 첫 결정): 익힌 단어 풀(box≥2) 기준 i+1 문장(미지 1~2개), 청크 중심. **신규 하이라이트 인프라**(볼드 재사용 아님, ADR-013) + BYOK 생성/폴백. 첫 레슨 무료 미리보기.
- [ ] **UoW-14 soft-gate 엔진** (⑤ 척추·로직): 5층 DAG soft-unlock(Leitner box=굳기, hard-lock 아님), 진척="산출 가능 청크/문장 수", 신규 progressStore. 순수 함수(`srs/softGate.ts`).
- [ ] **UoW-15 문법 cloze 드릴** (② 정렬된 격자): 청크 패턴 사후 추출, cloze(빈칸 산출), CEFR A1/A2/B1 게이팅. 예문 타깃 토큰 마스킹(순수 함수).
- [ ] **UoW-16 응용 — 가이드 산출 + BYOK 피드백 루프** (③ 쌓아 올리기): 빈칸·재배열·KR→FR 번역. BYOK는 예문 보강이 아닌 **산출 교정 피드백** 경로(enrich 분리, 키 없으면 정답+해설 폴백, classifyCard 신호 오염 금지). BYOK 유료화 금지.
- [ ] **UoW-17 활용 — 자유 산출 → 설경 편입** (④ 설경): 주제 작문 프롬프트, 산출물 로컬 보존(outputStore). 콘텐츠 생산비 큼 → content-gen + flocons-content 단계적 큐레이션 + 테마 팩.
- [ ] **UoW-18 설경 시각화** (⑤ 척추·시각화): 눈송이→결정→격자→설경 진척 시각화(기본 무료). **RN View/그라데이션 1차**, react-native-svg는 검증 게이트(Context7+export+성능) 통과 시 선택. 비선형 열람·부드러운 감쇠.
- [ ] **UoW-19 수익화 — EAS prebuild + StoreKit 평생 해금 IAP** (depth-paywall): 단일 비소비성 IAP "결정 평생 해금"(₩29,000, 출시 ₩19,000) + Restore(무계정 복원) + 정직 페이지. 보조: 테마 팩·❄️ 후원. non-negotiables는 [DESIGN §12.2](DESIGN.md) 준수. **EAS prebuild(Operations) + 팔 층(13~17) + Apple Developer Program 선행, 미구현 층 선판매 금지.**
