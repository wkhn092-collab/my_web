import 'server-only';
import { draftMode } from 'next/headers';
import { cache } from 'react';
import type { PortableTextBlock } from '@portabletext/react';
import { LEGAL_DRAFTS, draftToPortableText } from '@/content/legal-drafts';
import {
  LOCAL_COVERS,
  SEED_ABOUT,
  SEED_ADDONS,
  SEED_FAQS,
  SEED_HOME,
  SEED_HOURS,
  SEED_NICHES,
  SEED_PROJECTS,
  SEED_SERVICES,
  SEED_SETTINGS,
  SEED_TESTIMONIALS,
} from '@/content/seed-data';
import { isConfigured } from '@/lib/env.server';
import { logError } from '@/lib/logger';
import { getSanityPreviewClient, getSanityPublicClient } from '@/sanity/lib/client';
import { LEGAL_PAGE_QUERY, SITE_CONTENT_QUERY } from '@/sanity/lib/queries';
import { siteContentSchema } from './schema';
import type { LegalPage, Project, SiteContent } from './types';

export const CONTENT_CACHE_TAG = 'sanity:content';

const withLocalCover = (project: Project): Project =>
  project.cover || !LOCAL_COVERS[project.slug] ? project : { ...project, cover: LOCAL_COVERS[project.slug] };

/**
 * Seed owns the portfolio demos (live URLs, titles, new entries). Studio can still add extras
 * that are not in seed; matching slugs take cover/metrics from CMS when present.
 */
const mergePortfolioProjects = (fromCms: Project[]): Project[] => {
  // First CMS doc wins per slug — Studio sometimes keeps stale duplicates.
  const cmsBySlug = new Map<string, Project>();
  for (const p of fromCms) {
    if (!cmsBySlug.has(p.slug)) cmsBySlug.set(p.slug, p);
  }
  const seedSlugs = new Set(SEED_PROJECTS.map((p) => p.slug));
  const merged = SEED_PROJECTS.map((seed) => {
    const cms = cmsBySlug.get(seed.slug);
    if (!cms) return withLocalCover(seed);
    return withLocalCover({
      ...cms,
      title: seed.title,
      summary: seed.summary,
      liveUrl: seed.liveUrl ?? cms.liveUrl,
      siteType: seed.siteType,
      tier: seed.tier,
      isConcept: seed.isConcept,
      niche: seed.niche,
    });
  });
  for (const leftover of cmsBySlug.values()) {
    if (seedSlugs.has(leftover.slug)) continue;
    merged.push(withLocalCover(leftover));
  }
  return merged;
};

const SEED_CONTENT: SiteContent = {
  settings: SEED_SETTINGS,
  hours: SEED_HOURS,
  announcement: null,
  home: SEED_HOME,
  about: SEED_ABOUT,
  services: SEED_SERVICES,
  niches: SEED_NICHES,
  projects: SEED_PROJECTS.map(withLocalCover),
  faqs: SEED_FAQS,
  addons: SEED_ADDONS,
  testimonials: SEED_TESTIMONIALS,
  legalPages: LEGAL_DRAFTS.map(({ slug, title }) => ({ slug, title })),
};

async function isPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

async function fetchContent<T>(query: string, params: Record<string, string>): Promise<T> {
  if (await isPreview()) {
    return getSanityPreviewClient().fetch<T>(query, params, { cache: 'no-store' });
  }
  return getSanityPublicClient().fetch<T>(query, params, { next: { revalidate: 86400, tags: [CONTENT_CACHE_TAG] } });
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!isConfigured.sanity()) return SEED_CONTENT;
  try {
    const raw = await fetchContent<unknown>(SITE_CONTENT_QUERY, {});
    const parsed = siteContentSchema.safeParse(raw);
    if (!parsed.success) {
      logError('content', new Error('Sanity content failed validation'), {
        issues: parsed.error.issues
          .slice(0, 5)
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join(' | '),
      });
      throw new Error('Content unavailable');
    }
    const published = new Set(parsed.data.legalPages.map((p) => p.slug));
    const missingLegal = LEGAL_DRAFTS.filter((d) => !published.has(d.slug)).map(({ slug, title }) => ({ slug, title }));
    const faqById = new Map(parsed.data.faqs.map((f) => [f.id, f]));
    const faqs = SEED_FAQS.map((seed) => {
      const cms = faqById.get(seed.id);
      faqById.delete(seed.id);
      return cms ? { ...cms, question: seed.question, answer: seed.answer } : seed;
    }).concat([...faqById.values()]);

    return {
      ...parsed.data,
      // Seed owns the hero headline line-breaks (desktop two-line lockup).
      home: {
        ...parsed.data.home,
        hero: { ...parsed.data.home.hero, title: SEED_HOME.hero.title },
      },
      // Seed owns FAQ copy so price numbers never reappear from an old Studio draft.
      faqs,
      projects: mergePortfolioProjects(parsed.data.projects),
      legalPages: [...parsed.data.legalPages, ...missingLegal],
    };
  } catch (error) {
    logError('content', error);
    throw new Error('Content unavailable');
  }
});

export const isUsingSeedContent = () => !isConfigured.sanity();

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { projects } = await getSiteContent();
  return projects.find((p) => p.slug === slug) ?? null;
}

const LEGAL_SLUG = /^[a-z0-9-]{1,32}$/;

function legalDraft(slug: string): LegalPage | null {
  const draft = LEGAL_DRAFTS.find((d) => d.slug === slug);
  return draft ? { slug: draft.slug, title: draft.title, updatedAt: draft.updatedAt, body: draftToPortableText(draft) } : null;
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  if (!LEGAL_SLUG.test(slug)) return null;
  if (!isConfigured.sanity()) return legalDraft(slug);
  try {
    const page = await fetchContent<{ slug: string; title: string; updatedAt: string; body: PortableTextBlock[] } | null>(
      LEGAL_PAGE_QUERY,
      { slug },
    );
    return page && Array.isArray(page.body) ? page : legalDraft(slug);
  } catch (error) {
    logError('content.legal', error, { slug });
    throw new Error('Content unavailable');
  }
}
