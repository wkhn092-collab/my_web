import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { NextResponse } from 'next/server';
import { isConfigured } from '@/lib/env.server';
import { getSanityPreviewClient } from '@/sanity/lib/client';

// Validates the Presentation tool's signed secret against Sanity before enabling draft mode.
export async function GET(request: Request) {
  if (!isConfigured.sanity()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const { GET: enable } = defineEnableDraftMode({ client: getSanityPreviewClient() });
  return enable(request);
}
