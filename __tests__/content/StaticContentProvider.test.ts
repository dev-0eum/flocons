import { StaticContentProvider } from '@/content/StaticContentProvider';

describe('StaticContentProvider', () => {
  const provider = new StaticContentProvider();

  it('returns the A1 word deck', async () => {
    const words = await provider.getWords('A1');
    expect(words.length).toBeGreaterThan(0);
    expect(words[0]).toHaveProperty('lemma');
    expect(words[0].level).toBe('A1');
  });

  it('returns an empty array for a level without a bundled dataset', async () => {
    expect(await provider.getWords('B1')).toEqual([]);
  });
});
