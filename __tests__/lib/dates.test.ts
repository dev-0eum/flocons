import { localDateKey, prevDateKey } from '@/lib/dates';

// 타임스탬프를 로컬 생성자(new Date(y, m, d, ...))로 만들어
// 러너 타임존과 무관하게 결정적으로 검증한다 (UoW-06 날짜 경계 DoD).

describe('dates — localDateKey', () => {
  it('로컬 달력 기준 YYYY-MM-DD를 만든다', () => {
    expect(localDateKey(new Date(2026, 5, 10, 12, 0).getTime())).toBe('2026-06-10');
  });

  it('자정 직전/직후가 다른 날짜로 갈린다 (날짜 경계)', () => {
    expect(localDateKey(new Date(2026, 5, 10, 23, 59, 59).getTime())).toBe('2026-06-10');
    expect(localDateKey(new Date(2026, 5, 11, 0, 0, 0).getTime())).toBe('2026-06-11');
  });

  it('한 자리 월/일을 0 패딩한다', () => {
    expect(localDateKey(new Date(2026, 0, 5).getTime())).toBe('2026-01-05');
  });
});

describe('dates — prevDateKey', () => {
  it('하루 전 키를 만든다', () => {
    expect(prevDateKey('2026-06-10')).toBe('2026-06-09');
  });

  it('월 경계를 넘는다', () => {
    expect(prevDateKey('2026-06-01')).toBe('2026-05-31');
  });

  it('연 경계를 넘는다', () => {
    expect(prevDateKey('2026-01-01')).toBe('2025-12-31');
  });

  it('윤년 3/1 → 2/29', () => {
    expect(prevDateKey('2024-03-01')).toBe('2024-02-29');
  });
});
