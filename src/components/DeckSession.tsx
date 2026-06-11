import { useEffect, useReducer, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButtons, StateView, TopBar, WordCard } from '@/components';
import { SwipeDeck } from '@/components/SwipeDeck';
import type { Word } from '@/content';
import { currentProvider } from '@/lib/content';
import {
  type Classification,
  currentWord,
  deckReducer,
  excludedCount,
  initDeck,
  isDone,
  progress,
} from '@/lib/deck';
import { celebrate, tapClassify, tapUndo } from '@/lib/haptics';
import { toWordCardData } from '@/lib/toWordCardData';
import { speak } from '@/lib/tts';
import { placeholderFor, useWordImage } from '@/lib/wordImage';
import { classifyCard, toggleBookmark } from '@/store/cardStore';
import { useCards, useSettings } from '@/store/hooks';
import { recordStudyDay } from '@/store/studyLog';
import { colors, spacing } from '@/theme';

export interface DeckSessionProps {
  /** 세션에서 돌 단어들(로드 완료본). 학습=레벨 전체, 복습=due 필터본. */
  words: Word[];
  /** 덱 소진 시 StateView 메시지(기본: done 기본 문구). */
  doneMessage?: string;
  /** 덱 소진 시 다음 행동 — 완료 시점에 평가되어 최신 상태(due 등)를 반영한다(UoW-11 F). */
  doneAction?: () => { label: string; onPress: () => void };
}

/**
 * 학습/복습 공용 덱 세션 컨테이너 (UoW-06 추출 · UoW-11 폴리시).
 * 분류 시 영속 SRS + 학습일 로그 + 세션 덱 + 햅틱을 한 곳에서 배선한다.
 * undo는 세션 덱만 되돌린다(UoW-05 알려진 한계 — 재분류 시 box 중복 승급 가능).
 */
export function DeckSession({ words, doneMessage, doneAction }: DeckSessionProps) {
  const [state, dispatch] = useReducer(deckReducer, words, initDeck);
  const cards = useCards(); // 북마크 토글 반영 구독 (UoW-07)
  const { ttsRate, hasAnthropicKey } = useSettings(); // 발음 속도(UoW-08) · enrich 노출(UoW-11 G)
  // "새 예문"(enrich) 결과 — 카드 id 기준이라 카드 전환 시 자연히 미적용 (UoW-11 G)
  const [enriched, setEnriched] = useState<{
    id: string;
    exampleFr: string;
    exampleKr: string;
  } | null>(null);

  const word = currentWord(state);
  const imageUri = useWordImage(word); // imageUrl/캐시/생성 해상 — null이면 플레이스홀더 (UoW-10)
  const done = isDone(state) || !word;

  // 덱 소진 축하 햅틱 — 완료 진입 시 1회 (UoW-11 D, Q-L3)
  useEffect(() => {
    if (done && state.words.length > 0) celebrate();
  }, [done, state.words.length]);

  if (done || !word) {
    const action = doneAction?.(); // 1회 평가 — 라벨과 핸들러가 동일 스냅샷을 공유 (리뷰 반영)
    return (
      <StateView
        variant="done"
        message={doneMessage}
        actionLabel={action?.label}
        onAction={action?.onPress}
      />
    );
  }

  const prog = progress(state);
  const headword = word.article ? `${word.article} ${word.lemma}` : word.lemma;
  const baseData = toWordCardData(word);
  const data =
    enriched && enriched.id === word.id
      ? { ...baseData, exampleFr: enriched.exampleFr, exampleKr: enriched.exampleKr }
      : baseData;

  const handleClassify = (value: Classification) => {
    const now = Date.now();
    classifyCard(word.id, value, now); // 영속 SRS
    recordStudyDay(now); // streak 학습일 로그
    tapClassify(); // 햅틱 (Q-L3)
    dispatch({ type: 'classify', value }); // 세션 진행
  };

  const handleUndo = () => {
    tapUndo();
    dispatch({ type: 'undo' });
  };

  // AI 대체 예문 — 키 보유 시에만 노출, 탭당 1회 호출. 실패는 원본 유지(UoW-09 폴백).
  const handleNewExample = () => {
    const target = word;
    void currentProvider()
      .enrich?.(target)
      .then((w) => {
        if (w) setEnriched({ id: target.id, exampleFr: w.exampleFr, exampleKr: w.exampleKr });
      });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TopBar
        excludedCount={excludedCount(state)}
        progressCurrent={prog.current}
        progressTotal={prog.total}
        onUndo={handleUndo}
      />
      {/* 스와이프 대안 — 스크린리더용 분류 커스텀 액션 (UoW-11 E). 그룹 요소라 내부 버튼은
          숨겨지지만 분류(액션·하단 버튼)와 카드 낭독은 유지된다. */}
      <View
        style={styles.deck}
        accessible
        accessibilityLabel={`${headword}, ${data.krMeaning}. 사용자 지정 동작으로 분류할 수 있어요.`}
        accessibilityActions={[
          { name: 'know', label: '알고 있어요' },
          { name: 'learn', label: '학습할게요' },
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'know') handleClassify('known');
          if (event.nativeEvent.actionName === 'learn') handleClassify('learn');
        }}
      >
        <SwipeDeck
          onSwipeLeft={() => handleClassify('known')}
          onSwipeRight={() => handleClassify('learn')}
        >
          <WordCard
            data={data}
            imageSource={imageUri ? { uri: imageUri } : null}
            imageFallback={placeholderFor(word)}
            bookmarked={cards[word.id]?.bookmarked ?? false}
            onToggleBookmark={() => toggleBookmark(word.id)}
            onPlayWord={() => speak(headword, { rate: ttsRate })}
            onPlayExample={() => speak(data.exampleFr, { rate: ttsRate })}
            onNewExample={hasAnthropicKey ? handleNewExample : undefined}
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
