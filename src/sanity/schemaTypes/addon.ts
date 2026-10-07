import { defineArrayMember, defineField, defineType } from 'sanity';

/** Paid extras shown in the lead form. No price field on purpose: the price comes in the written quote. */
export const addon = defineType({
  name: 'addon',
  title: 'תוספת',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'שם התוספת', type: 'string', validation: (r) => r.required().max(40) }),
    defineField({
      name: 'slug',
      title: 'מזהה',
      description: 'אותיות באנגלית, ספרות ומקף. לא משנים אחרי שהתוספת עלתה, כי פניות ישנות נשענות עליו.',
      type: 'slug',
      options: { source: 'title', maxLength: 40 },
      validation: (r) =>
        r.required().custom((value: { current?: string } | undefined) =>
          /^[a-z0-9-]{1,40}$/.test(value?.current ?? '') ? true : 'רק אותיות קטנות באנגלית, ספרות ומקף',
        ),
    }),
    defineField({
      name: 'benefit',
      title: 'למה זה טוב לעסק',
      description: 'משפט אחד. בלי מחיר ובלי הבטחות שלא בטוח שיתקיימו.',
      type: 'text',
      rows: 2,
      validation: (r) => r.required().max(140),
    }),
    defineField({
      name: 'siteTypes',
      title: 'מוצג למי שבחר',
      description: 'לא מציעים תוספת שכבר כלולה בסוג האתר שנבחר',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'דף נחיתה', value: 'landing' },
          { title: 'אתר תדמית', value: 'brand' },
          { title: 'אתר פרימיום עם תלת-ממד', value: 'premium3d' },
          { title: 'עדיין לא ברור לי', value: 'unsure' },
        ],
        layout: 'grid',
      },
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: 'active', title: 'מוצג בטופס', type: 'boolean', initialValue: true }),
    defineField({ name: 'order', title: 'סדר', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'סדר', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', active: 'active' },
    prepare: ({ title, active }) => ({ title, subtitle: active ? 'מוצג בטופס' : 'מוסתר' }),
  },
});
