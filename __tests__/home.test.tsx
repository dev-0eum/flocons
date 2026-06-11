import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { classifyCard, resetCards } from '@/store/cardStore';
import { rehydrateSettings, resetSettingsForTest, setOnboarded } from '@/store/settingsStore';
import { resetStudyLog } from '@/store/studyLog';
import HomeScreen from '../app/(tabs)/index';

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    router: { push: jest.fn(), replace: jest.fn() },
    Redirect: ({ href }: { href: string }) => React.createElement(Text, null, `REDIRECT:${href}`),
  };
});

// 2단어 덱 mock — 진척 분모 고정.
jest.mock('@/lib/content', () => {
  const words = [
    { id: 'w1', lemma: 'un', level: 'A1' },
    { id: 'w2', lemma: 'deux', level: 'A1' },
  ];
  return {
    useWords: () => ({ words, level: 'A1' }),
    currentProvider: () => ({ getWords: async () => words }),
  };
});

beforeEach(async () => {
  resetSettingsForTest();
  resetCards();
  resetStudyLog();
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('HomeScreen (UoW-11 A)', () => {
  it('rehydrate 전에는 로딩을 보여준다 (리다이렉트 오판 방지)', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('불러오는 중…')).toBeTruthy();
  });

  it('미온보딩이면 /onboarding으로 리다이렉트한다', async () => {
    await rehydrateSettings(); // hydrated=true, onboarded=false
    const { getByText } = render(<HomeScreen />);
    expect(getByText('REDIRECT:/onboarding')).toBeTruthy();
  });

  it('온보딩 후 진척·오늘 due·시작/복습/설정 동선을 제공한다', async () => {
    await rehydrateSettings();
    setOnboarded();
    classifyCard('w1', 'learn', Date.now()); // due 1장

    const { getByText, getByLabelText, findByText } = render(<HomeScreen />);

    expect(await findByText('1장')).toBeTruthy(); // 오늘 복습할 카드
    expect(getByText('레벨 A1')).toBeTruthy();
    expect(getByText('0%')).toBeTruthy(); // known 0 / 2

    fireEvent.press(getByLabelText('학습 시작'));
    expect(router.push).toHaveBeenCalledWith('/learn');

    fireEvent.press(getByLabelText('복습하기'));
    expect(router.push).toHaveBeenCalledWith('/review');

    fireEvent.press(getByLabelText('설정'));
    expect(router.push).toHaveBeenCalledWith('/settings');
  });

  it('due가 0이면 복습 버튼을 숨긴다', async () => {
    await rehydrateSettings();
    setOnboarded();
    const { queryByLabelText, findByText } = render(<HomeScreen />);
    expect(await findByText('0장')).toBeTruthy();
    expect(queryByLabelText('복습하기')).toBeNull();
  });
});
