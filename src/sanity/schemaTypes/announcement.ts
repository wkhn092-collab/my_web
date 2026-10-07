import { defineField, defineType } from 'sanity';

export const announcement = defineType({
  name: 'announcement',
  title: 'באנר עליון',
  type: 'document',
  fields: [
    defineField({ name: 'active', title: 'פעיל', type: 'boolean', initialValue: false }),
    defineField({
      name: 'text',
      title: 'טקסט',
      description: 'רק מידע אמיתי. בלי ספירה לאחור ובלי "נשארו מקומות אחרונים".',
      type: 'string',
      validation: (r) => r.max(120),
    }),
    defineField({
      name: 'href',
      title: 'קישור (רשות)',
      type: 'url',
      validation: (r) => r.uri({ allowRelative: true, scheme: ['https'] }),
    }),
    defineField({ name: 'endsAt', title: 'תאריך סיום', description: 'אחרי התאריך הבאנר נעלם לבד', type: 'datetime' }),
  ],
  preview: { select: { title: 'text', active: 'active' }, prepare: ({ title, active }) => ({ title: title || 'באנר עליון', subtitle: active ? 'פעיל' : 'כבוי' }) },
});
