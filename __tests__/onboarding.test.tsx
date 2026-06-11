import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import {
  SETTINGS_KEY,
  getSettings,
  resetSettingsForTest,
} from '@/store/settingsStore';
import OnboardingScreen from '../app/onboarding';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  resetSettingsForTest();
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('OnboardingScreen (첫 실행 — UoW-11 B)', () => {
  it('레벨을 선택하면 설정에 반영된다', () => {
    const { getByLabelText } = render(<OnboardingScreen />);
    fireEvent.press(getByLabelText('레벨 A2'));
    expect(getSettings().level).toBe('A2');
  });

  it('시작하기 → onboarded 영속 + 홈으로 이동', async () => {
    const { getByLabelText } = render(<OnboardingScreen />);
    fireEvent.press(getByLabelText('레벨 B1'));
    fireEvent.press(getByLabelText('시작하기'));

    expect(getSettings().onboarded).toBe(true);
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');

    await flush();
    const parsed = JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY)) as string);
    expect(parsed.state.onboarded).toBe(true); // 재시작 후에도 온보딩 재노출 없음
    expect(parsed.state.level).toBe('B1');
  });
});
