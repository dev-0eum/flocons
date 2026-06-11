import * as Haptics from 'expo-haptics';

// 햅틱 래퍼 — expo-haptics 유일 접점 (UoW-11, Inception Q2 · ADR-005 패턴).
// 호출부는 의미 단위 함수만 사용한다. 매핑은 Q-L3 결정.

/** 카드 분류 확정 (스와이프/버튼) — 가벼운 임팩트. */
export function tapClassify(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** 되돌리기 — 선택 변경 피드백. */
export function tapUndo(): void {
  void Haptics.selectionAsync();
}

/** 덱 완료 축하 — 성공 노티피케이션. */
export function celebrate(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
