import { expect, test } from '@playwright/test';

test.describe('security surface', () => {
  test('pages ship the hardening headers', async ({ request }) => {
    const res = await request.get('/');
    const h = res.headers();
    expect(h['x-powered-by']).toBeUndefined();
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('SAMEORIGIN');
    expect(h['cross-origin-resource-policy']).toBe('same-origin');
    expect(h['referrer-policy']).toBeTruthy();
    expect(h['permissions-policy']).toContain('camera=()');
    expect(h['content-security-policy']).toContain('report-uri /api/csp-report');
  });

  test('health check answers plainly and is never cached', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe('OK');
    expect(res.headers()['cache-control']).toContain('no-store');
  });

  test('the retention job refuses callers without the secret', async ({ request }) => {
    const res = await request.get('/api/cron/purge-leads', { headers: { authorization: 'Bearer wrong' } });
    expect([401, 503]).toContain(res.status());
  });

  test('the revalidate webhook refuses unsigned calls', async ({ request }) => {
    const res = await request.post('/api/revalidate', { data: { _type: 'project' } });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('CSP reports are accepted quietly and oversize ones are refused', async ({ request }) => {
    const ok = await request.post('/api/csp-report', {
      headers: { 'content-type': 'application/csp-report' },
      data: JSON.stringify({ 'csp-report': { 'violated-directive': 'script-src', 'blocked-uri': 'https://evil.test/x.js?q=1', 'document-uri': 'http://localhost/' } }),
    });
    expect(ok.status()).toBe(204);
    const big = await request.post('/api/csp-report', {
      headers: { 'content-type': 'application/csp-report' },
      data: 'x'.repeat(20_000),
    });
    expect(big.status()).toBe(413);
  });

  test('security.txt is published', async ({ request }) => {
    const res = await request.get('/.well-known/security.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('Contact: mailto:');
  });
});
