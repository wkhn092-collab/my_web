import { aboutPage } from './aboutPage';
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

export const contentSchemaTypes = [siteSettings, hours, announcement, homePage, aboutPage, service, niche, project, faq, legalPage];
export const leadSchemaTypes = [lead];

export const SINGLETONS = ['siteSettings', 'hours', 'announcement', 'homePage', 'aboutPage'] as const;
