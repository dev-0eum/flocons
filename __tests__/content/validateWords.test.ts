import type { Word } from '@/content/types';
import { validateWords } from '@/content/validateWords';

const valid: Word[] = [
  {
    id: 'fr-a1-crime',
    lemma: 'crime',
    article: 'le',
    gender: 'm',
    pos: 'n',
    krMeaning: '범죄',
    level: 'A1',
    exampleFr: 'La police enquête sur un crime.',
    exampleKr: '경찰이 범죄를 수사한다.',
  },
];

describe('validateWords', () => {
  it('passes a valid dataset (errors empty)', () => {
    expect(validateWords(valid).errors).toEqual([]);
  });

  it('flags a missing required field', () => {
    const bad: unknown = [
      {
        id: 'x',
        lemma: 'x',
        article: null,
        gender: null,
        pos: 'n',
        level: 'A1',
        exampleFr: 'x',
        exampleKr: 'x',
      }, // krMeaning 누락
    ];
    expect(validateWords(bad).errors.length).toBeGreaterThan(0);
  });

  it('flags invalid pos and duplicate id', () => {
    const bad: unknown = [valid[0], { ...valid[0], pos: 'xxx' }];
    const r = validateWords(bad);
    expect(r.errors.some((e) => e.includes('pos'))).toBe(true);
    expect(r.errors.some((e) => e.includes('중복 id'))).toBe(true);
  });

  it('flags an article-gender mismatch (le + f)', () => {
    const bad: Word[] = [{ ...valid[0], gender: 'f' }];
    expect(validateWords(bad).errors.some((e) => e.includes('관사-성'))).toBe(true);
  });

  it('rejects a non-array', () => {
    expect(validateWords({}).errors.length).toBeGreaterThan(0);
  });

  it('flags an empty-string article and an invalid gender enum', () => {
    const bad: unknown = [
      { ...valid[0], article: '' },
      { ...valid[0], id: 'fr-a1-x', gender: 'x' },
    ];
    const r = validateWords(bad);
    expect(r.errors.some((e) => e.includes('빈 문자열'))).toBe(true);
    expect(r.errors.some((e) => e.includes('gender'))).toBe(true);
  });
});
