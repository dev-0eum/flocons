import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { StateView } from '@/components';
import type { Word } from '@/content';
import { useWords } from '@/lib/content';
import { toggleBookmark } from '@/store/cardStore';
import { useCards } from '@/store/hooks';
import { articleColor, colors, radius, spacing, typography } from '@/theme';

// 북마크 목록 + 거기서 복습 시작 (DESIGN §3, UoW-07). 레벨은 설정 연동 (UoW-11 C).
export default function BookmarksScreen() {
  const cards = useCards(); // 토글 즉시 목록 반영 (영속 상태와 일치 — DoD)
  const { words } = useWords();

  if (!words) return <StateView variant="loading" />;

  const bookmarked = words.filter((w) => cards[w.id]?.bookmarked);
  if (bookmarked.length === 0) {
    return <StateView variant="empty" message="북마크한 단어가 없어요." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarked}
        keyExtractor={(w) => w.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <BookmarkRow word={item} onRemove={() => toggleBookmark(item.id)} />
        )}
      />
      <View style={styles.footer}>
        <Pressable
          style={styles.reviewButton}
          onPress={() => router.push({ pathname: '/review', params: { mode: 'bookmarks' } })}
          accessibilityRole="button"
          accessibilityLabel="북마크 복습"
        >
          <Text style={styles.reviewLabel}>북마크 복습 ({bookmarked.length})</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** 북마크 행: 관사 색 headword + 뜻 + 해제 토글 (행 탭 동작은 v1 없음 — Q-H4). */
function BookmarkRow({ word, onRemove }: { word: Word; onRemove: () => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTexts}>
        <Text style={styles.headword}>
          {word.article ? (
            <Text style={{ color: articleColor(word.gender) }}>{word.article} </Text>
          ) : null}
          {word.lemma}
        </Text>
        <Text style={styles.meaning}>{word.krMeaning}</Text>
      </View>
      <Pressable
        onPress={onRemove}
        style={styles.removeBtn}
        accessibilityRole="button"
        accessibilityLabel={`${word.lemma} 북마크 해제`}
      >
        <Ionicons name="bookmark" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  rowTexts: { flexShrink: 1, gap: spacing.xs },
  headword: { ...typography.bodyStrong, color: colors.text },
  meaning: { ...typography.caption, color: colors.textMuted },
  removeBtn: { padding: spacing.xs },
  footer: { padding: spacing.lg },
  reviewButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  reviewLabel: { ...typography.bodyStrong, color: colors.onAccent },
});
