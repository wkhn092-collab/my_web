'use client';

import { defineConfig } from 'sanity';
import { presentationTool } from 'sanity/presentation';
import { structureTool, type StructureResolver } from 'sanity/structure';
import { requestTestimonialAction } from './src/sanity/actions/requestTestimonial';
import { LEAD_STATUSES } from './src/sanity/schemaTypes/lead';
import { TESTIMONIAL_STATUSES } from './src/sanity/schemaTypes/testimonial';
import { contentSchemaTypes, leadSchemaTypes, SINGLETONS } from './src/sanity/schemaTypes';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'missing-project-id';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const leadsDataset = process.env.NEXT_PUBLIC_SANITY_LEADS_DATASET || 'leads';

const singletonIds = new Set<string>(SINGLETONS);

const SINGLETON_TITLES: Record<(typeof SINGLETONS)[number], string> = {
  siteSettings: 'פרטי העסק',
  hours: 'שעות מענה',
  announcement: 'באנר עליון',
  homePage: 'עמוד הבית',
  aboutPage: 'עמוד מי אני',
};

const contentStructure: StructureResolver = (S) =>
  S.list()
    .title('עומק')
    .items([
      ...SINGLETONS.map((id) =>
        S.listItem().title(SINGLETON_TITLES[id]).id(id).child(S.document().schemaType(id).documentId(id)),
      ),
      S.divider(),
      S.documentTypeListItem('project').title('פרויקטים'),
      S.documentTypeListItem('niche').title('תחומים'),
      S.documentTypeListItem('service').title('שירותים'),
      S.documentTypeListItem('addon').title('תוספות בטופס'),
      S.listItem()
        .title('המלצות')
        .id('testimonials')
        .child(
          S.list()
            .title('המלצות')
            .items(
              TESTIMONIAL_STATUSES.map((status) =>
                S.listItem()
                  .title(status.title)
                  .id(`testimonials-${status.value}`)
                  .child(
                    S.documentList()
                      .title(status.title)
                      .schemaType('testimonial')
                      .filter('_type == "testimonial" && status == $status')
                      .params({ status: status.value }),
                  ),
              ),
            ),
        ),
      S.documentTypeListItem('faq').title('שאלות נפוצות'),
      S.divider(),
      S.documentTypeListItem('legalPage').title('עמודים משפטיים'),
    ]);

const leadsStructure: StructureResolver = (S) =>
  S.list()
    .title('פניות')
    .items([
      ...LEAD_STATUSES.map((status) =>
        S.listItem()
          .title(status.title)
          .id(`leads-${status.value}`)
          .child(
            S.documentList()
              .title(status.title)
              .schemaType('lead')
              .filter('_type == "lead" && status == $status')
              .params({ status: status.value })
              .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
          ),
      ),
      S.divider(),
      S.documentTypeListItem('lead').title('כל הפניות'),
      S.divider(),
      S.documentTypeListItem('testimonialConsent').title('אישורי פרסום המלצות'),
    ]);

export default defineConfig([
  {
    name: 'content',
    title: 'עומק · תוכן',
    basePath: '/studio/content',
    projectId,
    dataset,
    plugins: [
      structureTool({ structure: contentStructure }),
      presentationTool({ previewUrl: { previewMode: { enable: '/api/draft-mode/enable' } } }),
    ],
    schema: {
      types: contentSchemaTypes,
      templates: (templates) => templates.filter(({ schemaType }) => !singletonIds.has(schemaType)),
    },
    document: {
      actions: (actions, { schemaType }) =>
        singletonIds.has(schemaType)
          ? actions.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
          : actions,
    },
  },
  {
    name: 'leads',
    title: 'עומק · פניות (פרטי)',
    basePath: '/studio/leads',
    projectId,
    dataset: leadsDataset,
    plugins: [structureTool({ structure: leadsStructure })],
    // Leads are created only by the server; consent records are created by hand.
    schema: { types: leadSchemaTypes, templates: (templates) => templates.filter(({ schemaType }) => schemaType === 'testimonialConsent') },
    document: {
      actions: (actions, { schemaType }) => {
        const allowed = actions.filter(({ action }) => action && ['publish', 'discardChanges', 'delete'].includes(action));
        return schemaType === 'lead' ? [...allowed, requestTestimonialAction] : allowed;
      },
    },
  },
]);
