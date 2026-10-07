'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import type { Project } from '@/lib/content/types';
import { useVisitor, useVisitorHydrated } from '@/lib/store/visitor';
import { ProjectCard } from './ProjectCard';

export function RecentlyViewed({ projects, excludeId }: { projects: Project[]; excludeId?: string }) {
  const t = useTranslations('works');
  const hydrated = useVisitorHydrated();
  const recent = useVisitor((s) => s.recentProjects);
  const clearRecent = useVisitor((s) => s.clearRecent);
  if (!hydrated) return null;

  const byId = new Map(projects.map((p) => [p.id, p]));
  const items = recent.filter((id) => id !== excludeId).map((id) => byId.get(id)).filter((p): p is Project => Boolean(p));
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="recent-title" className="mb-16">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id="recent-title" className="text-2xl font-light">
          {t('resume')}
        </h2>
        <button type="button" className="link text-base" onClick={clearRecent}>
          {t('clear')}
        </button>
      </div>
      <ul className="flex snap-x gap-6 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {items.map((project) => (
          <li key={project.id} className="w-72 shrink-0 snap-start">
            <ProjectCard project={project} morph={false} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RememberProject({ id }: { id: string }) {
  const remember = useVisitor((s) => s.rememberProject);
  const hydrated = useVisitorHydrated();
  useEffect(() => {
    if (hydrated) remember(id);
  }, [hydrated, id, remember]);
  return null;
}
