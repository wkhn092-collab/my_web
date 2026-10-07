'use client';

import { useEffect } from 'react';
import { getLenis, prefersReducedMotion, setLenis } from '@/lib/motion/lenis';
import { useSession } from '@/lib/store/visitor';

/** Lenis drives the window scroll on GSAP's ticker so ScrollTrigger scenes stay in sync. Off on reduced motion. */
export function SmoothScroll() {
  const drawerOpen = useSession((s) => s.drawerOpen);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({
        lerp: 0.085,
        wheelMultiplier: 0.95,
        anchors: { offset: -96 },
        autoRaf: false,
        prevent: (node) => node.closest('dialog') !== null,
      });
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
      if (useSession.getState().drawerOpen) lenis.stop();
      // Fonts change heights after first layout; pinned scenes need fresh measurements.
      document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined);

      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (drawerOpen) lenis.stop();
    else lenis.start();
  }, [drawerOpen]);

  return null;
}
