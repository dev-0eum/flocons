// flocons jest 셋업 — 네이티브 모듈 mock 토대 (UoW-04/05/08에서 실제 사용)
// 추측 대신 각 라이브러리의 공식 jest mock 패턴을 사용한다.
// reanimated 4 / gesture-handler는 jest에서 로드하지 않는다(worklets 네이티브 미초기화 문제).
// SwipeDeck을 쓰는 화면 테스트는 SwipeDeck을 패스스루로 mock하고, 스와이프 제스처는
// 번들(expo export) + 수동으로 검증한다(Q-C3). 덱 분류/undo 로직은 src/lib/deck.ts 단위 테스트로 커버.

// expo-secure-store: in-memory Map 기반 mock (UoW-08 — secureKeys 라운드트립 테스트용).
// 키 격리는 각 테스트의 beforeEach에서 deleteKey로 수행한다.
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(async () => false),
}));

// @expo/vector-icons: jest에서 폰트 로드 없이 가벼운 stub으로 렌더 (상호작용은 부모 Pressable의 accessibilityLabel로 테스트)
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Icon = (props: { accessibilityLabel?: string }) =>
    React.createElement(Text, { accessibilityLabel: props.accessibilityLabel });
  return { Ionicons: Icon, MaterialIcons: Icon, Feather: Icon };
});
