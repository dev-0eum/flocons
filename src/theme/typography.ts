import type { TextStyle } from 'react-native';

// flocons 타이포 토큰. 고정 px를 컴포넌트에 흩지 않고 여기서 관리(폰트 스케일 대응 용이).
export const typography = {
  title: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  word: { fontSize: 32, fontWeight: '800', lineHeight: 38 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyStrong: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  badge: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type Typography = typeof typography;
