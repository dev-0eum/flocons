import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

export interface ProgressBarProps {
  current: number;
  total: number;
}

/** 진행 막대 (프리젠테이셔널). current/total 비율을 채운다. */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;
  return (
    <View
      style={styles.track}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current }}
    >
      <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
});
