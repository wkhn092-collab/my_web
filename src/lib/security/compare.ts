import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Constant-time comparison for secrets. Both sides are hashed first, so differing lengths neither throw nor leak
 * through timing.
 */
export function safeEqual(received: string, expected: string): boolean {
  const a = createHash('sha256').update(received).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b) && received.length === expected.length;
}

/** Reads `Authorization: Bearer <secret>` and compares it in constant time. */
export function hasBearer(authorization: string | null, secret: string): boolean {
  const match = authorization?.match(/^Bearer (.{1,512})$/);
  return Boolean(match) && safeEqual(match![1], secret);
}
