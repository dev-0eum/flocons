import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useWords } from '@/lib/content';
import { countByStatus, dueCount, levelProgress, streakDays, studiedCount } from '@/srs/stats';
import { useCards, useStudyDays } from '@/store/hooks';
import { colors, radius, spacing, typography } from '@/theme';

// 통계: streak · 학습 단어 수 · 레벨 진척 · 오늘 복습 (DESIGN §3, UoW-06).
// 레벨은 설정 연동 (UoW-11 C).
export default function StatsScreen() {
  const cards = useCards();
  const days = useStudyDays();
  const { words, level } = useWords();

  const now = Date.now();
  const counts = countByStatus(cards);
  const streak = streakDays(days, now);
  const studied = studiedCount(cards);
  const due = dueCount(cards, now);
  const total = words?.length ?? 0;
  const progressPct = Math.round(levelProgress(counts.known, total) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatRow label="연속 학습" value={`${streak}일`} />
      <StatRow
        label="학습 단어 수"
        value={`${studied}개`}
        detail={`알고 있어요 ${counts.known} · 학습 중 ${counts.learning}`}
      />
      <StatRow
        label={`${level} 진척`}
        value={`${progressPct}%`}
        detail={words === null ? '불러오는 중…' : `${counts.known} / ${total} 단어`}
      />
      <StatRow label="오늘 복습할 카드" value={`${due}장`} />
      <Pressable
        style={styles.reviewButton}
        onPress={() => router.push('/review')}
        accessibilityRole="button"
        accessibilityLabel="복습하기"
      >
        <Text style={styles.reviewLabel}>복습하기</Text>
      </Pressable>
    </ScrollView>
  );
}

/** 통계 한 줄 (화면 내부 전용 — 디자인 시스템 컴포넌트 아님). */
function StatRow({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={`${label} ${value}`}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  rowLabel: { ...typography.caption, color: colors.textMuted },
  rowValue: { ...typography.title, color: colors.text },
  rowDetail: { ...typography.caption, color: colors.textMuted },
  reviewButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  reviewLabel: { ...typography.bodyStrong, color: colors.onAccent },
});
