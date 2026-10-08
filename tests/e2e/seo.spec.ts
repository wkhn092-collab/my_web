import { expect, test } from '@playwright/test';

function jsonLdBlocks(html: string): unknown[] {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([^<]*)<\/script>/g)].flatMap((m) => {
    const parsed = JSON.parse(m[1]);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

test.describe('search and sharing', () => {
  test('home page describes the business, services and FAQ for Google', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const types = jsonLdBlocks(html).map((block) => (block as { '@type': string })['@type']);
    expect(types).toEqual(expect.arrayContaining(['ProfessionalService', 'ItemList', 'FAQPage']));
    expect(html).not.toContain('streetAddress');
  });

  test('project pages carry a concept-labelled work and breadcrumbs', async ({ request }) => {
    const html = await (await request.get('/projects/spacehub')).text();
    const blocks = jsonLdBlocks(html) as { '@type': string; description?: string }[];
    expect(blocks.find((b) => b['@type'] === 'CreativeWork')?.description).toMatch(/^פרויקט קונספט/);
    expect(blocks.some((b) => b['@type'] === 'BreadcrumbList')).toBe(true);
  });

  test('every project page has its own share image', async ({ request }) => {
    const html = await (await request.get('/projects/luxi')).text();
    const src = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    expect(src).toContain('/projects/luxi/opengraph-image');
    const image = await request.get(new URL(src!).pathname + new URL(src!).search);
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toBe('image/png');
    expect((await image.body()).length).toBeGreaterThan(50_000);
  });

  test('the site-wide share image renders', async ({ request }) => {
    const res = await request.get('/opengraph-image');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/png');
  });
});
