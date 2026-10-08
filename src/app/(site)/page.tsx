import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { DepthStory } from '@/components/home/DepthStory';
import { Faq } from '@/components/home/Faq';
import { FitCheck } from '@/components/home/FitCheck';
import { Hero } from '@/components/home/Hero';
import { Marquee } from '@/components/home/Marquee';
import { NextSteps } from '@/components/home/NextSteps';
import { ProductShowcase } from '@/components/home/ProductShowcase';
import { Proof } from '@/components/proof/Proof';
import { ProductStage } from '@/components/scene/ProductStage';
import { Services } from '@/components/home/Services';
import { SurfaceZone } from '@/components/home/SurfaceZone';
import { InlineLeadForm } from '@/components/lead/LazyLeadForm';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { WorksShowcase } from '@/components/works/WorksShowcase';
import { getSiteContent } from '@/lib/content/site-content';
import { formatIsraeliPhone, toWhatsAppNumber } from '@/lib/domain/phone';
import { formatReplyWindow, getReplyWindow } from '@/lib/domain/reply-window';

/** Set to '/about/avishi.jpg' (square, about 512px, in public/) once the portrait is shot; until then the monogram stands in. */
const PORTRAIT_SRC: string | null = null;

export default async function HomePage() {
  const [content, t, requestHeaders] = await Promise.all([getSiteContent(), getTranslations(), headers()]);
  const { home, settings } = content;
  const replyWindow = formatReplyWindow(getReplyWindow(new Date(), content.hours));
  const nonce = requestHeaders.get('x-nonce') ?? undefined;  const whatsappNumber = toWhatsAppNumber(settings.whatsappE164);

  return (
    <>
      <Hero hero={home.hero} replyWindow={replyWindow} eyebrow={`${t('footer.tagline')} · ${settings.city}`} />

      <Marquee items={t.raw('home.marquee') as string[]} />

      <WorksShowcase projects={content.projects} title={home.works.title} intro={home.works.intro} eyebrow={t('home.worksEyebrow')} />

      <section aria-labelledby="about-teaser-title" className="relative overflow-hidden pb-24 pt-4 md:pb-32 lg:pt-0">
        <div
          className="pointer-events-none absolute left-[22%] top-1/2 -z-10 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(201_166_107/0.14),transparent_65%)]"
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 md:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div>
            <p className="eyebrow">{t('home.aboutEyebrow')}</p>
            <h2 id="about-teaser-title" className="sr-only">
              {t('nav.about')}
            </h2>
            {PORTRAIT_SRC ? (
              <Reveal className="relative mt-8 h-28 w-28 overflow-hidden rounded-full border border-gold/50 md:h-32 md:w-32">
                <Image src={PORTRAIT_SRC} alt={t('home.portraitAlt')} fill sizes="128px" className="object-cover" />
              </Reveal>
            ) : (
              <Reveal className="mt-8 flex h-20 w-20 items-center justify-center rounded-full border border-gold/50 font-display text-4xl text-gilded">
                <span aria-hidden="true">א</span>
              </Reveal>
            )}
            <SplitText as="p" text={home.about.text} className="mt-8 font-display text-3xl font-light leading-snug md:text-5xl" />
            <Reveal className="mt-10">
              <Link href="/about" className="link text-lg">
                {t('about.more')}
              </Link>
            </Reveal>
          </div>
          <div className="relative -mx-5 h-72 md:mx-0 md:h-96 lg:h-[28rem]">
            <ProductStage kind="diamond" cursorLabel={t('showcase.drag')} className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      </section>

      <SurfaceZone>
        <DepthStory depth={home.depth} eyebrow={t('home.depthEyebrow')} ctaLabel={t('common.ctaTalk')} />

        <ProductShowcase eyebrow={t('home.showcaseEyebrow')} />
      </SurfaceZone>

      <Services section={home.services} services={content.services} eyebrow={t('home.servicesEyebrow')} />

      <FitCheck eyebrow={t('home.fitEyebrow')} />

      <Proof testimonials={content.testimonials} eyebrow={t('home.proofEyebrow')} />

      <Faq
        section={home.faq}
        faqs={content.faqs}
        eyebrow={t('home.faqEyebrow')}
        contact={{
          whatsappNumber,
          phoneE164: settings.phoneE164,
          phoneDisplay: formatIsraeliPhone(settings.phoneE164),
          reply: `${t('common.replyPrefix')} ${replyWindow}`,
        }}
      />

      <section id="contact" aria-labelledby="contact-title" className="relative isolate overflow-hidden py-28 md:py-40">
        <div
          className="pointer-events-none absolute -right-40 top-0 -z-10 h-[80vmin] w-[80vmin] rounded-full bg-[radial-gradient(circle,rgb(62_154_168/0.16),transparent_65%)]"
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow">{t('home.contactEyebrow')}</p>
            <h2 id="contact-title" className="mt-5 text-5xl font-light md:text-7xl">
              <SplitText text={home.closing.title} />
            </h2>
            <p className="mt-6 text-lg text-mist">{t('form.title')}</p>

            {/* Beside the form on desktop; after it on phones, so the form comes first. */}
            <NextSteps replyWindow={replyWindow} className="mt-12 hidden lg:block" />
          </div>
          <div className="glass rounded-[2rem] p-6 md:p-10">
            <InlineLeadForm whatsappNumber={whatsappNumber} addons={content.addons} nonce={nonce} location="inline" />
          </div>
          <NextSteps replyWindow={replyWindow} className="lg:hidden" />
        </div>
      </section>
    </>
  );
}
