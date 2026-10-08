import 'server-only';
import { Redis } from '@upstash/redis';
import { env, isConfigured, isDeployed } from '@/lib/env.server';
import { logWarn } from '@/lib/logger';

let redis: Redis | null = null;
const memory = new Map<string, number>();

/**
 * Marks an event id as handled. Returns true the first time and false for every replay within the TTL, so a captured
 * webhook delivered twice is processed once. Fails closed in a deployed environment without Redis.
 */
export async function claimOnce(scope: string, id: string, ttlSeconds: number): Promise<boolean> {
  const key = `omek:once:${scope}:${id}`;
  if (!isConfigured.redis()) {
    if (isDeployed) {
      logWarn('replay', 'Upstash missing in deployed environment; failing closed', { scope });
      return false;
    }
    const now = Date.now();
    for (const [k, expires] of memory) if (expires <= now) memory.delete(k);
    if (memory.has(key)) return false;
    memory.set(key, now + ttlSeconds * 1000);
    return true;
  }
  try {
    redis ??= new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! });
    return (await redis.set(key, '1', { nx: true, ex: ttlSeconds })) === 'OK';
  } catch (error) {
    logWarn('replay', 'Redis error; failing closed', { scope, error: String(error) });
    return false;
  }
}

/** Reads `t=<ms>` from a Sanity webhook signature header and checks it is within the allowed skew of now. */
export function isFreshSanitySignature(header: string | null, maxSkewMs: number, now = Date.now()): boolean {
  const match = header?.match(/(?:^|,)\s*t=(\d{10,16})(?:,|$)/);
  if (!match) return false;
  const timestamp = Number(match[1]);
  return Number.isFinite(timestamp) && Math.abs(now - timestamp) <= maxSkewMs;
}
