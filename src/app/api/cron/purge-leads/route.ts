import { NextResponse } from 'next/server';
import { env, isConfigured } from '@/lib/env.server';
import { EXPIRED_LEADS_QUERY, KEPT_STATUS, retentionCutoff } from '@/lib/lead/retention';
import { logError, logInfo, logWarn } from '@/lib/logger';
import { hasBearer } from '@/lib/security/compare';
import { getSanityLeadsWriteClient } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

/** Daily (vercel.json): deletes leads past the retention period that never became work. Ids only in the logs. */
export async function GET(request: Request) {
  if (!env.CRON_SECRET) {
    logWarn('retention', 'CRON_SECRET missing; purge skipped');
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }
  if (!hasBearer(request.headers.get('authorization'), env.CRON_SECRET)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!isConfigured.sanityWrite()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  try {
    const client = getSanityLeadsWriteClient();
    const ids = await client.fetch<string[]>(EXPIRED_LEADS_QUERY, { kept: KEPT_STATUS, cutoff: retentionCutoff() });
    if (ids.length > 0) {
      const tx = client.transaction();
      for (const id of ids) tx.delete(id);
      await tx.commit({ visibility: 'async' });
    }
    logInfo('retention', 'Expired leads purged', { deleted: ids.length });
    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    logError('retention', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
