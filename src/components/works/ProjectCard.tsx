import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { SITE_TYPE_LABEL } from '@/lib/content/labels';
import type { Project } from '@/lib/content/types';
import { formatDate } from '@/lib/format';
import { ProjectArt } from './ProjectArt';

export function ProjectCard({
  project,
  headingLevel = 'h3',
  morph = true,
}: {
  project: Project;
  headingLevel?: 'h2' | 'h3';
  /** view-transition names must be unique per page: only one card per project may morph. */
  morph?: boolean;
}) {
  const t = useTranslations();
  const tooltipId = useId();
  const Heading = headingLevel;
  const speed = project.metrics.find((m) => /ביצוע|מהירות|performance/i.test(m.label)) ?? project.metrics[0];

  return (
    <article className="group relative flex h-full flex-col" data-cursor="view">
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-ink ring-1 ring-pearl/10 transition-shadow duration-700 group-hover:shadow-[0_30px_80px_-30px_rgb(201_166_107/0.35)] group-has-[a:focus-visible]:ring-2 group-has-[a:focus-visible]:ring-gold-soft"
        style={morph ? { viewTransitionName: `project-${project.slug}` } : undefined}
      >
        <ProjectArt project={project} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
      </div>
      <div className="flex flex-1 flex-col gap-2 pt-5">
        <p className="text-xs tracking-[0.2em] text-gold">
          {project.niche.title} · {SITE_TYPE_LABEL[project.siteType]}
        </p>
        <Heading className="text-3xl font-light">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {project.title}
          </Link>
        </Heading>
        <p className="text-base text-mist">{project.summary}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-sm">
          {project.isConcept && (
            <span className="relative z-10">
              <span
                tabIndex={0}
                aria-describedby={tooltipId}
                className="peer glass inline-block cursor-help rounded-full px-3 py-1 text-xs text-pearl/90"
              >
                {t('common.conceptLabel')}
              </span>
              <span
                id={tooltipId}
                role="tooltip"
                className="pointer-events-none absolute bottom-full right-0 mb-2 w-60 rounded-lg bg-pearl px-3 py-2 text-abyss opacity-0 transition-opacity duration-200 peer-hover:opacity-100 peer-focus:opacity-100"
              >
                {t('common.conceptTooltip')}
              </span>
            </span>
          )}
          {speed && (
            <span className="text-mist">
              {speed.label} <bdi>{speed.value}</bdi> · <bdi>{formatDate(speed.measuredAt)}</bdi>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
