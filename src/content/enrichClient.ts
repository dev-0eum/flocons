import Anthropic from '@anthropic-ai/sdk';

import type { Word } from './types';

// Anthropic enrich 클라이언트 — SDK 유일 접점 (UoW-09, ADR-009: 공식 SDK + fetch 주입).
// 키는 호출 직전에만 getApiKey로 조회하고 보관·로그하지 않는다(ADR-004).

/** 생성 모델 (Q-J1 결정 — 저비용 다국어 생성. 품질 우선 시 'claude-opus-4-8'로 교체). */
export const AI_MODEL = 'claude-haiku-4-5';
/** 프롬프트/스키마 변경 시 증가 → enrich 캐시 자연 무효화 (ADR-006). */
export const PROVIDER_VERSION = 1;

/** enrich 산출 — 기존과 다른 대체 예문 1개 (Q-J5). */
export interface EnrichedExample {
  exampleFr: string;
  exampleKr: string;
}

/** enrich HTTP 경계 (주입 가능 — 테스트는 가짜 구현/가짜 fetch). */
export interface EnrichClient {
  enrich(word: Word): Promise<EnrichedExample>;
}

/** API 키 없음 — 상위(AIContentProvider)에서 Static 폴백한다. */
export class NoApiKeyError extends Error {
  constructor() {
    super('Anthropic API key is not set');
    this.name = 'NoApiKeyError';
  }
}

// 구조화 출력 스키마 — JSON 보장 (claude-api 스킬: output_config.format).
const ENRICH_SCHEMA = {
  type: 'object',
  properties: {
    exampleFr: { type: 'string', description: '기존과 다른 새 프랑스어 예문 1문장' },
    exampleKr: { type: 'string', description: '예문의 자연스러운 한국어 번역(구어체 존댓말)' },
  },
  required: ['exampleFr', 'exampleKr'],
  additionalProperties: false,
} as const;

// flocons-content 규약 요약 (관사-성 일치·엘리지옹·CEFR·한국어 번역 톤).
const SYSTEM_PROMPT = [
  '당신은 한국어 모어 화자를 위한 프랑스어 학습 콘텐츠 작성자다.',
  '주어진 단어로 학습자 레벨(CEFR)에 맞는 자연스러운 프랑스어 예문 1문장과 한국어 번역을 만든다.',
  '규칙: 예문은 제시된 기존 예문과 달라야 한다. 관사는 성(gender)과 일치시키고 엘리지옹(l’, d’, j’ 등)을 정확히 적용한다.',
  '한국어 번역은 자연스러운 구어체 존댓말("-요" 체)로 쓴다.',
].join('\n');

function buildEnrichPrompt(word: Word): string {
  const headword = word.article ? `${word.article} ${word.lemma}` : word.lemma;
  return [
    `단어: ${headword} (품사 ${word.pos}, 성 ${word.gender ?? '없음'})`,
    `뜻: ${word.krMeaning}`,
    `레벨: ${word.level}`,
    `기존 예문: ${word.exampleFr}`,
    '위 단어로 기존 예문과 다른 새 예문 1개와 한국어 번역을 만들어라.',
  ].join('\n');
}

/** 표준 fetch 시그니처 (SDK ClientOptions.fetch와 호환). */
type FetchLike = typeof globalThis.fetch;

export interface AnthropicEnrichClientOptions {
  /** 호출 직전에만 키 조회 (lib/secureKeys.getKey — 키 체류 최소화). */
  getApiKey: () => Promise<string | null>;
  /** HTTP 주입 경계 — 테스트에서 가짜 fetch(성공/타임아웃/4xx/5xx) 주입. */
  fetch?: FetchLike;
}

export class AnthropicEnrichClient implements EnrichClient {
  constructor(private readonly opts: AnthropicEnrichClientOptions) {}

  async enrich(word: Word): Promise<EnrichedExample> {
    const apiKey = await this.opts.getApiKey();
    if (!apiKey) throw new NoApiKeyError();

    // SDK 인스턴스는 호출 단위 생성·미보관. BYOK 클라이언트 실행(RN/Expo Go)이라
    // dangerouslyAllowBrowser 필요 — 키는 사용자 본인 것(secure-store)이다.
    const client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
      maxRetries: 1,
      timeout: 15_000,
      fetch: this.opts.fetch,
    });

    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildEnrichPrompt(word) }],
      output_config: { format: { type: 'json_schema', schema: ENRICH_SCHEMA } },
    });

    const block = response.content.find((b) => b.type === 'text');
    if (!block || block.type !== 'text') throw new Error('enrich: empty response');
    const parsed = JSON.parse(block.text) as EnrichedExample;
    if (typeof parsed.exampleFr !== 'string' || typeof parsed.exampleKr !== 'string') {
      throw new Error('enrich: invalid payload');
    }
    return parsed;
  }
}
