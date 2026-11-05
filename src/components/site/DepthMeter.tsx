'use client';

import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion/lenis';

const MAX_M = 400;

/**
 * Fixed depth gauge on the side of the page: a thin line + meters (0m → 400m).
 * Also drives --depth / --depth-m on <html> so the palette can darken with the dive.
 */
export function DepthMeter() {
  const [meters, setMeters] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    setReady(true);
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      const m = Math.round(progress * MAX_M);
      doc.style.setProperty('--depth', progress.toFixed(4));
      doc.style.setProperty('--depth-m', String(m));
      setMeters(m);
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
      document.documentElement.style.removeProperty('--depth');
      document.documentElement.style.removeProperty('--depth-m');
    };
  }, []);

  if (!ready) return null;

  const fill = Math.min(1, meters / MAX_M);

  return (
    <div
      className="depth-meter pointer-events-none fixed start-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 md:start-5 md:flex"
      aria-hidden="true"
    >
      <span className="font-display text-[0.65rem] tracking-[0.2em] text-pearl/45">0m</span>
      <div className="relative h-[min(42vh,18rem)] w-px overflow-hidden bg-pearl/15">
        <span
          className="absolute inset-x-0 top-0 block origin-top bg-gradient-to-b from-lake to-pearl/40"
          style={{ height: `${fill * 100}%` }}
        />
        <span
          className="absolute start-1/2 size-1.5 -translate-x-1/2 rounded-full bg-lake shadow-[0_0_10px_rgb(62_154_168/0.8)]"
          style={{ top: `calc(${fill * 100}% - 3px)` }}
        />
      </div>
      <span className="font-display text-sm tabular-nums text-pearl/70">
        <bdi>{meters}</bdi>m
      </span>
      <span className="font-display text-[0.65rem] tracking-[0.2em] text-pearl/35">{MAX_M}m</span>
    </div>
  );
}
