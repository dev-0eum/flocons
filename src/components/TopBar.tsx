import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export interface TopBarProps {
  excludedCount: number;
  progressCurrent: number;
  progressTotal: number;
  onUndo?: () => void;
  onMenu?: () => void;
}

/** 학습 화면 상단 바: 제외 수 · 진행도(n/총) · 되돌리기 · 메뉴 (프리젠테이셔널). */
export function TopBar({
  excludedCount,
  progressCurrent,
  progressTotal,
  onUndo,
  onMenu,
}: TopBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.counter} accessibilityLabel={`제외 ${excludedCount}개`}>
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        <Text style={styles.counterText}>{excludedCount}</Text>
      </View>

      <Text style={styles.progress} accessibilityLabel={`진행 ${progressCurrent} / ${progressTotal}`}>
        {progressCurrent} / {progressTotal}
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={onUndo}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="되돌리기"
        >
          <Ionicons name="arrow-undo-outline" size={20} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={onMenu}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="메뉴"
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  counterText: { ...typography.caption, color: colors.textMuted },
  progress: { ...typography.bodyStrong, color: colors.text },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: { padding: spacing.xs },
});
