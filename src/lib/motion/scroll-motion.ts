import type { gsap as Gsap } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

import { getLenis } from './lenis';

/** Same offset Lenis uses for anchor links: the sticky header's height plus breathing room. */
const HEADER_OFFSET = -96;

type ScrollMotion = { gsap: typeof Gsap; ScrollTrigger: typeof ScrollTriggerType };

let pending: Promise<ScrollMotion> | null = null;

function afterLoadAndIdle(): Promise<void> {
  return new Promise((resolve) => {
    const idle = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => resolve(), { timeout: 1500 });
      else window.setTimeout(resolve, 200);
    };
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
  });
}

/**
 * Pinned scenes add their scroll length only once they're built, which pushes a #contact target down after the
 * browser already jumped to it. Re-align with the target after each refresh until the visitor scrolls themselves.
 */
function keepHashTargetInView(ScrollTrigger: typeof ScrollTriggerType) {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id || !document.getElementById(id)) return;
  const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  const stop = () => {
    ScrollTrigger.removeEventListener('refresh', align);
    events.forEach((e) => window.removeEventListener(e, stop));
  };
  const align = () => {
    const target = document.getElementById(id);
    if (!target) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { immediate: true, offset: HEADER_OFFSET });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET, behavior: 'instant' });
  };
  events.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }));
  ScrollTrigger.addEventListener('refresh', align);
  window.setTimeout(stop, 8000);
}

/**
 * GSAP + ScrollTrigger, fetched once and only after the page has loaded and gone idle, so scroll scenes never
 * compete with the first paint. Every caller shares the same promise and the plugin is registered once.
 */
export function loadScrollMotion(): Promise<ScrollMotion> {
  pending ??= afterLoadAndIdle()
    .then(() => Promise.all([import('gsap'), import('gsap/ScrollTrigger')]))
    .then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      keepHashTargetInView(ScrollTrigger);
      return { gsap, ScrollTrigger };
    })
    .catch((error: unknown) => {
      pending = null;
      throw error;
    });
  return pending;
}
