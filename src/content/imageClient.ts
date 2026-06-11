import type { Word } from './types';

// 이미지 생성 클라이언트 경계 (UoW-10, ADR-007 (2) — 옵셔널·후순위).
// Anthropic API는 이미지 생성을 제공하지 않으므로 실제 벤더 구현은 벤더 결정 후
// 후속 Unit에서 추가한다(Q-K1). 테스트는 가짜 구현을 주입한다(DoD).

/** 이미지 생성 경계 — word.imagePrompt를 소비해 이미지 URL을 반환한다. */
export interface ImageClient {
  generateImage(word: Word): Promise<string>;
}
