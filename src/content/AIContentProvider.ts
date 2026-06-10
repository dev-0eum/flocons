import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ContentProvider } from './ContentProvider';
import { PROVIDER_VERSION, type EnrichClient, type EnrichedExample } from './enrichClient';
import type { StaticContentProvider } from './StaticContentProvider';
import type { Level, Word } from './types';

// AI 콘텐츠 Provider (UoW-09, DESIGN §5): getWords는 Static 위임(덱은 정적 큐레이션 — §10),
// enrich만 Claude로 보강·캐시한다. 모든 실패는 원본 word 반환 = Static 폴백
// ("앱은 키 없이도 완전히 동작"). 에러는 화면에 전파하지 않는다.

/** enrich 캐시 키 (ADR-006: wordId+level+providerVersion). */
export const enrichCacheKey = (word: Word): string =>
  `flocons:enrich:v1:${word.id}:${word.level}:${PROVIDER_VERSION}`;

export class AIContentProvider implements ContentProvider {
  constructor(
    private readonly client: EnrichClient,
    private readonly fallback: StaticContentProvider,
  ) {}

  getWords(level: Level): Promise<Word[]> {
    return this.fallback.getWords(level);
  }

  /** 대체 예문 보강 — 캐시 우선. 키 없음/타임아웃/4xx/5xx/파싱 실패 시 원본 그대로(폴백). */
  async enrich(word: Word): Promise<Word> {
    try {
      const cached = await readCache(word);
      if (cached) return apply(word, cached);
      const fresh = await this.client.enrich(word);
      await writeCache(word, fresh);
      return apply(word, fresh);
    } catch {
      return word; // Static 폴백 (DESIGN §5)
    }
  }
}

function apply(word: Word, ex: EnrichedExample): Word {
  return { ...word, exampleFr: ex.exampleFr, exampleKr: ex.exampleKr };
}

async function readCache(word: Word): Promise<EnrichedExample | null> {
  const raw = await AsyncStorage.getItem(enrichCacheKey(word));
  if (!raw) return null;
  const parsed = JSON.parse(raw) as EnrichedExample;
  return typeof parsed.exampleFr === 'string' && typeof parsed.exampleKr === 'string'
    ? parsed
    : null;
}

async function writeCache(word: Word, ex: EnrichedExample): Promise<void> {
  await AsyncStorage.setItem(enrichCacheKey(word), JSON.stringify(ex));
}
