import { describe, expect, it } from 'vitest';
import { LEAD_ERRORS, leadInputSchema } from './lead-schema';

const valid = { name: 'דנה', phone: '050-396-7230', siteType: 'landing' };

describe('leadInputSchema', () => {
  it('normalizes phone and trims optional fields', () => {
    const result = leadInputSchema.parse({ ...valid, message: '  ', email: '', page: '/projects' });
    expect(result.phone).toBe('+972503967230');
    expect(result.message).toBeUndefined();
    expect(result.email).toBeUndefined();
    expect(result.page).toBe('/projects');
  });

  it.each([
    ['name', { ...valid, name: '   ' }, LEAD_ERRORS.name],
    ['phone', { ...valid, phone: '12345' }, LEAD_ERRORS.phone],
    ['message', { ...valid, message: 'א'.repeat(501) }, LEAD_ERRORS.message],
    ['email', { ...valid, email: 'not-an-email' }, LEAD_ERRORS.email],
    ['siteType', { ...valid, siteType: 'store' }, LEAD_ERRORS.siteType],
  ])('rejects bad %s with the approved copy', (field, input, message) => {
    const result = leadInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    const issue = result.error!.issues.find((i) => i.path[0] === field);
    expect(issue?.message).toBe(message);
  });

  it('strips bidi controls from the name', () => {
    expect(leadInputSchema.parse({ ...valid, name: 'דנה\u202E' }).name).toBe('דנה');
  });

  it('reads extras as a clean id list and ignores junk', () => {
    expect(leadInputSchema.parse({ ...valid, addons: 'logo,booking,<b>x</b>' }).addons).toEqual(['logo', 'booking']);
    expect(leadInputSchema.parse(valid).addons).toEqual([]);
  });

  it('rejects an oversized extras field', () => {
    expect(leadInputSchema.safeParse({ ...valid, addons: 'a,'.repeat(300) }).success).toBe(false);
  });

  it('falls back to "/" for a suspicious page value', () => {
    expect(leadInputSchema.parse({ ...valid, page: 'https://evil.example' }).page).toBe('/');
  });
});
