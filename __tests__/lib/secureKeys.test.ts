import { deleteKey, getKey, hasKey, setKey } from '@/lib/secureKeys';

// jest.setup의 in-memory secure-store mock 기반 라운드트립 검증 (UoW-08).

beforeEach(async () => {
  await deleteKey('anthropic');
  await deleteKey('image');
});

describe('secureKeys (expo-secure-store 래퍼)', () => {
  it('set → get 라운드트립', async () => {
    await setKey('anthropic', 'sk-test-123');
    expect(await getKey('anthropic')).toBe('sk-test-123');
  });

  it('hasKey: 저장 전 false → 저장 후 true → 삭제 후 false', async () => {
    expect(await hasKey('anthropic')).toBe(false);
    await setKey('anthropic', 'sk-test');
    expect(await hasKey('anthropic')).toBe(true);
    await deleteKey('anthropic');
    expect(await hasKey('anthropic')).toBe(false);
  });

  it('키 id별로 분리 저장된다', async () => {
    await setKey('anthropic', 'a-key');
    expect(await hasKey('image')).toBe(false);
    await setKey('image', 'i-key');
    expect(await getKey('anthropic')).toBe('a-key');
    expect(await getKey('image')).toBe('i-key');
  });
});
