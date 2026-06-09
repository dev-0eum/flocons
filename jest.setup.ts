// flocons jest 셋업 — 네이티브 모듈 mock 토대 (UoW-04/05/08에서 실제 사용)
// 추측 대신 각 라이브러리의 공식 jest mock 패턴을 사용한다.

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(async () => undefined),
  getItemAsync: jest.fn(async () => null),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(async () => false),
}));
