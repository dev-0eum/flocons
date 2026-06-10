import type { CardState } from '@/content';

// SRS 엔진 (Leitner) — 순수 함수. now를 주입받아 결정적으로 동작한다(DESIGN §6).

/** box별 다음 복습 간격(일). box0=즉시(오늘), box4=16일. */
export const INTERVAL_DAYS = [0, 1, 3, 7, 16] as const;
/** 마지막 box 인덱스(=known 도달). */
export const MAX_BOX = INTERVAL_DAYS.length - 1;

const DAY_MS = 86_400_000;

/** 정답이면 한 칸 승급(최대 MAX_BOX), 오답이면 box0으로 리셋. */
export function nextBox(box: number, correct: boolean): number {
  if (!correct) return 0;
  return Math.min(box + 1, MAX_BOX);
}

/** box → 다음 복습까지 간격(ms). 범위 밖 box는 클램프. */
export function intervalMs(box: number): number {
  const i = Math.max(0, Math.min(box, MAX_BOX));
  return INTERVAL_DAYS[i] * DAY_MS;
}

/** box → 학습 상태. 마지막 box 도달 시 known, 그 외 learning. */
function statusFor(box: number): CardState['status'] {
  return box >= MAX_BOX ? 'known' : 'learning';
}

/** 분류 전 새 카드의 초기 상태. */
export function newCardState(wordId: string): CardState {
  return {
    wordId,
    status: 'new',
    box: 0,
    dueAt: 0,
    reps: 0,
    lapses: 0,
    bookmarked: false,
  };
}

/**
 * 분류 결과를 반영한 다음 CardState(순수, now 주입).
 * @param prev   기존 상태
 * @param correct 알고있어요=true(승급) / 학습할게요=false(box0 리셋)
 * @param now    기준 시각(ms) — 결정성 위해 주입
 */
export function schedule(prev: CardState, correct: boolean, now: number): CardState {
  const box = nextBox(prev.box, correct);
  return {
    ...prev,
    box,
    status: statusFor(box),
    dueAt: now + intervalMs(box),
    reps: prev.reps + 1,
    lapses: prev.lapses + (correct ? 0 : 1),
    lastReviewedAt: now,
  };
}
