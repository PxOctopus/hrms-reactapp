/**
 * Parse "HH:mm" into minutes since 00:00.
 */
export function parseHmToMinutes(hm: string): number {
  const [H, M] = hm.split(":").map(Number);
  return (H * 60) + (M || 0);
}

/**
 * Minutes between start and end, supporting overnight.
 * Example: 22:00 -> 06:00 = 8h (480m).
 */
export function dailyMinutes(startHm: string, endHm: string): number {
  const s = parseHmToMinutes(startHm);
  const e = parseHmToMinutes(endHm);
  // overnight support: if end <= start, wrap to next day
  return e > s ? e - s : (24 * 60 - s + e);
}

/** Local formatter "YYYY-MM-DD" (no toISOString -> no UTC shift). */
function formatISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Local parser for "YYYY-MM-DD" at local midnight. */
function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

/**
 * Get ISO week bounds (Mon..Sun) for a local ISO date string.
 * Avoids toISOString() to prevent off-by-one day issues.
 */
export function getIsoWeekBounds(dateStr: string): { weekStart: string; weekEnd: string } {
  const d = parseISODateLocal(dateStr);
  // JS: 0=Sun..6=Sat  => ISO: Mon=0..Sun=6
  const isoDay = (d.getDay() + 6) % 7;

  const monday = new Date(d.getTime());
  monday.setDate(d.getDate() - isoDay);

  const sunday = new Date(monday.getTime());
  sunday.setDate(monday.getDate() + 6);

  return {
    weekStart: formatISODateLocal(monday),
    weekEnd: formatISODateLocal(sunday),
  };
}

/**
 * Sum weekly hours from denormalized assignments.
 * Each item must have start/end "HH:mm". Overnight is supported.
 */
export function computeWeeklyHours(assignments: { shiftDate: string; startTime: string; endTime: string }[]) {
  const minutes = assignments.reduce((acc, a) => acc + dailyMinutes(a.startTime, a.endTime), 0);
  return Math.round((minutes / 60) * 10) / 10; // 1 decimal
}