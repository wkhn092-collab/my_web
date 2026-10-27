import { describe, expect, it } from 'vitest';
import { SEED_FAQS, SEED_PROJECTS, SEED_SERVICES, SEED_SETTINGS } from '@/content/seed-data';
import { businessLd, faqLd, projectLd, serializeJsonLd, servicesLd } from './structured-data';

const BASE = 'https://example.test';

describe('structured data', () => {
  it('can never close the script tag', () => {
    const out = serializeJsonLd(faqLd([{ id: 'x', question: '</script><script>alert(1)</script>', answer: 'a' }]));
    expect(out).not.toContain('<');
    expect(out).toContain('\\u003c/script>');
  });

  it('describes the business with city only, all of Israel, and no price or clock hours', () => {
    const ld = businessLd(SEED_SETTINGS, BASE);
    expect(ld.address).toEqual({ '@type': 'PostalAddress', addressLocality: 'טבריה', addressCountry: 'IL' });
    expect(JSON.stringify(ld)).not.toMatch(/streetAddress|priceRange|aggregateRating|review|openingHours|14:00|19:00/);
    expect(ld.telephone).toBe(SEED_SETTINGS.phoneE164);
  });

  it('lists services without offers or prices', () => {
    const ld = servicesLd(SEED_SERVICES, BASE);
    expect(JSON.stringify(ld)).not.toMatch(/offers|price/i);
    expect((ld.itemListElement as unknown[]).length).toBe(SEED_SERVICES.length);
  });

  it('labels concept projects as such', () => {
    const [work, crumbs] = projectLd(SEED_PROJECTS[0], BASE);
    expect(work.description).toMatch(/^פרויקט קונספט: /);
    expect(crumbs['@type']).toBe('BreadcrumbList');
  });

  it('includes every FAQ', () => {
    expect((faqLd(SEED_FAQS).mainEntity as unknown[]).length).toBe(SEED_FAQS.length);
  });
});
