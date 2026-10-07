'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { OpenDrawerButton } from '@/components/site/OpenDrawerButton';
import { track } from '@/lib/analytics';
import type { Niche, Project } from '@/lib/content/types';
import { useVisitor, useVisitorHydrated } from '@/lib/store/visitor';
import { ProjectCard } from './ProjectCard';

/** Client-side filter over ≤30 projects. On /projects the choice is mirrored to ?niche= so links can be shared. */
export function ProjectsBrowser({
  projects,
  niches,
  syncUrl,
  limit,
  headingLevel = 'h3',
}: {
  projects: Project[];
  niches: Niche[];
  syncUrl: boolean;
  limit?: number;
  headingLevel?: 'h2' | 'h3';
}) {
  const t = useTranslations('works');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useVisitorHydrated();
  const lastFilter = useVisitor((s) => s.lastFilter);
  const setLastFilter = useVisitor((s) => s.setLastFilter);

  const validSlugs = useMemo(() => new Set(niches.map((n) => n.slug)), [niches]);
  const fromUrl = searchParams.get('niche');
  // undefined = the visitor hasn't picked yet on this page view.
  const [chosen, setChosen] = useState<string | null | undefined>(undefined);
  const urlFilter = fromUrl && validSlugs.has(fromUrl) ? fromUrl : null;
  // On /projects, fall back to the last filter when the URL doesn't specify one.
  const restored = syncUrl && hydrated && !fromUrl && lastFilter && validSlugs.has(lastFilter) ? lastFilter : null;
  const active = chosen !== undefined ? chosen : (urlFilter ?? restored);

  const usedNiches = niches.filter((n) => projects.some((p) => p.niche.slug === n.slug) || n.slug === active);
  const filtered = active ? projects.filter((p) => p.niche.slug === active) : projects;
  const shown = limit ? filtered.slice(0, limit) : filtered;

  function choose(slug: string | null) {
    setChosen(slug);
    setLastFilter(slug);
    if (slug) track('filter_niche', { niche: slug });
    if (syncUrl) {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) params.set('niche', slug);
      else params.delete('niche');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }

  const chip = (selected: boolean) =>
    `min-h-11 rounded-full border px-5 py-2 text-sm tracking-wide transition-colors duration-300 ${
      selected ? 'border-gold bg-gold text-abyss' : 'border-pearl/20 text-pearl/85 hover:border-gold/70 hover:text-gold-soft'
    }`;

  return (
    <div>
      <div role="group" aria-label={t('filtersLabel')} className="mb-12 flex flex-wrap gap-2">
        <button type="button" className={chip(active === null)} aria-pressed={active === null} onClick={() => choose(null)}>
          {t('all')}
        </button>
        {usedNiches.map((n) => (
          <button key={n.slug} type="button" className={chip(active === n.slug)} aria-pressed={active === n.slug} onClick={() => choose(n.slug)}>
            {n.title}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="glass rounded-[1.5rem] p-8">
          <p>{t('empty')}</p>
          <OpenDrawerButton location="works-empty" className="btn-primary mt-4">
            {t('emptyCta')}
          </OpenDrawerButton>
        </div>
      ) : (
        <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((project, i) => (
            <li key={project.id} className="rise-in" style={{ '--rise-delay': `${Math.min(i, 5) * 80}ms` } as React.CSSProperties}>
              <ProjectCard project={project} headingLevel={headingLevel} />
            </li>
          ))}
        </ul>
      )}

      {limit && (
        <p className="mt-6">
          <Link href={active ? `/projects?niche=${active}` : '/projects'} className="btn-secondary">
            {t('allWorks')}
          </Link>
        </p>
      )}
    </div>
  );
}
