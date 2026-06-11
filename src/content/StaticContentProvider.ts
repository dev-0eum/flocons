import a1 from '@/data/a1.json';
import a2 from '@/data/a2.json';
import b1 from '@/data/b1.json';

import type { ContentProvider } from './ContentProvider';
import type { Level, Word } from './types';

// 번들 정적 데이터셋. 키 없이도 완전 동작하는 베이스라인 (DESIGN §5).
// JSON은 word.schema.json을 따르며 빌드 시 번들된다. 런타임 유효성은 validateWords + 테스트로 보장.
const DATASETS: Partial<Record<Level, Word[]>> = {
  A1: a1 as unknown as Word[],
  A2: a2 as unknown as Word[], // UoW-12
  B1: b1 as unknown as Word[], // UoW-12
};

/** 번들 JSON에서 단어를 읽는 기본 콘텐츠 Provider. */
export class StaticContentProvider implements ContentProvider {
  getWords(level: Level): Promise<Word[]> {
    return Promise.resolve(DATASETS[level] ?? []);
  }
}
