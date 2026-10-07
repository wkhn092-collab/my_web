import type { Addon, LeadSiteType } from '@/lib/content/types';

export const ADDON_SLUG = /^[a-z0-9-]{1,40}$/;
/** More than this in the form turns a light question into homework. */
export const ADDONS_VISIBLE_MAX = 4;
export const ADDONS_SUBMIT_MAX = 6;

/** Which extras to offer for a site type: active ones that suit it, in the order set in Sanity. */
export function addonsForSiteType(addons: Addon[], siteType: LeadSiteType | ''): Addon[] {
  if (!siteType) return [];
  return addons.filter((a) => a.siteTypes.includes(siteType)).slice(0, ADDONS_VISIBLE_MAX);
}

/** The form sends one comma-separated field; anything malformed is dropped rather than rejected. */
export function parseAddonIds(raw: string | undefined): string[] {
  if (!raw) return [];
  const ids = raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => ADDON_SLUG.test(id));
  return [...new Set(ids)].slice(0, ADDONS_SUBMIT_MAX);
}

/** Server side: the browser sends IDs only, and the server decides what they mean. Unknown or unsuitable IDs vanish. */
export function resolveAddons(all: Addon[], ids: string[], siteType: LeadSiteType): Addon[] {
  const allowed = new Set(addonsForSiteType(all, siteType).map((a) => a.slug));
  return all.filter((a) => ids.includes(a.slug) && allowed.has(a.slug));
}
