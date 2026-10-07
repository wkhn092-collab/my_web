import { defineField, defineType } from 'sanity';

export const faq = defineType({
  name: 'faq',
  title: 'שאלה נפוצה',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'שאלה', type: 'string', validation: (r) => r.required().max(80) }),
    defineField({ name: 'answer', title: 'תשובה', type: 'text', rows: 4, validation: (r) => r.required().max(600) }),
    defineField({
      name: 'objection',
      title: 'איזו התנגדות זה עונה (פנימי)',
      type: 'string',
      validation: (r) => r.max(120),
    }),
    defineField({ name: 'order', title: 'סדר', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'סדר', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
});
