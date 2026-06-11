import AsyncStorage from '@react-native-async-storage/async-storage';

import { AIImageProvider, imageCacheKey, type ImageClient, type Word } from '@/content';

const WORD: Word = {
  id: 'fr-a1-chat',
  lemma: 'chat',
  article: 'le',
  gender: 'm',
  pos: 'n',
  krMeaning: '고양이',
  level: 'A1',
  exampleFr: 'Le chat dort.',
  exampleKr: '고양이가 자요.',
  imagePrompt: 'A cute cat sleeping, photographic, no text',
  tags: ['동물'],
};

const URL_OK = 'https://img.example.com/chat.png';

/** 가짜 ImageClient — 호출 횟수 추적 (DoD: 가짜 클라이언트 검증). */
class FakeImageClient implements ImageClient {
  calls = 0;
  constructor(private readonly impl: () => Promise<string>) {}
  generateImage(): Promise<string> {
    this.calls += 1;
    return this.impl();
  }
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('AIImageProvider — 해상 순서 (Q-K4)', () => {
  it('① word.imageUrl이 있으면 그대로 반환 (클라이언트 미호출)', async () => {
    const client = new FakeImageClient(async () => URL_OK);
    const provider = new AIImageProvider(client);
    const withUrl: Word = { ...WORD, imageUrl: 'https://img.example.com/preset.png' };
    expect(await provider.resolve(withUrl, true)).toBe('https://img.example.com/preset.png');
    expect(client.calls).toBe(0);
  });

  it('② 키 없음 → null (플레이스홀더 폴백, 클라이언트 미호출)', async () => {
    const client = new FakeImageClient(async () => URL_OK);
    const provider = new AIImageProvider(client);
    expect(await provider.resolve(WORD, false)).toBeNull();
    expect(client.calls).toBe(0);
  });

  it('③ 클라이언트 없음(실벤더 보류 — Q-K1) → 키 있어도 null', async () => {
    const provider = new AIImageProvider(null);
    expect(await provider.resolve(WORD, true)).toBeNull();
  });

  it('④ 키+클라이언트 → 생성 URL 반환 + 캐시 저장 (URL만 — Q-K3)', async () => {
    const client = new FakeImageClient(async () => URL_OK);
    const provider = new AIImageProvider(client);
    expect(await provider.resolve(WORD, true)).toBe(URL_OK);
    expect(await AsyncStorage.getItem(imageCacheKey(WORD))).toBe(URL_OK);
  });

  it('⑤ 캐시 적중 → 클라이언트 재호출 없음', async () => {
    const client = new FakeImageClient(async () => URL_OK);
    const provider = new AIImageProvider(client);
    await provider.resolve(WORD, true);
    await provider.resolve(WORD, true);
    expect(client.calls).toBe(1);
  });
});

describe('AIImageProvider — 실패 폴백', () => {
  it('생성 실패 → null + 캐시 미저장', async () => {
    const client = new FakeImageClient(async () => {
      throw new Error('image generation failed');
    });
    const provider = new AIImageProvider(client);
    expect(await provider.resolve(WORD, true)).toBeNull();
    expect(await AsyncStorage.getItem(imageCacheKey(WORD))).toBeNull();
  });
});
