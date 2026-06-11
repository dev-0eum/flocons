import type { ReactNode } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { classifyCard, getCard, resetCards, toggleBookmark } from '@/store/cardStore';
import { resetStudyLog } from '@/store/studyLog';
import ReviewScreen from '../app/review';

// SwipeDeck은 reanimated/gesture 의존 → jest에서 패스스루로 mock (learn.test와 동일 — Q-C3).
jest.mock('@/components/SwipeDeck', () => ({
  SwipeDeck: ({ children }: { children: ReactNode }) => children,
}));

// 라우트 파라미터 mock — 테스트별로 mockParams 교체 (mode=bookmarks 분기 검증).
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  router: { push: jest.fn(), replace: jest.fn() },
}));

// 2단어 덱 mock — due 필터를 검증 (UoW-11: 화면은 useWords 경유).
jest.mock('@/lib/content', () => {
  const words = [
    {
      id: 'w1',
      lemma: 'un',
      article: 'le',
      gender: 'm',
      pos: 'n',
      krMeaning: '하나',
      level: 'A1',
      exampleFr: 'Il y a un livre.',
      exampleKr: '책이 한 권 있어요.',
    },
    {
      id: 'w2',
      lemma: 'deux',
      article: null,
      gender: null,
      pos: 'num',
      krMeaning: '둘',
      level: 'A1',
      exampleFr: "J'ai deux amis.",
      exampleKr: '친구가 두 명 있어요.',
    },
  ];
  return {
    useWords: () => ({ words, level: 'A1' }),
    currentProvider: () => ({ getWords: async () => words }),
  };
});

beforeEach(() => {
  resetCards();
  resetStudyLog();
  mockParams = {};
});

describe('ReviewScreen (복습 큐)', () => {
  it('due 카드만 큐잉한다', async () => {
    classifyCard('w1', 'learn', Date.now()); // box0 → dueAt=now → due
    classifyCard('w2', 'known', Date.now()); // box1 → dueAt=now+1일 → not due
    const { findByText, queryByText } = render(<ReviewScreen />);
    expect(await findByText('하나')).toBeTruthy();
    expect(queryByText('둘')).toBeNull();
  });

  it('due 0건이면 빈 상태를 보여준다', async () => {
    const { findByText } = render(<ReviewScreen />);
    expect(await findByText('지금 복습할 카드가 없어요.')).toBeTruthy();
  });

  it('복습 분류가 SRS를 갱신하고 큐 소진 시 완료 상태가 된다', async () => {
    classifyCard('w1', 'learn', Date.now());
    const { findByText, getByLabelText } = render(<ReviewScreen />);
    await findByText('하나');
    fireEvent.press(getByLabelText('알고 있어요'));
    expect(await findByText(/복습을 마쳤어요/)).toBeTruthy();
    expect(getCard('w1')!.box).toBe(1); // box0 → 승급
  });

  it('북마크만 한 카드(미분류)는 기본 due 큐에 잡히지 않는다 (Q-H3)', async () => {
    toggleBookmark('w1');
    const { findByText } = render(<ReviewScreen />);
    expect(await findByText('지금 복습할 카드가 없어요.')).toBeTruthy();
  });
});

describe('ReviewScreen — mode=bookmarks (북마크 복습, UoW-07)', () => {
  it('북마크 전체를 큐잉한다 (due 무관 — Q-H2)', async () => {
    mockParams = { mode: 'bookmarks' };
    toggleBookmark('w2'); // 미분류·북마크만 — due 아님에도 북마크 복습엔 포함
    const { findByText, queryByText } = render(<ReviewScreen />);
    expect(await findByText('둘')).toBeTruthy();
    expect(queryByText('하나')).toBeNull();
  });

  it('북마크 0건이면 전용 빈 상태', async () => {
    mockParams = { mode: 'bookmarks' };
    const { findByText } = render(<ReviewScreen />);
    expect(await findByText('북마크한 단어가 없어요.')).toBeTruthy();
  });

  it('큐 소진 시 북마크 전용 완료 문구 + 홈으로 액션 (UoW-11 F)', async () => {
    mockParams = { mode: 'bookmarks' };
    toggleBookmark('w1');
    const { findByText, getByLabelText, findByLabelText } = render(<ReviewScreen />);
    await findByText('하나');
    fireEvent.press(getByLabelText('알고 있어요'));
    expect(await findByText(/북마크 복습을 마쳤어요/)).toBeTruthy();

    fireEvent.press(await findByLabelText('홈으로'));
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });
});
