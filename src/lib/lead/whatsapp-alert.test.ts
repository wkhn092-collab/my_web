import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LEAD_ALERT_BODY, buildLeadAlertParams } from './whatsapp-alert';

describe('WhatsApp lead alert', () => {
  it('sends only name, site type and phone, each on one line', () => {
    const params = buildLeadAlertParams({ name: 'דנה\nכהן', phone: '0501234567', siteType: 'brand' });
    expect(params).toHaveLength(3);
    expect(params[0]).toBe('דנה כהן');
    expect(params[1]).toBe('אתר תדמית');
    expect(params.every((p) => !/[\n\t]| {2,}/.test(p))).toBe(true);
  });

  it('caps long names', () => {
    const [name] = buildLeadAlertParams({ name: 'א'.repeat(200), phone: '0501234567', siteType: 'landing' });
    expect(name.length).toBeLessThanOrEqual(60);
  });

  it('has a body Meta accepts: three variables, not at the start or end', () => {
    expect(LEAD_ALERT_BODY.match(/\{\{\d\}\}/g)).toEqual(['{{1}}', '{{2}}', '{{3}}']);
    expect(LEAD_ALERT_BODY.startsWith('{{')).toBe(false);
    expect(LEAD_ALERT_BODY.endsWith('}}')).toBe(false);
  });

  it('matches the body the template script submits', () => {
    const script = readFileSync('scripts/create-lead-alert-template.mjs', 'utf8');
    expect(script).toContain(`const BODY = '${LEAD_ALERT_BODY.replace(/\n/g, '\\n')}';`);
  });
});
