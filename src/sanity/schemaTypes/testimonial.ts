import { defineField, defineType } from 'sanity';

export const TESTIMONIAL_STATUSES = [
  { title: 'ממתינה לאישור', value: 'pending' },
  { title: 'מאושרת לפרסום', value: 'approved' },
  { title: 'לא לפרסום', value: 'rejected' },
];

/**
 * Lives in the public `production` dataset, so it holds only what may be shown. The consent proof
 * (screenshot, message) is kept in the private `leads` dataset as `testimonialConsent`.
 */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'המלצה',
  type: 'document',
  fields: [
    defineField({
      name: 'status',
      title: 'סטטוס',
      description: 'רק "מאושרת לפרסום" מופיעה באתר, ורק אם מולא תאריך האישור',
      type: 'string',
      options: { list: TESTIMONIAL_STATUSES, layout: 'radio' },
      initialValue: 'pending',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'fullName',
      title: 'שם מלא',
      description: 'שם אמיתי של לקוח שעבדת איתו. בלי שמות בדויים ובלי ראשי תיבות.',
      type: 'string',
      validation: (r) => r.required().max(60),
    }),
    defineField({ name: 'role', title: 'תפקיד ועסק (רשות)', description: 'למשל: בעלת מאפייה, טבריה', type: 'string', validation: (r) => r.max(80) }),
    defineField({
      name: 'quote',
      title: 'מה הלקוח אמר',
      description: 'במילים של הלקוח. מותר לקצר, אסור לשנות משמעות. מוצג כטקסט רגיל.',
      type: 'text',
      rows: 5,
      validation: (r) => r.required().max(400),
    }),
    defineField({
      name: 'rating',
      title: 'דירוג (רשות)',
      description: 'רק אם הלקוח נתן אותו בעצמו',
      type: 'number',
      options: { list: [1, 2, 3, 4, 5] },
      validation: (r) => r.integer().min(1).max(5),
    }),
    defineField({
      name: 'project',
      title: 'הפרויקט שלו',
      description: 'כשמקושר פרויקט אמיתי (לא קונספט), ליד ההמלצה מופיע "לקוח מאומת" עם קישור לעבודה',
      type: 'reference',
      to: [{ type: 'project' }],
    }),
    defineField({
      name: 'photo',
      title: 'תמונה של הלקוח (רשות)',
      description: 'רק תמונה שהלקוח שלח ואישר. גם היא חלק מהאישור לפרסום.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'תיאור התמונה (לקוראי מסך)', type: 'string', validation: (r) => r.required().max(140) }),
      ],
    }),
    defineField({
      name: 'consentDate',
      title: 'תאריך האישור לפרסום',
      description: 'חובה לפני פרסום. האישור עצמו נשמר בסטודיו הפניות (פרטי), תחת "אישורי פרסום".',
      type: 'date',
      validation: (r) =>
        r.custom((value, context) =>
          (context.document as { status?: string } | undefined)?.status === 'approved' && !value
            ? 'אי אפשר לפרסם המלצה בלי תאריך אישור'
            : true,
        ),
    }),
    defineField({
      name: 'consentRef',
      title: 'מזהה האישור',
      description: 'המזהה של מסמך האישור בסטודיו הפניות. בלי פרטים אישיים כאן.',
      type: 'string',
      validation: (r) => r.max(120),
    }),
  ],
  preview: {
    select: { title: 'fullName', status: 'status', media: 'photo' },
    prepare: ({ title, status, media }) => ({
      title,
      media,
      subtitle: TESTIMONIAL_STATUSES.find((s) => s.value === status)?.title ?? '',
    }),
  },
});
