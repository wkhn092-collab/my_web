'use client';

import { getLenis, prefersReducedMotion } from '@/lib/motion/lenis';

export function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      data-magnetic=""
      onClick={() => {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { duration: 2.2 });
        else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        document.getElementById('main')?.focus({ preventScroll: true });
      }}
      className="group inline-flex items-center gap-3 text-sm text-mist transition-colors duration-500 hover:text-gold-soft"
    >
      <span>{label}</span>
      <span
        className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-pearl/20 transition-colors duration-500 group-hover:border-gold"
        aria-hidden="true"
      >
        <span className="back-top-arrow block">↑</span>
      </span>
    </button>
  );
}
