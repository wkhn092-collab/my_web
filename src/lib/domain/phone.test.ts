import { describe, expect, it } from 'vitest';
import { formatIsraeliPhone, normalizeIsraeliPhone } from './phone';

describe('normalizeIsraeliPhone (PROJECT_BRIEF §5ב)', () => {
  it.each([
    ['0503967230', '+972503967230'],
    ['050-396-7230', '+972503967230'],
    ['+972 50 396 7230', '+972503967230'],
    ['+972 050 396 7230', '+972503967230'],
    ['00972503967230', '+972503967230'],
    ['04-6721234', '+97246721234'],
    ['077-1234567', '+972771234567'],
  ])('%s → %s', (input, expected) => {
    expect(normalizeIsraeliPhone(input)).toBe(expected);
  });

  it.each(['12345', '', '050-123', '0123456789', '+1 212 555 0100', 'abc0503967230', '0'.repeat(40)])('rejects %j', (input) => {
    expect(normalizeIsraeliPhone(input)).toBeNull();
  });
});

describe('formatIsraeliPhone', () => {
  it('formats mobile and landline', () => {
    expect(formatIsraeliPhone('+972503967230')).toBe('050-3967230');
    expect(formatIsraeliPhone('+97246721234')).toBe('04-6721234');
  });
});
