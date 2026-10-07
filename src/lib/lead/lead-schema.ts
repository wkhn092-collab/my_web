import { z } from '@/lib/zod';
import { LEAD_SITE_TYPES } from '@/lib/content/types';
import { parseAddonIds } from '@/lib/domain/addons';
import { normalizeIsraeliPhone } from '@/lib/domain/phone';
import { MESSAGE_MAX, NAME_MAX, sanitizeText } from '@/lib/domain/whatsapp';

export type LeadField = 'name' | 'phone' | 'siteType' | 'message' | 'email';

/** Error copy from docs/microcopy-map.md. */
export const LEAD_ERRORS: Record<LeadField, string> = {
  name: 'צריך שם, כדי שאדע איך לפנות',
  phone: 'כדאי לבדוק את המספר. למשל: 050-1234567',
  siteType: 'צריך לבחור סוג אתר. אפשר "עדיין לא ברור לי"',
  message: 'עד 500 תווים. אפשר לקצר ולהמשיך את השאר בוואטסאפ',
  email: 'כדאי לבדוק את המייל, או להשאיר את השדה ריק',
};

const optionalTrimmed = (max: number) =>
  z
    .string()
    .max(max * 2)
    .optional()
    .transform((v) => sanitizeText(v ?? '', max) || undefined);

export const leadInputSchema = z.object({
  name: z
    .string()
    .max(NAME_MAX * 2, LEAD_ERRORS.name)
    .transform((v) => sanitizeText(v, NAME_MAX))
    .pipe(z.string().min(1, LEAD_ERRORS.name)),
  phone: z
    .string()
    .max(32, LEAD_ERRORS.phone)
    .transform((v, ctx) => {
      const e164 = normalizeIsraeliPhone(v);
      if (!e164) {
        ctx.addIssue({ code: 'custom', message: LEAD_ERRORS.phone });
        return z.NEVER;
      }
      return e164;
    }),
  siteType: z.enum(LEAD_SITE_TYPES, LEAD_ERRORS.siteType),
  message: z
    .string()
    .optional()
    .refine((v) => (v ?? '').trim().length <= MESSAGE_MAX, LEAD_ERRORS.message)
    .transform((v) => sanitizeText(v ?? '', MESSAGE_MAX) || undefined),
  email: z
    .string()
    .max(254, LEAD_ERRORS.email)
    .optional()
    .transform((v) => v?.trim() || undefined)
    .pipe(z.email(LEAD_ERRORS.email).optional()),
  // Extra IDs only, comma-separated. What they mean is decided on the server.
  addons: z.string().max(400).optional().transform(parseAddonIds),
  // Hidden from people; bots fill it.
  website: z.string().max(200).optional(),
  turnstileToken: z.string().max(2048).optional(),
  page: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && /^\/[\w\-/]*$/.test(v) ? v : '/')),
  utmSource: optionalTrimmed(100),
  utmMedium: optionalTrimmed(100),
  utmCampaign: optionalTrimmed(100),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export type LeadActionState =
  | { status: 'idle' }
  | { status: 'invalid'; fieldErrors: Partial<Record<LeadField, string>> }
  | { status: 'rate-limited' }
  | { status: 'error' }
  | { status: 'success'; name: string; whatsappUrl: string; submissionId: string; addons: string[] };
