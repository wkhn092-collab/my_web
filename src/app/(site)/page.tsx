import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { BusinessPicker } from "@/components/home/BusinessPicker";
import { DepthStory } from "@/components/home/DepthStory";
import { Faq } from "@/components/home/Faq";
import { FitCheck } from "@/components/home/FitCheck";
import { Hero } from "@/components/home/Hero";
import { NextSteps } from "@/components/home/NextSteps";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { Proof } from "@/components/proof/Proof";
import { Services } from "@/components/home/Services";
import { SurfaceZone } from "@/components/home/SurfaceZone";
import { InlineLeadForm } from "@/components/lead/LazyLeadForm";
import { Reveal } from "@/components/Reveal";
import { SplitText } from "@/components/SplitText";
import { WorksShowcase } from "@/components/works/WorksShowcase";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteContent } from "@/lib/content/site-content";
import { formatIsraeliPhone, toWhatsAppNumber } from "@/lib/domain/phone";
import { publicEnv } from "@/lib/env.public";
import { leadsLocked } from "@/lib/env.server";
import { businessLd, faqLd, servicesLd } from "@/lib/seo/structured-data";

/** Square, about 512px, in public/. Set to null to fall back to the monogram. */
const PORTRAIT_SRC: string | null = "/about/avishi.jpg";

export default async function HomePage() {
  const [content, t, requestHeaders] = await Promise.all([
    getSiteContent(),
    getTranslations(),
    headers(),
  ]);
  const { home, settings } = content;
  const nonce = requestHeaders.get("x-nonce") ?? undefined;
  const whatsappNumber = toWhatsAppNumber(settings.whatsappE164);

  return (
    <>
      <Hero hero={home.hero} />

      {/* Proof before personality: elite buyers trust work and risk-removal before "who am I". */}
      <WorksShowcase
        projects={content.projects}
        title={home.works.title}
        intro={home.works.intro}
        eyebrow={t("home.worksEyebrow")}
      />

      <FitCheck eyebrow={t("home.fitEyebrow")} />

      <Proof
        testimonials={content.testimonials}
        eyebrow={t("home.proofEyebrow")}
      />

      <BusinessPicker />

      <Services
        section={home.services}
        services={content.services}
        eyebrow={t("home.servicesEyebrow")}
      />

      <section
        aria-labelledby="about-teaser-title"
        className="relative overflow-hidden pb-24 pt-4 md:pb-32 lg:pt-0"
      >
        <div
          className="pointer-events-none absolute left-[22%] top-1/2 -z-10 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(201_166_107/0.14),transparent_65%)]"
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 md:px-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          {PORTRAIT_SRC ? (
            <Reveal className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-pearl/10 bg-ink md:max-w-none lg:mx-0 lg:max-h-[min(72vh,36rem)]">
              <Image
                src={PORTRAIT_SRC}
                alt={t("home.portraitAlt")}
                fill
                sizes="(min-width: 1024px) 42vw, 90vw"
                priority
                unoptimized
                className="object-cover object-[50%_18%] grayscale contrast-[1.05]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss/70 via-transparent to-abyss/20" aria-hidden="true" />
            </Reveal>
          ) : (
            <Reveal className="relative mx-auto flex aspect-[4/5] w-full max-w-md items-center justify-center rounded-[2rem] border border-gold/30 bg-ink font-display text-7xl text-gilded lg:mx-0">
              <span aria-hidden="true">א</span>
            </Reveal>
          )}
          <div>
            <p className="eyebrow">{t("home.aboutEyebrow")}</p>
            <h2 id="about-teaser-title" className="sr-only">
              {t("nav.about")}
            </h2>
            <SplitText
              as="p"
              text={home.about.text}
              className="mt-6 font-display text-3xl font-light leading-snug md:mt-8 md:text-5xl lg:text-[clamp(2.4rem,3.4vw,3.4rem)]"
            />
            <p className="mt-8 font-display text-2xl font-light italic text-pearl/55" aria-hidden="true">
              אבישי
            </p>
            <Reveal className="mt-8">
              <Link href="/about" className="link text-lg">
                {t("about.more")}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <SurfaceZone>
        <DepthStory
          depth={home.depth}
          eyebrow={t("home.depthEyebrow")}
          ctaLabel={t("common.ctaTalk")}
        />

        {/* 3D showcase after the core sale: lawyers/contractors rarely buy the bottle first. */}
        <ProductShowcase eyebrow={t("home.showcaseEyebrow")} />
      </SurfaceZone>

      <Faq
        section={home.faq}
        faqs={content.faqs}
        eyebrow={t("home.faqEyebrow")}
        contact={{
          whatsappNumber,
          phoneE164: settings.phoneE164,
          phoneDisplay: formatIsraeliPhone(settings.phoneE164),
          reply: t("about.hoursByAppointment"),
        }}
      />

      <SurfaceZone tone="sunset">
        <section
          id="contact"
          aria-labelledby="contact-title"
          className="relative py-28 md:py-40"
        >
          {/* Pearl returns at the seabed — closes the dive story from the hero. */}
          <div
            className="pointer-events-none absolute left-1/2 top-[18%] -z-10 size-[min(48vw,22rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_244_220/0.28),rgb(232_212_168/0.1)_42%,transparent_70%)] blur-[2px]"
            aria-hidden="true"
          />
          <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="eyebrow">{t("home.contactEyebrow")}</p>
              <h2
                id="contact-title"
                className="mt-5 text-5xl font-light md:text-7xl"
              >
                <SplitText text={home.closing.title} />
              </h2>
              <p className="mt-6 text-lg text-mist">{t("form.title")}</p>

              {/* Beside the form on desktop; after it on phones, so the form comes first. */}
              <NextSteps className="mt-12 hidden lg:block" />
            </div>
            <div className="glass glass-deep rounded-[2rem] p-6 md:p-10 lg:self-start">
              <InlineLeadForm
                whatsappNumber={whatsappNumber}
                addons={content.addons}
                nonce={nonce}
                location="inline"
                whatsappOnly={leadsLocked}
              />
            </div>
            <NextSteps className="lg:hidden" />
          </div>
        </section>
      </SurfaceZone>

      <JsonLd
        nonce={nonce}
        data={[
          businessLd(settings, publicEnv.siteUrl),
          servicesLd(content.services, publicEnv.siteUrl),
          faqLd(content.faqs),
        ]}
      />
    </>
  );
}
