import 'server-only';
import { z } from '@/lib/zod';
import { env, isConfigured, isDeployed } from '@/lib/env.server';
import { logWarn } from '@/lib/logger';

const responseSchema = z.object({
  success: z.boolean(),
  'error-codes': z.array(z.string()).optional(),
  action: z.string().optional(),
  hostname: z.string().optional(),
});

function expectedHostname(): string | null {
  if (env.VERCEL_ENV !== 'production') return null;
  try {
    return new URL(env.NEXT_PUBLIC_SITE_URL).hostname;
  } catch {
    return null;
  }
}

export async function verifyTurnstile(token: string | undefined, ip: string, expectedAction: string): Promise<boolean> {
  if (!isConfigured.turnstile()) {
    // Local development without Cloudflare keys only; deployed environments require them (env.server.ts).
    return !isDeployed;
  }
  if (!token || token.length > 2048) return false;

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY!, response: token, remoteip: ip }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const parsed = responseSchema.safeParse(await res.json());
    if (!parsed.success || !parsed.data.success) return false;
    if (parsed.data.action !== expectedAction) {
      logWarn('turnstile', 'Action mismatch', { expected: expectedAction, got: parsed.data.action ?? 'none' });
      return false;
    }
    const host = expectedHostname();
    if (host && parsed.data.hostname !== host) {
      logWarn('turnstile', 'Hostname mismatch', { got: parsed.data.hostname ?? 'none' });
      return false;
    }
    return true;
  } catch (error) {
    logWarn('turnstile', 'Verification request failed', { error: String(error) });
    return false;
  }
}
