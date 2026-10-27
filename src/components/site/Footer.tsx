import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import type { SiteContent } from '@/lib/content/types';
import { formatIsraeliPhone, toWhatsAppNumber } from '@/lib/domain/phone';
import { FAB_MESSAGE, whatsappUrl } from '@/lib/domain/whatsapp';
import { BackToTop } from './BackToTop';
import { CookieSettingsButton } from './CookieBanner';
import { HoursCard } from './HoursCard';
import { OpenDrawerButton } from './OpenDrawerButton';
import { PhoneLink } from './PhoneLink';

export async function Footer({ content }: { content: SiteContent }) {
  const t = await getTranslations();
  const { settings, legalPages } = content;
  const phone = formatIsraeliPhone(settings.phoneE164);
  const studioName = t('footer.studioName', { brand: settings.brandName });
  // Consumer-protection identity; each part appears only once it is filled in settings.
  const ownerName = settings.legalName ? `${studioName} / ${settings.legalName}` : studioName;
  const registration = settings.businessType && settings.businessNumber ? { type: settings.businessType, number: settings.businessNumber } : null;
  const navLinks = [
    { href: '/projects', label: t('nav.works') },
    { href: '/#services', label: t('nav.services') },
    { href: '/about', label: t('nav.about') },
    { href: '/#faq', label: t('nav.faq') },
  ];
  const placeLine = [settings.city, settings.remoteNote].filter(Boolean).join(' · ');

  return (
    <footer
      className="relative isolate overflow-hidden border-t border-pearl/[0.08] bg-ink"
      style={{ paddingBottom: 'calc(1.25rem + var(--sticky-cta-height, 0px))' }}
    >
      <div
        className="pointer-events-none absolute -bottom-1/3 left-1/2 -z-10 h-[100vmin] w-[140vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(201_166_107/0.16),transparent)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -right-40 top-0 -z-10 h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(closest-side,rgb(62_154_168/0.12),transparent)]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-5 pt-12 md:px-10 md:pt-36">
        {/* The closing call: the biggest line on the page, and one round door into the form. */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="max-w-4xl">
            <p className="eyebrow">{t('footer.nextStep')}</p>
            <h2 className="mt-4 text-[clamp(2.35rem,6.8vw,6.5rem)] font-light leading-[1.02] tracking-[-0.03em] md:mt-6">
              <SplitText text={t('footer.ctaTitle')} accent={['מקצועיים']} />
            </h2>
          </div>
          <Reveal className="shrink-0 self-start md:self-end">
            <OpenDrawerButton location="footer" className="footer-orb group">
              <svg viewBox="0 0 200 200" className="footer-orb-ring" aria-hidden="true">
                <defs>
                  <path id="footer-orb-path" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
                </defs>
                {/* LTR on the path itself: an RTL run starts at the path's end and falls off it. The Hebrew still reads right to left. */}
                <text direction="ltr">
                  {/* Stretched to the exact circumference (2π·82), so the ring closes without a gap or an overlap. */}
                  <textPath href="#footer-orb-path" textLength="512" lengthAdjust="spacing">
                    {t('footer.orbRing')}
                  </textPath>
                </text>
              </svg>
              <span className="footer-orb-core">
                <span className="max-w-[7.5rem] text-center font-display text-lg leading-snug md:text-xl">{t('common.ctaTalk')}</span>
                <span className="footer-orb-arrow mt-1 text-xl" aria-hidden="true">
                  ←
                </span>
              </span>
            </OpenDrawerButton>
          </Reveal>
        </div>

        <div className="hairline mt-10 md:mt-28" />

        {/*
          Mobile: links first, then a tight contact strip — no tall empty band before the studio card.
          Desktop: hours/contact | nav/legal.
        */}
        <div className="grid gap-8 py-8 text-base md:grid-cols-2 md:gap-16 md:py-16 lg:gap-24">
          <div className="order-2 space-y-6 md:order-1 md:space-y-10">
            <HoursCard />

            <div className="space-y-2.5 px-1 md:space-y-3">
              <p className="eyebrow">{t('footer.contact')}</p>
              <p className="pt-2 md:pt-3">
                {t('footer.phone')}{' '}
                <PhoneLink phoneE164={settings.phoneE164} location="footer" className="link">
                  <bdi>{phone}</bdi>
                </PhoneLink>
              </p>
              <p>
                {t('footer.email')}{' '}
                <a href={`mailto:${settings.email}`} className="link">
                  <bdi>{settings.email}</bdi>
                </a>
              </p>
              <p>
                <a href={whatsappUrl(toWhatsAppNumber(settings.whatsappE164), FAB_MESSAGE)} target="_blank" rel="noopener noreferrer" className="link">
                  {t('footer.whatsapp')} ↗
                </a>
              </p>
            </div>
          </div>

          <div className="order-1 grid grid-cols-2 gap-5 self-start md:order-2 md:gap-8 md:border-r md:border-pearl/10 md:pr-12 lg:pr-16">
            <nav aria-label={t('footer.nav')}>
              <p className="eyebrow" aria-hidden="true">
                {t('footer.nav')}
              </p>
              <ul className="space-y-0 pt-3 md:space-y-1 md:pt-5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="footer-nav-link inline-flex items-baseline py-1 font-display text-[1.25rem] font-light leading-tight text-pearl/90 md:py-1 md:text-2xl lg:text-3xl"
                    >
                      <span className="footer-nav-dash" aria-hidden="true" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label={t('footer.legal')}>
              <p className="eyebrow" aria-hidden="true">
                {t('footer.legal')}
              </p>
              <ul className="space-y-1 pt-3 md:space-y-2 md:pt-5">
                {legalPages.map((page) => (
                  <li key={page.slug}>
                    <Link href={`/legal/${page.slug}`} className="link link-reveal inline-block py-0.5 text-[0.9rem] text-pearl/80 md:py-1 md:text-base">
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
        </div>

        {/* Identity — flush strip on mobile, glass card only from md up (no floating island in empty abyss). */}
        <div className="border-t border-pearl/10 pt-5 md:border-0 md:pt-0">
          <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:rounded-[1.75rem] md:border md:border-pearl/10 md:bg-[linear-gradient(160deg,rgb(255_255_255/0.06),rgb(255_255_255/0.015))] md:p-8 md:shadow-[var(--shadow-contact-sm)] md:backdrop-blur-[18px]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
              <div className="shrink-0">
                <p className="font-display text-lg text-pearl md:text-2xl">{studioName}</p>
                {placeLine ? <p className="mt-0.5 text-sm text-mist md:mt-1 md:text-base">{placeLine}</p> : null}
              </div>
              <dl className="grid gap-1 text-sm text-mist sm:border-r sm:border-pearl/10 sm:pr-8 md:gap-1.5 md:text-base">
                {settings.legalName && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt>{t('footer.businessName')}</dt>
                    <dd className="text-pearl/85">
                      <bdi>{ownerName}</bdi>
                    </dd>
                  </div>
                )}
                {registration && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt>{registration.type}:</dt>
                    <dd className="text-pearl/85">
                      <bdi>{registration.number}</bdi>
                    </dd>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-2">
                  <dt>{t('footer.officialEmail')}</dt>
                  <dd>
                    <a href={`mailto:${settings.email}`} className="link text-pearl/85">
                      <bdi>{settings.email}</bdi>
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-pearl/10 pt-4 md:border-0 md:justify-end md:pt-0">
              <p className="text-sm text-mist md:hidden">
                © {new Date().getFullYear()} {studioName}
              </p>
              <BackToTop label={t('footer.backToTop')} />
            </div>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-5 hidden max-w-7xl px-5 pb-1 text-sm text-mist md:mt-6 md:block md:px-10 md:text-start">
        © {new Date().getFullYear()} {studioName}. {t('footer.rights')}.
      </p>
    </footer>
  );
}
