import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  STORAGE_KEY,
  STORE_VERSION,
  classifyCard,
  dueWordIds,
  getCard,
  isCorrect,
  rehydrateCardStore,
  resetCards,
  subscribeCards,
} from '@/store/cardStore';

const DAY = 86_400_000;
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  resetCards();
  await AsyncStorage.clear();
});

describe('cardStore — 분류 매핑', () => {
  it('isCorrect: 알고있어요=true, 학습할게요=false', () => {
    expect(isCorrect('known')).toBe(true);
    expect(isCorrect('learn')).toBe(false);
  });
});

describe('cardStore — classifyCard (SRS 반영)', () => {
  it('새 단어 학습할게요 → box0·learning·lapses1', () => {
    classifyCard('w1', 'learn', 1000);
    const c = getCard('w1');
    expect(c).toBeDefined();
    expect(c!.box).toBe(0);
    expect(c!.status).toBe('learning');
    expect(c!.dueAt).toBe(1000);
    expect(c!.lapses).toBe(1);
    expect(c!.reps).toBe(1);
  });

  it('알고있어요 → box 승급·dueAt=now+1일', () => {
    classifyCard('w1', 'known', 2000);
    const c = getCard('w1')!;
    expect(c.box).toBe(1);
    expect(c.dueAt).toBe(2000 + 1 * DAY);
  });

  it('변경 시 구독자에 통지', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeCards(listener);
    classifyCard('w1', 'known', 1000);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    classifyCard('w2', 'learn', 1000);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('resetCards → cards 비움 + AsyncStorage 삭제', async () => {
    classifyCard('w1', 'known', 1000);
    await flush();
    resetCards();
    await flush();
    expect(getCard('w1')).toBeUndefined();
    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('cardStore — dueWordIds', () => {
  it('dueAt<=now 인 단어만 반환', () => {
    classifyCard('due1', 'learn', 1000); // dueAt 1000
    classifyCard('later', 'known', 1000); // dueAt 1000+1일
    expect(dueWordIds(1000).sort()).toEqual(['due1']);
    expect(dueWordIds(1000 + DAY).sort()).toEqual(['due1', 'later']);
  });
});

describe('cardStore — 영속 (라운드트립 / 마이그레이션)', () => {
  it('classifyCard 후 AsyncStorage에 {version, state} 직렬화', async () => {
    classifyCard('w1', 'known', 1000);
    await flush();
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.version).toBe(STORE_VERSION);
    expect(parsed.state.cards.w1.box).toBe(1);
  });

  it('라운드트립: 저장본 → 초기화 → rehydrate로 복원', async () => {
    classifyCard('w1', 'known', 1000);
    await flush();
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    resetCards(); // 메모리+저장 모두 초기화 (앱 재시작 모사)
    await flush();
    expect(getCard('w1')).toBeUndefined();
    await AsyncStorage.setItem(STORAGE_KEY, raw as string);
    await rehydrateCardStore();
    expect(getCard('w1')?.box).toBe(1);
  });

  it('migrate: v1 저장본을 그대로 복원', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORE_VERSION,
        state: {
          cards: {
            w9: {
              wordId: 'w9',
              status: 'learning',
              box: 2,
              dueAt: 5000,
              reps: 3,
              lapses: 1,
              bookmarked: false,
            },
          },
        },
      }),
    );
    await rehydrateCardStore();
    expect(getCard('w9')?.box).toBe(2);
  });

  it('손상된 저장본은 무시하고 빈 상태 유지', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{not json');
    await rehydrateCardStore();
    expect(getCard('w1')).toBeUndefined();
  });
});
