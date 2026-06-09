# 01 — 요구사항 (Requirements)

> Inception 산출물 #1. flocons가 *무엇을 / 왜* 하는지, 어떤 제약·가정·리스크 위에서 동작하는지를 합의한다.
> 작성: **app-pm** 리드 mob (back/front/db/cloud-dev 의견, code-review 리뷰). 근거: [docs/DESIGN.md](../../docs/DESIGN.md) · [docs/ROADMAP.md](../../docs/ROADMAP.md).

작성일: 2026-06-09 · 상태: ✅ Approved (2026-06-09, 0eum)

> ℹ️ `.git` 손상 사고(2026-06-09) 후 재구성됨 — 승인 요건 동일.

---

## 1. 목표
- 한국어 모어 화자가 **프랑스어 단어를 스와이프 카드로 빠르게 분류·복습**하는 모바일 앱.
- 맥락 예문(FR/KR) + 발음으로 단어를 익히고, 간격반복(SRS)으로 장기 기억.
- **키 없이도 완전 동작**(번들 정적 데이터셋 + 무료 온디바이스 발음), 키 있으면 AI로 강화.

## 2. 비목표 (NG)
- NG1: 계정/클라우드 동기화·소셜·결제 (v1 밖).
- NG2: 안드로이드 — **개발 대상 iOS만**(사용자 지시 2026-06-09). web은 검증용.

## 3. 기능 요구사항 (FR)
| ID | 요구사항 | 연관 |
|---|---|---|
| FR-01 | 단어 카드 표시(관사 포함 단어·품사·한국어 뜻·예문 FR/KR·이미지) | UoW-01/02/03 |
| FR-02 | 단어·예문 발음 재생(무료 온디바이스 fr-FR) | UoW-04 |
| FR-03 | 스와이프로 "알고 있어요/학습할게요" 분류 | UoW-03 |
| FR-04 | 진행도(n/총)·제외 수·되돌리기(undo) | UoW-03 |
| FR-05 | 간격반복(Leitner)으로 복습 스케줄 | UoW-05 |
| FR-06 | 학습 상태 로컬 영속(앱 재시작 후 복원) | UoW-05 |
| FR-07 | 마감(due) 카드만 복습 큐 | UoW-06 |
| FR-08 | 북마크 저장/목록/복습 | UoW-07 |
| FR-09 | 통계(streak·학습 단어 수·레벨 진척) | UoW-06 |
| FR-10 | 설정: TTS 속도/음성, 레벨, 데이터 초기화 | UoW-08 |
| FR-11 | API 키 입력(보안 저장) → 있으면 AI 콘텐츠, 없으면/삭제 시 정적 폴백 | UoW-08/09 |
| FR-12 | 온보딩·레벨 선택, 햅틱·접근성 | UoW-11 |
| FR-13 | 단어별 이미지(키 없으면 플레이스홀더, 키 있으면 AI) | UoW-10 |
| FR-14 | A1 시드 + A2/B1 확장(동일 스키마) | UoW-02/12 |

## 4. 비기능 요구사항 (NFR)
- 오프라인·무료로 첫 실행부터 동작. 60fps 스와이프. 접근성(대비 WCAG AA·폰트 스케일). 비밀키는 secure-store 전용·평문/커밋 금지. 검증 게이트(typecheck/lint/test/expo export) green 유지.

## 5. 제약 / 가정
- Expo(SDK 55 핀) + TypeScript, expo-router, Zustand, expo-speech, expo-secure-store ([DESIGN §7](../../docs/DESIGN.md), [00-tech-stack](../00-tech-stack.md)).
- 개발/배포 대상 iOS, 데이터는 로컬(AsyncStorage; 규모 시 SQLite).

## 6. 리스크
| # | 리스크 | 완화 |
|---|---|---|
| R-01 | Expo Go 네이티브 모듈/SDK 호환 한계 | Expo Go 호환 범위 한정, SDK 55 핀 (R-11), EAS는 Operations |
| R-02 | AI 콘텐츠 비결정성·비용·지연 | 로컬 캐시 + Static 폴백, 주입형 클라이언트로 테스트 |
| R-03 | 시드 데이터 품질(관사/성/예문) | validate.mjs 게이트, db-dev/content-gen 큐레이션 |
| R-04 | AsyncStorage→SQLite 이관 시점 | v1 AsyncStorage, UoW-12에서 재평가 |
| R-05 | secure-store 키 취급(평문/커밋) | secure-store 전용, store엔 hasKey만, .gitignore |
| R-06 | persist 마이그레이션 누락 = 유실 | version+migrate+partialize, 라운드트립 테스트 |
| R-07 | SRS v1(Leitner) 단순성 | srs/ 격리로 SM-2 교체 경로 |
| R-08 | 테스트 범위 합의 | SRS·Provider 단위 + 핵심 렌더 우선 |
| R-09 | v1 이미지 부재(플레이스홀더) | 카테고리 플레이스홀더, 키 시 AIImage |
| R-10 | AI 캐시 stale | 캐시 키에 providerVersion, 명시적 초기화 |
| R-11 | SDK 56 최신이나 Expo Go 미지원 | SDK 55 핀(ADR-010), 56 지원 시 재평가 |

## 7. 미해결 질문 (체크포인트에서 확정됨)
- Q1 스와이프 방향=좌(알고있어요)/우(학습할게요) · Q2 expo-haptics 채택 · Q3 라우터 (tabs)+풀스크린 혼합 · Q4 데이터 초기화=학습 데이터만(키 별도) · Q5 Anthropic 클라이언트=UoW-09에서 확정 · Q6 이미지 2단계 · Q7 branch protection=Operations. (모두 2026-06-09 승인)
