import { useSyncExternalStore } from 'react';

import type { CardState } from '@/content';
import { getCards, subscribeCards } from './cardStore';
import { getStudyDays, subscribeStudyLog } from './studyLog';

// 스토어 → React 구독 (UoW-06). 모듈 상태 스토어(UoW-05 결정 A)를 useSyncExternalStore로
// 연결한다. 세 번째 인자(server snapshot)는 expo export web 정적 렌더 대비.

/** cardStore의 cards 스냅샷 구독. */
export function useCards(): Record<string, CardState> {
  return useSyncExternalStore(subscribeCards, getCards, getCards);
}

/** studyLog의 학습일 스냅샷 구독. */
export function useStudyDays(): ReadonlySet<string> {
  return useSyncExternalStore(subscribeStudyLog, getStudyDays, getStudyDays);
}
