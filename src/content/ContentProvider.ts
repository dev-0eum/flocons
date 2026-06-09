import type { Level, Word } from './types';

/**
 * 콘텐츠 소스 추상화 (DESIGN §5). 런타임에 구현체를 선택한다.
 * - 키 없음 → StaticContentProvider (베이스라인)
 * - 키 있음 → AIContentProvider (UoW-09), 실패 시 Static 폴백
 */
export interface ContentProvider {
  /** 레벨별 단어 덱을 반환. */
  getWords(level: Level): Promise<Word[]>;
  /** (선택) 예문/번역 보강. AI 경로에서만. */
  enrich?(word: Word): Promise<Word>;
  /** (선택) 단어 이미지 URL 생성. 이미지 키 있을 때만. */
  generateImage?(word: Word): Promise<string>;
}
