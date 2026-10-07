import { defineArrayMember, defineField, defineType } from 'sanity';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'עמוד מי אני',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'כותרת', type: 'string', validation: (r) => r.required().max(80) }),
    defineField({
      name: 'paragraphs',
      title: 'פסקאות',
      type: 'array',
      of: [defineArrayMember({ type: 'text', rows: 4, validation: (r) => r.max(600) })],
      validation: (r) => r.required().min(1).max(6),
    }),
    defineField({ name: 'processTitle', title: 'כותרת "איך אני עובד"', type: 'string', validation: (r) => r.required().max(60) }),
    defineField({ name: 'process', title: 'איך אני עובד', type: 'text', rows: 5, validation: (r) => r.required().max(800) }),
  ],
  preview: { prepare: () => ({ title: 'עמוד מי אני' }) },
});
