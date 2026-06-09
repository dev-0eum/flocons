import type { Word } from '@/content';

// 인메모리 학습 덱 상태 + 순수 reducer (UoW-03). 영속/SRS는 UoW-05.

export type Classification = 'known' | 'learn'; // known=알고있어요(좌), learn=학습할게요(우)

export interface DeckState {
  words: Word[];
  index: number;
  knownIds: string[];
  learnIds: string[];
  history: Classification[];
}

export type DeckAction =
  | { type: 'load'; words: Word[] }
  | { type: 'classify'; value: Classification }
  | { type: 'undo' };

export function initDeck(words: Word[]): DeckState {
  return { words, index: 0, knownIds: [], learnIds: [], history: [] };
}

export function deckReducer(state: DeckState, action: DeckAction): DeckState {
  switch (action.type) {
    case 'load':
      return initDeck(action.words);

    case 'classify': {
      if (state.index >= state.words.length) return state; // 소진 후 무시
      const w = state.words[state.index];
      const known = action.value === 'known';
      return {
        ...state,
        index: state.index + 1,
        knownIds: known ? [...state.knownIds, w.id] : state.knownIds,
        learnIds: known ? state.learnIds : [...state.learnIds, w.id],
        history: [...state.history, action.value],
      };
    }

    case 'undo': {
      if (state.index === 0 || state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      const prev = state.words[state.index - 1];
      return {
        ...state,
        index: state.index - 1,
        knownIds: last === 'known' ? state.knownIds.filter((id) => id !== prev.id) : state.knownIds,
        learnIds: last === 'learn' ? state.learnIds.filter((id) => id !== prev.id) : state.learnIds,
        history: state.history.slice(0, -1),
      };
    }

    default:
      return state;
  }
}

// selectors
export const currentWord = (s: DeckState): Word | null => s.words[s.index] ?? null;
export const isDone = (s: DeckState): boolean => s.words.length > 0 && s.index >= s.words.length;
/** "제외"(알고있어요로 빠진) 카드 수 — TopBar 휴지통 카운트. */
export const excludedCount = (s: DeckState): number => s.knownIds.length;
export const progress = (s: DeckState): { current: number; total: number } => ({
  current: s.index,
  total: s.words.length,
});
