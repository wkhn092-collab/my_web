import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { PageHeader } from '@/components/site/PageHeader';
import { ProjectsBrowser } from '@/components/works/ProjectsBrowser';
import { RecentlyViewed } from '@/components/works/RecentlyViewed';
import { getSiteContent } from '@/lib/content/site-content';

export const metadata: Metadata = {
  title: 'עבודות',
  description: 'פרויקטים של עומק: אתרי תדמית, דפי נחיתה ואתרי פרימיום, לפי תחום.',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage() {
  const [content, t] = await Promise.all([getSiteContent(), getTranslations()]);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 md:px-10 md:pb-40">
      <PageHeader eyebrow={t('home.worksEyebrow')} title={t('nav.works')} lead={content.home.works.intro} />
      <RecentlyViewed projects={content.projects} />
      <Suspense>
        <ProjectsBrowser projects={content.projects} niches={content.niches} syncUrl headingLevel="h2" />
      </Suspense>
    </div>
  );
}
