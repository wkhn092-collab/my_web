'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { SplitText } from '@/components/SplitText';
import { ProductStage } from '@/components/scene/ProductStage';
import { OpenDrawerButton } from '@/components/site/OpenDrawerButton';
import { prefersReducedMotion } from '@/lib/motion/lenis';
import { loadScrollMotion } from '@/lib/motion/scroll-motion';

const PIN_QUERY = '(min-width: 1024px)';

type Fact = { title: string; body: string };

/**
 * A live product demo: the perfume bottle turns once as the section scrolls by (pinned on large screens, with the
 * facts lighting up in turn) and can be dragged. Labelled as a demo product, not a real brand.
 */
export function ProductShowcase({ eyebrow }: { eyebrow: string }) {
  const t = useTranslations('showcase');
  const facts = t.raw('facts') as Fact[];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia(PIN_QUERY).matches) return lightFactsInView(sectionRef.current);
    let cancelled = false;
    let revert: (() => void) | undefined;

    (async () => {
      const { gsap, ScrollTrigger } = await loadScrollMotion();
      const section = sectionRef.current;
      if (cancelled || !section) return;
      const ctx = gsap.context(() => {
        const items = gsap.utils.toArray<HTMLElement>('[data-fact-list] [data-fact]');
        const setActive = (index: number) => items.forEach((item, i) => item.toggleAttribute('data-active', i <= index));
        setActive(-1);
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.4}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setActive(Math.floor(self.progress * (items.length + 0.6)) - 1),
        });
        gsap.fromTo('[data-showcase-line]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${window.innerHeight * 1.4}`, scrub: 0.6 } });
      }, section);
      section.classList.add('is-pinned');
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
      id="showcase"
      aria-labelledby="showcase-title"
      className="group/showcase relative isolate overflow-hidden py-24 md:py-32 lg:flex lg:h-screen lg:items-center lg:py-0"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_30%_55%,rgb(201_166_107/0.1),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-6">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="showcase-title" className="mt-5 text-5xl font-light md:text-7xl lg:text-6xl xl:text-7xl">
            <SplitText text={t('title')} accent={['תלת-ממד']} />
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pearl/75">{t('lead')}</p>

          <div className="mt-10 hidden gap-6 lg:flex" data-fact-list="">
            <div className="relative w-px shrink-0 bg-pearl/15" aria-hidden="true">
              <span data-showcase-line className="absolute inset-0 block origin-top bg-gradient-to-b from-gold-soft to-gold" />
            </div>
            <FactList facts={facts} />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <OpenDrawerButton siteType="premium3d" location="showcase">
              {t('cta')}
            </OpenDrawerButton>
            <span className="glass rounded-full px-4 py-2 text-xs text-pearl/80">{t('badge')}</span>
          </div>
        </div>

        <div className="relative -mx-5 h-[68svh] min-h-[22rem] md:mx-0 lg:h-[86vh]">
          <ProductStage kind="perfume" cursorLabel={t('drag')} trackSelector=".pin-spacer" className="absolute inset-0 h-full w-full" />
        </div>

        <div className="lg:hidden" data-fact-scroll="">
          <FactList facts={facts} />
        </div>
      </div>
    </section>
  );
}

/** Smaller screens have no pinned stage, so each fact lights up as it scrolls past the middle of the screen. */
function lightFactsInView(section: HTMLElement | null) {
  if (!section) return;
  const items = Array.from(section.querySelectorAll<HTMLElement>('[data-fact-scroll] [data-fact]'));
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.target.toggleAttribute('data-active', entry.isIntersecting)),
    { rootMargin: '0px 0px -45% 0px' },
  );
  items.forEach((item) => observer.observe(item));
  section.classList.add('is-lighting');
  return () => {
    observer.disconnect();
    section.classList.remove('is-lighting');
    items.forEach((item) => item.removeAttribute('data-active'));
  };
}

function FactList({ facts }: { facts: Fact[] }) {
  return (
    <ol className="space-y-6">
      {facts.map((fact, i) => (
        <li
          key={fact.title}
          data-fact=""
          className="flex gap-4 transition-opacity duration-700 group-[.is-pinned]/showcase:opacity-30 group-[.is-pinned]/showcase:data-[active]:opacity-100 group-[.is-lighting]/showcase:opacity-30 group-[.is-lighting]/showcase:data-[active]:opacity-100"
        >
          <bdi className="font-display text-sm text-gold">{String(i + 1).padStart(2, '0')}</bdi>
          <div>
            <h3 className="text-xl font-normal text-pearl">{fact.title}</h3>
            <p className="mt-1 max-w-md text-base text-mist">{fact.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
