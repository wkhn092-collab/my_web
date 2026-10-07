import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BidiText } from '@/components/BidiText';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { formatHoursSummary } from '@/lib/content/hours-summary';
import type { SiteContent } from '@/lib/content/types';
import { formatIsraeliPhone, toWhatsAppNumber } from '@/lib/domain/phone';
import { formatReplyWindow, getReplyWindow } from '@/lib/domain/reply-window';
import { FAB_MESSAGE, whatsappUrl } from '@/lib/domain/whatsapp';
import { BackToTop } from './BackToTop';
import { CookieSettingsButton } from './CookieBanner';
import { OpenDrawerButton } from './OpenDrawerButton';

export async function Footer({ content }: { content: SiteContent }) {
  const t = await getTranslations();
  const { settings, hours, legalPages } = content;
  const phone = formatIsraeliPhone(settings.phoneE164);
  const replyWindow = formatReplyWindow(getReplyWindow(new Date(), hours));
  const navLinks = [
    { href: '/projects', label: t('nav.works') },
    { href: '/#services', label: t('nav.services') },
    { href: '/about', label: t('nav.about') },
    { href: '/#faq', label: t('nav.faq') },
  ];

  return (
    <footer className="relative isolate overflow-hidden border-t border-pearl/[0.08] bg-ink" style={{ paddingBottom: 'calc(1.5rem + var(--sticky-cta-height))' }}>
      <div
        className="pointer-events-none absolute -bottom-1/3 left-1/2 -z-10 h-[100vmin] w-[140vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(201_166_107/0.16),transparent)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -right-40 top-0 -z-10 h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(closest-side,rgb(62_154_168/0.12),transparent)]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-5 pt-24 md:px-10 md:pt-36">
        {/* The closing call: the biggest line on the page, and one round door into the form. */}
        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-4xl">
            <p className="eyebrow">{t('footer.nextStep')}</p>
            <h2 className="mt-6 text-[clamp(3rem,7.6vw,7.25rem)] font-light leading-[0.98] tracking-[-0.01em]">
              <SplitText text={t('footer.ctaTitle')} accent={['אתר']} />
            </h2>
          </div>
          <Reveal className="shrink-0 self-center md:self-end">
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

        <div className="hairline mt-20 md:mt-28" />

        {/* Two halves (RTL): hours over contact on the right, navigation beside legal on the left. */}
        <div className="grid gap-12 py-16 text-base md:grid-cols-2 md:gap-16 lg:gap-24">
          <div className="space-y-10">
            <Reveal className="glass rounded-[1.75rem] p-6 md:p-7">
              <p className="eyebrow">{t('footer.hours')}</p>
              <div className="space-y-1 pt-4 text-pearl/85">
                {formatHoursSummary(hours).map((line) => (
                  <p key={line}>
                    <BidiText text={line} />
                  </p>
                ))}
              </div>
              <p className="mt-5 flex items-center gap-3 border-t border-pearl/10 pt-4 text-sm text-mist">
                <span className="pulse-dot inline-block h-2 w-2 shrink-0 rounded-full bg-[#5fd38d]" aria-hidden="true" />
                <span>
                  <BidiText text={`${t('common.replyPrefix')} ${replyWindow}`} />
                </span>
              </p>
            </Reveal>

            <Reveal delay={80} className="space-y-3 px-1">
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
              <p>
                <a href={whatsappUrl(toWhatsAppNumber(settings.whatsappE164), FAB_MESSAGE)} target="_blank" rel="noopener noreferrer" className="link">
                  {t('footer.whatsapp')} ↗
                </a>
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-8 self-start md:border-r md:border-pearl/10 md:pr-12 lg:pr-16">
            <Reveal as="nav" delay={160} aria-label={t('footer.nav')}>
              <p className="eyebrow" aria-hidden="true">
                {t('footer.nav')}
              </p>
              <ul className="space-y-1 pt-5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-nav-link inline-flex items-baseline py-1 font-display text-2xl font-light text-pearl/90 lg:text-3xl">
                      <span className="footer-nav-dash" aria-hidden="true" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal as="nav" delay={240} aria-label={t('footer.legal')}>
              <p className="eyebrow" aria-hidden="true">
                {t('footer.legal')}
              </p>
              <ul className="space-y-2 pt-5">
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
            </Reveal>
          </div>
        </div>

        <div className="hairline" />
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between gap-6 px-5 text-sm text-mist md:flex-row md:px-10">
        <p className="text-center md:text-start">
          © {new Date().getFullYear()} {settings.brandName} · {t('footer.tagline')}, {settings.city}
          {settings.remoteNote ? ` · ${settings.remoteNote}` : ''} · {t('footer.rights')}
        </p>
        <BackToTop label={t('footer.backToTop')} />
      </div>
    </footer>
  );
}
