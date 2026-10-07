import { defineField, defineType } from 'sanity';

/** Private (`leads` dataset): the proof that a client agreed to have their testimonial published. */
export const testimonialConsent = defineType({
  name: 'testimonialConsent',
  title: 'אישור פרסום המלצה',
  type: 'document',
  fields: [
    defineField({ name: 'fullName', title: 'שם הלקוח', type: 'string', validation: (r) => r.required().max(60) }),
    defineField({ name: 'date', title: 'תאריך האישור', type: 'date', validation: (r) => r.required() }),
    defineField({
      name: 'method',
      title: 'איך אושר',
      type: 'string',
      options: {
        list: [
          { title: 'וואטסאפ', value: 'whatsapp' },
          { title: 'מייל', value: 'email' },
          { title: 'מסמך חתום', value: 'signed' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'scope',
      title: 'על מה אושר',
      description: 'למשל: הטקסט, השם המלא, התמונה והקישור לאתר',
      type: 'text',
      rows: 2,
      validation: (r) => r.required().max(300),
    }),
    // Not an upload: Sanity asset files are reachable by URL even in a private dataset.
    defineField({
      name: 'proofLocation',
      title: 'איפה שמורה ההוכחה',
      description: 'למשל: צילום מסך של הוואטסאפ, בתיקייה "אישורים" בדרייב. לא מעלים את הצילום לכאן.',
      type: 'string',
      validation: (r) => r.required().max(200),
    }),
    defineField({ name: 'notes', title: 'הערות', type: 'text', rows: 3 }),
  ],
  preview: {
    select: { title: 'fullName', subtitle: 'date' },
  },
});
