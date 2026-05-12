// 한국 시간 기준 날짜 처리 유틸

// Date → "YYYY-MM-DD" (KST 기준)
export function kstDayString(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);
}

// 날짜 라벨: "오늘", "어제", "그제", "3일 전", "5월 8일"
export function dateLabel(dayStr: string): string {
  const today = kstDayString(new Date());
  const todayMs = new Date(today + "T00:00:00Z").getTime();
  const articleMs = new Date(dayStr + "T00:00:00Z").getTime();
  const diffDays = Math.round((todayMs - articleMs) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays === 2) return "그제";
  if (diffDays < 7) return `${diffDays}일 전`;

  const [y, m, d] = dayStr.split("-");
  const now = new Date();
  const currentYear = parseInt(kstDayString(now).split("-")[0]);
  const articleYear = parseInt(y);

  if (articleYear === currentYear) {
    return `${parseInt(m)}월 ${parseInt(d)}일`;
  }
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

// 시간 표시 (오늘 기사면 "오전 8:35" 같은 시간, 그 외면 빈 문자)
export function shortTime(d: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    minute: "2-digit"
  }).format(d);
}

// 날짜별로 기사 그룹화
export function groupByDay<T extends { publishedAt: Date }>(articles: T[]): Array<{ day: string; label: string; items: T[] }> {
  const groups: Record<string, T[]> = {};
  for (const a of articles) {
    const day = kstDayString(a.publishedAt);
    groups[day] = groups[day] ?? [];
    groups[day].push(a);
  }
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a)) // 최신순
    .map(day => ({ day, label: dateLabel(day), items: groups[day] }));
}

// "YYYY-MM-DD" → 그 날의 KST 자정부터 다음날 KST 자정까지의 UTC Date 범위
export function kstDayRange(dayStr: string): { start: Date; end: Date } {
  // KST 자정 = UTC 전날 15:00
  const start = new Date(dayStr + "T00:00:00+09:00");
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

// "YYYY-MM-DD"에서 N일 더하거나 뺀 날짜 문자열
export function shiftDay(dayStr: string, deltaDays: number): string {
  const { start } = kstDayRange(dayStr);
  const shifted = new Date(start.getTime() + deltaDays * 24 * 60 * 60 * 1000);
  return kstDayString(shifted);
}

// 긴 날짜 표시: "2026년 5월 12일 화요일"
export function fullDateLabel(dayStr: string): string {
  const { start } = kstDayRange(dayStr);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(start);
}

// 중간 날짜 표시: "5월 12일 (화)" — 모바일 친화
export function midDateLabel(dayStr: string): string {
  const { start } = kstDayRange(dayStr);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(start);
}
