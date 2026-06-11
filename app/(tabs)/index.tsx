import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StateView } from '@/components';
import { useWords } from '@/lib/content';
import { countByStatus, dueCount, levelProgress } from '@/srs/stats';
import { useCards, useSettings } from '@/store/hooks';
import { colors, radius, spacing, typography } from '@/theme';

// 홈 (UoW-11 A, DESIGN §3): 레벨 진척 · 오늘 복습할 카드 · 학습/복습 시작 · 설정 진입(Q-L5).
export default function HomeScreen() {
  const { hydrated, onboarded } = useSettings();
  const cards = useCards();
  const { words, level } = useWords();

  if (!hydrated) return <StateView variant="loading" />;
  if (!onboarded) return <Redirect href="/onboarding" />;

  const now = Date.now();
  const counts = countByStatus(cards);
  const due = dueCount(cards, now);
  const total = words?.length ?? 0;
  const progressPct = Math.round(levelProgress(counts.known, total) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>flocons</Text>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="설정"
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.card} accessibilityRole="text" accessibilityLabel={`레벨 ${level} 진척 ${progressPct}퍼센트`}>
        <Text style={styles.cardLabel}>레벨 {level}</Text>
        <Text style={styles.cardValue}>{progressPct}%</Text>
        <Text style={styles.cardDetail}>
          {words === null ? '불러오는 중…' : `알고 있는 단어 ${counts.known} / ${total}`}
        </Text>
      </View>

      <View style={styles.card} accessibilityRole="text" accessibilityLabel={`오늘 복습할 카드 ${due}장`}>
        <Text style={styles.cardLabel}>오늘 복습할 카드</Text>
        <Text style={styles.cardValue}>{due}장</Text>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => router.push('/learn')}
        accessibilityRole="button"
        accessibilityLabel="학습 시작"
      >
        <Text style={styles.primaryLabel}>학습 시작</Text>
      </Pressable>

      {due > 0 ? (
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/review')}
          accessibilityRole="button"
          accessibilityLabel="복습하기"
        >
          <Text style={styles.secondaryLabel}>복습하기 ({due})</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...typography.title, color: colors.text },
  iconBtn: { padding: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardLabel: { ...typography.caption, color: colors.textMuted },
  cardValue: { ...typography.title, color: colors.text },
  cardDetail: { ...typography.caption, color: colors.textMuted },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryLabel: { ...typography.bodyStrong, color: colors.onAccent },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryLabel: { ...typography.bodyStrong, color: colors.text },
});
