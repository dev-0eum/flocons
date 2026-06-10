import type { ReactNode } from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { classifyCard, getCard, resetCards } from '@/store/cardStore';
import { resetStudyLog } from '@/store/studyLog';
import ReviewScreen from '../app/review';

// SwipeDeck은 reanimated/gesture 의존 → jest에서 패스스루로 mock (learn.test와 동일 — Q-C3).
jest.mock('@/components/SwipeDeck', () => ({
  SwipeDeck: ({ children }: { children: ReactNode }) => children,
}));

// StaticContentProvider를 2단어 덱으로 모킹 — due 필터를 검증.
jest.mock('@/content', () => {
  const actual = jest.requireActual('@/content');
  class FakeProvider {
    getWords() {
      return Promise.resolve([
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
      ]);
    }
  }
  return { ...actual, StaticContentProvider: FakeProvider };
});

beforeEach(() => {
  resetCards();
  resetStudyLog();
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
});
