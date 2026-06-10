import { StaticContentProvider, createProvider, selectProviderKind } from '@/content';

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

describe('createProvider (UoW-08 골격)', () => {
  it('static → StaticContentProvider', () => {
    expect(createProvider('static')).toBeInstanceOf(StaticContentProvider);
  });

  it('ai → UoW-09 전까지 Static 반환 (골격 — Q-I5)', () => {
    expect(createProvider('ai')).toBeInstanceOf(StaticContentProvider);
  });
});
