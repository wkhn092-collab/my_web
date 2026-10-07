import { normalizeIsraeliPhone, toWhatsAppNumber } from './phone';
import { NAME_MAX, sanitizeText, whatsappUrl } from './whatsapp';

/**
 * Sent by Avishi himself after handing over a site. Asks for an honest opinion, offers nothing in return
 * (no reward for a positive review), and asks for explicit consent before anything is published.
 */
export function buildTestimonialRequest(name: string): string {
  const firstName = sanitizeText(name, NAME_MAX).split(/\s+/)[0] ?? '';
  return [
    `היי${firstName ? ` ${firstName}` : ''}, כאן אבישי מעומק. שמחתי לבנות איתך את האתר.`,
    'אם יש לך דקה, אשמח לשמוע בכנות איך הייתה העבודה איתי: מה עבד טוב, ומה כדאי לשפר.',
    'אם תרצה, אפשר לפרסם את מה שכתבת באתר שלי עם השם המלא שלך. אפרסם רק אם תאשר במפורש, ותמיד אפשר לבקש שאוריד.',
    'תודה!',
  ].join('\n');
}

/** Null when the stored phone is not a valid Israeli number, so the Studio button stays disabled. */
export function testimonialRequestUrl(name: string, phone: string | undefined): string | null {
  const e164 = phone ? normalizeIsraeliPhone(phone) : null;
  return e164 ? whatsappUrl(toWhatsAppNumber(e164), buildTestimonialRequest(name)) : null;
}
