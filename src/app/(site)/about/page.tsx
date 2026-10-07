import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BidiText } from '@/components/BidiText';
import { Reveal } from '@/components/Reveal';
import { OpenDrawerButton } from '@/components/site/OpenDrawerButton';
import { PageHeader } from '@/components/site/PageHeader';
import { formatHoursSummary } from '@/lib/content/hours-summary';
import { getSiteContent } from '@/lib/content/site-content';

export const metadata: Metadata = {
  title: 'מי אני',
  description: 'אבישי, עומק: סטודיו לאתרים מטבריה. איך אני עובד ומתי אני זמין.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const [{ about, hours }, t] = await Promise.all([getSiteContent(), getTranslations()]);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 md:px-10 md:pb-40">
      <PageHeader eyebrow={t('home.aboutEyebrow')} title={about.title}>
        <div className="rise-in mt-10 flex h-24 w-24 items-center justify-center rounded-full border border-gold/50 font-display text-5xl" aria-hidden="true">
          <span className="text-gilded">א</span>
        </div>
      </PageHeader>

      <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6 text-xl leading-relaxed text-pearl/85">
          {about.paragraphs.map((p, i) => (
            <Reveal as="p" key={p} delay={i * 80}>
              {p}
            </Reveal>
          ))}
        </div>
        <div className="space-y-12">
          <Reveal as="section" className="glass rounded-[1.5rem] p-8">
            <h2 className="text-3xl font-light">{about.processTitle}</h2>
            <p className="mt-4 text-pearl/80">{about.process}</p>
          </Reveal>
          <Reveal as="section" delay={100} className="glass rounded-[1.5rem] p-8">
            <h2 className="text-3xl font-light">{t('about.hoursTitle')}</h2>
            {formatHoursSummary(hours).map((line) => (
              <p key={line} className="mt-4 text-pearl/80">
                <BidiText text={line} />
              </p>
            ))}
          </Reveal>
          <OpenDrawerButton location="about">{t('common.ctaTalk')}</OpenDrawerButton>
        </div>
      </div>
    </div>
  );
}
