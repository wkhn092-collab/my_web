'use client';

import { useTranslations } from 'next-intl';
import { BidiText } from '@/components/BidiText';
import { SplitText } from '@/components/SplitText';
import { WhatsAppIcon } from '@/components/site/WhatsAppIcon';
import { ProjectCard } from '@/components/works/ProjectCard';
import type { Project } from '@/lib/content/types';
import { whatsappUrl } from '@/lib/domain/whatsapp';
import { useSession, useVisitor, useVisitorHydrated } from '@/lib/store/visitor';

/** The name and WhatsApp link arrive via in-memory hand-off only; a direct visit shows the generic version. */
export function ThanksClient({ replyWindow, projects, siteUrl }: { replyWindow: string; projects: Project[]; siteUrl: string }) {
  const t = useTranslations('thanks');
  const handoff = useSession((s) => s.handoff);
  const hydrated = useVisitorHydrated();
  const recent = useVisitor((s) => s.recentProjects);

  const unseen = projects.filter((p) => !hydrated || !recent.includes(p.id));
  const more = (unseen.length >= 3 ? unseen : projects).slice(0, 3);
  const shareUrl = whatsappUrl(null, `${t('shareText')} ${siteUrl}`);
  const title = handoff ? t('title', { name: handoff.name }) : t('titleGeneric');

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-16 md:px-10 md:pb-40 md:pt-24">
      <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-full border border-gold/50 text-gold" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="sig-check h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h1 className="max-w-5xl text-[clamp(2.75rem,7vw,6rem)] font-light leading-[1]">
        <SplitText key={title} text={title} mode="now" delayMs={150} />
      </h1>
      <p className="rise-in mt-8 text-xl text-pearl/80" style={{ '--rise-delay': '400ms' } as React.CSSProperties}>
        <BidiText text={`${t('reply')} ${replyWindow}.`} />
      </p>

      {handoff && (
        <p className="mt-8 flex flex-wrap items-center gap-4">
          <span className="text-mist">{t('whatsappFallback')}</span>
          <a href={handoff.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" data-magnetic="">
            <WhatsAppIcon className="h-5 w-5" />
            {t('whatsappOpen')}
          </a>
        </p>
      )}

      <div className="mt-20 grid gap-6 md:grid-cols-2">
        <section className="glass rounded-[1.5rem] p-8">
          <h2 className="text-3xl font-light">{t('nextTitle')}</h2>
          <p className="mt-4 text-pearl/80">{t('next')}</p>
        </section>
        <section className="glass rounded-[1.5rem] p-8">
          <h2 className="text-3xl font-light">{t('shareTitle')}</h2>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-6" data-magnetic="">
            {t('share')}
          </a>
        </section>
      </div>

      {more.length > 0 && (
        <section className="mt-24">
          <h2 className="text-4xl font-light md:text-5xl">{t('more')}</h2>
          <ul className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
