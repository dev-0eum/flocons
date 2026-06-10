import {
  INTERVAL_DAYS,
  MAX_BOX,
  intervalMs,
  newCardState,
  nextBox,
  schedule,
} from '@/srs/leitner';

const DAY = 86_400_000;

describe('leitner — 상수/box', () => {
  it('간격표는 0/1/3/7/16일', () => {
    expect([...INTERVAL_DAYS]).toEqual([0, 1, 3, 7, 16]);
    expect(MAX_BOX).toBe(4);
  });

  it('nextBox: 정답은 +1(최대 4 클램프), 오답은 0', () => {
    expect(nextBox(0, true)).toBe(1);
    expect(nextBox(3, true)).toBe(4);
    expect(nextBox(4, true)).toBe(4); // 상한 클램프
    expect(nextBox(2, false)).toBe(0);
    expect(nextBox(0, false)).toBe(0);
  });

  it('intervalMs: box→ms, 범위 밖은 클램프', () => {
    expect(intervalMs(0)).toBe(0);
    expect(intervalMs(1)).toBe(1 * DAY);
    expect(intervalMs(4)).toBe(16 * DAY);
    expect(intervalMs(99)).toBe(16 * DAY); // 상한
    expect(intervalMs(-1)).toBe(0); // 하한
  });
});

describe('leitner — newCardState', () => {
  it('초기값(new/box0/dueAt0)', () => {
    expect(newCardState('w1')).toEqual({
      wordId: 'w1',
      status: 'new',
      box: 0,
      dueAt: 0,
      reps: 0,
      lapses: 0,
      bookmarked: false,
    });
  });
});

describe('leitner — schedule (now 주입, 결정적)', () => {
  const now = 1_000_000;

  it('정답: box 승급·dueAt=now+간격·reps++·status learning', () => {
    const next = schedule(newCardState('w1'), true, now);
    expect(next.box).toBe(1);
    expect(next.dueAt).toBe(now + 1 * DAY);
    expect(next.reps).toBe(1);
    expect(next.lapses).toBe(0);
    expect(next.status).toBe('learning');
    expect(next.lastReviewedAt).toBe(now);
  });

  it('오답: box0 리셋·dueAt=now·lapses++', () => {
    const prev = schedule(newCardState('w1'), true, now); // box1
    const next = schedule(prev, false, now + 500);
    expect(next.box).toBe(0);
    expect(next.dueAt).toBe(now + 500); // 간격 0
    expect(next.lapses).toBe(1);
    expect(next.reps).toBe(2);
    expect(next.status).toBe('learning');
  });

  it('연속 정답 4회 → box4·status known', () => {
    let s = newCardState('w1');
    for (let i = 0; i < 4; i++) s = schedule(s, true, now + i);
    expect(s.box).toBe(MAX_BOX);
    expect(s.status).toBe('known');
    expect(s.dueAt).toBe(now + 3 + 16 * DAY);
    expect(s.reps).toBe(4);
  });
});
