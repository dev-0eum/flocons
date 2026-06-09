import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export type StateVariant = 'empty' | 'loading' | 'error' | 'done';

export interface StateViewProps {
  variant: StateVariant;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ICON: Record<Exclude<StateVariant, 'loading'>, keyof typeof Ionicons.glyphMap> = {
  empty: 'file-tray-outline',
  error: 'alert-circle-outline',
  done: 'checkmark-circle-outline',
};

const DEFAULT_MESSAGE: Record<StateVariant, string> = {
  empty: '표시할 카드가 없어요.',
  loading: '불러오는 중…',
  error: '문제가 발생했어요.',
  done: '오늘 학습을 마쳤어요! 🎉',
};

/** 빈/로딩/에러/완료 보조 상태 (프리젠테이셔널). */
export function StateView({ variant, message, actionLabel, onAction }: StateViewProps) {
  const text = message ?? DEFAULT_MESSAGE[variant];
  return (
    <View style={styles.container} accessibilityRole="summary">
      {variant === 'loading' ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Ionicons name={ICON[variant]} size={40} color={colors.textMuted} />
      )}
      <Text style={styles.message}>{text}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  message: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  action: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  actionLabel: { ...typography.bodyStrong, color: colors.onAccent },
});
