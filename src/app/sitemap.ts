import type { MetadataRoute } from 'next';
import { getSiteContent } from '@/lib/content/site-content';
import { publicEnv } from '@/lib/env.public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, legalPages } = await getSiteContent();
  const base = publicEnv.siteUrl;
  return [
    { url: `${base}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/projects`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, changeFrequency: 'yearly', priority: 0.6 },
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...legalPages.map((p) => ({ url: `${base}/legal/${p.slug}`, changeFrequency: 'yearly' as const, priority: 0.2 })),
  ];
}
