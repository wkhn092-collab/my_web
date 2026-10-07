'use client';

import { useEffect, useRef, useState } from 'react';
import { useVisitor } from '@/lib/store/visitor';
import { detectStageTier, rememberSceneOff } from './device-tier';
import { MODEL_URLS, prefetchModel } from './model-cache';
import type { ProductEngine, ProductKind } from './product-engine';

type Props = {
  kind: ProductKind;
  className?: string;
  /** Text for the custom cursor while hovering the stage. */
  cursorLabel?: string;
  /** Ancestor whose scroll position drives the rotation (e.g. a pin wrapper). Falls back to the closest section. */
  trackSelector?: string;
};

/**
 * A live 3D product on a turntable: turns with the scroll, can be flicked with a drag, follows the pointer.
 * Loads only when it approaches the viewport; draws one still frame on reduced motion; renders nothing where
 * WebGL is missing or the device is too weak (the surrounding section stands on its own).
 */
export function ProductStage({ kind, className = '', cursorLabel, trackSelector }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const start = async () => {
      const tier = detectStageTier();
      if (tier === 'poster') return;
      const { createProductEngine } = await import('./product-engine');
      if (cancelled) return;
      const still = tier === 'still';
      let engine: ProductEngine;
      try {
        engine = createProductEngine(canvas, {
          kind,
          quality: still ? 'reduced' : tier,
          still,
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
        return;
      }
      setInteractive(!still);

      // Resolved on every scroll: a pin wrapper may be added after the stage starts.
      const track = () => (trackSelector ? canvas.closest(trackSelector) : null) ?? canvas.closest('section') ?? canvas;
      let visible = false;
      const sync = () => engine.setRunning(visible && !document.hidden && !useVisitor.getState().motionPaused);
      const visibility = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      });
      visibility.observe(canvas);
      const unsubscribe = useVisitor.subscribe(sync);

      const onScroll = () => {
        const rect = track().getBoundingClientRect();
        const travel = rect.height + window.innerHeight;
        engine.setProgress(Math.min(1, Math.max(0, (window.innerHeight - rect.top) / Math.max(1, travel))));
      };
      const onPointer = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        engine.setPointer(
          Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1)),
          Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1)),
        );
      };
      let dragging = false;
      let lastX = 0;
      const onDown = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        engine.drag(e.clientX - lastX);
        lastX = e.clientX;
      };
      const onUp = () => {
        dragging = false;
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('pointermove', onPointer, { passive: true });
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      document.addEventListener('visibilitychange', sync);
      onScroll();
      sync();

      cleanup = () => {
        visibility.disconnect();
        unsubscribe();
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointermove', onPointer);
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        document.removeEventListener('visibilitychange', sync);
        engine.dispose();
        cleanup = undefined;
      };
    };

    // Once the page is idle, fetch the model file and the engine chunk (both small and cached), so the stage
    // appears instantly when the visitor gets there. The GPU work itself still waits for the approach below.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const warm = idle(
      () => {
        if (detectStageTier() === 'poster') return;
        prefetchModel(MODEL_URLS[kind]).catch(() => {});
        void import('./product-engine');
      },
      { timeout: 4000 },
    );

    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        approach.disconnect();
        void start();
      },
      { rootMargin: '150% 0px' },
    );
    approach.observe(canvas);

    return () => {
      cancelled = true;
      cancelIdle(warm as number);
      approach.disconnect();
      cleanup?.();
    };
  }, [kind, trackSelector]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-cursor={interactive && cursorLabel ? 'view' : undefined}
      data-cursor-label={interactive ? cursorLabel : undefined}
      className={`touch-pan-y select-none transition-opacity duration-[1400ms] ease-[var(--ease-out)] ${live ? 'opacity-100' : 'opacity-0'} ${
        interactive ? 'cursor-grab active:cursor-grabbing' : ''
      } ${className}`}
    />
  );
}
