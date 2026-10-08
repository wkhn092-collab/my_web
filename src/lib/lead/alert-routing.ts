/**
 * Which of Avishi's numbers gets a lead alert. Same rule as omek-bot (src/business/bot.config.ts → alertRouting):
 * the weekend number from Thursday 14:00 to Sunday 19:00 Israel time, the weekday number otherwise, unless he
 * overrode it from WhatsApp ("התראות" to the bot), which the bot stores as auto / weekday / weekend.
 */

export type AlertMode = 'auto' | 'weekday' | 'weekend';

export const ALERT_SCHEDULE = {
  timeZone: 'Asia/Jerusalem',
  weekendFrom: { day: 4, minutes: 14 * 60 },
  weekendUntil: { day: 0, minutes: 19 * 60 },
} as const;

/** The bot's store key for the override: `wa:<phone number id>:settings:alert-mode`. */
export function alertModeKey(phoneNumberId: string): string {
  return `wa:${phoneNumberId}:settings:alert-mode`;
}

export function parseAlertMode(value: unknown): AlertMode {
  return value === 'weekday' || value === 'weekend' ? value : 'auto';
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function isWeekendWindow(now: Date): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ALERT_SCHEDULE.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const current = (WEEKDAYS[get('weekday')] ?? 0) * 1440 + Number(get('hour')) * 60 + Number(get('minute'));
  const start = ALERT_SCHEDULE.weekendFrom.day * 1440 + ALERT_SCHEDULE.weekendFrom.minutes;
  const end = ALERT_SCHEDULE.weekendUntil.day * 1440 + ALERT_SCHEDULE.weekendUntil.minutes;
  return start <= end ? current >= start && current < end : current >= start || current < end;
}

/** The number to alert first, then the other one as a fallback. */
export function orderAlertNumbers(numbers: { weekday: string; weekend: string }, mode: AlertMode, now: Date): [string, string] {
  const weekend = mode === 'weekend' || (mode === 'auto' && isWeekendWindow(now));
  return weekend ? [numbers.weekend, numbers.weekday] : [numbers.weekday, numbers.weekend];
}
