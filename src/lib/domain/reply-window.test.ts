import { describe, expect, it } from 'vitest';
import { formatReplyWindow, getReplyWindow, type ReplyHours } from './reply-window';

const weekday = [
  { from: '14:00', to: '16:00' },
  { from: '19:00', to: '21:00' },
];

const hours: ReplyHours = {
  days: [weekday, weekday, weekday, weekday, weekday, [], []],
  closedDates: [],
  cutoffMinutes: 20,
};

// October 2026: Israel is on IDT (UTC+3) until Sunday 25.10 at 02:00, then IST (UTC+2).
const at = (iso: string, h: ReplyHours = hours) => formatReplyWindow(getReplyWindow(new Date(iso), h));

describe('reply window matrix (PROJECT_BRIEF §5א)', () => {
  it('Sunday 15:00 → today until 16:00', () => {
    expect(at('2026-10-11T12:00:00Z')).toBe('היום עד 16:00');
  });

  it('Sunday 15:45 → under the cutoff, moves to the evening window', () => {
    expect(at('2026-10-11T12:45:00Z')).toBe('היום בין 19:00 ל-21:00');
  });

  it('Sunday 17:00 → between windows', () => {
    expect(at('2026-10-11T14:00:00Z')).toBe('היום בין 19:00 ל-21:00');
  });

  it('Sunday 22:00 → tomorrow (Monday) afternoon', () => {
    expect(at('2026-10-11T19:00:00Z')).toBe('מחר (יום ב׳) בין 14:00 ל-16:00');
  });

  it('Thursday 21:30 → skips the weekend to Sunday', () => {
    expect(at('2026-10-15T18:30:00Z')).toBe('ביום א׳ בין 14:00 ל-16:00');
  });

  it('Saturday → Sunday afternoon', () => {
    expect(at('2026-10-17T09:00:00Z')).toBe('מחר (יום א׳) בין 14:00 ל-16:00');
  });

  it('consecutive closed dates are skipped', () => {
    const holidays = { ...hours, closedDates: ['2026-10-18', '2026-10-19'] };
    expect(at('2026-10-15T18:30:00Z', holidays)).toBe('ביום ג׳ בין 14:00 ל-16:00');
  });

  it('today closed → next open day even inside working hours', () => {
    const closedToday = { ...hours, closedDates: ['2026-10-11'] };
    expect(at('2026-10-11T12:00:00Z', closedToday)).toBe('מחר (יום ב׳) בין 14:00 ל-16:00');
  });

  it('DST end: 13:00Z on 25.10 is 15:00 local, still inside the window', () => {
    expect(at('2026-10-25T13:00:00Z')).toBe('היום עד 16:00');
  });

  it('DST end: 14:00Z on 25.10 is 16:00 local, window closed', () => {
    expect(at('2026-10-25T14:00:00Z')).toBe('היום בין 19:00 ל-21:00');
  });

  it('a long closure prints the date', () => {
    const closed = Array.from({ length: 10 }, (_, i) => `2026-10-${String(18 + i).padStart(2, '0')}`);
    expect(at('2026-10-15T18:30:00Z', { ...hours, closedDates: closed })).toBe('ב-28.10 (יום ד׳) בין 14:00 ל-16:00');
  });

  it('no hours at all → generic phrase', () => {
    expect(at('2026-10-11T12:00:00Z', { days: [[], [], [], [], [], [], []], closedDates: [], cutoffMinutes: 20 })).toBe('בהקדם');
  });
});
