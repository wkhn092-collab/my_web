/** For the uptime monitor: a plain OK, with no version, environment or dependency details. */
export const dynamic = 'force-dynamic';

const headers = { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' };

export function GET() {
  return new Response('OK', { headers });
}

export function HEAD() {
  return new Response(null, { headers });
}
