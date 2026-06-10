import AsyncStorage from '@react-native-async-storage/async-storage';

import { localDateKey } from '@/lib/dates';

// 학습한 날짜 영속 로그 — streak 계산용 (UoW-06). CardState.lastReviewedAt은 카드별
// 최신값만 남아 과거 활동일이 유실되므로 별도 키로 기록한다.
// cardStore와 동일한 모듈 상태 + subscribe 패턴 (UoW-05 결정 A — zustand 미사용).

export const STUDY_LOG_KEY = 'flocons:study-days:v1';
export const STUDY_LOG_VERSION = 1;

/** 직렬화 포맷. version 필드로 migrate 지원. */
interface PersistedStudyLog {
  version: number;
  state: { days: string[] };
}

let days: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function persistNow(): void {
  // 비동기 persist (fire-and-forget)
  void AsyncStorage.setItem(
    STUDY_LOG_KEY,
    JSON.stringify({
      version: STUDY_LOG_VERSION,
      state: { days: [...days] },
    } satisfies PersistedStudyLog),
  );
}

/** 학습 활동을 해당 시각의 로컬 날짜로 기록·영속. 이미 기록된 날이면 no-op. */
export function recordStudyDay(now: number): void {
  const key = localDateKey(now);
  if (days.has(key)) return;
  days = new Set(days).add(key);
  persistNow();
  emit();
}

/** 학습일 초기화(데이터 초기화 — UoW-08에서 사용). 저장본도 삭제. */
export function resetStudyLog(): void {
  days = new Set();
  void AsyncStorage.removeItem(STUDY_LOG_KEY);
  emit();
}

/** 저장된 학습일을 읽어 복원 (앱 시작 시 한 번 호출 — app/_layout). */
export async function rehydrateStudyLog(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STUDY_LOG_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as PersistedStudyLog;
    // migrate: v1 그대로 사용. 이후 스키마 변경 시 version 분기 추가.
    if (parsed.version === STUDY_LOG_VERSION && Array.isArray(parsed.state?.days)) {
      days = new Set(parsed.state.days);
      emit();
    }
  } catch {
    // 저장 데이터 손상 시 새 상태로 시작
  }
}

/** 현재 학습일 스냅샷. */
export const getStudyDays = (): ReadonlySet<string> => days;

/** 변경 구독. 해제 함수 반환. */
export function subscribeStudyLog(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
