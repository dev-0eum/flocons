import type { ReactNode } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import * as Speech from 'expo-speech';

import { getCard, resetCards } from '@/store/cardStore';
import { resetStudyLog } from '@/store/studyLog';
import LearnScreen from '../app/learn';

// SwipeDeck은 reanimated/gesture 의존 → jest에서 패스스루로 mock(자식만 렌더).
// 스와이프 제스처 자체는 expo export(번들) + 수동으로 검증(Q-C3).
jest.mock('@/components/SwipeDeck', () => ({
  SwipeDeck: ({ children }: { children: ReactNode }) => children,
}));

// provider를 2단어 덱으로 모킹해 전체 흐름(로드→분류→완료·undo)을 검증 (UoW-09: 화면은 currentProvider 경유).
jest.mock('@/lib/content', () => ({
  currentProvider: () => ({
    getWords: () =>
      Promise.resolve([
        {
          id: 'w1',
          lemma: 'un',
          article: 'le',
          gender: 'm',
          pos: 'n',
          krMeaning: '하나',
          level: 'A1',
          exampleFr: "Il y a un livre.",
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
      ]),
  }),
}));

// DeckSession이 전역 모듈 스토어(cardStore·studyLog)에 기록하므로 스위트 간 격리.
beforeEach(() => {
  resetCards();
  resetStudyLog();
});

describe('LearnScreen (학습 덱)', () => {
  it('loads the deck, classifies through to done, and supports undo', async () => {
    const { getByLabelText, findByText } = render(<LearnScreen />);

    // 로딩 후 첫 카드(하나)
    expect(await findByText('하나')).toBeTruthy();

    // 발음 버튼 → tts.speak(fr-FR)로 관사+표제어 재생 (rate는 settingsStore 기본 1.0 — UoW-08)
    fireEvent.press(getByLabelText('단어 발음 듣기'));
    expect(Speech.speak).toHaveBeenCalledWith(
      'le un',
      expect.objectContaining({ language: 'fr-FR', rate: 1.0 }),
    );

    // 북마크 토글 → 영속 반영 (UoW-07 — DeckSession 배선)
    fireEvent.press(getByLabelText('북마크 추가'));
    expect(getCard('w1')?.bookmarked).toBe(true);

    // 학습할게요 → 다음 카드(둘)
    fireEvent.press(getByLabelText('학습할게요'));
    expect(await findByText('둘')).toBeTruthy();

    // undo → 다시 첫 카드(하나)
    fireEvent.press(getByLabelText('되돌리기'));
    expect(await findByText('하나')).toBeTruthy();

    // 두 장 모두 분류 → 완료 상태
    fireEvent.press(getByLabelText('알고 있어요'));
    fireEvent.press(getByLabelText('학습할게요'));
    expect(await findByText(/마쳤어요/)).toBeTruthy();
  });
});
