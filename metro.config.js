// flocons Metro 설정 — expo 기본값 + @anthropic-ai/sdk의 Node 전용 모듈 스텁 (UoW-09).
//
// @anthropic-ai/sdk(0.104.x)의 client.js가 자격증명(credentials) 모듈을 정적 require하고,
// 그 내부의 node:fs/node:path 참조(동적이지만 Metro가 정적 스캔)가 RN 번들을 깨뜨린다.
// flocons는 항상 apiKey를 명시 주입(secure-store)하므로 자격증명 해석 경로는 런타임에
// 실행되지 않는다 — origin이 SDK인 node:* 해석만 빈 모듈로 대체한다(타 패키지 무영향).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 현재 번들 그래프가 실제 참조하는 것은 node:fs·node:path뿐이나, SDK 마이너 업그레이드로
// 참조가 늘 수 있어 SDK가 쓰는 node:* 전체를 방어적으로 등록해 둔다.
const NODE_BUILTINS = new Set([
  'node:crypto',
  'node:fs',
  'node:fs/promises',
  'node:path',
  'node:readline',
  'node:stream',
  'node:stream/promises',
  'node:util',
]);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    NODE_BUILTINS.has(moduleName) &&
    context.originModulePath.includes('@anthropic-ai/sdk')
  ) {
    return { type: 'empty' };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
