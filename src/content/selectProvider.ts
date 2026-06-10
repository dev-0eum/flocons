import { getKey } from '@/lib/secureKeys';

import { AIContentProvider } from './AIContentProvider';
import type { ContentProvider } from './ContentProvider';
import { AnthropicEnrichClient } from './enrichClient';
import { StaticContentProvider } from './StaticContentProvider';

// Provider 선택 규칙 (DESIGN §5): 키 있음 → AI(enrich 실패 시 Static 폴백), 없음 → Static.

export type ProviderKind = 'ai' | 'static';

/** 키 존재 여부 → Provider 종류 (순수). 키 삭제 → hasKey false → 즉시 'static' 회귀. */
export function selectProviderKind(flags: { hasAnthropicKey: boolean }): ProviderKind {
  return flags.hasAnthropicKey ? 'ai' : 'static';
}

/** 종류 → Provider 인스턴스 (UoW-09: 'ai' = Anthropic enrich + Static 폴백). */
export function createProvider(kind: ProviderKind): ContentProvider {
  if (kind === 'ai') {
    return new AIContentProvider(
      new AnthropicEnrichClient({ getApiKey: () => getKey('anthropic') }),
      new StaticContentProvider(),
    );
  }
  return new StaticContentProvider();
}
