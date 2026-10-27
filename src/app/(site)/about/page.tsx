import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/Reveal';
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
    <div className="mx-auto max-w-7xl px-5 pb-28 md:px-10 md:pb-40">
      <PageHeader eyebrow={t('home.aboutEyebrow')} title={about.title}>
        <div className="rise-in relative mt-8 h-28 w-28 overflow-hidden rounded-full border border-gold/50 md:mt-10 md:h-36 md:w-36">
          <Image src="/about/avishi.jpg" alt={t('home.portraitAlt')} fill sizes="144px" priority className="object-cover" />
        </div>
      </PageHeader>

      <div className="grid items-start gap-8 md:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div className="space-y-5 text-lg leading-[1.75] text-pearl/85 md:text-xl">
          {about.paragraphs.map((p, i) => (
            <Reveal as="p" key={p} delay={i * 80} className="text-pretty">
              {p}
            </Reveal>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          <Reveal as="section" className="glass rounded-3xl p-6 md:p-7">
            <h2 className="text-2xl font-light tracking-[-0.01em] md:text-[1.75rem]">{about.processTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-pretty text-pearl/80 md:text-[1.05rem]">{about.process}</p>
          </Reveal>
          <Reveal as="section" delay={80} className="glass rounded-3xl p-6 md:p-7">
            <h2 className="text-2xl font-light tracking-[-0.01em] md:text-[1.75rem]">{t('about.hoursTitle')}</h2>
            <p className="mt-3 text-base leading-relaxed text-pearl/80 md:text-[1.05rem]">{t('about.hoursByAppointment')}</p>
          </Reveal>
          <OpenDrawerButton location="about">{t('common.ctaTalk')}</OpenDrawerButton>
        </div>
      </div>
    </div>
  );
}
