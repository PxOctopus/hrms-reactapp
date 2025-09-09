/**
 * Local date helpers that DO NOT use toISOString()
 * to avoid timezone shifts (e.g., UTC+3 -> previous day).
 */

/** Parse "YYYY-MM-DD" into a Date at local midnight */
export function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  // month is 0-based in JS Date
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

/** Format a Date to "YYYY-MM-DD" using LOCAL calendar values */
export function formatISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Inclusive day range between two ISO dates (local).
 * If `toISO` is omitted, returns just `[fromISO]`.
 */
export function eachDay(fromISO: string, toISO?: string): string[] {
  const start = parseISODateLocal(fromISO);
  const end = parseISODateLocal(toISO ?? fromISO);

  const out: string[] = [];
  // clone to avoid mutating `start`
  for (let d = new Date(start.getTime()); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(formatISODateLocal(d));
  }
  return out;
}
