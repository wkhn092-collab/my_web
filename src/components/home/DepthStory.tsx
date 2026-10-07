'use client';

import { useEffect, useRef } from 'react';
import { SplitText } from '@/components/SplitText';
import { Reveal } from '@/components/Reveal';
import { OpenDrawerButton } from '@/components/site/OpenDrawerButton';
import type { HomePage } from '@/lib/content/types';
import { prefersReducedMotion } from '@/lib/motion/lenis';

const PIN_QUERY = '(min-width: 1024px)';

/**
 * The signature: three layers, going deeper. On large screens the section pins and the layers replace one
 * another as you scroll while the gauge fills; elsewhere they stack and fade in.
 */
export function DepthStory({ depth, eyebrow, ctaLabel }: { depth: HomePage['depth']; eyebrow: string; ctaLabel: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia(PIN_QUERY).matches) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      const section = sectionRef.current;
      if (cancelled || !section) return;
      gsap.registerPlugin(ScrollTrigger);
      section.classList.add('is-pinned');

      const ctx = gsap.context(() => {
        const layers = gsap.utils.toArray<HTMLElement>('[data-layer]');
        const marks = gsap.utils.toArray<HTMLElement>('[data-mark]');
        const setActive = (index: number) => marks.forEach((m, i) => m.toggleAttribute('data-active', i === index));
        setActive(0);

        gsap.set(layers.slice(1), { autoAlpha: 0, yPercent: 30, scale: 0.94 });
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut', duration: 1 },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * (layers.length - 0.4)}`,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setActive(Math.min(layers.length - 1, Math.floor(self.progress * layers.length * 0.999))),
          },
        });
        tl.fromTo('[data-gauge]', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: layers.length }, 0);
        tl.fromTo('[data-abyss]', { opacity: 0 }, { opacity: 1, ease: 'none', duration: layers.length }, 0);
        layers.forEach((layer, i) => {
          if (i === 0) return;
          tl.to(layers[i - 1], { autoAlpha: 0, yPercent: -18, scale: 0.94, duration: 0.42, ease: 'power2.in' }, i - 0.5).to(
            layer,
            { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.5, ease: 'power2.out' },
            i - 0.05,
          );
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
      aria-labelledby="depth-title"
      className="relative isolate overflow-hidden lg:flex lg:h-screen lg:items-center [&.is-pinned_[data-layer]]:[grid-area:1/1]"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_30%,rgb(62_154_168/0.14),transparent_70%)]" aria-hidden="true" />
      <div
        data-abyss
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_30%_80%,rgb(201_166_107/0.12),transparent_70%),linear-gradient(to_bottom,transparent,rgb(2_4_6/0.9))] opacity-0"
        aria-hidden="true"
      />

      <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 py-28 md:px-10 lg:grid-cols-[1fr_1.25fr] lg:items-center lg:py-0">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="depth-title" className="mt-5 text-5xl font-light md:text-7xl">
            <SplitText text={depth.title} />
          </h2>

          <div className="mt-12 hidden gap-6 lg:flex" aria-hidden="true">
            <div className="relative w-px bg-pearl/15">
              <span data-gauge className="absolute inset-0 block origin-top scale-y-0 bg-gradient-to-b from-gold-soft to-gold" />
            </div>
            <ol className="space-y-5">
              {depth.layers.map((layer, i) => (
                <li
                  key={layer.title}
                  data-mark
                  className="flex items-baseline gap-4 text-mist transition-colors duration-500 data-[active]:text-pearl"
                >
                  <bdi className="font-display text-sm">{String(i + 1).padStart(2, '0')}</bdi>
                  <span className="text-lg">{layer.title}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12">
            <OpenDrawerButton location="depth">{ctaLabel}</OpenDrawerButton>
          </div>
        </div>

        <ol className="grid gap-6">
          {depth.layers.map((layer, i) => (
            <li key={layer.title} data-layer>
              <Reveal delay={i * 80} className="glass relative overflow-hidden rounded-[2rem] p-8 md:p-12 lg:min-h-[52vh] lg:p-14">
                <span
                  className="text-outline pointer-events-none absolute -top-6 left-6 font-display text-[9rem] leading-none md:text-[12rem]"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative lg:flex lg:min-h-[calc(52vh-7rem)] lg:flex-col lg:justify-end">
                  <h3 className="text-3xl font-light md:text-5xl">{layer.title}</h3>
                  <p className="mt-5 max-w-xl text-lg leading-relaxed text-pearl/75">{layer.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
