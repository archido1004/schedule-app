export function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// 날짜는 항상 "YYYY-MM-DD" <-> UTC 자정 Date로 1:1 매핑해서 저장/조회한다.
// 서버가 어느 타임존에서 돌든 저장된 날짜가 밀리지 않도록 하기 위함.
export function dateKeyToUTCDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// "오늘"은 서버 타임존이 아니라 한국 시간 기준으로 판단한다.
export function todayKeyKST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function weekdayLabel(dateKey: string): string {
  const weekday = dateKeyToUTCDate(dateKey).getUTCDay();
  return `(${WEEKDAY_KO[weekday]})`;
}

export function weekdayIndex(dateKey: string): number {
  return dateKeyToUTCDate(dateKey).getUTCDay();
}

export function weekdayColorClass(weekday: number): string {
  if (weekday === 0) return "text-red-500";
  if (weekday === 6) return "text-blue-500";
  return "text-neutral-500";
}

export function dateRangeKeys(startKey: string, endKey: string): string[] {
  const start = dateKeyToUTCDate(startKey);
  const end = dateKeyToUTCDate(endKey);
  const keys: string[] = [];
  for (let d = start; d <= end; d = new Date(d.getTime() + 86400000)) {
    keys.push(formatDateKey(d));
  }
  return keys;
}
