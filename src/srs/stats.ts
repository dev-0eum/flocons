import type { CardState } from '@/content';
import { localDateKey, prevDateKey } from '@/lib/dates';

// 통계 셀렉터 — 전부 순수 함수, now 주입 (UoW-06, DESIGN §3 /stats).

export interface StatusCounts {
  new: number;
  learning: number;
  known: number;
}

/** status별 카드 수. */
export function countByStatus(cards: Record<string, CardState>): StatusCounts {
  const counts: StatusCounts = { new: 0, learning: 0, known: 0 };
  for (const c of Object.values(cards)) counts[c.status] += 1;
  return counts;
}

/** 한 번이라도 분류한(reps>0) 단어 수 — "학습 단어 수" (Q-F3). */
export function studiedCount(cards: Record<string, CardState>): number {
  return Object.values(cards).filter((c) => c.reps > 0).length;
}

/** now 기준 복습 예정(dueAt <= now)인 카드 수. */
export function dueCount(cards: Record<string, CardState>, now: number): number {
  return Object.values(cards).filter((c) => c.dueAt <= now).length;
}

/** 레벨 진척(0~1): known / 전체 단어 수. 분모 0이면 0. 0~1로 클램프. */
export function levelProgress(knownCount: number, totalWords: number): number {
  if (totalWords <= 0) return 0;
  return Math.min(1, Math.max(0, knownCount / totalWords));
}

/**
 * 연속 학습일(streak). 오늘 학습했으면 오늘부터, 안 했으면 어제부터 역산 —
 * 오늘은 아직 기회가 있으므로 streak을 끊지 않는다 (Q-F1).
 */
export function streakDays(days: ReadonlySet<string>, now: number): number {
  let key = localDateKey(now);
  if (!days.has(key)) key = prevDateKey(key);
  let streak = 0;
  while (days.has(key)) {
    streak += 1;
    key = prevDateKey(key);
  }
  return streak;
}
