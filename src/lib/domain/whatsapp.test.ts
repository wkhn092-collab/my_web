import { describe, expect, it } from 'vitest';
import { buildLeadMessage, sanitizeText, whatsappUrl } from './whatsapp';

describe('WhatsApp message (PROJECT_BRIEF §5ג)', () => {
  it('keeps emoji in the name', () => {
    expect(buildLeadMessage({ name: 'דנה 🌸', siteTypeLabel: 'דף נחיתה' })).toContain('אני דנה 🌸,');
  });

  it('sends links as plain text', () => {
    const text = buildLeadMessage({ name: 'רון', siteTypeLabel: 'אתר תדמית', message: 'כמו https://example.com' });
    expect(text).toContain('פרטים: כמו https://example.com');
  });

  it('omits the details line without a message', () => {
    const text = buildLeadMessage({ name: 'רון', siteTypeLabel: 'אתר תדמית', message: '   ' });
    expect(text).not.toContain('פרטים');
    expect(text.split('\n')).toHaveLength(2);
  });

  it('strips bidi overrides and control characters', () => {
    expect(sanitizeText('a\u202Eb\u2066c\u0007d', 50)).toBe('abcd');
  });

  it('caps name and message length', () => {
    expect(sanitizeText('א'.repeat(600), 500)).toHaveLength(500);
  });

  it('encodes newlines as %0A', () => {
    expect(whatsappUrl('972503967230', 'שורה\nשנייה')).toContain('%0A');
    expect(whatsappUrl('972503967230', 'a&b')).toBe('https://wa.me/972503967230?text=a%26b');
  });
});
