import a1 from '@/data/a1.json';
import { validateWords } from '@/content/validateWords';

describe('A1 seed dataset (src/data/a1.json)', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(a1)).toBe(true);
    expect(a1.length).toBeGreaterThan(0);
  });

  it('passes validateWords with no errors', () => {
    const { errors } = validateWords(a1);
    // 실패 시 어떤 항목인지 보이도록 errors를 노출
    expect(errors).toEqual([]);
  });

  it('all entries are level A1 with unique ids', () => {
    const ids = new Set<string>();
    for (const w of a1 as { id: string; level: string }[]) {
      expect(w.level).toBe('A1');
      expect(ids.has(w.id)).toBe(false);
      ids.add(w.id);
    }
  });
});
