import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ImageClient } from './imageClient';
import type { Word } from './types';

// 단어 이미지 해상 (UoW-10, ADR-007 (2)): imageUrl → 캐시 → 생성(키·클라이언트) → null.
// null이면 호출부가 카테고리 플레이스홀더로 폴백한다 — 키 없이도 항상 동작(DESIGN §5 패턴).

/** 생성 파이프라인 변경 시 증가 → 캐시 자연 무효화. */
export const IMAGE_CACHE_VERSION = 1;

/** 이미지 캐시 키 — URL 문자열만 저장(Q-K3). `v1`은 키 네임스페이스, 끝의 숫자는 IMAGE_CACHE_VERSION. */
export const imageCacheKey = (word: Word): string =>
  `flocons:image:v1:${word.id}:${IMAGE_CACHE_VERSION}`;

export class AIImageProvider {
  /** client가 null이면(실벤더 보류 — Q-K1) 키가 있어도 생성 없이 폴백한다. */
  constructor(private readonly client: ImageClient | null) {}

  /** 해상 순서(Q-K4): ① word.imageUrl ② 캐시 ③ 생성(hasImageKey+클라이언트) ④ null. */
  async resolve(word: Word, hasImageKey: boolean): Promise<string | null> {
    try {
      if (word.imageUrl) return word.imageUrl;
      const cached = await AsyncStorage.getItem(imageCacheKey(word));
      if (cached) return cached;
      if (!hasImageKey || !this.client) return null;
      const url = await this.client.generateImage(word);
      await AsyncStorage.setItem(imageCacheKey(word), url);
      return url;
    } catch {
      return null; // 모든 실패 → 플레이스홀더 폴백
    }
  }
}

/** 프로덕션 인스턴스 — 실벤더 미정이라 클라이언트 없음(Q-K1). 벤더 결정 시 주입 교체. */
export const wordImageProvider = new AIImageProvider(null);
