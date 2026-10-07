import { defineField, defineType } from 'sanity';

export const service = defineType({
  name: 'service',
  title: 'שירות',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'שם השירות', type: 'string', validation: (r) => r.required().max(40) }),
    defineField({ name: 'summary', title: 'תיאור קצר', type: 'text', rows: 3, validation: (r) => r.required().max(240) }),
    defineField({ name: 'includes', title: 'מה כלול', type: 'text', rows: 3, validation: (r) => r.required().max(240) }),
    defineField({
      name: 'siteType',
      title: 'סוג אתר בטופס',
      description: 'כשלוחצים על הכפתור בכרטיס, הטופס נפתח עם הבחירה הזו',
      type: 'string',
      options: {
        list: [
          { title: 'דף נחיתה', value: 'landing' },
          { title: 'אתר תדמית', value: 'brand' },
          { title: 'אתר פרימיום עם תלת-ממד', value: 'premium3d' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'ctaLabel', title: 'טקסט הכפתור', type: 'string', validation: (r) => r.required().max(40) }),
    defineField({
      name: 'priceFrom',
      title: 'מחיר "החל מ-" (רשות)',
      description: 'כרגע לא מציגים מחירים. אם ימולא, המחיר יוצג כולל מע"מ לפי סוג העוסק.',
      type: 'number',
      validation: (r) => r.integer().min(0),
    }),
    defineField({ name: 'order', title: 'סדר', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'סדר', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
});
