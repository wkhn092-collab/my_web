import 'server-only';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { env } from '@/lib/env.server';

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || '0.0.0.0';
  return candidate.slice(0, 64);
}

/**
 * Server Actions are public POST endpoints. Next already rejects a mismatched Origin; this repeats the check inside
 * the action with an exact host comparison (never `includes`), so it holds even if framework defaults change.
 */
export async function isSameOriginRequest(): Promise<boolean> {
  const h = await headers();
  const origin = h.get('origin');
  const host = (h.get('x-forwarded-host') ?? h.get('host'))?.split(',')[0]?.trim().toLowerCase();
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host;
  } catch {
    return false;
  }
}

/** SHA-256 with a server-side salt: lets us spot abuse without storing the IP itself. */
export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(`${env.LEAD_IP_SALT ?? 'dev-only-salt'}:${ip}`)
    .digest('hex');
}
