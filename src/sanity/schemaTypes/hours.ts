import { defineArrayMember, defineField, defineType } from 'sanity';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const rangeMember = defineArrayMember({
  type: 'object',
  name: 'timeRange',
  title: 'טווח שעות',
  fields: [
    defineField({ name: 'from', title: 'מ-', type: 'string', validation: (r) => r.required().regex(HHMM, { name: 'HH:mm' }) }),
    defineField({ name: 'to', title: 'עד', type: 'string', validation: (r) => r.required().regex(HHMM, { name: 'HH:mm' }) }),
  ],
  validation: (r) =>
    r.custom((value: { from?: string; to?: string } | undefined) =>
      value?.from && value?.to && value.from >= value.to ? 'שעת הסיום צריכה להיות אחרי שעת ההתחלה' : true,
    ),
  preview: { select: { from: 'from', to: 'to' }, prepare: ({ from, to }) => ({ title: `${from ?? '?'} עד ${to ?? '?'}` }) },
});

export const hours = defineType({
  name: 'hours',
  title: 'שעות מענה',
  type: 'document',
  fields: [
    ...DAYS.map((day, index) =>
      defineField({
        name: `day${index}`,
        title: `יום ${day}`,
        description: 'ריק = לא עונים ביום הזה',
        type: 'array',
        of: [rangeMember],
        validation: (r) => r.max(4),
      }),
    ),
    defineField({
      name: 'closedDates',
      title: 'ימים סגורים (חגים וחופשות)',
      description: 'בימים האלה האתר יבטיח לחזור ביום הפתוח הבא',
      type: 'array',
      of: [defineArrayMember({ type: 'date', options: { dateFormat: 'DD.MM.YYYY' } })],
    }),
    defineField({
      name: 'cutoffMinutes',
      title: 'כמה דקות לפני סוף חלון כבר לא מבטיחים "היום"',
      type: 'number',
      initialValue: 20,
      validation: (r) => r.required().integer().min(0).max(120),
    }),
  ],
  preview: { prepare: () => ({ title: 'שעות מענה' }) },
});
