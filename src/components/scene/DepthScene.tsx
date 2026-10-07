'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { heroDiveProgress } from '@/lib/motion/hero-dive';
import { getLenis } from '@/lib/motion/lenis';
import { useVisitor, useVisitorHydrated } from '@/lib/store/visitor';
import { detectSceneTier, rememberSceneOff } from './device-tier';
import { MODEL_URLS, prefetchModel } from './model-cache';
import type { DepthEngine } from './scene-engine';

/**
 * The hero's 3D pearl oyster. Sits on top of the CSS poster (.scene-poster) and loads after the page is idle;
 * the poster stays on reduced motion, weak devices, or any failure.
 */
export function DepthScene() {
  const t = useTranslations('motion');
  const hydrated = useVisitorHydrated();
  const paused = useVisitor((s) => s.motionPaused);
  const setPaused = useVisitor((s) => s.setMotionPaused);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<DepthEngine | null>(null);
  const visibleRef = useRef(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const tier = detectSceneTier();
    if (tier === 'poster') return;
    // The download starts now, in parallel with the engine chunk; the idle wait only delays the parsing.
    prefetchModel(MODEL_URLS.oyster).catch(() => {});

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;

    const handle = idle(
      async () => {
        const { createDepthEngine } = await import('./scene-engine');
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        let engine: DepthEngine | null = null;
        try {
          engine = createDepthEngine(canvas, {
            quality: tier,
            onFirstFrame: () => setLive(true),
            onTooSlow: () => {
              rememberSceneOff();
              setLive(false);
              cleanup?.();
            },
            onFail: () => {
              setLive(false);
              cleanup?.();
            },
          });
        } catch {
          engine = null;
        }
        if (!engine || cancelled) {
          engine?.dispose();
          return;
        }
        engineRef.current = engine;

        const hero = canvas.closest('section') ?? canvas;
        const sync = () => engine!.setRunning(visibleRef.current && !document.hidden && !useVisitor.getState().motionPaused);

        const onPointer = (e: PointerEvent) => {
          engine!.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
        };
        const onOrientation = (e: DeviceOrientationEvent) => {
          if (e.gamma === null || e.beta === null) return;
          engine!.setPointer(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
        };
        let lastY = window.scrollY;
        const onScroll = () => {
          engine!.setDive(heroDiveProgress(hero));
          const lenis = getLenis();
          engine!.setVelocity(lenis ? lenis.velocity : window.scrollY - lastY);
          lastY = window.scrollY;
        };

        // The gap between the header and the headline's eyebrow, where the shell sits on portrait screens.
        const measure = () => {
          const eyebrow = hero.querySelector<HTMLElement>('.hero-content .eyebrow');
          // Mid-dive the text is lifted and fading: only the resting layout is a valid reference.
          if (!eyebrow || hero.getBoundingClientRect().top < -2) return;
          const canvasTop = canvas.getBoundingClientRect().top;
          const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 64;
          engine!.setFreeBand(Math.max(56, headerBottom - canvasTop), eyebrow.getBoundingClientRect().top - canvasTop - 12);
        };
        measure();
        // Again once the entrance animation has settled the text in its final place.
        const settle = window.setTimeout(measure, 2600);
        window.addEventListener('resize', measure);

        const observer = new IntersectionObserver(([entry]) => {
          visibleRef.current = entry.isIntersecting;
          sync();
        });
        observer.observe(hero);
        const unsubscribe = useVisitor.subscribe(sync);

        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('visibilitychange', sync);
        const tilt = canUseTilt();
        if (tilt) window.addEventListener('deviceorientation', onOrientation, { passive: true });
        onScroll();
        sync();

        cleanup = () => {
          window.clearTimeout(settle);
          window.removeEventListener('resize', measure);
          observer.disconnect();
          unsubscribe();
          window.removeEventListener('pointermove', onPointer);
          window.removeEventListener('scroll', onScroll);
          document.removeEventListener('visibilitychange', sync);
          if (tilt) window.removeEventListener('deviceorientation', onOrientation);
          engine!.dispose();
          engineRef.current = null;
          cleanup = undefined;
        };
      },
      { timeout: 700 },
    );

    return () => {
      cancelled = true;
      cancelIdle(handle as number);
      cleanup?.();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-live={live ? '' : undefined}
        className={`absolute inset-0 h-full w-full transition-opacity duration-[1600ms] ease-[var(--ease-out)] ${live ? 'opacity-100' : 'opacity-0'}`}
      />
      {hydrated && live && (
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
          className="absolute bottom-6 left-5 z-10 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs tracking-[0.18em] text-mist transition-colors hover:text-gold-soft md:left-8"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true" fill="currentColor">
            {paused ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" />}
          </svg>
          {paused ? t('play') : t('pause')}
        </button>
      )}
    </>
  );
}

/** iOS requires a permission prompt for orientation; we don't ask, so tilt is Android-only. */
function canUseTilt(): boolean {
  if (!('DeviceOrientationEvent' in window)) return false;
  const ctor = window.DeviceOrientationEvent as unknown as { requestPermission?: unknown };
  return typeof ctor.requestPermission !== 'function' && window.matchMedia('(pointer: coarse)').matches;
}
