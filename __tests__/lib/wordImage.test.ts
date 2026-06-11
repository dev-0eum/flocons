import type { Word } from '@/content';
import { placeholderFor } from '@/lib/wordImage';
import { colors } from '@/theme';

const base: Word = {
  id: 'fr-a1-bonjour',
  lemma: 'bonjour',
  article: null,
  gender: null,
  pos: 'intj',
  krMeaning: '안녕하세요',
  level: 'A1',
  exampleFr: 'Bonjour, comment allez-vous ?',
  exampleKr: '안녕하세요, 어떻게 지내세요?',
  tags: ['인사', '예의'],
};

describe('wordImage — placeholderFor (Q-K2: 결정적 카테고리 매핑)', () => {
  it('같은 입력은 항상 같은 출력 (결정성)', () => {
    expect(placeholderFor(base)).toEqual(placeholderFor({ ...base }));
  });

  it('같은 카테고리(tags[0])는 lemma가 달라도 같은 색', () => {
    const other: Word = { ...base, id: 'fr-a1-bonsoir', lemma: 'bonsoir' };
    expect(placeholderFor(other).color).toBe(placeholderFor(base).color);
  });

  it('색은 테마 팔레트 안에서 나온다', () => {
    expect(colors.imagePalette).toContain(placeholderFor(base).color);
  });

  it('tags가 없으면 pos 기반으로 폴백 (역시 결정적)', () => {
    const noTags: Word = { ...base, tags: undefined };
    const samePos: Word = { ...noTags, id: 'x', lemma: 'salut' };
    expect(placeholderFor(noTags).color).toBe(placeholderFor(samePos).color);
    expect(colors.imagePalette).toContain(placeholderFor(noTags).color);
  });

  it('라벨은 lemma 이니셜 대문자 (악상 유지)', () => {
    expect(placeholderFor(base).label).toBe('B');
    expect(placeholderFor({ ...base, lemma: 'école' }).label).toBe('É');
  });
});
