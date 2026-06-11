import { validateWords } from '@/content/validateWords';
import a1 from '@/data/a1.json';
import a2 from '@/data/a2.json';
import b1 from '@/data/b1.json';

describe('B1 seed dataset (src/data/b1.json — UoW-12)', () => {
  it('has exactly 60 entries (Q-N1)', () => {
    expect(Array.isArray(b1)).toBe(true);
    expect(b1.length).toBe(60);
  });

  it('passes validateWords with no errors', () => {
    const { errors } = validateWords(b1);
    expect(errors).toEqual([]);
  });

  it('all entries are level B1 with fr-b1- ids, unique', () => {
    const ids = new Set<string>();
    for (const w of b1 as { id: string; level: string }[]) {
      expect(w.level).toBe('B1');
      expect(w.id.startsWith('fr-b1-')).toBe(true);
      expect(ids.has(w.id)).toBe(false);
      ids.add(w.id);
    }
  });

  it('does not duplicate A1/A2 lemmas', () => {
    const seen = new Set(
      [...(a1 as { lemma: string }[]), ...(a2 as { lemma: string }[])].map((w) => w.lemma),
    );
    for (const w of b1 as { lemma: string }[]) {
      expect(seen.has(w.lemma)).toBe(false);
    }
  });
});
