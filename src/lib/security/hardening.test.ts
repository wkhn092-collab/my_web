import { describe, expect, it } from 'vitest';
import { EXPIRED_LEADS_QUERY, retentionCutoff } from '@/lib/lead/retention';
import { hasBearer, safeEqual } from './compare';
import { isFreshSanitySignature } from './replay';

describe('safeEqual / hasBearer', () => {
  it('accepts only the exact secret', () => {
    expect(safeEqual('a'.repeat(40), 'a'.repeat(40))).toBe(true);
    expect(safeEqual('a'.repeat(40), 'a'.repeat(39) + 'b')).toBe(false);
    expect(safeEqual('short', 'a'.repeat(40))).toBe(false);
  });

  it('reads a Bearer header and nothing else', () => {
    const secret = 's'.repeat(40);
    expect(hasBearer(`Bearer ${secret}`, secret)).toBe(true);
    expect(hasBearer(`bearer ${secret}`, secret)).toBe(false);
    expect(hasBearer(secret, secret)).toBe(false);
    expect(hasBearer(null, secret)).toBe(false);
  });
});

describe('isFreshSanitySignature', () => {
  const now = 1_790_000_000_000;
  it('accepts a timestamp inside the window', () => {
    expect(isFreshSanitySignature(`t=${now - 60_000},v1=abc`, 300_000, now)).toBe(true);
  });
  it('rejects old, future, missing and malformed timestamps', () => {
    expect(isFreshSanitySignature(`t=${now - 600_000},v1=abc`, 300_000, now)).toBe(false);
    expect(isFreshSanitySignature(`t=${now + 600_000},v1=abc`, 300_000, now)).toBe(false);
    expect(isFreshSanitySignature('v1=abc', 300_000, now)).toBe(false);
    expect(isFreshSanitySignature(null, 300_000, now)).toBe(false);
    expect(isFreshSanitySignature('t=abc,v1=x', 300_000, now)).toBe(false);
  });
});

describe('lead retention', () => {
  it('cuts off exactly twelve months back', () => {
    expect(retentionCutoff(new Date('2027-10-08T03:00:00.000Z'))).toBe('2026-10-08T03:00:00.000Z');
  });
  it('keeps clients and takes its values from parameters', () => {
    expect(EXPIRED_LEADS_QUERY).toContain('status != $kept');
    expect(EXPIRED_LEADS_QUERY).toContain('createdAt < $cutoff');
  });
});
