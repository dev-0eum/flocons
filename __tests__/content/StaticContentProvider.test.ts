import { StaticContentProvider } from '@/content/StaticContentProvider';

describe('StaticContentProvider', () => {
  const provider = new StaticContentProvider();

  it('returns the A1 word deck', async () => {
    const words = await provider.getWords('A1');
    expect(words.length).toBeGreaterThan(0);
    expect(words[0]).toHaveProperty('lemma');
    expect(words[0].level).toBe('A1');
  });

  it('returns the A2/B1 word decks (UoW-12)', async () => {
    const a2 = await provider.getWords('A2');
    const b1 = await provider.getWords('B1');
    expect(a2.length).toBe(60);
    expect(a2[0].level).toBe('A2');
    expect(b1.length).toBe(60);
    expect(b1[0].level).toBe('B1');
  });

  it('returns an empty array for a level without a bundled dataset', async () => {
    expect(await provider.getWords('B2')).toEqual([]);
  });
});
