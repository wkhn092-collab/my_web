import { aboutPage } from './aboutPage';
import { addon } from './addon';
import { announcement } from './announcement';
import { faq } from './faq';
import { homePage } from './homePage';
import { hours } from './hours';
import { lead } from './lead';
import { legalPage } from './legalPage';
import { niche } from './niche';
import { project } from './project';
import { service } from './service';
import { siteSettings } from './siteSettings';
import { testimonial } from './testimonial';
import { testimonialConsent } from './testimonialConsent';

export const contentSchemaTypes = [
  siteSettings,
  hours,
  announcement,
  homePage,
  aboutPage,
  service,
  addon,
  niche,
  project,
  testimonial,
  faq,
  legalPage,
];
export const leadSchemaTypes = [lead, testimonialConsent];

export const SINGLETONS = ['siteSettings', 'hours', 'announcement', 'homePage', 'aboutPage'] as const;
