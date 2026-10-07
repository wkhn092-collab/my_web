import { defineField, defineType } from 'sanity';

const PHONE_E164 = /^\+972\d{8,9}$/;

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'פרטי העסק',
  type: 'document',
  fields: [
    defineField({ name: 'brandName', title: 'שם המותג', type: 'string', validation: (r) => r.required().max(40) }),
    defineField({
      name: 'launchReady',
      title: 'מוכן להשקה',
      description: 'אפשר לסמן רק כשהשם המשפטי, סוג העוסק ומספר העוסק מלאים. הם מופיעים במדיניות הפרטיות ובתנאי השימוש.',
      type: 'boolean',
      initialValue: false,
      validation: (r) =>
        r.custom((value, ctx) => {
          const doc = ctx.document as { legalName?: string; businessType?: string; businessNumber?: string } | undefined;
          if (value && (!doc?.legalName || !doc?.businessType || !doc?.businessNumber)) {
            return 'כדי לסמן "מוכן להשקה" צריך למלא שם משפטי, סוג עוסק ומספר עוסק';
          }
          return true;
        }),
    }),
    defineField({ name: 'legalName', title: 'שם משפטי', type: 'string', validation: (r) => r.max(80) }),
    defineField({
      name: 'businessType',
      title: 'סוג עוסק',
      type: 'string',
      options: { list: ['עוסק פטור', 'עוסק מורשה', 'חברה בע"מ'] },
    }),
    defineField({
      name: 'businessNumber',
      title: 'מספר עוסק / ח"פ',
      type: 'string',
      validation: (r) => r.regex(/^\d{9}$/, { name: 'תשע ספרות' }),
    }),
    defineField({ name: 'city', title: 'עיר', type: 'string', validation: (r) => r.required().max(40) }),
    defineField({
      name: 'remoteNote',
      title: 'שורת אזור שירות',
      description: 'למשל: "עבודה מרחוק בכל הארץ"',
      type: 'string',
      validation: (r) => r.max(60),
    }),
    defineField({
      name: 'phoneE164',
      title: 'טלפון',
      description: 'בפורמט בינלאומי: +972503967230',
      type: 'string',
      validation: (r) => r.required().regex(PHONE_E164, { name: '+972…' }),
    }),
    defineField({
      name: 'whatsappE164',
      title: 'וואטסאפ',
      description: 'בפורמט בינלאומי. אם זה אותו מספר, להעתיק אותו.',
      type: 'string',
      validation: (r) => r.required().regex(PHONE_E164, { name: '+972…' }),
    }),
    defineField({ name: 'email', title: 'מייל', type: 'string', validation: (r) => r.required().email() }),
    defineField({
      name: 'accessibilityCoordinator',
      title: 'רכז נגישות',
      type: 'object',
      validation: (r) => r.required(),
      fields: [
        defineField({ name: 'name', title: 'שם', type: 'string', validation: (r) => r.required().max(60) }),
        defineField({
          name: 'phoneE164',
          title: 'טלפון',
          type: 'string',
          validation: (r) => r.required().regex(PHONE_E164, { name: '+972…' }),
        }),
        defineField({ name: 'email', title: 'מייל', type: 'string', validation: (r) => r.required().email() }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'פרטי העסק' }) },
});
