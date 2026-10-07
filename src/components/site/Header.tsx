'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SoundToggle } from '@/components/motion/SoundToggle';
import { Logo } from './Logo';
import { OpenDrawerButton } from './OpenDrawerButton';

/** Transparent over the hero, glass once scrolled; slides away while reading down and returns on the way up. */
export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuId = useId();

  // Close the mobile menu after navigating.
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 320);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const links = [
    { href: '/projects', label: t('nav.works') },
    { href: '/#services', label: t('nav.services') },
    { href: '/about', label: t('nav.about') },
    { href: '/#faq', label: t('nav.faq') },
  ];
  const solid = scrolled || menuOpen;

  return (
    <header
      className={`sticky top-0 z-40 transition-[transform,opacity,background-color,border-color] duration-700 ease-[var(--ease-out)] motion-reduce:transition-none ${
        hidden && !menuOpen ? '-translate-y-full opacity-0 focus-within:translate-y-0 focus-within:opacity-100' : 'translate-y-0'
      } ${solid ? 'border-b border-pearl/[0.08] bg-abyss/70 backdrop-blur-xl' : 'border-b border-transparent'}`}
    >
      <div className="mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
        <Link href="/" className="flex items-center gap-3 text-pearl" aria-label={t('common.logoAlt')} data-magnetic="">
          <Logo className="h-10 w-10" />
          <span className="font-display text-2xl tracking-[0.12em]">{t('common.brand')}</span>
        </Link>

        <nav aria-label={t('nav.label')} className="hidden md:block">
          <ul className="flex items-center gap-9 text-[15px] tracking-wide">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link link-reveal text-pearl/85" aria-current={pathname === link.href ? 'page' : undefined}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <SoundToggle />
          <OpenDrawerButton location="header" className="btn-primary hidden !min-h-11 !px-5 text-sm sm:inline-flex">
            {t('common.ctaTalk')}
          </OpenDrawerButton>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 9h16M8 15h12" />}
            </svg>
          </button>
        </div>
      </div>

      <nav id={menuId} aria-label={t('nav.label')} hidden={!menuOpen} className="h-[calc(100svh-var(--header-height))] border-t border-pearl/[0.08] md:hidden">
        <ul className="mx-auto max-w-7xl px-5 py-8">
          {links.map((link, i) => (
            <li key={link.href} className="rise-in" style={{ '--rise-delay': `${i * 70}ms` } as React.CSSProperties}>
              <Link href={link.href} className="flex items-baseline gap-4 border-b border-pearl/[0.08] py-5 font-display text-4xl font-light" onClick={() => setMenuOpen(false)}>
                <bdi className="text-sm text-gold">{String(i + 1).padStart(2, '0')}</bdi>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-5">
          <OpenDrawerButton location="menu" className="btn-primary w-full">
            {t('common.ctaTalk')}
          </OpenDrawerButton>
        </div>
      </nav>
    </header>
  );
}
