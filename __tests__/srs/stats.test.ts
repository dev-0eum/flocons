import type { CardState } from '@/content';
import { countByStatus, dueCount, levelProgress, streakDays, studiedCount } from '@/srs/stats';

const card = (over: Partial<CardState> & { wordId: string }): CardState => ({
  status: 'new',
  box: 0,
  dueAt: 0,
  reps: 0,
  lapses: 0,
  bookmarked: false,
  ...over,
});

/** 로컬 정오 타임스탬프 — 러너 타임존 무관 결정적. */
const at = (y: number, mo: number, d: number) => new Date(y, mo - 1, d, 12).getTime();

describe('stats — countByStatus / studiedCount', () => {
  const cards = {
    a: card({ wordId: 'a', status: 'known', reps: 5 }),
    b: card({ wordId: 'b', status: 'learning', reps: 1 }),
    c: card({ wordId: 'c', status: 'learning', reps: 2 }),
    d: card({ wordId: 'd', status: 'new', reps: 0 }),
  };

  it('status별 카드 수를 센다', () => {
    expect(countByStatus(cards)).toEqual({ new: 1, learning: 2, known: 1 });
  });

  it('학습 단어 수 = reps>0 (Q-F3)', () => {
    expect(studiedCount(cards)).toBe(3);
  });

  it('빈 상태는 전부 0', () => {
    expect(countByStatus({})).toEqual({ new: 0, learning: 0, known: 0 });
    expect(studiedCount({})).toBe(0);
  });
});

describe('stats — dueCount (경계: dueAt == now 포함)', () => {
  const cards = {
    a: card({ wordId: 'a', dueAt: 1000 }),
    b: card({ wordId: 'b', dueAt: 1001 }),
  };

  it('dueAt <= now 인 카드만 센다', () => {
    expect(dueCount(cards, 999)).toBe(0);
    expect(dueCount(cards, 1000)).toBe(1);
    expect(dueCount(cards, 1001)).toBe(2);
  });
});

describe('stats — levelProgress', () => {
  it('known / 전체', () => {
    expect(levelProgress(13, 65)).toBeCloseTo(0.2);
  });

  it('분모 0이면 0', () => {
    expect(levelProgress(5, 0)).toBe(0);
  });

  it('0~1로 클램프', () => {
    expect(levelProgress(70, 65)).toBe(1);
    expect(levelProgress(-1, 65)).toBe(0);
  });
});

describe('stats — streakDays', () => {
  it('오늘 학습 → 오늘 포함 역산', () => {
    const days = new Set(['2026-06-08', '2026-06-09', '2026-06-10']);
    expect(streakDays(days, at(2026, 6, 10))).toBe(3);
  });

  it('오늘 미학습 → 어제부터 역산 (미단절 — Q-F1)', () => {
    const days = new Set(['2026-06-08', '2026-06-09']);
    expect(streakDays(days, at(2026, 6, 10))).toBe(2);
  });

  it('어제도 미학습 → 0', () => {
    const days = new Set(['2026-06-07']);
    expect(streakDays(days, at(2026, 6, 10))).toBe(0);
  });

  it('중간 빈 날에서 끊긴다', () => {
    const days = new Set(['2026-06-06', '2026-06-08', '2026-06-09', '2026-06-10']);
    expect(streakDays(days, at(2026, 6, 10))).toBe(3);
  });

  it('빈 로그 → 0', () => {
    expect(streakDays(new Set<string>(), at(2026, 6, 10))).toBe(0);
  });

  it('월 경계를 가로지른 streak', () => {
    const days = new Set(['2026-05-31', '2026-06-01']);
    expect(streakDays(days, at(2026, 6, 1))).toBe(2);
  });
});
