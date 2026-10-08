import { SITE_TYPE_LABEL } from '@/lib/content/labels';
import { getProjectBySlug } from '@/lib/content/site-content';
import { OG_SIZE, renderOgCard } from '@/lib/og/card';

export const alt = 'פרויקט מסטודיו עומק';
export const size = OG_SIZE;
export const contentType = 'image/png';

const SLUG = /^[a-z0-9-]{1,64}$/;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = SLUG.test(slug) ? await getProjectBySlug(slug) : null;
  if (!project) return renderOgCard({ title: 'אתרים עם עומק.', eyebrow: 'סטודיו לאתרים' });
  return renderOgCard({
    title: project.title,
    eyebrow: `${project.niche.title} · ${SITE_TYPE_LABEL[project.siteType]}`,
    badge: project.isConcept ? 'פרויקט קונספט' : undefined,
    image: project.cover?.url,
  });
}
