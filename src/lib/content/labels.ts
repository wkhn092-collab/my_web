import type { LeadGoal, LeadSiteType, SiteType } from './types';

export const LEAD_GOAL_LABEL: Record<LeadGoal, string> = {
  premium: 'להיראות כמו הגדולים בתחום',
  leads: 'לקבל יותר פניות',
  questions: 'להפסיק לענות על אותן שאלות',
};

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
