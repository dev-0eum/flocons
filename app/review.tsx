import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { StateView } from '@/components';
import { DeckSession } from '@/components/DeckSession';
import type { Word } from '@/content';
import { currentProvider } from '@/lib/content';
import { bookmarkedWordIds, dueWordIds } from '@/store/cardStore';

// 복습: 기본은 SRS 마감(due) 카드만, `?mode=bookmarks`면 북마크 전체 (DESIGN §3, UoW-06/07).
// 레벨은 /learn과 동일하게 A1 고정 (레벨 선택은 UoW-11).
const LEVEL = 'A1' as const;

export default function ReviewScreen() {
  const { mode } = useLocalSearchParams();
  const isBookmarkMode = mode === 'bookmarks'; // 북마크 복습 (Q-H1/H2 — due 무관 전체)
  const [queue, setQueue] = useState<Word[] | null>(null);

  useEffect(() => {
    let mounted = true;
    // 마운트 시 now 1회 고정 — 복습 도중 새로 due가 된 카드가 끼어들지 않는다(Q-F2).
    const now = Date.now();
    currentProvider().getWords(LEVEL).then((words) => {
      if (!mounted) return;
      const ids = new Set(isBookmarkMode ? bookmarkedWordIds() : dueWordIds(now));
      setQueue(words.filter((w) => ids.has(w.id)));
    });
    return () => {
      mounted = false;
    };
  }, [isBookmarkMode]);

  if (!queue) return <StateView variant="loading" />;
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
    />
  );
}
