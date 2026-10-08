'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion/lenis';

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * The way back up: the site is a dive, and the page ends by surfacing into a sunset over the Kinneret. The scene
 * fills the open band at the bottom of the contact section, below the copy, so no text ever sits on the bright sun.
 * As the band scrolls into view the sun rises from the water and the sky warms (CSS: .sunrise, --rise 0..1).
 * With reduced motion the sun is simply up.
 */
export function Sunrise() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = ref.current;
    if (!scene) return;
    if (prefersReducedMotion()) {
      scene.style.setProperty('--rise', '1');
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = scene.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / rect.height));
      scene.style.setProperty('--rise', smoothstep(progress).toFixed(4));
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
    };
  }, []);

  return (
    <div ref={ref} className="sunrise pointer-events-none absolute inset-x-0 bottom-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="sunrise-sky absolute inset-x-0 top-0" />
      <div className="sunrise-sun absolute" />
      <div className="sunrise-water absolute inset-x-0 bottom-0" />
    </div>
  );
}
