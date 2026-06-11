import type { ReactNode } from 'react';
import { render } from '@testing-library/react-native';

import LearnScreen from '../app/learn';
import ReviewScreen from '../app/review';

// SwipeDeck은 reanimated 의존 → 패스스루 mock (다른 화면 테스트와 동일 — Q-C3).
jest.mock('@/components/SwipeDeck', () => ({
  SwipeDeck: ({ children }: { children: ReactNode }) => children,
}));

// 데이터가 없는 레벨(A2/B1) — "준비 중" 빈 상태 검증 (UoW-11 C, Q-L1).
jest.mock('@/lib/content', () => ({
  useWords: () => ({ words: [], level: 'A2' }),
  currentProvider: () => ({ getWords: async () => [] }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

describe('빈 레벨 (Q-L1)', () => {
  it('learn: 데이터 없는 레벨이면 준비 중 안내를 보여준다', () => {
    const { getByText } = render(<LearnScreen />);
    expect(getByText('이 레벨 콘텐츠는 준비 중이에요.')).toBeTruthy();
  });

  it('review: 데이터 없는 레벨이면 준비 중 안내를 보여준다', () => {
    const { getByText } = render(<ReviewScreen />);
    expect(getByText('이 레벨 콘텐츠는 준비 중이에요.')).toBeTruthy();
  });
});
