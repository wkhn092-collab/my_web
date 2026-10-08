'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/motion/lenis';

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * Abalone: as the zone arrives, the colours of the inside of a shell open from the middle of the screen as a soft
 * iris, stay behind every section inside it, and close back into the dark as it leaves. The colour layer is one
 * screen tall and sticky, so the mask never repaints more than the viewport (CSS: .surface-zone, --surface 0..1).
 * With reduced motion the zone is simply in colour, without the iris.
 */
export function SurfaceZone({ children }: { children: ReactNode }) {
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    if (prefersReducedMotion()) {
      zone.classList.add('is-surfaced', 'is-still');
      return () => zone.classList.remove('is-surfaced', 'is-still');
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const rect = zone.getBoundingClientRect();
      const span = vh * 0.7;
      const progress = Math.min(1, Math.max(0, Math.min((vh - rect.top) / span, rect.bottom / span)));
      const surface = smoothstep(progress);
      zone.style.setProperty('--surface', surface.toFixed(4));
      zone.classList.toggle('is-surfaced', surface > 0.45);
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
      zone.classList.remove('is-surfaced');
      zone.style.removeProperty('--surface');
    };
  }, []);

  return (
    <div ref={zoneRef} className="surface-zone relative isolate">
      <div className="surface-stage pointer-events-none sticky top-0 -z-10 -mb-[100lvh] h-[100lvh] overflow-hidden" aria-hidden="true">
        <div className="surface-color absolute inset-0" />
        <div className="surface-ring absolute" />
      </div>
      {children}
    </div>
  );
}
