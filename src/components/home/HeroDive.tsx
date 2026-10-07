'use client';

import { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/motion/lenis';
import { heroDiveProgress } from '@/lib/motion/hero-dive';

/**
 * Turns the hero into a pinned stage the visitor scrolls through (CSS: .hero-dive.is-diving) and feeds the
 * progress to CSS as --dive: the text lifts away, a pearly light fills the screen, then it settles into the dark.
 * Without JavaScript or with reduced motion, the hero stays a normal single screen.
 */
export function HeroDive({ targetId }: { targetId: string }) {
  useEffect(() => {
    const section = document.getElementById(targetId);
    if (!section || prefersReducedMotion()) return;
    section.classList.add('is-diving');
    // The hero just grew: let ScrollTrigger (which listens for resize) re-measure the pinned sections below.
    window.dispatchEvent(new Event('resize'));
    let frame = 0;
    const update = () => {
      frame = 0;
      section.style.setProperty('--dive', heroDiveProgress(section).toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      section.classList.remove('is-diving');
      section.style.removeProperty('--dive');
    };
  }, [targetId]);
  return null;
}
