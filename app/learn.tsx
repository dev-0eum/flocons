import { router } from 'expo-router';

import { StateView } from '@/components';
import { DeckSession } from '@/components/DeckSession';
import { useWords } from '@/lib/content';
import { dueCount } from '@/srs/stats';
import { getCards } from '@/store/cardStore';

// 학습 덱 — 레벨은 설정(useWords) 연동 (UoW-11 C). 덱 조립·분류 배선은 DeckSession.
export default function LearnScreen() {
  const { words } = useWords();

  if (!words) return <StateView variant="loading" />;
  if (words.length === 0) {
    return <StateView variant="empty" message="이 레벨 콘텐츠는 준비 중이에요." />;
  }
  return (
    <DeckSession
      words={words}
      // 완료 시점 평가 — 방금 분류한 카드들의 due를 반영 (UoW-11 F)
      doneAction={() =>
        dueCount(getCards(), Date.now()) > 0
          ? { label: '복습하러 가기', onPress: () => router.replace('/review') }
          : { label: '홈으로', onPress: () => router.replace('/(tabs)') }
      }
    />
  );
}
