import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { articleColor, colors, radius, spacing, typography } from '@/theme';

/** 품사. UoW-02의 정규 Word `pos`와 같은 값 집합이되, 컴포넌트는 콘텐츠 계층에 의존하지 않는다. */
export type Pos =
  | 'n'
  | 'v'
  | 'adj'
  | 'adv'
  | 'prep'
  | 'pron'
  | 'conj'
  | 'num'
  | 'det'
  | 'intj'
  | 'phrase';

/** 품사 코드 → 한국어 라벨 (스크린리더 accessibilityLabel용; 시각 배지는 약어 유지). */
const POS_KO: Record<Pos, string> = {
  n: '명사',
  v: '동사',
  adj: '형용사',
  adv: '부사',
  prep: '전치사',
  pron: '대명사',
  conj: '접속사',
  num: '수사',
  det: '한정사',
  intj: '감탄사',
  phrase: '표현',
};

/**
 * WordCard가 표시하는 데이터 (프리젠테이셔널 타입).
 * UoW-02의 `Word`와 **분리**되어 있어 디자인 시스템이 콘텐츠 계층에 의존하지 않는다.
 * UoW-03에서 `Word → WordCardData` 매핑.
 */
export interface WordCardData {
  lemma: string;
  article: string | null;
  gender: 'm' | 'f' | null;
  pos: Pos;
  krMeaning: string;
  exampleFr: string;
  exampleKr: string;
}

export interface WordCardProps {
  data: WordCardData;
  bookmarked?: boolean;
  imageSource?: { uri: string } | number | null;
  /** 이미지가 없을 때의 결정적 플레이스홀더(카테고리 색 + 이니셜 — UoW-10). */
  imageFallback?: { color: string; label: string };
  onPlayWord?: () => void;
  onPlayExample?: () => void;
  onToggleBookmark?: () => void;
  /** "새 예문" 요청 콜백 (UoW-11 — AI enrich 보유 시에만 부모가 전달). */
  onNewExample?: () => void;
}

/** 단어 카드 (프리젠테이셔널). 발음/북마크는 콜백만 받는다(스토어/expo-speech 직접 의존 없음). */
export function WordCard({
  data,
  bookmarked = false,
  imageSource = null,
  imageFallback,
  onPlayWord,
  onPlayExample,
  onToggleBookmark,
  onNewExample,
}: WordCardProps) {
  const headword = data.article ? `${data.article} ${data.lemma}` : data.lemma;

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View
            style={[
              styles.image,
              styles.imagePlaceholder,
              imageFallback ? { backgroundColor: imageFallback.color } : null,
            ]}
            accessibilityElementsHidden
          >
            {imageFallback ? <Text style={styles.imageInitial}>{imageFallback.label}</Text> : null}
          </View>
        )}
        <Pressable
          style={styles.bookmark}
          onPress={onToggleBookmark}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? '북마크 해제' : '북마크 추가'}
          accessibilityState={{ selected: bookmarked }}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.wordRow}>
          <Text
            style={styles.word}
            accessibilityLabel={`${headword}, ${POS_KO[data.pos]}, 뜻 ${data.krMeaning}`}
          >
            {data.article ? (
              <Text style={{ color: articleColor(data.gender) }}>{data.article} </Text>
            ) : null}
            {data.lemma}
          </Text>
          <Pressable
            style={styles.audioBtn}
            onPress={onPlayWord}
            accessibilityRole="button"
            accessibilityLabel="단어 발음 듣기"
          >
            <Ionicons name="volume-medium-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data.pos}</Text>
          </View>
          <Text style={styles.meaning}>{data.krMeaning}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.exampleRow}>
          <View style={styles.exampleTexts}>
            <Text style={styles.exampleFr}>{data.exampleFr}</Text>
            <Text style={styles.exampleKr}>{data.exampleKr}</Text>
          </View>
          <View style={styles.exampleActions}>
            {onNewExample ? (
              <Pressable
                style={styles.audioBtn}
                onPress={onNewExample}
                accessibilityRole="button"
                accessibilityLabel="새 예문"
              >
                <Ionicons name="refresh-outline" size={20} color={colors.textMuted} />
              </Pressable>
            ) : null}
            <Pressable
              style={styles.audioBtn}
              onPress={onPlayExample}
              accessibilityRole="button"
              accessibilityLabel="예문 발음 듣기"
            >
              <Ionicons name="volume-medium-outline" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', aspectRatio: 4 / 3 },
  imagePlaceholder: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageInitial: { fontSize: 56, fontWeight: '800', lineHeight: 64, color: colors.textMuted },
  bookmark: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    padding: spacing.sm,
  },
  body: { padding: spacing.lg, gap: spacing.sm },
  wordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  word: { ...typography.word, color: colors.text, flexShrink: 1 },
  audioBtn: { padding: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: { ...typography.badge, color: colors.textMuted },
  meaning: { ...typography.bodyStrong, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  exampleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  exampleTexts: { flexShrink: 1, gap: spacing.xs },
  exampleActions: { flexDirection: 'row', alignItems: 'center' },
  exampleFr: { ...typography.body, color: colors.text },
  exampleKr: { ...typography.caption, color: colors.textMuted },
});
