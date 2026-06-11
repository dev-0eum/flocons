import type { ReactNode } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';

import { deleteKey } from '@/lib/secureKeys';
import { getCard, resetCards } from '@/store/cardStore';
import { resetSettingsForTest, saveKey } from '@/store/settingsStore';
import { resetStudyLog } from '@/store/studyLog';
import LearnScreen from '../app/learn';

// SwipeDeck은 reanimated/gesture 의존 → jest에서 패스스루로 mock(자식만 렌더).
jest.mock('@/components/SwipeDeck', () => ({
  SwipeDeck: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

// 2단어 덱 + enrich 가능한 provider mock (UoW-11: 화면은 useWords/currentProvider 경유).
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
    currentProvider: () => ({
      getWords: async () => words,
      enrich: async (w: { id: string }) => ({
        ...words.find((x) => x.id === w.id),
        exampleFr: 'Nouvelle phrase.',
        exampleKr: '새 예문이에요.',
      }),
    }),
  };
});

beforeEach(async () => {
  resetCards();
  resetStudyLog();
  resetSettingsForTest();
  await deleteKey('anthropic');
  jest.clearAllMocks();
});

describe('LearnScreen (학습 덱)', () => {
  it('loads the deck, classifies through to done, and supports undo', async () => {
    const { getByLabelText, findByText } = render(<LearnScreen />);

    // 첫 카드(하나)
    expect(await findByText('하나')).toBeTruthy();

    // 발음 버튼 → tts.speak(fr-FR)로 관사+표제어 재생 (rate는 settingsStore 기본 1.0)
    fireEvent.press(getByLabelText('단어 발음 듣기'));
    expect(Speech.speak).toHaveBeenCalledWith(
      'le un',
      expect.objectContaining({ language: 'fr-FR', rate: 1.0 }),
    );

    // 북마크 토글 → 영속 반영 (UoW-07)
    fireEvent.press(getByLabelText('북마크 추가'));
    expect(getCard('w1')?.bookmarked).toBe(true);

    // 학습할게요 → 다음 카드(둘) + 분류 햅틱 (UoW-11 D)
    fireEvent.press(getByLabelText('학습할게요'));
    expect(await findByText('둘')).toBeTruthy();
    expect(Haptics.impactAsync).toHaveBeenCalled();

    // undo → 다시 첫 카드(하나) + 선택 햅틱
    fireEvent.press(getByLabelText('되돌리기'));
    expect(await findByText('하나')).toBeTruthy();
    expect(Haptics.selectionAsync).toHaveBeenCalled();

    // 두 장 모두 분류 → 완료 상태 + 축하 햅틱 + 다음 행동 버튼 (UoW-11 D/F)
    fireEvent.press(getByLabelText('알고 있어요'));
    fireEvent.press(getByLabelText('학습할게요'));
    expect(await findByText(/마쳤어요/)).toBeTruthy();
    expect(Haptics.notificationAsync).toHaveBeenCalled();

    // 방금 'learn' 분류된 w2가 due → "복습하러 가기" 액션
    fireEvent.press(getByLabelText('복습하러 가기'));
    expect(router.replace).toHaveBeenCalledWith('/review');
  });

  it('classifies via accessibility actions (스와이프 대안 — UoW-11 E)', async () => {
    const { findByText, getByLabelText } = render(<LearnScreen />);
    await findByText('하나');

    const deck = getByLabelText(/사용자 지정 동작/);
    fireEvent(deck, 'accessibilityAction', { nativeEvent: { actionName: 'know' } });
    expect(await findByText('둘')).toBeTruthy();
    expect(getCard('w1')?.box).toBe(1); // know=승급
  });

  it('shows 새 예문 button only with an Anthropic key and swaps the example (UoW-11 G)', async () => {
    // 키 없음 → 버튼 미노출
    const first = render(<LearnScreen />);
    await first.findByText('하나');
    expect(first.queryByLabelText('새 예문')).toBeNull();
    first.unmount();

    // 키 있음 → 버튼 노출, 탭 시 예문 교체
    await saveKey('anthropic', 'sk-test');
    const second = render(<LearnScreen />);
    await second.findByText('하나');
    fireEvent.press(second.getByLabelText('새 예문'));
    expect(await second.findByText('Nouvelle phrase.')).toBeTruthy();
    expect(await second.findByText('새 예문이에요.')).toBeTruthy();
  });
});
