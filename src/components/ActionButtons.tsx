import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export interface ActionButtonsProps {
  onKnow?: () => void;
  onLearn?: () => void;
}

/**
 * 카드 분류 버튼. 좌="알고 있어요"(보조), 우="학습할게요"(강조·검정). (Q1 결정 반영)
 */
export function ActionButtons({ onKnow, onLearn }: ActionButtonsProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onKnow}
        style={[styles.btn, styles.secondary]}
        accessibilityRole="button"
        accessibilityLabel="알고 있어요"
      >
        <Text style={[styles.label, styles.secondaryLabel]}>알고 있어요</Text>
      </Pressable>
      <Pressable
        onPress={onLearn}
        style={[styles.btn, styles.primary]}
        accessibilityRole="button"
        accessibilityLabel="학습할게요"
      >
        <Text style={[styles.label, styles.primaryLabel]}>학습할게요</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  btn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  primary: { backgroundColor: colors.accent },
  label: { ...typography.bodyStrong },
  secondaryLabel: { color: colors.text },
  primaryLabel: { color: colors.onAccent },
});
