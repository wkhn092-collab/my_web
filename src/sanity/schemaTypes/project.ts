import { defineArrayMember, defineField, defineType } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'פרויקט',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'שם הפרויקט', type: 'string', validation: (r) => r.required().max(40) }),
    defineField({
      name: 'slug',
      title: 'מזהה בכתובת',
      type: 'slug',
      options: { source: 'title', maxLength: 48 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'niche', title: 'תחום', type: 'reference', to: [{ type: 'niche' }], validation: (r) => r.required() }),
    defineField({
      name: 'siteType',
      title: 'סוג אתר',
      type: 'string',
      options: {
        list: [
          { title: 'דף נחיתה', value: 'landing' },
          { title: 'אתר תדמית', value: 'brand' },
          { title: 'אתר פרימיום עם תלת-ממד', value: 'premium3d' },
          { title: 'חנות', value: 'store' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tier',
      title: 'Tier',
      type: 'number',
      options: { list: [1, 2, 3], layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'isConcept',
      title: 'פרויקט קונספט',
      description: 'מסומן כברירת מחדל. כל עוד הוא מסומן, האתר מציג "פרויקט קונספט" ליד הפרויקט. מבטלים רק כשיש לקוח אמיתי.',
      type: 'boolean',
      initialValue: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'liveUrl',
      title: 'קישור לאתר החי',
      type: 'url',
      validation: (r) => r.uri({ scheme: ['https'] }),
    }),
    defineField({ name: 'summary', title: 'תיאור קצר לכרטיס', type: 'text', rows: 3, validation: (r) => r.required().max(200) }),
    defineField({ name: 'challenge', title: 'האתגר', description: 'מה לקוח בתחום הזה צריך, וממה הוא חושש', type: 'text', rows: 4, validation: (r) => r.max(600) }),
    defineField({ name: 'solution', title: 'מה בניתי', description: 'שלושה עד חמישה משפטים', type: 'text', rows: 5, validation: (r) => r.max(800) }),
    defineField({
      name: 'codes',
      title: 'קודים מהספר (P/A/T)',
      description: 'פנימי, לא מוצג באתר',
      type: 'array',
      of: [defineArrayMember({ type: 'string', validation: (r) => r.regex(/^[PAT]\d{2}$/, { name: 'P01 / A12 / T03' }) })],
    }),
    defineField({
      name: 'cover',
      title: 'תמונת כיסוי',
      description: 'צילום מסך אמיתי של האתר. רוחב מינימלי 1600 פיקסלים.',
      type: 'image',
      options: { hotspot: true },
      validation: (r) =>
        r.custom((value: { asset?: { _ref?: string } } | undefined) => {
          const ref = value?.asset?._ref;
          if (!ref) return true;
          const width = Number(/-(\d+)x\d+-/.exec(ref)?.[1] ?? 0);
          return width >= 1600 ? true : 'התמונה צרה מדי. צריך רוחב של 1600 פיקסלים לפחות';
        }),
      fields: [
        defineField({ name: 'alt', title: 'תיאור התמונה (לקוראי מסך)', type: 'string', validation: (r) => r.required().max(140) }),
      ],
    }),
    defineField({
      name: 'metrics',
      title: 'ציונים שנמדדו',
      description: 'רק מדידה אמיתית, עם תאריך ומקור',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'metric',
          fields: [
            defineField({ name: 'label', title: 'מה נמדד', type: 'string', validation: (r) => r.required().max(24) }),
            defineField({ name: 'value', title: 'ציון', type: 'string', validation: (r) => r.required().max(12) }),
            defineField({ name: 'measuredAt', title: 'תאריך המדידה', type: 'date', validation: (r) => r.required() }),
            defineField({
              name: 'source',
              title: 'מקור',
              type: 'string',
              initialValue: 'PageSpeed Insights, מובייל',
              validation: (r) => r.required().max(60),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    defineField({ name: 'order', title: 'סדר', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'סדר', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', media: 'cover', concept: 'isConcept' },
    prepare: ({ title, media, concept }) => ({ title, media, subtitle: concept ? 'פרויקט קונספט' : 'לקוח' }),
  },
});
