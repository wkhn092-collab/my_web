import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { SplitText } from '@/components/SplitText';
import { DepthScene } from '@/components/scene/DepthScene';
import { OpenDrawerButton } from '@/components/site/OpenDrawerButton';
import type { HomePage } from '@/lib/content/types';
import { HeroDive } from './HeroDive';

const delay = (ms: number) => ({ '--rise-delay': `${ms}ms` }) as CSSProperties;

/**
 * Full-screen opening: the 3D pearl oyster in the left half (above the text on phones), the headline rising word
 * by word as the intro lifts. Scrolling dives into the pearl (HeroDive) before the rest of the site begins.
 * Dive height is kept short so works and proof arrive early in the scroll.
 * No eyebrow / reply line on purpose — they crowd the first screen on phones.
 */
export async function Hero({ hero }: { hero: HomePage['hero'] }) {
  const t = await getTranslations();
  return (
    <section id="hero" aria-labelledby="hero-title" className="hero-dive relative isolate -mt-[var(--header-height)]">
      <HeroDive targetId="hero" />
      <div className="hero-stage relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="scene-poster absolute inset-0 -z-10">
          <DepthScene />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-abyss via-abyss/70 to-transparent" aria-hidden="true" />

        <div className="hero-content hero-lift relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-14 pt-36 md:px-10 md:pb-28 md:pt-40">
          <h1
            id="hero-title"
            className="max-w-5xl text-[clamp(2.35rem,7.2vw,4.75rem)] font-light leading-[1.05] tracking-[-0.02em] max-md:[@media(max-height:740px)]:text-[2.1rem] lg:max-w-[54vw]"
          >
            <SplitText text={hero.title} mode="now" delayMs={900} accent={['חזק']} />
          </h1>
          <p
            className="rise-in mt-5 max-w-xl text-lg leading-relaxed text-pearl/80 max-md:[@media(max-height:740px)]:mt-3 max-md:[@media(max-height:740px)]:text-base md:mt-6 md:text-xl lg:max-w-[min(36rem,48vw)]"
            style={delay(1250)}
          >
            {hero.lead}
          </p>
          <div className="rise-in mt-8 flex flex-col gap-3 max-md:[@media(max-height:740px)]:mt-5 sm:flex-row sm:items-center sm:gap-5 md:mt-9" style={delay(1400)}>
            <OpenDrawerButton id="hero-cta" location="hero">
              {t('common.ctaTalk')}
            </OpenDrawerButton>
            <Link href="#works" className="btn-secondary" data-magnetic="">
              {t('common.ctaWorks')}
            </Link>
          </div>
        </div>

        <div
          className="hero-content rise-in pointer-events-none absolute bottom-7 right-1/2 hidden translate-x-1/2 flex-col items-center gap-3 md:flex"
          style={delay(2000)}
          aria-hidden="true"
        >
          <span className="text-[0.7rem] tracking-[0.4em] text-mist">{t('hero.scroll')}</span>
          <span className="scroll-cue block h-12 w-px bg-pearl/15" />
        </div>

        <div className="hero-veil-light pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="hero-veil-dark pointer-events-none absolute inset-0 bg-abyss" aria-hidden="true" />
      </div>
    </section>
  );
}
