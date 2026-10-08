import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { CONTENT_CACHE_TAG } from '@/lib/content/site-content';
import { isConfigured, requireEnv } from '@/lib/env.server';
import { logError, logWarn } from '@/lib/logger';
import { rateLimit } from '@/lib/security/rate-limit';
import { claimOnce, isFreshSanitySignature } from '@/lib/security/replay';
import { getClientIp, hashIp } from '@/lib/security/request-meta';

const MAX_BODY_BYTES = 16 * 1024;
const MAX_SKEW_MS = 5 * 60 * 1000;

/**
 * Signed GROQ webhook from Sanity (sanity.io/manage → API → Webhooks), on the `production` dataset only:
 * filter `_type in ["siteSettings","hours","announcement","homePage","aboutPage","service","addon","niche","project","testimonial","faq","legalPage"]`,
 * projection `{_type}`, secret = SANITY_WEBHOOK_SECRET. All content is one query, so one tag refreshes it.
 * Layers: rate limit, JSON and size checks, HMAC signature, a five-minute timestamp window, and one-time delivery ids.
 */
export async function POST(request: NextRequest) {
  if (!isConfigured.sanity()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const { SANITY_WEBHOOK_SECRET } = requireEnv('sanity', 'SANITY_WEBHOOK_SECRET');

  if (!(await rateLimit('revalidate', hashIp(await getClientIp())))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'unsupported_media_type' }, { status: 415 });
  }
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_BODY_BYTES) return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });

  const signature = request.headers.get('sanity-webhook-signature');
  if (!isFreshSanitySignature(signature, MAX_SKEW_MS)) {
    logWarn('revalidate', 'Stale or missing signature timestamp');
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  try {
    const { isValidSignature } = await parseBody<{ _type?: string }>(request, SANITY_WEBHOOK_SECRET, true);
    if (!isValidSignature) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  } catch (error) {
    logError('revalidate', error);
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // Sanity sends a unique idempotency-key per delivery; fall back to the signed signature itself.
  const deliveryId = (request.headers.get('idempotency-key') ?? signature ?? '').slice(0, 200);
  if (!(await claimOnce('sanity-webhook', deliveryId, 24 * 60 * 60))) {
    return NextResponse.json({ revalidated: false, duplicate: true });
  }

  revalidateTag(CONTENT_CACHE_TAG, 'max');
  return NextResponse.json({ revalidated: true });
}
