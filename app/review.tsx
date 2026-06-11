import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import { StateView } from '@/components';
import { DeckSession } from '@/components/DeckSession';
import { useWords } from '@/lib/content';
import { bookmarkedWordIds, dueWordIds } from '@/store/cardStore';

// 복습: 기본은 SRS 마감(due) 카드만, `?mode=bookmarks`면 북마크 전체 (UoW-06/07).
// 레벨은 설정(useWords) 연동 (UoW-11 C).
export default function ReviewScreen() {
  const { mode } = useLocalSearchParams();
  const isBookmarkMode = mode === 'bookmarks'; // 북마크 복습 (Q-H1/H2 — due 무관 전체)
  const { words } = useWords();
  // 마운트 시 now 1회 고정 — 복습 도중 새로 due가 된 카드가 끼어들지 않는다(Q-F2).
  const [now] = useState(() => Date.now());

  const queue = useMemo(() => {
    if (!words) return null;
    const ids = new Set(isBookmarkMode ? bookmarkedWordIds() : dueWordIds(now));
    return words.filter((w) => ids.has(w.id));
  }, [words, isBookmarkMode, now]);

  if (!words || !queue) return <StateView variant="loading" />;
  if (words.length === 0) {
    return <StateView variant="empty" message="이 레벨 콘텐츠는 준비 중이에요." />;
  }
  if (queue.length === 0) {
    return (
      <StateView
        variant="empty"
        message={isBookmarkMode ? '북마크한 단어가 없어요.' : '지금 복습할 카드가 없어요.'}
      />
    );
  }
  return (
    <DeckSession
      words={queue}
      doneMessage={isBookmarkMode ? '북마크 복습을 마쳤어요! 🎉' : '오늘 복습을 마쳤어요! 🎉'}
      doneAction={() => ({ label: '홈으로', onPress: () => router.replace('/(tabs)') })}
    />
  );
}
