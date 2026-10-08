import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { NextResponse } from 'next/server';
import { isConfigured } from '@/lib/env.server';
import { rateLimit } from '@/lib/security/rate-limit';
import { getClientIp, hashIp } from '@/lib/security/request-meta';
import { getSanityPreviewClient } from '@/sanity/lib/client';

// Validates the Presentation tool's signed secret against Sanity before enabling draft mode; a visitor without one
// gets a 401 from next-sanity, and guessing is throttled per IP.
export async function GET(request: Request) {
  if (!isConfigured.sanity()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!(await rateLimit('draftMode', hashIp(await getClientIp())))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  const { GET: enable } = defineEnableDraftMode({ client: getSanityPreviewClient() });
  return enable(request);
}
