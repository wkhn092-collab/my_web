import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BidiText } from '@/components/BidiText';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { BackNav } from '@/components/site/BackNav';
import { OpenDrawerButton } from '@/components/site/OpenDrawerButton';
import { LiveLink } from '@/components/works/LiveLink';
import { ProjectArt } from '@/components/works/ProjectArt';
import { RememberProject } from '@/components/works/RecentlyViewed';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_TYPE_LABEL, leadSiteTypeFor } from '@/lib/content/labels';
import { getProjectBySlug } from '@/lib/content/site-content';
import { publicEnv } from '@/lib/env.public';
import { formatDate } from '@/lib/format';
import { projectLd } from '@/lib/seo/structured-data';

const SLUG = /^[a-z0-9-]{1,64}$/;

async function loadProject(slug: string) {
  return SLUG.test(slug) ? getProjectBySlug(slug) : null;
}

export async function generateMetadata({ params }: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) notFound();
  const [t, requestHeaders] = await Promise.all([getTranslations(), headers()]);

  const hasStory = Boolean(project.challenge || project.solution);

  return (
    <article className="pb-24 md:pb-40">
      <JsonLd nonce={requestHeaders.get('x-nonce') ?? undefined} data={projectLd(project, publicEnv.siteUrl)} />
      <RememberProject id={project.id} />
      <div className="mx-auto max-w-7xl px-5 pt-10 md:px-10 md:pt-20">
        <BackNav label={t('project.back')} fallbackHref="/projects" />
        <p className="rise-in mt-6 text-xs tracking-[0.25em] text-gold md:mt-10">
          {project.niche.title} · {SITE_TYPE_LABEL[project.siteType]}
          {project.isConcept && <> · {t('common.conceptLabel')}</>}
        </p>
        <h1 className="mt-4 text-[clamp(2.75rem,9vw,8rem)] font-light leading-[0.95] md:mt-5">
          <SplitText text={project.title} mode="now" delayMs={150} />
        </h1>
        <div className="rise-in mt-6 flex flex-col gap-5 md:mt-8 md:flex-row md:items-end md:justify-between md:gap-6" style={{ '--rise-delay': '400ms' } as React.CSSProperties}>
          <div className="max-w-2xl">
            <p className="text-lg leading-relaxed text-pearl/85 md:text-2xl">{project.summary}</p>
            {project.isConcept && <p className="mt-3 text-base text-mist">{t('common.conceptTooltip')}</p>}
          </div>
          {project.liveUrl && <LiveLink href={project.liveUrl} slug={project.slug} />}
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[100rem] px-3 md:mt-14 md:px-6">
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-ink ring-1 ring-pearl/10 md:aspect-[21/9] md:rounded-[2rem]"
          style={{ viewTransitionName: `project-${project.slug}` }}
        >
          <ProjectArt project={project} sizes="100vw" priority />
        </div>
      </div>

      {hasStory && (
        <div className="mx-auto mt-12 grid max-w-7xl gap-10 px-5 md:mt-24 md:gap-16 md:px-10 lg:grid-cols-2">
          {project.challenge && (
            <Reveal as="section">
              <p className="eyebrow">01</p>
              <h2 className="mt-4 text-3xl font-light md:text-5xl">{t('project.challenge')}</h2>
              <p className="mt-4 text-lg leading-relaxed text-pearl/80 md:mt-6">{project.challenge}</p>
            </Reveal>
          )}
          {project.solution && (
            <Reveal as="section" delay={120}>
              <p className="eyebrow">02</p>
              <h2 className="mt-4 text-3xl font-light md:text-5xl">{t('project.solution')}</h2>
              <p className="mt-4 text-lg leading-relaxed text-pearl/80 md:mt-6">{project.solution}</p>
            </Reveal>
          )}
        </div>
      )}

      {project.metrics.length > 0 && (
        <section className="mx-auto mt-12 max-w-7xl px-5 md:mt-24 md:px-10">
          <h2 className="text-3xl font-light md:text-5xl">{t('project.metrics')}</h2>
          <dl className="mt-6 grid gap-px overflow-hidden rounded-[1.5rem] bg-pearl/10 sm:grid-cols-2 md:mt-10 lg:grid-cols-4">
            {project.metrics.map((metric) => (
              <div key={`${metric.label}-${metric.measuredAt}`} className="bg-abyss p-6 md:p-8">
                <dt className="text-sm text-mist">{metric.label}</dt>
                <dd className="mt-3 font-display text-4xl font-light text-gilded md:text-5xl">
                  <bdi>{metric.value}</bdi>
                </dd>
                <dd className="mt-3 text-sm text-mist">
                  <BidiText text={t('works.measured', { date: formatDate(metric.measuredAt), source: metric.source })} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="mx-auto mt-10 max-w-7xl px-5 md:mt-24 md:px-10">
        <div className="glass flex flex-col items-stretch gap-5 rounded-[1.5rem] p-5 md:flex-row md:items-center md:justify-between md:gap-8 md:rounded-[2rem] md:p-14">
          <p className="max-w-xl font-display text-2xl font-light leading-snug md:text-4xl">{t('project.cta')}</p>
          <OpenDrawerButton siteType={leadSiteTypeFor(project.siteType)} location={`project-${project.slug}`}>
            {t('common.ctaTalk')}
          </OpenDrawerButton>
        </div>
      </div>
    </article>
  );
}
