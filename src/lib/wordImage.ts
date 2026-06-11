import { useEffect, useState } from 'react';

import { wordImageProvider, type Word } from '@/content';
import { useSettings } from '@/store/hooks';
import { colors } from '@/theme';

// 카드 이미지 글루 (UoW-10): 결정적 카테고리 플레이스홀더(순수) + 이미지 해상 훅.

export interface ImageFallback {
  color: string;
  label: string;
}

/** 문자열 → 음이 아닌 32bit 해시 (결정적, 의존성 없음). */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** 카테고리(tags[0], 없으면 pos) 해시 → 팔레트 색 + lemma 이니셜 (Q-K2 — 같은 카테고리는 항상 같은 색). */
export function placeholderFor(word: Word): ImageFallback {
  const key = word.tags?.[0] ?? word.pos;
  const color = colors.imagePalette[hashString(key) % colors.imagePalette.length];
  return { color, label: word.lemma.charAt(0).toUpperCase() };
}

/**
 * 단어 이미지 해상 훅 — imageUrl/캐시/생성(hasImageKey) 순(Q-K4).
 * null이면 호출부가 placeholderFor로 폴백한다. word가 null(덱 소진)이면 해상하지 않는다.
 */
export function useWordImage(word: Word | null): string | null {
  const { hasImageKey } = useSettings();
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    if (!word) return undefined;
    let mounted = true;
    setUri(null); // 카드 전환 시 이전 카드 이미지 잔상 방지
    void wordImageProvider.resolve(word, hasImageKey).then((resolved) => {
      if (mounted && resolved !== null) setUri(resolved);
    });
    return () => {
      mounted = false;
    };
  }, [word, hasImageKey]);

  return uri;
}
