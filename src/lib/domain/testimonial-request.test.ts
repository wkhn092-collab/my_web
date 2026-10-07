import { describe, expect, it } from 'vitest';
import { buildTestimonialRequest, testimonialRequestUrl } from './testimonial-request';

describe('testimonial request (no incentives, explicit consent)', () => {
  it('greets by first name only', () => {
    expect(buildTestimonialRequest('דנה לוי').startsWith('היי דנה, ')).toBe(true);
  });

  it('asks for honesty and consent, and never offers anything in return', () => {
    const text = buildTestimonialRequest('רון');
    expect(text).toContain('בכנות');
    expect(text).toContain('רק אם תאשר במפורש');
    expect(text).not.toMatch(/הנחה|מתנה|קופון|הטבה|בתמורה/);
  });

  it('strips bidi controls from the stored name', () => {
    expect(buildTestimonialRequest('דנה\u202E')).toContain('היי דנה,');
  });

  it('builds a wa.me link only for a valid Israeli phone', () => {
    expect(testimonialRequestUrl('רון', '+972503967230')).toMatch(/^https:\/\/wa\.me\/972503967230\?text=/);
    expect(testimonialRequestUrl('רון', '12345')).toBeNull();
    expect(testimonialRequestUrl('רון', undefined)).toBeNull();
  });
});
