import type { Word } from '@/content';
import {
  currentWord,
  deckReducer,
  excludedCount,
  initDeck,
  isDone,
  progress,
} from '@/lib/deck';

const W = (id: string): Word => ({
  id,
  lemma: id,
  article: null,
  gender: null,
  pos: 'n',
  krMeaning: id,
  level: 'A1',
  exampleFr: 'x',
  exampleKr: 'y',
});
const words = [W('a'), W('b'), W('c')];

describe('deck reducer', () => {
  it('loads words and starts at the first card', () => {
    const s = deckReducer(initDeck([]), { type: 'load', words });
    expect(s.words).toHaveLength(3);
    expect(currentWord(s)?.id).toBe('a');
    expect(isDone(s)).toBe(false);
  });

  it('classify advances index and buckets the card', () => {
    let s = initDeck(words);
    s = deckReducer(s, { type: 'classify', value: 'known' });
    expect(currentWord(s)?.id).toBe('b');
    expect(s.knownIds).toEqual(['a']);
    expect(excludedCount(s)).toBe(1);
    s = deckReducer(s, { type: 'classify', value: 'learn' });
    expect(s.learnIds).toEqual(['b']);
  });

  it('undo restores the previous card and removes its bucket entry', () => {
    let s = initDeck(words);
    s = deckReducer(s, { type: 'classify', value: 'known' });
    s = deckReducer(s, { type: 'undo' });
    expect(currentWord(s)?.id).toBe('a');
    expect(s.knownIds).toEqual([]);
    expect(s.history).toEqual([]);
  });

  it('undo at the start is a no-op', () => {
    const s = initDeck(words);
    expect(deckReducer(s, { type: 'undo' })).toEqual(s);
  });

  it('reaches done after classifying all cards', () => {
    let s = initDeck(words);
    for (let i = 0; i < 3; i++) s = deckReducer(s, { type: 'classify', value: 'learn' });
    expect(isDone(s)).toBe(true);
    expect(currentWord(s)).toBeNull();
    expect(progress(s)).toEqual({ current: 3, total: 3 });
  });

  it('classify past the end is a no-op', () => {
    let s = initDeck([W('a')]);
    s = deckReducer(s, { type: 'classify', value: 'learn' });
    expect(deckReducer(s, { type: 'classify', value: 'learn' })).toEqual(s);
  });
});
