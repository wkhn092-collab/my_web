const SEPARATORS = /[\s\-().\u200e\u200f]/g;

/** Israeli mobile, landline or VoIP number → E.164 (+972…), or null when invalid. */
export function normalizeIsraeliPhone(input: string): string | null {
  if (typeof input !== 'string' || input.length > 32) return null;
  let digits = input.trim().replace(SEPARATORS, '');

  const countryCode = /^(\+972|00972|972)/.exec(digits);
  if (countryCode) {
    // A leading 0 after the country code ("+972 050…") is a common slip.
    digits = `0${digits.slice(countryCode[0].length).replace(/^0/, '')}`;
  }

  if (!/^\d+$/.test(digits)) return null;

  const mobileOrVoip = /^0(5\d|7\d)\d{7}$/;
  const landline = /^0[2-489]\d{7}$/;
  if (!mobileOrVoip.test(digits) && !landline.test(digits)) return null;

  return `+972${digits.slice(1)}`;
}

/** +972503967230 → 050-3967230; +97246721234 → 04-6721234. */
export function formatIsraeliPhone(e164: string): string {
  const local = `0${e164.replace(/^\+972/, '')}`;
  const prefixLength = local.length === 10 ? 3 : 2;
  return `${local.slice(0, prefixLength)}-${local.slice(prefixLength)}`;
}

/** +972503967230 → 972503967230 (wa.me format). */
export function toWhatsAppNumber(e164: string): string {
  return e164.replace(/^\+/, '');
}
