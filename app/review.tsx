import { useEffect, useState } from 'react';

import { StateView } from '@/components';
import { DeckSession } from '@/components/DeckSession';
import { StaticContentProvider, type Word } from '@/content';
import { dueWordIds } from '@/store/cardStore';

// 복습: SRS 마감(due) 카드만 큐잉 (DESIGN §3, UoW-06).
// 레벨은 /learn과 동일하게 A1 고정 (레벨 선택은 UoW-11).
const LEVEL = 'A1' as const;

export default function ReviewScreen() {
  const [dueWords, setDueWords] = useState<Word[] | null>(null);

  useEffect(() => {
    let mounted = true;
    // 마운트 시 now 1회 고정 — 복습 도중 새로 due가 된 카드가 끼어들지 않는다(Q-F2).
    const now = Date.now();
    new StaticContentProvider().getWords(LEVEL).then((words) => {
      if (!mounted) return;
      const due = new Set(dueWordIds(now));
      setDueWords(words.filter((w) => due.has(w.id)));
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!dueWords) return <StateView variant="loading" />;
  if (dueWords.length === 0) {
    return <StateView variant="empty" message="지금 복습할 카드가 없어요." />;
  }
  return <DeckSession words={dueWords} doneMessage="오늘 복습을 마쳤어요! 🎉" />;
}
