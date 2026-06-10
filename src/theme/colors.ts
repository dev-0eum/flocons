// flocons 색 토큰 — v1 라이트 테마 (DESIGN §9). 강조 버튼은 검정(레퍼런스 기준).
export const colors = {
  background: '#FFFFFF',
  surface: '#F7F7F8',
  text: '#111111',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  accent: '#111111', // 강조 버튼(검정)
  onAccent: '#FFFFFF',
  danger: '#B91C1C', // 파괴적 동작(데이터 초기화 등)
  // 관사-성 색 (색만으로 의미를 전달하지 않고 텍스트 le/la 병행 — 접근성)
  articleMasculine: '#2563EB', // m: 파랑
  articleFeminine: '#DB2777', // f: 로즈
  articleNeutral: '#6B7280', // null: 회색
} as const;

export type Colors = typeof colors;
