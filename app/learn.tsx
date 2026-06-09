import { useEffect, useReducer, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButtons, StateView, TopBar, WordCard } from '@/components';
import { SwipeDeck } from '@/components/SwipeDeck';
import { StaticContentProvider } from '@/content';
import {
  currentWord,
  deckReducer,
  excludedCount,
  initDeck,
  isDone,
  progress,
} from '@/lib/deck';
import { toWordCardData } from '@/lib/toWordCardData';
import { speak } from '@/lib/tts';
import { colors, spacing } from '@/theme';

// 레벨은 A1 고정 (레벨 선택 UI는 UoW-11). 영속/SRS는 UoW-05.
const LEVEL = 'A1' as const;

export default function LearnScreen() {
  const [state, dispatch] = useReducer(deckReducer, [], () => initDeck([]));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    new StaticContentProvider().getWords(LEVEL).then((words) => {
      if (mounted) {
        dispatch({ type: 'load', words });
        setLoaded(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!loaded) return <StateView variant="loading" />;

  const word = currentWord(state);
  if (isDone(state) || !word) {
    return <StateView variant="done" />;
  }

  const prog = progress(state);
  const headword = word.article ? `${word.article} ${word.lemma}` : word.lemma;

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
          onSwipeLeft={() => dispatch({ type: 'classify', value: 'known' })}
          onSwipeRight={() => dispatch({ type: 'classify', value: 'learn' })}
        >
          <WordCard
            data={toWordCardData(word)}
            onPlayWord={() => speak(headword)}
            onPlayExample={() => speak(word.exampleFr)}
          />
        </SwipeDeck>
      </View>
      <View style={styles.actions}>
        <ActionButtons
          onKnow={() => dispatch({ type: 'classify', value: 'known' })}
          onLearn={() => dispatch({ type: 'classify', value: 'learn' })}
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
