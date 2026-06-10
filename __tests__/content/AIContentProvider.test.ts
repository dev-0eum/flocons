import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AIContentProvider,
  NoApiKeyError,
  StaticContentProvider,
  enrichCacheKey,
  type EnrichClient,
  type EnrichedExample,
  type Word,
} from '@/content';

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
};

const EX: EnrichedExample = { exampleFr: 'Le chat mange.', exampleKr: '고양이가 먹어요.' };

/** 가짜 EnrichClient — 호출 횟수 추적 (주입 경계 검증). */
class FakeEnrichClient implements EnrichClient {
  calls = 0;
  constructor(private readonly impl: () => Promise<EnrichedExample>) {}
  enrich(): Promise<EnrichedExample> {
    this.calls += 1;
    return this.impl();
  }
}

const providerWith = (client: EnrichClient) =>
  new AIContentProvider(client, new StaticContentProvider());

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('AIContentProvider — enrich / 캐시 (ADR-006)', () => {
  it('성공 시 예문을 교체하고 캐시에 저장한다', async () => {
    const client = new FakeEnrichClient(async () => EX);
    const enriched = await providerWith(client).enrich(WORD);
    expect(enriched.exampleFr).toBe(EX.exampleFr);
    expect(enriched.exampleKr).toBe(EX.exampleKr);
    expect(enriched.id).toBe(WORD.id); // 나머지 필드는 원본 유지
    const raw = await AsyncStorage.getItem(enrichCacheKey(WORD));
    expect(JSON.parse(raw as string)).toEqual(EX);
  });

  it('캐시 적중 시 클라이언트를 재호출하지 않는다', async () => {
    const client = new FakeEnrichClient(async () => EX);
    const provider = providerWith(client);
    await provider.enrich(WORD);
    await provider.enrich(WORD);
    expect(client.calls).toBe(1);
  });
});

describe('AIContentProvider — Static 폴백 (DESIGN §5)', () => {
  it('키 없음(NoApiKeyError) → 원본 word 그대로', async () => {
    const client = new FakeEnrichClient(async () => {
      throw new NoApiKeyError();
    });
    expect(await providerWith(client).enrich(WORD)).toEqual(WORD);
  });

  it('타임아웃/4xx/5xx 등 모든 실패 → 원본 word 그대로 (에러 비전파)', async () => {
    for (const message of ['timeout', '400 bad request', '500 server error']) {
      const client = new FakeEnrichClient(async () => {
        throw new Error(message);
      });
      expect(await providerWith(client).enrich(WORD)).toEqual(WORD);
    }
  });

  it('실패 시 캐시를 남기지 않는다', async () => {
    const client = new FakeEnrichClient(async () => {
      throw new Error('boom');
    });
    await providerWith(client).enrich(WORD);
    expect(await AsyncStorage.getItem(enrichCacheKey(WORD))).toBeNull();
  });
});

describe('AIContentProvider — getWords', () => {
  it('덱은 Static 데이터셋에 위임한다 (DESIGN §10)', async () => {
    const client = new FakeEnrichClient(async () => EX);
    const words = await providerWith(client).getWords('A1');
    expect(words.length).toBeGreaterThan(0);
    expect(client.calls).toBe(0); // getWords는 AI 미사용
  });
});
