// 로컬 타임존 달력 날짜 헬퍼 — 순수, now 주입 (UoW-06).
// streak은 "사용자의 하루" 기준이므로 UTC가 아닌 로컬 자정을 경계로 한다.

/** epoch ms → 로컬 타임존 기준 날짜 키 "YYYY-MM-DD". */
export function localDateKey(now: number): string {
  const d = new Date(now);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** 날짜 키의 하루 전 키. Date 필드 연산(달력 기준)이라 월/연 경계·DST에 안전. */
export function prevDateKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return localDateKey(new Date(y, m - 1, d - 1).getTime());
}
