'use client';

import { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/motion/lenis';

const TARGETS = '.btn-primary, .btn-secondary, .footer-orb, .btn-fx';

/**
 * Every press answers at once: a ripple spreads from the exact point of contact (CSS: .btn-ripple), well inside
 * the 100ms a tap needs to feel instant, even when what it opens takes longer.
 */
export function ButtonFx() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = (event.target as Element | null)?.closest<HTMLElement>(TARGETS);
      if (!target || target.matches(':disabled')) return;
      const rect = target.getBoundingClientRect();
      const size = Math.hypot(rect.width, rect.height) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.setAttribute('aria-hidden', 'true');
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      target.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);
  return null;
}
