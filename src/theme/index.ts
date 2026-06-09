import { colors } from './colors';
import { spacing, radius } from './spacing';
import { typography } from './typography';

export const theme = { colors, typography, spacing, radius } as const;
export { colors, typography, spacing, radius };
export type { Colors } from './colors';
export type { Typography } from './typography';
export type { Spacing, Radius } from './spacing';

export type Gender = 'm' | 'f' | null;

/** 성(gender)에 따른 관사 색. 색은 보조 신호이며 텍스트(le/la)와 병행한다(접근성). */
export function articleColor(gender: Gender): string {
  if (gender === 'm') return colors.articleMasculine;
  if (gender === 'f') return colors.articleFeminine;
  return colors.articleNeutral;
}
