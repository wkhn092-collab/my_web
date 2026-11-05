'use client';

import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';

/**
 * "Is this for me?" as a waterline: clear above the wave (fit), sunk and soft below (not a fit).
 * Same honesty as before — the visual tells the idea instead of two identical glass cards.
 */
export function FitCheck({ eyebrow }: { eyebrow: string }) {
  const t = useTranslations('fit');
  const yes = t.raw('yes') as string[];
  const no = t.raw('no') as string[];

  return (
    <section id="fit" aria-labelledby="fit-title" className="relative overflow-hidden pb-24 pt-8 md:pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10 waterline-wash" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="fit-title" className="mt-5 max-w-3xl text-5xl font-light md:text-7xl">
          <SplitText text={t('title')} />
        </h2>

        <div className="relative mt-14 md:mt-20">
          <Reveal>
            <p className="font-display text-2xl text-pearl md:text-3xl">{t('yesTitle')}</p>
            <ul className="mt-6 max-w-3xl space-y-5">
              {yes.map((item) => (
                <li key={item} className="text-lg leading-relaxed text-pearl/90 md:text-xl">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="waterline relative my-10 md:my-14" aria-hidden="true">
            <svg viewBox="0 0 1200 48" className="h-10 w-full text-lake/70 md:h-12" preserveAspectRatio="none">
              <path
                d="M0 28 C150 8, 300 48, 450 28 S750 8, 900 28 S1100 48, 1200 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M0 34 C180 18, 320 44, 480 30 S780 14, 960 32 S1120 44, 1200 34"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.45"
              />
            </svg>
            <span className="absolute start-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-lake/40 bg-abyss/80 px-3 py-1 text-[0.7rem] tracking-[0.18em] text-lake md:inline-flex">
              קו המים
            </span>
          </div>

          <Reveal delay={80} className="waterline-below">
            <p className="font-display text-2xl text-pearl/55 md:text-3xl">{t('noTitle')}</p>
            <ul className="mt-6 max-w-3xl space-y-5">
              {no.map((item) => (
                <li key={item} className="text-lg leading-relaxed text-mist md:text-xl">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
