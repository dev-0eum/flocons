import { validateWords } from '@/content/validateWords';
import a1 from '@/data/a1.json';
import a2 from '@/data/a2.json';

describe('A2 seed dataset (src/data/a2.json — UoW-12)', () => {
  it('has exactly 60 entries (Q-N1)', () => {
    expect(Array.isArray(a2)).toBe(true);
    expect(a2.length).toBe(60);
  });

  it('passes validateWords with no errors', () => {
    const { errors } = validateWords(a2);
    expect(errors).toEqual([]);
  });

  it('all entries are level A2 with fr-a2- ids, unique', () => {
    const ids = new Set<string>();
    for (const w of a2 as { id: string; level: string }[]) {
      expect(w.level).toBe('A2');
      expect(w.id.startsWith('fr-a2-')).toBe(true);
      expect(ids.has(w.id)).toBe(false);
      ids.add(w.id);
    }
  });

  it('does not duplicate A1 lemmas', () => {
    const a1Lemmas = new Set((a1 as { lemma: string }[]).map((w) => w.lemma));
    for (const w of a2 as { lemma: string }[]) {
      expect(a1Lemmas.has(w.lemma)).toBe(false);
    }
  });
});
