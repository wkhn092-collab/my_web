'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BidiText } from '@/components/BidiText';
import { OpenDrawerButton } from './OpenDrawerButton';

const HERO_CTA_ID = 'hero-cta';

/** Mobile only. Slides in once the hero CTA leaves the screen; publishes its height so the FAB rides above it. */
export function StickyCta({ replyWindow }: { replyWindow: string }) {
  const t = useTranslations('common');
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
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-pearl/10 bg-abyss/80 px-4 pt-3 backdrop-blur-xl transition-transform duration-300 ease-[var(--ease-out)] motion-reduce:transition-none md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <OpenDrawerButton location="sticky" className="btn-primary w-full" magnetic={false}>
        {t('ctaTalk')}
      </OpenDrawerButton>
      <p className="mt-1 text-center text-sm text-mist">
        <BidiText text={`${t('replyPrefix')} ${replyWindow}`} />
      </p>
    </div>
  );
}
