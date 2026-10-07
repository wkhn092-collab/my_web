export const TIME_ZONE = 'Asia/Jerusalem';

export type TimeRange = { from: string; to: string };

export type ReplyHours = {
  /** Index 0 = Sunday … 6 = Saturday. */
  days: TimeRange[][];
  /** Local dates, YYYY-MM-DD. */
  closedDates: string[];
  cutoffMinutes: number;
};

export type ReplyWindow =
  | { kind: 'today-until'; to: string }
  | { kind: 'window'; dayOffset: number; weekday: number; date: string; from: string; to: string }
  | { kind: 'none' };

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const HE_DAY = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'];
const MAX_LOOKAHEAD_DAYS = 30;

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function localParts(now: Date) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(now).map((p) => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: WEEKDAY_INDEX[parts.weekday] ?? 0,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

function sortedRanges(ranges: TimeRange[] | undefined): TimeRange[] {
  return [...(ranges ?? [])].sort((a, b) => toMinutes(a.from) - toMinutes(b.from));
}

/** The next reply window, in Israel local time. Pure: same input, same output. */
export function getReplyWindow(now: Date, hours: ReplyHours): ReplyWindow {
  const today = localParts(now);
  const closed = new Set(hours.closedDates);

  if (!closed.has(today.date)) {
    for (const range of sortedRanges(hours.days[today.weekday])) {
      const from = toMinutes(range.from);
      const to = toMinutes(range.to);
      if (today.minutes >= from && to - today.minutes > hours.cutoffMinutes) {
        return { kind: 'today-until', to: range.to };
      }
      if (today.minutes < from) {
        return { kind: 'window', dayOffset: 0, weekday: today.weekday, date: today.date, from: range.from, to: range.to };
      }
    }
  }

  for (let offset = 1; offset <= MAX_LOOKAHEAD_DAYS; offset++) {
    const date = addDays(today.date, offset);
    const weekday = (today.weekday + offset) % 7;
    if (closed.has(date)) continue;
    const first = sortedRanges(hours.days[weekday])[0];
    if (first) return { kind: 'window', dayOffset: offset, weekday, date, from: first.from, to: first.to };
  }
  return { kind: 'none' };
}

/** Hebrew phrase that completes "נחזור …" / "אחזור אליך …". Times stay as HH:mm so the UI can wrap them in <bdi>. */
export function formatReplyWindow(window: ReplyWindow): string {
  if (window.kind === 'none') return 'בהקדם';
  if (window.kind === 'today-until') return `היום עד ${window.to}`;
  const range = `בין ${window.from} ל-${window.to}`;
  if (window.dayOffset === 0) return `היום ${range}`;
  const day = window.weekday === 6 ? 'שבת' : `יום ${HE_DAY[window.weekday]}`;
  if (window.dayOffset === 1) return `מחר (${day}) ${range}`;
  if (window.dayOffset < 7) return `ב${day} ${range}`;
  const [, m, d] = window.date.split('-');
  return `ב-${Number(d)}.${Number(m)} (${day}) ${range}`;
}
