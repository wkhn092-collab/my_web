import { NextResponse, type NextRequest } from 'next/server';
import { logWarn } from '@/lib/logger';
import { rateLimit } from '@/lib/security/rate-limit';
import { getClientIp, hashIp } from '@/lib/security/request-meta';

const MAX_BODY_BYTES = 8 * 1024;
const ACCEPTED_TYPES = ['application/csp-report', 'application/reports+json', 'application/json'];

type Report = Record<string, unknown>;

/** Only the parts that say what was blocked; never query strings, which can carry personal data. */
function summarise(report: Report) {
  const field = (...keys: string[]) => {
    for (const key of keys) {
      const value = report[key];
      if (typeof value === 'string') return value.slice(0, 200);
    }
    return undefined;
  };
  const stripQuery = (value: string | undefined) => value?.split(/[?#]/)[0];
  return {
    directive: field('effectiveDirective', 'effective-directive', 'violatedDirective', 'violated-directive'),
    blocked: stripQuery(field('blockedURL', 'blocked-uri')),
    page: stripQuery(field('documentURL', 'document-uri')),
    sample: field('sample', 'script-sample')?.slice(0, 40),
  };
}

/** Browsers post here when the CSP blocks something: the earliest sign of an injected script. */
export async function POST(request: NextRequest) {
  const type = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!ACCEPTED_TYPES.includes(type)) return new NextResponse(null, { status: 415 });
  if (Number(request.headers.get('content-length') ?? '0') > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });
  if (!(await rateLimit('cspReport', hashIp(await getClientIp())))) return new NextResponse(null, { status: 429 });

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const reports: Report[] = Array.isArray(body)
    ? body.slice(0, 10).map((entry) => (entry && typeof entry === 'object' ? ((entry as Report).body as Report) : null)).filter((r): r is Report => Boolean(r))
    : body && typeof body === 'object' && (body as Report)['csp-report']
      ? [(body as Report)['csp-report'] as Report]
      : [];

  for (const report of reports) logWarn('csp', 'Violation', summarise(report));
  return new NextResponse(null, { status: 204 });
}
