import { useReducer } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButtons, StateView, TopBar, WordCard } from '@/components';
import { SwipeDeck } from '@/components/SwipeDeck';
import type { Word } from '@/content';
import {
  type Classification,
  currentWord,
  deckReducer,
  excludedCount,
  initDeck,
  isDone,
  progress,
} from '@/lib/deck';
import { toWordCardData } from '@/lib/toWordCardData';
import { speak } from '@/lib/tts';
import { classifyCard, toggleBookmark } from '@/store/cardStore';
import { useCards, useSettings } from '@/store/hooks';
import { recordStudyDay } from '@/store/studyLog';
import { colors, spacing } from '@/theme';

export interface DeckSessionProps {
  /** 세션에서 돌 단어들(로드 완료본). 학습=레벨 전체, 복습=due 필터본. */
  words: Word[];
  /** 덱 소진 시 StateView 메시지(기본: done 기본 문구). */
  doneMessage?: string;
}

/**
 * 학습/복습 공용 덱 세션 컨테이너 (UoW-06 — app/learn.tsx 조립부 추출).
 * 분류 시 영속 SRS(classifyCard) + 학습일 로그(recordStudyDay) + 세션 덱(dispatch)을
 * 한 곳에서 배선한다. undo는 세션 덱만 되돌린다(UoW-05 알려진 한계 — 재분류 시 box 중복 승급 가능).
 */
export function DeckSession({ words, doneMessage }: DeckSessionProps) {
  const [state, dispatch] = useReducer(deckReducer, words, initDeck);
  const cards = useCards(); // 북마크 토글 반영 구독 (UoW-07)
  const { ttsRate } = useSettings(); // 발음 속도 설정 (UoW-08, ADR-005 — rate는 인자로 전달)

  const word = currentWord(state);
  if (isDone(state) || !word) {
    return <StateView variant="done" message={doneMessage} />;
  }

  const prog = progress(state);
  const headword = word.article ? `${word.article} ${word.lemma}` : word.lemma;

  const handleClassify = (value: Classification) => {
    const now = Date.now();
    classifyCard(word.id, value, now); // 영속 SRS
    recordStudyDay(now); // streak 학습일 로그
    dispatch({ type: 'classify', value }); // 세션 진행
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TopBar
        excludedCount={excludedCount(state)}
        progressCurrent={prog.current}
        progressTotal={prog.total}
        onUndo={() => dispatch({ type: 'undo' })}
      />
      <View style={styles.deck}>
        <SwipeDeck
          onSwipeLeft={() => handleClassify('known')}
          onSwipeRight={() => handleClassify('learn')}
        >
          <WordCard
            data={toWordCardData(word)}
            bookmarked={cards[word.id]?.bookmarked ?? false}
            onToggleBookmark={() => toggleBookmark(word.id)}
            onPlayWord={() => speak(headword, { rate: ttsRate })}
            onPlayExample={() => speak(word.exampleFr, { rate: ttsRate })}
          />
        </SwipeDeck>
      </View>
      <View style={styles.actions}>
        <ActionButtons
          onKnow={() => handleClassify('known')}
          onLearn={() => handleClassify('learn')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  deck: { flex: 1, padding: spacing.lg },
  actions: { padding: spacing.lg },
});
