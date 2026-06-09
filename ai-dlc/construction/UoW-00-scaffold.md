# Bolt 기록 — `UoW-00-scaffold`

> 한 Unit of Work를 도는 Bolt 사이클의 기록. 상태의 SSOT는 [ai-dlc/STATUS.md](../STATUS.md).
> 관련: [Construction README](README.md) · [기술 스택](../00-tech-stack.md) · [설계](../../docs/DESIGN.md) · [하네스](../../docs/HARNESS.md)

> ℹ️ `.git` 손상 사고(2026-06-09)로 미커밋 작업이 유실되어 재구성됨. 게이트는 재실행으로 재확인.

## 헤더

| 항목 | 값 |
|---|---|
| **Unit ID** | `UoW-00-scaffold` |
| **이름** | 스캐폴드 & 툴링 |
| **연결 마일스톤** | [docs/ROADMAP.md](../../docs/ROADMAP.md) M0 |
| **리드** | back-dev · **멤버** front-dev / cloud-dev(verify CI 재현성) / qa-dev / code-review |
| **상태** | ✅ Approved (체크포인트 B) |
| **시작/완료** | 2026-06-09 / 2026-06-09 |

> DoD: `verify`(typecheck+lint+test) green · jest 네이티브 모듈 mock 스모크 통과 · `.gitignore`(.env*/*.key) · Node 핀 · SDK 호환 버전 핀.

---

## 1) 논리 설계 (제안) — ✅ 체크포인트 A 승인 (0eum, 2026-06-09)
back-dev 리드. 루트 `app/` expo-router + `src/` 골격(DESIGN §8), jest-expo + 네이티브 mock, eslint-config-expo, tsconfig strict + `@/*→src/*`. ADR-008(`(tabs)`+풀스크린 혼합). reanimated는 UoW-03로 연기. Node 22·npm.

## 2) 구현
승인된 설계대로 작성:
- **설정**: `package.json`(scripts incl. **verify**, jest preset, `engines.node>=22`), `app.json`(expo-router+splash+secure-store plugin, ios+web, typedRoutes; 커스텀 아이콘은 사고 후 재구성에서 기본값 사용), `tsconfig`(strict, `types:["jest","node"]`, `@/*→src/*`), `babel.config.js`, `eslint.config.js`, `.prettierrc.json`, `.nvmrc`(22), `jest.setup.ts`(mock 3종), `expo-env.d.ts`.
- **라우트**: `app/_layout.tsx`(Stack, ADR-008) · `app/(tabs)/_layout.tsx`(홈/통계/북마크) · 6 화면 placeholder.
- **소스 골격**: `src/components/Placeholder.tsx` + `src/{content,srs,store,data,theme,lib}/.gitkeep`.
- **테스트**: `__tests__/scaffold.test.tsx`(렌더 + secure-store mock).

설계 대비 변경(구현 중 반영):
- **Expo SDK 56→55**(ADR-010): iOS Expo Go가 56 미지원 → 55.0.26 `expo install --fix` 정렬.
- **iOS only**: app.json android 제거. web=검증용.
- 환경 이슈: root 소유 `~/.npm`(EACCES) → 사용자 캐시 우회; RNTL v14(렌더러 peer 변경)→v13.3.3; `babel-preset-expo` 명시 설치; `@expo/ngrok`(터널 테스트용) 제거.

## 3) 테스트 (qa-dev) — 검증 게이트 ([HARNESS §3](../../docs/HARNESS.md))
- [x] `npm run typecheck` — PASS
- [x] `npm run lint` — PASS
- [x] `npm run test` (jest, mock 스모크 2 tests) — PASS
- [x] `npx expo export -p ios` (번들 스모크) — PASS (Hermes 번들 생성)

## 4) 리뷰 (code-review)
승인 수준. blocker였던 `expo export` 미검증은 export 실행으로 해소. nit(.nvmrc↔engines→`>=22` 통일, tsconfig `types` 주석, jest secure-store mock은 UoW-08 확장 인계, icon 에셋은 UoW-01/Operations) 후속 인계. → 머지 가능.

## 5) Unit 완료 — ✅ 체크포인트 B 승인 (0eum, 2026-06-09)
- [x] 게이트 4종 통과 · [x] code-review 머지 가능

### 커밋 / 푸시 (⚠️ `.git` 사고 이후 — **사용자가 직접 푸시**)
- [x] STATUS UoW-00 행 ✅ 갱신
- [ ] 커밋·푸시 — **사용자 수행**. 제안 메시지: `feat: scaffold Expo SDK55 + TS app (expo-router, jest, verify gate) [UoW-00]`
- 커밋 해시: (사용자 푸시 후 기입)

### 마무리
다음 Unit: `UoW-01-design-system`(의존 UoW-00). `UoW-02`·`UoW-04`도 병행 가능.
