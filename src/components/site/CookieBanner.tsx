'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useVisitor, useVisitorHydrated } from '@/lib/store/visitor';

/** Equal-weight choices; never blocks content or covers the sticky CTA. */
export function CookieBanner() {
  const t = useTranslations('cookies');
  const hydrated = useVisitorHydrated();
  const consent = useVisitor((s) => s.consent);
  const setConsent = useVisitor((s) => s.setConsent);
  if (!hydrated || consent !== null) return null;

  return (
    <section
      aria-label={t('label')}
      className="glass fixed inset-x-3 z-50 mx-auto max-w-xl rounded-2xl !bg-ink/90 p-5 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.9)] md:inset-x-auto md:right-8"
      style={{ bottom: 'calc(0.75rem + var(--sticky-cta-height) + env(safe-area-inset-bottom))' }}
    >
      <p className="text-sm leading-relaxed text-pearl/85">
        {t('text')}{' '}
        <Link href="/legal/cookies" className="link">
          {t('details')}
        </Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button type="button" className="btn-secondary !min-h-11" onClick={() => setConsent('granted')}>
          {t('accept')}
        </button>
        <button type="button" className="btn-secondary !min-h-11" onClick={() => setConsent('denied')}>
          {t('reject')}
        </button>
      </div>
    </section>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  const setConsent = useVisitor((s) => s.setConsent);
  return (
    <button type="button" className="link link-reveal py-1 text-pearl/80" onClick={() => setConsent(null)}>
      {label}
    </button>
  );
}
