import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/Reveal';
import { HoursCard } from '@/components/site/HoursCard';
import { OpenDrawerButton } from '@/components/site/OpenDrawerButton';
import { PageHeader } from '@/components/site/PageHeader';
import { getSiteContent } from '@/lib/content/site-content';

export const metadata: Metadata = {
  title: 'מי אני',
  description: 'אבישי, עומק: סטודיו לאתרים מטבריה. איך אני עובד ומתי אני זמין.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const [{ about }, t] = await Promise.all([getSiteContent(), getTranslations()]);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 md:px-10 md:pb-28">
      <PageHeader eyebrow={t('home.aboutEyebrow')} title={about.title} compact>
        <div className="rise-in relative mt-5 h-24 w-24 overflow-hidden rounded-full border border-gold/40 bg-ink md:mt-6 md:h-28 md:w-28">
          <Image
            src="/about/avishi.jpg"
            alt={t('home.portraitAlt')}
            fill
            sizes="112px"
            priority
            unoptimized
            className="object-cover"
          />
        </div>
      </PageHeader>

      <div className="grid items-start gap-6 md:gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div className="space-y-4 text-lg leading-[1.7] text-pearl/85 md:space-y-5 md:text-xl md:leading-[1.75]">
          {about.paragraphs.map((p, i) => (
            <Reveal as="p" key={p} delay={i * 80} className="text-pretty">
              {p}
            </Reveal>
          ))}
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <Reveal as="section" className="glass rounded-3xl p-5 md:p-6">
            <h2 className="text-2xl font-light tracking-[-0.01em] md:text-[1.75rem]">{about.processTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-pretty text-pearl/80 md:text-[1.05rem]">{about.process}</p>
          </Reveal>
          <Reveal delay={80}>
            <HoursCard className="rounded-3xl" />
          </Reveal>
          <OpenDrawerButton location="about">{t('common.ctaTalk')}</OpenDrawerButton>
        </div>
      </div>
    </div>
  );
}
