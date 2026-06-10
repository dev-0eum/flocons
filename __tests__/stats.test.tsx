import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { classifyCard, resetCards } from '@/store/cardStore';
import { recordStudyDay, resetStudyLog } from '@/store/studyLog';
import StatsScreen from '../app/(tabs)/stats';

// router.push를 스파이 — 복습하기 CTA 동선 검증.
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// provider를 2단어 덱으로 모킹 — 레벨 진척 분모(total=2)를 고정 (UoW-09: currentProvider 경유).
jest.mock('@/lib/content', () => ({
  currentProvider: () => ({
    getWords: () =>
      Promise.resolve([
        { id: 'w1', lemma: 'un', level: 'A1' },
        { id: 'w2', lemma: 'deux', level: 'A1' },
      ]),
  }),
}));

beforeEach(() => {
  resetCards();
  resetStudyLog();
  jest.clearAllMocks();
});

describe('StatsScreen (통계)', () => {
  it('streak·학습 단어 수·레벨 진척·오늘 due를 표시한다', async () => {
    const now = Date.now();
    // w1을 known까지 4회 승급 (box4=known), w2는 학습할게요(due).
    classifyCard('w1', 'known', now);
    classifyCard('w1', 'known', now);
    classifyCard('w1', 'known', now);
    classifyCard('w1', 'known', now);
    classifyCard('w2', 'learn', now);
    recordStudyDay(now);

    const { findByText, getByText } = render(<StatsScreen />);

    expect(await findByText('50%')).toBeTruthy(); // known 1 / total 2
    expect(getByText('1일')).toBeTruthy(); // 오늘 학습 → streak 1
    expect(getByText('2개')).toBeTruthy(); // reps>0 단어 2개
    expect(getByText('1장')).toBeTruthy(); // w2만 due (w1은 +16일)
    expect(getByText('알고 있어요 1 · 학습 중 1')).toBeTruthy();
    expect(getByText('1 / 2 단어')).toBeTruthy();
  });

  it('기록이 없으면 전부 0', async () => {
    const { findByText, getByText } = render(<StatsScreen />);
    expect(await findByText('0%')).toBeTruthy();
    expect(getByText('0일')).toBeTruthy();
    expect(getByText('0개')).toBeTruthy();
    expect(getByText('0장')).toBeTruthy();
  });

  it('복습하기 버튼이 /review로 이동한다', async () => {
    const { findByLabelText } = render(<StatsScreen />);
    fireEvent.press(await findByLabelText('복습하기'));
    expect(router.push).toHaveBeenCalledWith('/review');
  });
});
