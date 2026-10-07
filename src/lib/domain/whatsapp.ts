export const NAME_MAX = 60;
export const MESSAGE_MAX = 500;

// C0/C1 controls except \n, plus invisible bidi overrides/isolates and line/paragraph separators.
const UNSAFE_CHARS = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069\u2028\u2029]/g;

export function sanitizeText(input: string, max: number): string {
  return input.replace(UNSAFE_CHARS, '').replace(/\r\n?/g, '\n').trim().slice(0, max);
}

/** `number: null` opens WhatsApp's contact picker (used for "share with a friend"). */
export function whatsappUrl(number: string | null, text: string): string {
  return `https://wa.me/${number ?? ''}?text=${encodeURIComponent(text)}`;
}

export type LeadMessageInput = {
  name: string;
  siteTypeLabel: string;
  message?: string;
  /** Titles resolved on the server, never raw form input. */
  addons?: string[];
};

export function buildLeadMessage({ name, siteTypeLabel, message, addons = [] }: LeadMessageInput): string {
  const lines = [`היי, אני ${sanitizeText(name, NAME_MAX)}, פניתי אליך מהאתר של עומק.`, `סוג אתר: ${sanitizeText(siteTypeLabel, 40)}`];
  const extras = addons.map((a) => sanitizeText(a, 40)).filter(Boolean);
  if (extras.length) lines.push(`מעניין אותי גם: ${extras.join(', ')}`);
  const details = message ? sanitizeText(message, MESSAGE_MAX) : '';
  if (details) lines.push(`פרטים: ${details}`);
  return lines.join('\n');
}

/** Used only where content may have failed to load (error boundaries). Keep in sync with siteSettings. */
export const FALLBACK_WHATSAPP_NUMBER = '972503967230';

export const FAB_MESSAGE = 'היי, הגעתי מהאתר של עומק';
