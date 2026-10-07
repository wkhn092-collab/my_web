import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env, isConfigured, isDeployed } from '@/lib/env.server';
import { logWarn } from '@/lib/logger';

export type LimiterName = 'leadIp' | 'leadPhone' | 'revalidate';

type Window = `${number} ${'s' | 'm' | 'h' | 'd'}`;

const SPECS: Record<LimiterName, { tokens: number; window: Window }> = {
  leadIp: { tokens: 3, window: '10 m' },
  leadPhone: { tokens: 5, window: '1 d' },
  revalidate: { tokens: 60, window: '1 m' },
};

let redis: Redis | null = null;
const limiters = new Map<LimiterName, Ratelimit>();

function getLimiter(name: LimiterName): Ratelimit | null {
  if (!isConfigured.redis()) return null;
  redis ??= new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! });
  const existing = limiters.get(name);
  if (existing) return existing;
  const spec = SPECS[name];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(spec.tokens, spec.window),
    prefix: `omek:rl:${name}`,
    analytics: false,
  });
  limiters.set(name, limiter);
  return limiter;
}

// Local development without Upstash still exercises the limits.
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function windowToMs(window: Window): number {
  const [amount, unit] = window.split(' ') as [string, 's' | 'm' | 'h' | 'd'];
  return Number(amount) * { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
}

function memoryLimit(name: LimiterName, key: string): boolean {
  const spec = SPECS[name];
  const bucketKey = `${name}:${key}`;
  const now = Date.now();
  const bucket = memoryBuckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(bucketKey, { count: 1, resetAt: now + windowToMs(spec.window) });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= spec.tokens;
}

/** true = allowed. Fails closed when the limiter is missing or erroring in a deployed environment. */
export async function rateLimit(name: LimiterName, key: string): Promise<boolean> {
  const limiter = getLimiter(name);
  if (!limiter) {
    if (isDeployed) {
      logWarn('rate-limit', 'Upstash missing in deployed environment; failing closed', { name });
      return false;
    }
    return memoryLimit(name, key);
  }
  try {
    return (await limiter.limit(key)).success;
  } catch (error) {
    logWarn('rate-limit', 'Limiter error; failing closed', { name, error: String(error) });
    return false;
  }
}
