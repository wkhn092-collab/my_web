import { describe, expect, it } from 'vitest';
import { alertModeKey, isWeekendWindow, orderAlertNumbers, parseAlertMode } from './alert-routing';

/** Israel time in October 2026 (before the 25th) is UTC+3. */
const il = (local: string) => new Date(`${local}+03:00`);
const numbers = { weekday: '972587012726', weekend: '972503967230' };

describe('lead alert routing', () => {
  it('weekend window is Thursday 14:00 to Sunday 19:00, Israel time', () => {
    expect(isWeekendWindow(il('2026-10-08T13:59'))).toBe(false);
    expect(isWeekendWindow(il('2026-10-08T14:00'))).toBe(true);
    expect(isWeekendWindow(il('2026-10-10T23:00'))).toBe(true);
    expect(isWeekendWindow(il('2026-10-11T18:59'))).toBe(true);
    expect(isWeekendWindow(il('2026-10-11T19:00'))).toBe(false);
    expect(isWeekendWindow(il('2026-10-13T10:00'))).toBe(false);
  });

  it('follows the winter clock change', () => {
    expect(isWeekendWindow(new Date('2026-10-29T11:59:00Z'))).toBe(false);
    expect(isWeekendWindow(new Date('2026-10-29T12:00:00Z'))).toBe(true);
  });

  it('050 on the weekend, 058 otherwise, the other number as fallback', () => {
    expect(orderAlertNumbers(numbers, 'auto', il('2026-10-09T12:00'))).toEqual(['972503967230', '972587012726']);
    expect(orderAlertNumbers(numbers, 'auto', il('2026-10-12T12:00'))).toEqual(['972587012726', '972503967230']);
  });

  it("Avishi's override beats the schedule", () => {
    expect(orderAlertNumbers(numbers, 'weekend', il('2026-10-12T12:00'))[0]).toBe('972503967230');
    expect(orderAlertNumbers(numbers, 'weekday', il('2026-10-10T12:00'))[0]).toBe('972587012726');
  });

  it('reads only the three known values from the bot, anything else means auto', () => {
    expect(parseAlertMode('weekend')).toBe('weekend');
    expect(parseAlertMode('weekday')).toBe('weekday');
    expect(parseAlertMode('auto')).toBe('auto');
    expect(parseAlertMode(null)).toBe('auto');
    expect(parseAlertMode('<script>')).toBe('auto');
  });

  it("uses the bot's key for the same phone number", () => {
    expect(alertModeKey('123456789')).toBe('wa:123456789:settings:alert-mode');
  });
});
