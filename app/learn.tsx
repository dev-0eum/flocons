import { useEffect, useState } from 'react';

import { StateView } from '@/components';
import { DeckSession } from '@/components/DeckSession';
import { StaticContentProvider, type Word } from '@/content';

// 레벨은 A1 고정 (레벨 선택 UI는 UoW-11). 덱 조립·분류 배선은 DeckSession(UoW-06 추출).
const LEVEL = 'A1' as const;

export default function LearnScreen() {
  const [words, setWords] = useState<Word[] | null>(null);

  useEffect(() => {
    let mounted = true;
    new StaticContentProvider().getWords(LEVEL).then((loaded) => {
      if (mounted) setWords(loaded);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!words) return <StateView variant="loading" />;
  return <DeckSession words={words} />;
}
