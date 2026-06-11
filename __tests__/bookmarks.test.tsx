import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { getCard, resetCards, toggleBookmark } from '@/store/cardStore';
import BookmarksScreen from '../app/(tabs)/bookmarks';

// router.push 스파이 — 북마크 복습 CTA 라우팅 검증.
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// 2단어 덱 mock (UoW-11: 화면은 useWords 경유).
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
  jest.clearAllMocks();
});

describe('BookmarksScreen (북마크 목록)', () => {
  it('북마크한 단어만 목록에 보인다', async () => {
    toggleBookmark('w1');
    const { findByText, queryByText } = render(<BookmarksScreen />);
    expect(await findByText('하나')).toBeTruthy(); // w1 뜻 (headword는 관사 중첩 Text라 뜻으로 식별)
    expect(queryByText('둘')).toBeNull();
  });

  it('0건이면 빈 상태를 보여준다', async () => {
    const { findByText } = render(<BookmarksScreen />);
    expect(await findByText('북마크한 단어가 없어요.')).toBeTruthy();
  });

  it('해제 토글 시 목록에서 즉시 제거되고 영속 상태와 일치한다', async () => {
    toggleBookmark('w1');
    const { findByLabelText, findByText, queryByText } = render(<BookmarksScreen />);
    await findByText('하나');
    fireEvent.press(await findByLabelText('un 북마크 해제'));
    expect(queryByText('하나')).toBeNull(); // useCards 구독으로 즉시 리렌더
    expect(getCard('w1')!.bookmarked).toBe(false);
  });

  it('북마크 복습 CTA가 /review?mode=bookmarks로 이동한다 (Q-H1)', async () => {
    toggleBookmark('w1');
    const { findByLabelText } = render(<BookmarksScreen />);
    fireEvent.press(await findByLabelText('북마크 복습'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/review',
      params: { mode: 'bookmarks' },
    });
  });
});
