import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { CONTENT_CACHE_TAG } from '@/lib/content/site-content';
import { isConfigured, requireEnv } from '@/lib/env.server';
import { logError } from '@/lib/logger';

/**
 * Signed GROQ webhook from Sanity (sanity.io/manage → API → Webhooks), on the `production` dataset only:
 * filter `_type in ["siteSettings","hours","announcement","homePage","aboutPage","service","niche","project","faq","legalPage"]`,
 * projection `{_type}`, secret = SANITY_WEBHOOK_SECRET. All content is one query, so one tag refreshes it.
 */
export async function POST(request: NextRequest) {
  if (!isConfigured.sanity()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const { SANITY_WEBHOOK_SECRET } = requireEnv('sanity', 'SANITY_WEBHOOK_SECRET');

  try {
    const { isValidSignature } = await parseBody<{ _type?: string }>(request, SANITY_WEBHOOK_SECRET, true);
    if (!isValidSignature) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  } catch (error) {
    logError('revalidate', error);
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  revalidateTag(CONTENT_CACHE_TAG, 'max');
  return NextResponse.json({ revalidated: true });
}
