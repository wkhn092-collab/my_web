import { describe, expect, it } from 'vitest';
import type { Addon } from '@/lib/content/types';
import { ADDONS_SUBMIT_MAX, ADDONS_VISIBLE_MAX, addonsForSiteType, parseAddonIds, resolveAddons } from './addons';

const all: Addon[] = [
  { slug: 'maintenance', title: 'תחזוקה', benefit: 'x', siteTypes: ['landing', 'brand', 'premium3d', 'unsure'] },
  { slug: 'booking', title: 'תורים', benefit: 'x', siteTypes: ['brand', 'unsure'] },
  { slug: 'motion-3d', title: 'תלת-ממד', benefit: 'x', siteTypes: ['landing', 'brand', 'unsure'] },
  { slug: 'logo', title: 'לוגו', benefit: 'x', siteTypes: ['landing', 'brand', 'premium3d', 'unsure'] },
  { slug: 'extra', title: 'עוד', benefit: 'x', siteTypes: ['brand', 'unsure'] },
];

describe('addonsForSiteType', () => {
  it('offers nothing until a site type is chosen', () => {
    expect(addonsForSiteType(all, '')).toEqual([]);
  });

  it('never offers 3D to someone who already picked the 3D site', () => {
    expect(addonsForSiteType(all, 'premium3d').map((a) => a.slug)).toEqual(['maintenance', 'logo']);
  });

  it('keeps the Sanity order and caps the list', () => {
    const shown = addonsForSiteType(all, 'brand');
    expect(shown).toHaveLength(ADDONS_VISIBLE_MAX);
    expect(shown.map((a) => a.slug)).toEqual(['maintenance', 'booking', 'motion-3d', 'logo']);
  });
});

describe('parseAddonIds', () => {
  it('drops malformed and duplicate ids', () => {
    expect(parseAddonIds('logo, logo,<script>,BOOKING,booking')).toEqual(['logo', 'booking']);
  });

  it('caps how many ids are read', () => {
    const raw = Array.from({ length: 20 }, (_, i) => `a${i}`).join(',');
    expect(parseAddonIds(raw)).toHaveLength(ADDONS_SUBMIT_MAX);
  });

  it('treats a missing field as no extras', () => {
    expect(parseAddonIds(undefined)).toEqual([]);
    expect(parseAddonIds('')).toEqual([]);
  });
});

describe('resolveAddons (server)', () => {
  it('ignores ids that do not exist or are inactive', () => {
    expect(resolveAddons(all, ['logo', 'ghost'], 'landing').map((a) => a.slug)).toEqual(['logo']);
  });

  it('ignores extras that do not suit the chosen site type, even if sent', () => {
    expect(resolveAddons(all, ['motion-3d', 'booking', 'logo'], 'premium3d').map((a) => a.slug)).toEqual(['logo']);
  });

  it('ignores extras beyond the visible list', () => {
    expect(resolveAddons(all, ['extra'], 'brand')).toEqual([]);
  });
});
