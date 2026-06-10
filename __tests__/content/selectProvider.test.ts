import { AIContentProvider, StaticContentProvider, createProvider, selectProviderKind } from '@/content';

describe('selectProviderKind (DESIGN §5 선택 규칙)', () => {
  it('키 있음 → ai', () => {
    expect(selectProviderKind({ hasAnthropicKey: true })).toBe('ai');
  });

  it('키 없음 → static', () => {
    expect(selectProviderKind({ hasAnthropicKey: false })).toBe('static');
  });

  it('키 삭제(hasKey false) 시 즉시 static 회귀 — DoD', () => {
    // 저장 → 삭제 시나리오: 플래그 전이만으로 선택이 결정된다(순수).
    expect(selectProviderKind({ hasAnthropicKey: true })).toBe('ai');
    expect(selectProviderKind({ hasAnthropicKey: false })).toBe('static');
  });
});

describe('createProvider', () => {
  it('static → StaticContentProvider', () => {
    expect(createProvider('static')).toBeInstanceOf(StaticContentProvider);
  });

  it('ai → AIContentProvider (UoW-09: Anthropic enrich + Static 폴백)', () => {
    expect(createProvider('ai')).toBeInstanceOf(AIContentProvider);
  });
});
