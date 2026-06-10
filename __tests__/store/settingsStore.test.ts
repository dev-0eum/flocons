import AsyncStorage from '@react-native-async-storage/async-storage';

import { deleteKey } from '@/lib/secureKeys';
import {
  SETTINGS_KEY,
  SETTINGS_VERSION,
  getSettings,
  rehydrateSettings,
  removeKey,
  resetSettingsForTest,
  saveKey,
  setLevel,
  setTtsRate,
  subscribeSettings,
} from '@/store/settingsStore';

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  resetSettingsForTest();
  await AsyncStorage.clear();
  await deleteKey('anthropic');
  await deleteKey('image');
});

describe('settingsStore — 설정 영속 (ttsRate·level)', () => {
  it('직렬화에 키 플래그를 포함하지 않는다 (ADR-004)', async () => {
    setTtsRate(1.25);
    setLevel('A2');
    await flush();
    const parsed = JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY)) as string);
    expect(parsed.version).toBe(SETTINGS_VERSION);
    expect(parsed.state).toEqual({ ttsRate: 1.25, level: 'A2' }); // hasKey 비직렬화
  });

  it('라운드트립: 저장본 → 초기화 → rehydrate 복원', async () => {
    setTtsRate(0.75);
    await flush();
    resetSettingsForTest();
    expect(getSettings().ttsRate).toBe(1.0);
    await rehydrateSettings();
    expect(getSettings().ttsRate).toBe(0.75);
  });

  it('손상된 저장본은 무시하고 기본값 유지', async () => {
    await AsyncStorage.setItem(SETTINGS_KEY, '{broken');
    await rehydrateSettings();
    expect(getSettings().ttsRate).toBe(1.0);
    expect(getSettings().level).toBe('A1');
  });
});

describe('settingsStore — hasKey 파생 (Q-I3)', () => {
  it('saveKey → true, removeKey → false (Static 회귀 전제)', async () => {
    await saveKey('anthropic', 'sk-test');
    expect(getSettings().hasAnthropicKey).toBe(true);
    await removeKey('anthropic');
    expect(getSettings().hasAnthropicKey).toBe(false);
  });

  it('rehydrateSettings가 secure-store에서 플래그를 파생한다', async () => {
    await saveKey('image', 'img-key');
    resetSettingsForTest(); // 앱 재시작 모사 (secure-store는 유지)
    expect(getSettings().hasImageKey).toBe(false);
    await rehydrateSettings();
    expect(getSettings().hasImageKey).toBe(true);
  });

  it('변경 시 구독자에 통지', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeSettings(listener);
    setTtsRate(1.25);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    setLevel('B1');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
