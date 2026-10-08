import type { PortableTextBlock } from '@portabletext/react';
import type { ReplyHours } from '@/lib/domain/reply-window';

export const SITE_TYPES = ['landing', 'brand', 'premium3d', 'store'] as const;
export type SiteType = (typeof SITE_TYPES)[number];

export const LEAD_SITE_TYPES = ['landing', 'brand', 'premium3d', 'unsure'] as const;
export type LeadSiteType = (typeof LEAD_SITE_TYPES)[number];
export const LEAD_GOALS = ['premium', 'leads', 'questions'] as const;
export type LeadGoal = (typeof LEAD_GOALS)[number];

export type SiteSettings = {
  brandName: string;
  legalName?: string;
  businessType?: string;
  businessNumber?: string;
  city: string;
  remoteNote: string;
  phoneE164: string;
  whatsappE164: string;
  email: string;
  accessibilityCoordinator: { name: string; phoneE164: string; email: string };
};

export type Announcement = { active: boolean; text: string; href?: string; endsAt?: string };

export type HomePage = {
  hero: { title: string; lead: string; reassurance: string };
  works: { title: string; intro: string };
  depth: { title: string; layers: { title: string; body: string }[] };
  services: { title: string; note: string };
  about: { text: string };
  faq: { title: string };
  closing: { title: string; privacyNote: string };
};

export type AboutPage = {
  title: string;
  paragraphs: string[];
  processTitle: string;
  process: string;
};

export type Service = {
  id: string;
  title: string;
  summary: string;
  includes: string;
  siteType: LeadSiteType;
  priceFrom?: number;
  ctaLabel: string;
};

export type Niche = { slug: string; title: string };

export type Metric = { label: string; value: string; measuredAt: string; source: string };

export type ProjectImage = { url: string; alt: string; width: number; height: number; lqip?: string };

export type Project = {
  id: string;
  slug: string;
  title: string;
  niche: Niche;
  siteType: SiteType;
  tier: 1 | 2 | 3;
  isConcept: boolean;
  liveUrl?: string;
  summary: string;
  challenge?: string;
  solution?: string;
  cover?: ProjectImage;
  metrics: Metric[];
};

export type Faq = { id: string; question: string; answer: string };

/** An extra the customer can ask about in the lead form. No price on purpose: prices come in the written quote. */
export type Addon = { slug: string; title: string; benefit: string; siteTypes: LeadSiteType[] };

/** Published only with status "approved" and a recorded consent date (the consent proof itself lives in `leads`). */
export type Testimonial = {
  id: string;
  fullName: string;
  role?: string;
  quote: string;
  rating?: number;
  photo?: ProjectImage;
  project?: { title: string; slug: string; isConcept: boolean };
};

export type LegalPage = { slug: string; title: string; updatedAt: string; body: PortableTextBlock[] };

export type SiteContent = {
  settings: SiteSettings;
  hours: ReplyHours;
  announcement: Announcement | null;
  home: HomePage;
  about: AboutPage;
  services: Service[];
  niches: Niche[];
  projects: Project[];
  faqs: Faq[];
  addons: Addon[];
  testimonials: Testimonial[];
  legalPages: Pick<LegalPage, 'slug' | 'title'>[];
};
