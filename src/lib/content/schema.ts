import { z } from 'zod';
import { LEAD_SITE_TYPES, SITE_TYPES } from './types';

const str = (max: number) => z.string().trim().min(1).max(max);
const optStr = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v || undefined);
const phone = z.string().regex(/^\+972\d{8,9}$/);
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const range = z.object({ from: hhmm, to: hhmm });
const day = z
  .array(range)
  .nullish()
  .transform((v) => v ?? []);

export const settingsSchema = z.object({
  brandName: str(40),
  legalName: optStr(80),
  businessType: optStr(40),
  businessNumber: optStr(12),
  city: str(40),
  remoteNote: optStr(60).transform((v) => v ?? ''),
  phoneE164: phone,
  whatsappE164: phone,
  email: z.email(),
  accessibilityCoordinator: z.object({ name: str(60), phoneE164: phone, email: z.email() }),
});

export const hoursSchema = z
  .object({
    day0: day,
    day1: day,
    day2: day,
    day3: day,
    day4: day,
    day5: day,
    day6: day,
    closedDates: z
      .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .nullish()
      .transform((v) => v ?? []),
    cutoffMinutes: z.number().int().min(0).max(120).nullish(),
  })
  .transform((h) => ({
    days: [h.day0, h.day1, h.day2, h.day3, h.day4, h.day5, h.day6],
    closedDates: h.closedDates,
    cutoffMinutes: h.cutoffMinutes ?? 20,
  }));

const announcementSchema = z
  .object({ active: z.boolean(), text: str(120), href: optStr(300), endsAt: optStr(40) })
  .nullable();

const homeSchema = z.object({
  hero: z.object({ title: str(40), lead: str(200), reassurance: str(80) }),
  works: z.object({ title: str(60), intro: str(320) }),
  depth: z.object({ title: str(60), layers: z.array(z.object({ title: str(60), body: str(320) })).length(3) }),
  services: z.object({ title: str(60), note: str(120) }),
  about: z.object({ text: str(300) }),
  faq: z.object({ title: str(60) }),
  closing: z.object({ title: str(60), privacyNote: str(120) }),
});

const aboutSchema = z.object({
  title: str(80),
  paragraphs: z.array(str(600)).min(1).max(6),
  processTitle: str(60),
  process: str(800),
});

const nicheSchema = z.object({ slug: str(32), title: str(24) });

export const projectSchema = z.object({
  id: str(120),
  slug: z.string().regex(/^[a-z0-9-]{1,48}$/),
  title: str(40),
  niche: nicheSchema,
  siteType: z.enum(SITE_TYPES),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  isConcept: z.boolean(),
  liveUrl: z
    .url({ protocol: /^https$/ })
    .nullish()
    .transform((v) => v || undefined),
  summary: str(200),
  challenge: optStr(600),
  solution: optStr(800),
  cover: z
    .object({
      url: z.url({ protocol: /^https$/, hostname: /^cdn\.sanity\.io$/ }),
      alt: str(140),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      lqip: optStr(4000),
    })
    .nullish()
    .transform((v) => v ?? undefined),
  metrics: z.array(z.object({ label: str(24), value: str(12), measuredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), source: str(60) })),
});

const sanityImage = z.object({
  url: z.url({ protocol: /^https$/, hostname: /^cdn\.sanity\.io$/ }),
  alt: str(140),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  lqip: optStr(4000),
});

export const addonSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,40}$/),
  title: str(40),
  benefit: str(140),
  siteTypes: z.array(z.enum(LEAD_SITE_TYPES)).min(1),
});

export const testimonialSchema = z.object({
  id: str(120),
  fullName: str(60),
  role: optStr(80),
  quote: str(400),
  rating: z.number().int().min(1).max(5).nullish().transform((v) => v ?? undefined),
  photo: sanityImage.nullish().transform((v) => v ?? undefined),
  project: z
    .object({ title: str(40), slug: z.string().regex(/^[a-z0-9-]{1,48}$/), isConcept: z.boolean() })
    .nullish()
    .transform((v) => v ?? undefined),
});

/** Arrays added after launch arrive as null from older datasets; treat that as empty. */
const list = <T extends z.ZodType>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform((v) => v ?? []);

export const siteContentSchema = z.object({
  settings: settingsSchema,
  hours: hoursSchema,
  announcement: announcementSchema,
  home: homeSchema,
  about: aboutSchema,
  services: z.array(
    z.object({
      id: str(120),
      title: str(40),
      summary: str(240),
      includes: str(240),
      siteType: z.enum(LEAD_SITE_TYPES),
      priceFrom: z.number().int().min(0).nullish().transform((v) => v ?? undefined),
      ctaLabel: str(40),
    }),
  ),
  niches: z.array(nicheSchema),
  projects: z.array(projectSchema),
  faqs: z.array(z.object({ id: str(120), question: str(80), answer: str(600) })),
  addons: list(addonSchema),
  testimonials: list(testimonialSchema),
  legalPages: z.array(z.object({ slug: str(32), title: str(60) })),
});
