import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BidiText } from '@/components/BidiText';
import { LegalBody } from '@/components/legal/LegalBody';
import { formatHoursSummary } from '@/lib/content/hours-summary';
import { getLegalPage, getSiteContent } from '@/lib/content/site-content';
import { formatIsraeliPhone } from '@/lib/domain/phone';
import { formatDate } from '@/lib/format';

export async function generateMetadata({ params }: PageProps<'/legal/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  return page ? { title: page.title, alternates: { canonical: `/legal/${page.slug}` } } : {};
}

export default async function LegalPage({ params }: PageProps<'/legal/[slug]'>) {
  const { slug } = await params;
  const [page, { settings, hours }, t] = await Promise.all([getLegalPage(slug), getSiteContent(), getTranslations('legal')]);
  if (!page) notFound();

  const pending = t('pending');
  const businessId = [settings.businessType, settings.businessNumber].filter(Boolean).join(' ');
  const tokens: Record<string, string> = {
    legalName: settings.legalName || pending,
    businessId: settings.businessNumber ? businessId : pending,
    city: settings.city,
    email: settings.email,
    phone: formatIsraeliPhone(settings.phoneE164),
    coordinatorName: settings.accessibilityCoordinator.name,
    coordinatorPhone: formatIsraeliPhone(settings.accessibilityCoordinator.phoneE164),
    coordinatorEmail: settings.accessibilityCoordinator.email,
    hours: formatHoursSummary(hours).join('. '),
  };

  return (
    <article className="mx-auto max-w-3xl px-5 pb-28 pt-16 md:pb-40 md:pt-24">
      <h1 className="text-5xl font-light md:text-7xl">{page.title}</h1>
      <p className="mt-5 text-sm tracking-wide text-gold">
        <BidiText text={t('updated', { date: formatDate(page.updatedAt) })} />
      </p>
      <div className="hairline mt-10" />
      <div className="mt-10 text-pearl/85">
        <LegalBody blocks={page.body} tokens={tokens} />
      </div>
    </article>
  );
}
