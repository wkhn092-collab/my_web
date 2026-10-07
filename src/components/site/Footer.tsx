import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BidiText } from '@/components/BidiText';
import { SplitText } from '@/components/SplitText';
import { formatHoursSummary } from '@/lib/content/hours-summary';
import type { SiteContent } from '@/lib/content/types';
import { formatIsraeliPhone } from '@/lib/domain/phone';
import { CookieSettingsButton } from './CookieBanner';import { OpenDrawerButton } from './OpenDrawerButton';

export async function Footer({ content }: { content: SiteContent }) {
  const t = await getTranslations();
  const { settings, hours, legalPages } = content;
  const phone = formatIsraeliPhone(settings.phoneE164);

  return (
    <footer className="relative isolate overflow-hidden border-t border-pearl/[0.08] bg-ink" style={{ paddingBottom: 'calc(2rem + var(--sticky-cta-height))' }}>
      <div
        className="pointer-events-none absolute -bottom-1/2 left-1/2 -z-10 h-[90vmin] w-[120vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(201_166_107/0.14),transparent)]"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-7xl px-5 pt-24 md:px-10 md:pt-32">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-3xl text-5xl font-light md:text-7xl">
            <SplitText text={t('footer.ctaTitle')} />
          </h2>
          <OpenDrawerButton location="footer">{t('common.ctaTalk')}</OpenDrawerButton>
        </div>

        <div className="hairline mt-20" />

        <div className="grid gap-10 py-14 text-base md:grid-cols-3">
          <div className="space-y-2">
            <p className="eyebrow">{t('footer.contact')}</p>
            <p className="pt-3">
              {t('footer.phone')}{' '}
              <a href={`tel:${settings.phoneE164}`} className="link">
                <bdi>{phone}</bdi>
              </a>
            </p>
            <p>
              {t('footer.email')}{' '}
              <a href={`mailto:${settings.email}`} className="link">
                <bdi>{settings.email}</bdi>
              </a>
            </p>
          </div>
          <div className="space-y-2 text-pearl/80">
            <p className="eyebrow">{t('footer.hours')}</p>
            <div className="pt-3">
              {formatHoursSummary(hours).map((line) => (
                <p key={line}>
                  <BidiText text={line} />
                </p>
              ))}
            </div>
          </div>
          <nav aria-label={t('footer.legal')}>
            <p className="eyebrow" aria-hidden="true">
              {t('footer.legal')}
            </p>
            <ul className="space-y-1 pt-3">
              {legalPages.map((page) => (
                <li key={page.slug}>
                  <Link href={`/legal/${page.slug}`} className="link link-reveal inline-block py-1 text-pearl/80">
                    {page.title}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton label={t('footer.cookieSettings')} />
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-6 flex flex-col items-center gap-5 select-none" aria-hidden="true">
          <p className="finale-word font-display text-[clamp(3.5rem,13vw,9rem)] font-light leading-none">{settings.brandName}</p>
          <span className="finale-line block h-px w-40 md:w-64" />
        </div>
        <p className="mt-8 text-center text-sm text-mist">
          {settings.brandName} · {t('footer.tagline')}, {settings.city}
          {settings.remoteNote ? ` · ${settings.remoteNote}` : ''}
        </p>
      </div>
    </footer>
  );
}
