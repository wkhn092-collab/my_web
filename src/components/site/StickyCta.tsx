'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BidiText } from '@/components/BidiText';
import { track } from '@/lib/analytics';
import { FAB_MESSAGE, whatsappUrl } from '@/lib/domain/whatsapp';
import { OpenDrawerButton } from './OpenDrawerButton';
import { WhatsAppIcon } from './WhatsAppIcon';

const HERO_CTA_ID = 'hero-cta';

/**
 * Mobile only, and on mobile it replaces the floating WhatsApp button (which would sit on top of content).
 * Slides in once the hero CTA leaves the screen; publishes its height so the page can leave room for it.
 */
export function StickyCta({ replyWindow, whatsappNumber }: { replyWindow: string; whatsappNumber: string }) {
  const t = useTranslations('common');
  const tFab = useTranslations('fab');
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState<{ path: string; past: boolean } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroCta = document.getElementById(HERO_CTA_ID);
    if (!heroCta) return;
    const observer = new IntersectionObserver(([entry]) =>
      setPastHero({ path: pathname, past: !entry.isIntersecting && entry.boundingClientRect.top < 0 }),
    );
    observer.observe(heroCta);
    return () => observer.disconnect();
  }, [pathname]);

  // Pages with a hero CTA show the bar once it scrolls away; other pages (except /thanks) show it always.
  const observed = pastHero?.path === pathname ? pastHero.past : null;
  const visible = observed ?? (pathname !== '/' && pathname !== '/thanks');

  useEffect(() => {
    const root = document.documentElement;
    const mobile = window.matchMedia('(max-width: 767px)');
    const apply = () => {
      const height = visible && mobile.matches ? (ref.current?.offsetHeight ?? 0) : 0;
      root.style.setProperty('--sticky-cta-height', `${height}px`);
    };
    apply();
    mobile.addEventListener('change', apply);
    return () => {
      mobile.removeEventListener('change', apply);
      root.style.setProperty('--sticky-cta-height', '0px');
    };
  }, [visible]);

  return (
    <div
      ref={ref}
      aria-hidden={!visible}
      inert={!visible}
      className={`sticky-cta fixed inset-x-0 bottom-0 z-30 border-t border-pearl/10 bg-abyss/80 px-4 pt-3 backdrop-blur-xl transition-transform duration-300 ease-[var(--ease-out)] motion-reduce:transition-none md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-stretch gap-2.5">
        <OpenDrawerButton location="sticky" className="btn-primary min-w-0 flex-1" magnetic={false}>
          {t('ctaTalk')}
        </OpenDrawerButton>
        <a
          href={whatsappUrl(whatsappNumber, FAB_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={tFab('label')}
          onClick={() => track('whatsapp_click', { location: 'sticky' })}
          className="glass btn-fx wa-ping inline-flex w-14 shrink-0 items-center justify-center rounded-full text-pearl"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>
      </div>
      <p className="mt-1.5 text-center text-sm text-mist">
        <BidiText text={`${t('replyPrefix')} ${replyWindow}`} />
      </p>
    </div>
  );
}
