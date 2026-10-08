import { defineField, defineType } from 'sanity';

export const LEAD_STATUSES = [
  { title: 'חדש', value: 'new' },
  { title: 'דיברתי', value: 'contacted' },
  { title: 'הצעה נשלחה', value: 'quoted' },
  { title: 'נסגר', value: 'won' },
  { title: 'לא רלוונטי', value: 'lost' },
];

/** Lives in the private `leads` dataset only. Written by the server; edited by Avishi in Studio. */
export const lead = defineType({
  name: 'lead',
  title: 'פנייה',
  type: 'document',
  fields: [
    defineField({
      name: 'status',
      title: 'סטטוס',
      type: 'string',
      options: { list: LEAD_STATUSES, layout: 'radio' },
      initialValue: 'new',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'name', title: 'שם', type: 'string', readOnly: true }),
    defineField({ name: 'phone', title: 'טלפון', type: 'string', readOnly: true }),
    defineField({ name: 'email', title: 'מייל', type: 'string', readOnly: true }),
    defineField({ name: 'siteType', title: 'סוג אתר', type: 'string', readOnly: true }),
    defineField({ name: 'goal', title: 'הכי חשוב לו', type: 'string', readOnly: true }),
    defineField({
      name: 'addons',
      title: 'מעניין אותו גם',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
    }),
    defineField({ name: 'message', title: 'הודעה', type: 'text', readOnly: true }),
    defineField({ name: 'createdAt', title: 'התקבלה', type: 'datetime', readOnly: true }),
    defineField({
      name: 'source',
      title: 'מקור',
      type: 'object',
      readOnly: true,
      fields: [
        defineField({ name: 'page', title: 'עמוד', type: 'string' }),
        defineField({ name: 'utmSource', title: 'utm_source', type: 'string' }),
        defineField({ name: 'utmMedium', title: 'utm_medium', type: 'string' }),
        defineField({ name: 'utmCampaign', title: 'utm_campaign', type: 'string' }),
      ],
    }),
    defineField({ name: 'ipHash', title: 'מזהה מגובב (אבטחה)', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'notes', title: 'הערות שלי', type: 'text', rows: 4 }),
  ],
  orderings: [{ title: 'החדשות קודם', name: 'createdAtDesc', by: [{ field: 'createdAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'phone', status: 'status' },
    prepare: ({ title, subtitle, status }) => ({
      title,
      subtitle: `${LEAD_STATUSES.find((s) => s.value === status)?.title ?? ''} · ${subtitle ?? ''}`,
    }),
  },
});
