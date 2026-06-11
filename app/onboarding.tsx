import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Level } from '@/content';
import { useSettings } from '@/store/hooks';
import { setLevel, setOnboarded } from '@/store/settingsStore';
import { colors, radius, spacing, typography } from '@/theme';

// 첫 실행 온보딩 — 1페이지: 소개 + 레벨 선택 + 시작 (UoW-11 B, Q-L2).
const LEVELS: Level[] = ['A1', 'A2', 'B1'];

export default function OnboardingScreen() {
  const { level } = useSettings();

  const start = () => {
    setOnboarded();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <Text style={styles.title}>flocons</Text>
        <Text style={styles.subtitle}>
          카드를 스와이프해 분류하고, 간격반복(SRS)으로 복습하고, 발음까지 — 한국어 화자를 위한
          프랑스어 단어 학습이에요.
        </Text>
      </View>

      <View style={styles.levelSection}>
        <Text style={styles.levelTitle}>시작 레벨을 골라 주세요</Text>
        <View style={styles.segment}>
          {LEVELS.map((l) => (
            <Pressable
              key={l}
              style={[styles.segmentItem, level === l && styles.segmentItemActive]}
              onPress={() => setLevel(l)}
              accessibilityRole="button"
              accessibilityLabel={`레벨 ${l}`}
              accessibilityState={{ selected: level === l }}
            >
              <Text style={[styles.segmentLabel, level === l && styles.segmentLabelActive]}>
                {l}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.levelCaption}>레벨은 설정에서 언제든 바꿀 수 있어요.</Text>
      </View>

      <Pressable
        style={styles.startButton}
        onPress={start}
        accessibilityRole="button"
        accessibilityLabel="시작하기"
      >
        <Text style={styles.startLabel}>시작하기</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: { gap: spacing.md, marginTop: spacing.xxl },
  title: { ...typography.word, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  levelSection: { gap: spacing.sm },
  levelTitle: { ...typography.bodyStrong, color: colors.text },
  segment: { flexDirection: 'row', gap: spacing.sm },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  segmentItemActive: { backgroundColor: colors.accent },
  segmentLabel: { ...typography.body, color: colors.text },
  segmentLabelActive: { ...typography.bodyStrong, color: colors.onAccent },
  levelCaption: { ...typography.caption, color: colors.textMuted },
  startButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  startLabel: { ...typography.bodyStrong, color: colors.onAccent },
});
