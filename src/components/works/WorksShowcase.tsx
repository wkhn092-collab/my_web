'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { SplitText } from '@/components/SplitText';
import { SITE_TYPE_LABEL } from '@/lib/content/labels';
import type { Project } from '@/lib/content/types';
import { prefersReducedMotion } from '@/lib/motion/lenis';
import { ProjectArt } from './ProjectArt';

const PIN_QUERY = '(min-width: 1024px)';

/**
 * Home gallery. On large screens the section pins and the row of projects glides sideways with the scroll;
 * elsewhere (and before JavaScript) it is a native swipe row with snap points.
 */
export function WorksShowcase({ projects, title, intro, eyebrow }: { projects: Project[]; title: string; intro: string; eyebrow: string }) {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia(PIN_QUERY).matches) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      const section = sectionRef.current;
      const track = trackRef.current;
      if (cancelled || !section || !track) return;
      gsap.registerPlugin(ScrollTrigger);
      section.classList.add('is-pinned');

      const ctx = gsap.context(() => {
        const distance = () => Math.max(0, track.scrollWidth - section.clientWidth);
        const scrollTrigger = {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 0.9,
          invalidateOnRefresh: true,
        };
        // RTL: the row starts on the right and overflows to the left, so it travels in +x.
        gsap.to(track, { x: () => distance(), ease: 'none', scrollTrigger: { ...scrollTrigger, pin: true, anticipatePin: 1 } });
        if (progressRef.current) gsap.fromTo(progressRef.current, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger });
        gsap.utils.toArray<HTMLElement>('[data-art]', track).forEach((art, i) => {
          gsap.fromTo(art, { xPercent: -6 - i }, { xPercent: 6 + i, ease: 'none', scrollTrigger });
        });
      }, section);
      ScrollTrigger.refresh();

      revert = () => {
        ctx.revert();
        section.classList.remove('is-pinned');
      };
    })();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="works"
      aria-labelledby="works-title"
      className="group/works relative overflow-hidden py-24 md:py-32 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0 [&.is-pinned_.works-scroller]:overflow-visible"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-10">
        <div className="max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="works-title" className="mt-5 text-5xl font-light md:text-7xl lg:text-6xl xl:text-7xl">
            <SplitText text={title} />
          </h2>
          <p className="mt-5 max-w-xl text-base text-mist md:text-lg lg:[@media(max-height:820px)]:hidden">{intro}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-mist">
          <bdi className="font-display text-3xl text-pearl">{String(projects.length).padStart(2, '0')}</bdi>
          <span>{t('home.projectsCount')}</span>
        </div>
      </div>

      <div className="works-scroller mt-12 overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:mt-10 [&::-webkit-scrollbar]:hidden">
        <ul ref={trackRef} className="flex w-max snap-x snap-mandatory gap-5 px-5 pb-4 md:gap-8 md:px-10">
          {projects.map((project, i) => (
            <li key={project.id} className="w-[82vw] shrink-0 snap-center sm:w-[58vw] lg:w-[34vw]">
              <article className="group relative" data-cursor="view">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-ink ring-1 ring-pearl/10 lg:aspect-auto lg:h-[clamp(12rem,calc(100vh-31rem),34rem)]">
                  <div data-art className="absolute -inset-x-[8%] inset-y-0">
                    <ProjectArt project={project} sizes="(min-width: 1024px) 34vw, 82vw" />
                  </div>
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
                    <bdi className="font-display text-lg text-pearl/80">{String(i + 1).padStart(2, '0')}</bdi>
                    {project.isConcept && (
                      <span className="glass rounded-full px-3 py-1 text-xs text-pearl/90" title={t('common.conceptTooltip')}>
                        {t('common.conceptLabel')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.2em] text-gold">
                      {project.niche.title} · {SITE_TYPE_LABEL[project.siteType]}
                    </p>
                    <h3 className="mt-2 text-3xl font-light md:text-4xl">
                      <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {project.title}
                      </Link>
                    </h3>
                  </div>
                  <span
                    className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-pearl/20 text-lg transition-all duration-500 group-hover:-rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-abyss"
                    aria-hidden="true"
                  >
                    ←
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 max-w-md lg:line-clamp-1 text-base text-mist">{project.summary}</p>
              </article>
            </li>
          ))}
          <li className="flex w-[70vw] shrink-0 snap-center items-center justify-center sm:w-[40vw] lg:w-[24vw]">
            <Link
              href="/projects"
              data-magnetic=""
              className="group flex aspect-square w-56 flex-col items-center justify-center gap-2 rounded-full border border-pearl/20 text-center transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-abyss md:w-64"
            >
              <span className="font-display text-3xl">{t('works.allWorks')}</span>
              <span aria-hidden="true" className="text-2xl transition-transform duration-500 group-hover:-translate-x-2">
                ←
              </span>
            </Link>
          </li>
        </ul>
      </div>

      <div className="mx-auto mt-6 hidden w-full max-w-7xl px-10 lg:block" aria-hidden="true">
        <div className="h-px w-full bg-pearl/10">
          <span ref={progressRef} className="block h-px w-full origin-right scale-x-0 bg-gold" />
        </div>
      </div>
    </section>
  );
}
