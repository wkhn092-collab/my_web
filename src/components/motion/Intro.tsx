'use client';

import { useEffect } from 'react';
import { Logo } from '@/components/site/Logo';

const SEEN_KEY = 'omek-intro';

/**
 * The opening curtain plays in pure CSS, so it ends even without JavaScript and never takes clicks.
 * After the first visit in a tab session it is skipped.
 */
export function Intro({ brand }: { brand: string }) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) document.documentElement.classList.add('intro-seen');
      else sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Storage blocked: the intro simply plays.
    }
  }, []);

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-mark flex flex-col items-center gap-5">
        <Logo className="h-16 w-16 text-pearl" />
        <span className="font-display text-3xl tracking-[0.4em] text-pearl">{brand}</span>
        <span className="intro-line block h-px w-44 bg-gradient-to-l from-transparent via-gold to-transparent" />
      </div>
    </div>
  );
}
