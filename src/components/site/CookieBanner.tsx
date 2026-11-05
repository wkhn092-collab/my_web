'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useVisitor, useVisitorHydrated } from '@/lib/store/visitor';

/**
 * Thin bottom consent bar. On the home hero it waits until #hero-cta leaves view
 * so the first impression (buttons) is never covered.
 */
export function CookieBanner() {
  const t = useTranslations('cookies');
  const pathname = usePathname();
  const hydrated = useVisitorHydrated();
  const consent = useVisitor((s) => s.consent);
  const setConsent = useVisitor((s) => s.setConsent);
  const [heroClear, setHeroClear] = useState(pathname !== '/');

  useEffect(() => {
    if (pathname !== '/') {
      setHeroClear(true);
      return;
    }
    const cta = document.getElementById('hero-cta');
    if (!cta || !('IntersectionObserver' in window)) {
      setHeroClear(true);
      return;
    }
    setHeroClear(false);
    const observer = new IntersectionObserver(([entry]) => setHeroClear(!entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(cta);
    return () => observer.disconnect();
  }, [pathname]);

  if (!hydrated || consent !== null || !heroClear) return null;

  return (
    <section
      aria-label={t('label')}
      className="fixed inset-x-0 z-50 border-t border-pearl/10 bg-ink/92 px-4 py-2.5 shadow-[0_-8px_28px_rgb(0_0_0/0.35)] backdrop-blur-md md:inset-x-auto md:bottom-4 md:right-4 md:max-w-sm md:rounded-xl md:border md:px-4 md:py-3"
      style={{ bottom: 'calc(var(--sticky-cta-height, 0px) + env(safe-area-inset-bottom))' }}
    >
      <p className="text-[0.8rem] leading-snug text-pearl/80 md:text-sm md:leading-relaxed">
        {t('text')}{' '}
        <Link href="/legal/cookies" className="link">
          {t('details')}
        </Link>
      </p>
      <div className="mt-2 flex gap-2 md:mt-3">
        <button type="button" className="btn-secondary !min-h-9 flex-1 !px-3 !text-sm" onClick={() => setConsent('granted')}>
          {t('accept')}
        </button>
        <button type="button" className="btn-secondary !min-h-9 flex-1 !px-3 !text-sm" onClick={() => setConsent('denied')}>
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
