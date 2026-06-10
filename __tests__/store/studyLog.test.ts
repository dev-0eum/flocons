import AsyncStorage from '@react-native-async-storage/async-storage';

import { localDateKey } from '@/lib/dates';
import {
  STUDY_LOG_KEY,
  STUDY_LOG_VERSION,
  getStudyDays,
  recordStudyDay,
  rehydrateStudyLog,
  resetStudyLog,
  subscribeStudyLog,
} from '@/store/studyLog';

const flush = () => new Promise((r) => setTimeout(r, 0));
const NOW = new Date(2026, 5, 10, 12).getTime();

beforeEach(async () => {
  resetStudyLog();
  await AsyncStorage.clear();
});

describe('studyLog — recordStudyDay', () => {
  it('해당 시각의 로컬 날짜 키를 기록한다', () => {
    recordStudyDay(NOW);
    expect(getStudyDays().has(localDateKey(NOW))).toBe(true);
  });

  it('같은 날 중복 기록은 no-op (통지도 1회)', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeStudyLog(listener);
    recordStudyDay(NOW);
    recordStudyDay(NOW + 60_000);
    expect(getStudyDays().size).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('다른 날은 누적된다', () => {
    recordStudyDay(NOW);
    recordStudyDay(new Date(2026, 5, 11, 9).getTime());
    expect(getStudyDays().size).toBe(2);
  });
});

describe('studyLog — 영속 (라운드트립 / 마이그레이션)', () => {
  it('record 후 {version, state.days}로 직렬화', async () => {
    recordStudyDay(NOW);
    await flush();
    const raw = await AsyncStorage.getItem(STUDY_LOG_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.version).toBe(STUDY_LOG_VERSION);
    expect(parsed.state.days).toEqual([localDateKey(NOW)]);
  });

  it('라운드트립: 저장본 → 초기화 → rehydrate로 복원', async () => {
    recordStudyDay(NOW);
    await flush();
    const raw = await AsyncStorage.getItem(STUDY_LOG_KEY);
    resetStudyLog(); // 앱 재시작 모사
    await flush();
    expect(getStudyDays().size).toBe(0);
    await AsyncStorage.setItem(STUDY_LOG_KEY, raw as string);
    await rehydrateStudyLog();
    expect(getStudyDays().has(localDateKey(NOW))).toBe(true);
  });

  it('손상된 저장본은 무시하고 빈 상태 유지', async () => {
    await AsyncStorage.setItem(STUDY_LOG_KEY, '{not json');
    await rehydrateStudyLog();
    expect(getStudyDays().size).toBe(0);
  });

  it('resetStudyLog → 메모리 비움 + 저장본 삭제', async () => {
    recordStudyDay(NOW);
    await flush();
    resetStudyLog();
    await flush();
    expect(getStudyDays().size).toBe(0);
    expect(await AsyncStorage.getItem(STUDY_LOG_KEY)).toBeNull();
  });
});
