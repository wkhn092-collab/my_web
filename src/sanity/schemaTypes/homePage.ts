import { defineArrayMember, defineField, defineType } from 'sanity';

/** Every section records which customer question it answers (rule 18: every section earns its place). */
const question = defineField({
  name: 'question',
  title: 'על איזו שאלה של הלקוח המקטע עונה (פנימי, לא מוצג)',
  type: 'string',
  validation: (r) => r.required().max(120),
});

const text = (name: string, title: string, max: number, rows = 1) =>
  defineField({ name, title, type: rows > 1 ? 'text' : 'string', ...(rows > 1 ? { rows } : {}), validation: (r) => r.required().max(max) });

export const homePage = defineType({
  name: 'homePage',
  title: 'עמוד הבית',
  type: 'document',
  groups: [
    { name: 'hero', title: 'פתיחה', default: true },
    { name: 'sections', title: 'מקטעים' },
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'פתיחה (Hero)',
      type: 'object',
      group: 'hero',
      fields: [question, text('title', 'כותרת', 40), text('lead', 'שורת הסבר', 200, 3), text('reassurance', 'שורת הרגעה', 80)],
    }),
    defineField({
      name: 'works',
      title: 'עבודות',
      type: 'object',
      group: 'sections',
      fields: [question, text('title', 'כותרת', 60), text('intro', 'פתיח', 320, 4)],
    }),
    defineField({
      name: 'depth',
      title: 'מתחת לפני המים',
      type: 'object',
      group: 'sections',
      fields: [
        question,
        text('title', 'כותרת', 60),
        defineField({
          name: 'layers',
          title: 'שכבות',
          type: 'array',
          validation: (r) => r.required().length(3),
          of: [
            defineArrayMember({
              type: 'object',
              name: 'layer',
              fields: [text('title', 'כותרת', 60), text('body', 'טקסט', 320, 4)],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'services',
      title: 'שירותים',
      type: 'object',
      group: 'sections',
      fields: [question, text('title', 'כותרת', 60), text('note', 'שורה מתחת לשירותים', 120)],
    }),
    defineField({ name: 'about', title: 'מי מאחורי הסטודיו (תקציר)', type: 'object', group: 'sections', fields: [question, text('text', 'טקסט', 300, 3)] }),
    defineField({ name: 'faq', title: 'שאלות', type: 'object', group: 'sections', fields: [question, text('title', 'כותרת', 60)] }),
    defineField({
      name: 'closing',
      title: 'סגירה וטופס',
      type: 'object',
      group: 'sections',
      fields: [question, text('title', 'כותרת', 60), text('privacyNote', 'שורת פרטיות', 120)],
    }),
  ],
  preview: { prepare: () => ({ title: 'עמוד הבית' }) },
});
