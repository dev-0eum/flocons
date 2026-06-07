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
