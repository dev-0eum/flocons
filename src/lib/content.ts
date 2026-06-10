import { type ContentProvider, createProvider, selectProviderKind } from '@/content';
import { getSettings } from '@/store/settingsStore';

/**
 * 현재 설정(hasAnthropicKey) 기준 ContentProvider (UoW-09).
 * 키 토글 시 화면들이 자연히 AI ↔ Static 경로를 전환한다 (DESIGN §5).
 */
export function currentProvider(): ContentProvider {
  return createProvider(selectProviderKind(getSettings()));
}
