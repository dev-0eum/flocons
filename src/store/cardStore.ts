import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CardState } from '@/content';
import type { Classification } from '@/lib/deck';
import { newCardState, schedule } from '@/srs/leitner';

// 영속 CardState 스토어 — 의존성 없는 순수 모듈 (ADR-002 수정: zustand 제거).
// zustand v5 타입이 tsc 무한 추론을 유발해(2026-06-10, 사용자 결정 A) 모듈 상태 +
// subscribe 패턴으로 대체. UI 반응 구독이 필요해지면(UoW-06) useSyncExternalStore로 연결.
// (UoW-03 인메모리 세션 덱 `lib/deck.ts`와 구분하기 위해 `cardStore`로 명명 — Q-E1.)

export const STORAGE_KEY = 'flocons:cards:v1';
export const STORE_VERSION = 1;

/** 직렬화 포맷. version 필드로 migrate 지원 (ADR-003). */
interface PersistedData {
  version: number;
  state: { cards: Record<string, CardState> };
}

/** 분류값 → SRS 정답 여부. 알고있어요=correct(승급) / 학습할게요=incorrect(box0). */
export function isCorrect(classification: Classification): boolean {
  return classification === 'known';
}

let cards: Record<string, CardState> = {};
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function persistNow(): void {
  // 비동기 persist (fire-and-forget)
  void AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: STORE_VERSION, state: { cards } } satisfies PersistedData),
  );
}

/** 분류 결과를 SRS로 반영·영속. now 주입(호출부에서 Date.now()). */
export function classifyCard(wordId: string, classification: Classification, now: number): void {
  const prev = cards[wordId] ?? newCardState(wordId);
  const next = schedule(prev, isCorrect(classification), now);
  cards = { ...cards, [wordId]: next };
  persistNow();
  emit();
}

/** 북마크 토글·영속. 카드가 없으면 생성하되 SRS 값은 건드리지 않는다(Q-H3). */
export function toggleBookmark(wordId: string): void {
  const prev = cards[wordId] ?? newCardState(wordId);
  cards = { ...cards, [wordId]: { ...prev, bookmarked: !prev.bookmarked } };
  persistNow();
  emit();
}

/** 학습 데이터 초기화(키/콘텐츠 무관 — Q4). 저장본도 삭제. */
export function resetCards(): void {
  cards = {};
  void AsyncStorage.removeItem(STORAGE_KEY);
  emit();
}

/** 저장된 데이터를 읽어 복원 (앱 시작 시 한 번 호출 — app/_layout). */
export async function rehydrateCardStore(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as PersistedData;
    // migrate: v1 그대로 사용. 이후 스키마 변경 시 version 분기 추가.
    if (parsed.version === STORE_VERSION && parsed.state?.cards) {
      cards = parsed.state.cards;
      emit();
    }
  } catch {
    // 저장 데이터 손상 시 새 상태로 시작
  }
}

// ── selector / 구독 (UoW-06 복습 큐·useSyncExternalStore용) ──

/** 현재 전체 스냅샷. */
export const getCards = (): Record<string, CardState> => cards;

/** 특정 단어의 CardState(없으면 undefined). */
export const getCard = (wordId: string): CardState | undefined => cards[wordId];

/** now 기준 복습 예정(dueAt <= now)인 단어 id — 분류 이력 있는(reps>0) 카드만. 북마크만 한 카드(dueAt 0)가 새지 않게(Q-H3). */
export function dueWordIds(now: number): string[] {
  return Object.values(cards)
    .filter((c) => c.reps > 0 && c.dueAt <= now)
    .map((c) => c.wordId);
}

/** 북마크된 단어 id 목록 (dueWordIds와 대칭 — /bookmarks·북마크 복습용). */
export function bookmarkedWordIds(): string[] {
  return Object.values(cards)
    .filter((c) => c.bookmarked)
    .map((c) => c.wordId);
}

/** 변경 구독. 해제 함수 반환. */
export function subscribeCards(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
