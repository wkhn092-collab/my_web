import { defineArrayMember, defineField, defineType } from 'sanity';

export const legalPage = defineType({
  name: 'legalPage',
  title: 'עמוד משפטי',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'כותרת', type: 'string', validation: (r) => r.required().max(60) }),
    defineField({
      name: 'slug',
      title: 'מזהה בכתובת',
      type: 'slug',
      options: { source: 'title', maxLength: 32 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'updatedAt', title: 'עודכן בתאריך', type: 'date', validation: (r) => r.required() }),
    defineField({
      name: 'body',
      title: 'תוכן',
      description:
        'אפשר לכתוב תגים שיתמלאו לבד מפרטי העסק: {legalName} {businessId} {city} {email} {phone} {coordinatorName} {coordinatorPhone} {coordinatorEmail} {hours}',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'רגיל', value: 'normal' },
            { title: 'כותרת', value: 'h2' },
          ],
          lists: [{ title: 'תבליטים', value: 'bullet' }],
          marks: { decorators: [{ title: 'מודגש', value: 'strong' }], annotations: [] },
        }),
      ],
      validation: (r) => r.required(),
    }),
  ],
});
