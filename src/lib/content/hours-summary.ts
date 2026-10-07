import type { ReplyHours, TimeRange } from '@/lib/domain/reply-window';

const DAY = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'];

function rangesKey(ranges: TimeRange[]): string {
  return ranges.map((r) => `${r.from}-${r.to}`).join(',');
}

function rangesText(ranges: TimeRange[]): string {
  return ranges.map((r) => `בין ${r.from} ל-${r.to}`).join(' ו');
}

/** "ימים א׳ עד ה׳, בין 14:00 ל-16:00 ובין 19:00 ל-21:00". Ranges written in words (bidi rule). */
export function formatHoursSummary(hours: ReplyHours): string[] {
  const groups: { start: number; end: number; ranges: TimeRange[] }[] = [];
  hours.days.forEach((ranges, day) => {
    if (!ranges?.length) return;
    const last = groups.at(-1);
    if (last && last.end === day - 1 && rangesKey(last.ranges) === rangesKey(ranges)) last.end = day;
    else groups.push({ start: day, end: day, ranges });
  });
  return groups.map(({ start, end, ranges }) => {
    const days = start === end ? `יום ${DAY[start]}` : `ימים ${DAY[start]} עד ${DAY[end]}`;
    return `${days}, ${rangesText(ranges)}`;
  });
}
