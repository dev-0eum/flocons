import { useEffect, useState } from 'react';

import { type ContentProvider, type Level, type Word, createProvider, selectProviderKind } from '@/content';
import { useSettings } from '@/store/hooks';
import { getSettings } from '@/store/settingsStore';

/**
 * 현재 설정(hasAnthropicKey) 기준 ContentProvider (UoW-09).
 * 키 토글 시 화면들이 자연히 AI ↔ Static 경로를 전환한다 (DESIGN §5).
 */
export function currentProvider(): ContentProvider {
  return createProvider(selectProviderKind(getSettings()));
}

/**
 * 설정된 레벨의 단어 로드 훅 (UoW-11 — Q-I2 레벨 연동 + 화면 로드 보일러플레이트 통합).
 * words가 null이면 로딩, 빈 배열이면 해당 레벨 데이터 없음(빈 상태 — Q-L1).
 */
export function useWords(): { words: Word[] | null; level: Level } {
  const { level } = useSettings();
  const [words, setWords] = useState<Word[] | null>(null);

  useEffect(() => {
    let mounted = true;
    setWords(null); // 레벨 전환 시 로딩으로 리셋
    currentProvider()
      .getWords(level)
      .then((loaded) => {
        if (mounted) setWords(loaded);
      });
    return () => {
      mounted = false;
    };
  }, [level]);

  return { words, level };
}
