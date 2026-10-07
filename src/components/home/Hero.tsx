import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { BidiText } from '@/components/BidiText';
import { SplitText } from '@/components/SplitText';
import { DepthScene } from '@/components/scene/DepthScene';
import { OpenDrawerButton } from '@/components/site/OpenDrawerButton';
import type { HomePage } from '@/lib/content/types';
import { HeroDive } from './HeroDive';

const delay = (ms: number) => ({ '--rise-delay': `${ms}ms` }) as CSSProperties;

/**
 * Full-screen opening: the 3D pearl oyster in the left half (above the text on phones), the headline rising word
 * by word as the intro lifts. Scrolling dives into the pearl (HeroDive) before the rest of the site begins.
 */
export async function Hero({ hero, replyWindow, eyebrow }: { hero: HomePage['hero']; replyWindow: string; eyebrow: string }) {
  const t = await getTranslations();
  return (
    <section id="hero" aria-labelledby="hero-title" className="hero-dive relative isolate -mt-[var(--header-height)]">
      <HeroDive targetId="hero" />
      <div className="hero-stage relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="scene-poster absolute inset-0 -z-10">
          <DepthScene />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-abyss via-abyss/70 to-transparent" aria-hidden="true" />

        <div className="hero-content hero-lift relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-14 pt-40 md:px-10 md:pb-32">
          <p className="eyebrow rise-in" style={delay(900)}>
            {eyebrow}
          </p>
          <h1
            id="hero-title"
            className="mt-4 max-w-5xl md:mt-6 text-[clamp(3.75rem,11.5vw,11rem)] max-md:[@media(max-height:740px)]:text-[3.1rem] font-light leading-[0.92] tracking-[-0.02em] lg:max-w-[50vw] lg:text-[clamp(5rem,8.4vw,10rem)]"
          >
            <SplitText text={hero.title} mode="now" delayMs={1000} accent={['עומק']} />
          </h1>
          <p className="rise-in mt-6 max-w-xl md:mt-8 max-md:[@media(max-height:740px)]:mt-4 max-md:[@media(max-height:740px)]:text-base text-lg leading-relaxed text-pearl/75 md:text-xl lg:max-w-[min(36rem,46vw)]" style={delay(1350)}>
            {hero.lead}
          </p>
          <div className="rise-in mt-8 flex flex-col md:mt-10 max-md:[@media(max-height:740px)]:mt-6 gap-3 sm:flex-row sm:items-center sm:gap-5" style={delay(1500)}>
            <OpenDrawerButton id="hero-cta" location="hero">
              {t('common.ctaTalk')}
            </OpenDrawerButton>
            <Link href="#works" className="btn-secondary" data-magnetic="">
              {t('common.ctaWorks')}
            </Link>
          </div>
          <p className="rise-in mt-5 text-sm text-mist" style={delay(1650)}>
            <BidiText text={`${hero.reassurance} ${t('common.replyPrefix')} ${replyWindow}.`} />
          </p>
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
