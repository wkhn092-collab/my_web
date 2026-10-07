import { defineField, defineType } from 'sanity';

export const niche = defineType({
  name: 'niche',
  title: 'תחום',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'שם', type: 'string', validation: (r) => r.required().max(24) }),
    defineField({
      name: 'slug',
      title: 'מזהה בכתובת',
      type: 'slug',
      options: { source: 'title', maxLength: 32 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', title: 'סדר', type: 'number', initialValue: 0 }),
  ],
});
