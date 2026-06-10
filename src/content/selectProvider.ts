import type { ContentProvider } from './ContentProvider';
import { StaticContentProvider } from './StaticContentProvider';

// Provider 선택 규칙 (DESIGN §5): 키 있음 → AI(실패 시 Static 폴백), 없음 → Static.
// UoW-08은 선택 골격만 확정한다 — 'ai' kind의 실제 AIContentProvider·폴백은 UoW-09에서 교체.

export type ProviderKind = 'ai' | 'static';

/** 키 존재 여부 → Provider 종류 (순수). 키 삭제 → hasKey false → 즉시 'static' 회귀. */
export function selectProviderKind(flags: { hasAnthropicKey: boolean }): ProviderKind {
  return flags.hasAnthropicKey ? 'ai' : 'static';
}

/** 종류 → Provider 인스턴스. 'ai'는 UoW-09 전까지 Static을 반환하는 골격(Q-I5). */
export function createProvider(kind: ProviderKind): ContentProvider {
  if (kind === 'ai') {
    // TODO(UoW-09): AIContentProvider + 실패 시 Static 폴백으로 교체.
    return new StaticContentProvider();
  }
  return new StaticContentProvider();
}
