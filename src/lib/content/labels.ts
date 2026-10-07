import type { LeadSiteType, SiteType } from './types';

export const SITE_TYPE_LABEL: Record<SiteType, string> = {
  landing: 'דף נחיתה',
  brand: 'אתר תדמית',
  premium3d: 'אתר פרימיום עם תלת-ממד',
  store: 'חנות',
};

export const LEAD_SITE_TYPE_LABEL: Record<LeadSiteType, string> = {
  landing: 'דף נחיתה',
  brand: 'אתר תדמית',
  premium3d: 'אתר פרימיום עם תלת-ממד',
  unsure: 'עדיין לא ברור לי',
};

export function leadSiteTypeFor(siteType: SiteType): LeadSiteType {
  return siteType === 'store' ? 'unsure' : siteType;
}
