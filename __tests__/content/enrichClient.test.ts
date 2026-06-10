import { AI_MODEL, AnthropicEnrichClient, NoApiKeyError, type Word } from '@/content';

// 가짜 fetch 주입(ADR-009 주입 경계)으로 성공/4xx/5xx/네트워크 실패 경로를 검증.
// 실제 네트워크는 사용하지 않는다.

const WORD: Word = {
  id: 'fr-a1-chat',
  lemma: 'chat',
  article: 'le',
  gender: 'm',
  pos: 'n',
  krMeaning: '고양이',
  level: 'A1',
  exampleFr: 'Le chat dort.',
  exampleKr: '고양이가 자요.',
};

const SECRET = 'sk-ant-test-secret';

function messageBody(payload: unknown) {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: AI_MODEL,
    content: [{ type: 'text', text: JSON.stringify(payload) }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
  };
}

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('AnthropicEnrichClient', () => {
  it('키 없음 → NoApiKeyError, HTTP 미호출', async () => {
    const fetchSpy = jest.fn();
    const client = new AnthropicEnrichClient({
      getApiKey: async () => null,
      fetch: fetchSpy as never,
    });
    await expect(client.enrich(WORD)).rejects.toBeInstanceOf(NoApiKeyError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('성공 — 결정 모델·구조화 출력으로 요청하고 응답을 파싱한다 (본문에 키 미노출)', async () => {
    const fetchSpy = jest.fn(async (_url: unknown, _init?: unknown) =>
      jsonResponse(200, messageBody({ exampleFr: 'Le chat mange.', exampleKr: '고양이가 먹어요.' })),
    );
    const client = new AnthropicEnrichClient({
      getApiKey: async () => SECRET,
      fetch: fetchSpy as never,
    });

    const result = await client.enrich(WORD);
    expect(result).toEqual({ exampleFr: 'Le chat mange.', exampleKr: '고양이가 먹어요.' });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe(AI_MODEL);
    expect(body.output_config.format.type).toBe('json_schema'); // 구조화 출력
    expect(body.temperature).toBeUndefined(); // 샘플링 파라미터 미사용
    expect(init.body as string).not.toContain(SECRET); // 키는 본문에 없음(헤더 전용)
  });

  it('4xx → 거부한다 (상위에서 Static 폴백)', async () => {
    const client = new AnthropicEnrichClient({
      getApiKey: async () => SECRET,
      fetch: (async () =>
        jsonResponse(400, {
          type: 'error',
          error: { type: 'invalid_request_error', message: 'bad request' },
        })) as never,
    });
    await expect(client.enrich(WORD)).rejects.toThrow();
  });

  it('5xx → 재시도 후 거부한다', async () => {
    const fetchSpy = jest.fn(async () =>
      jsonResponse(500, { type: 'error', error: { type: 'api_error', message: 'oops' } }),
    );
    const client = new AnthropicEnrichClient({
      getApiKey: async () => SECRET,
      fetch: fetchSpy as never,
    });
    await expect(client.enrich(WORD)).rejects.toThrow();
    expect(fetchSpy.mock.calls.length).toBeGreaterThan(1); // maxRetries: 1 → 2회 시도
  }, 15_000);

  it('네트워크 실패(타임아웃류) → 거부한다', async () => {
    const client = new AnthropicEnrichClient({
      getApiKey: async () => SECRET,
      fetch: (async () => {
        throw new Error('network down');
      }) as never,
    });
    await expect(client.enrich(WORD)).rejects.toThrow();
  }, 15_000);
});
