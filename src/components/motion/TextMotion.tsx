'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/motion/lenis';

const TARGETS = 'main .eyebrow, main h3, main p, main blockquote';
// Anything that already animates its own text, holds a form, or is driven by a pinned scroll timeline.
const SKIP = '.hero-dive, .reveal, .split-scroll, .split-now, .rise-in, form, dialog, details, [role="dialog"], [data-fact], [data-no-text-motion]';
const STAGGER_MS = 90;
const MAX_STAGGER = 5;

/**
 * Copy that isn't already animated surfaces out of a soft blur as it scrolls in (CSS: .text-motion .tm).
 * Content is only hidden once this has run, so without JavaScript or with reduced motion nothing changes.
 */
export function TextMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    document.documentElement.classList.add('text-motion');

    const targets = Array.from(document.querySelectorAll<HTMLElement>(TARGETS)).filter(
      (el) => !el.closest(SKIP) && !el.classList.contains('tm') && el.textContent?.trim(),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        entering.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        entering.forEach((el, i) => {
          el.style.setProperty('--tm-delay', `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`);
          el.classList.add('tm-in');
          observer.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((el) => {
      el.classList.add('tm');
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      targets.forEach((el) => {
        el.classList.remove('tm', 'tm-in');
        el.style.removeProperty('--tm-delay');
      });
    };
  }, [pathname]);

  return null;
}
