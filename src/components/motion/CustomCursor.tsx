'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { playTick } from '@/lib/audio/ambient';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion/lenis';
import { useSession } from '@/lib/store/visitor';

type CursorState = 'idle' | 'hover' | 'view' | 'text';

const INTERACTIVE = 'a, button, summary, label, [role="button"], [data-magnetic]';
const MAGNET_PULL = 0.32;

/**
 * Desktop only: a gold dot with a trailing ring that grows over links and turns into a "view" disc over
 * [data-cursor="view"]. Elements with [data-magnetic] lean toward the pointer.
 */
export function CustomCursor() {
  const t = useTranslations('cursor');
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const enabledRef = useRef(false);
  const drawerOpen = useSession((s) => s.drawerOpen);

  // The drawer is a modal <dialog> in the top layer, above this cursor: hand back the native one meanwhile.
  useEffect(() => {
    if (enabledRef.current) document.documentElement.classList.toggle('has-cursor', !drawerOpen);
  }, [drawerOpen]);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    enabledRef.current = true;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const root = document.documentElement;
    root.classList.toggle('has-cursor', !useSession.getState().drawerOpen);

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let frame = 0;
    let state: CursorState = 'idle';
    let interactive: Element | null = null;
    let magnet: HTMLElement | null = null;

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      frame = Math.abs(pos.x - ringPos.x) + Math.abs(pos.y - ringPos.y) > 0.1 ? requestAnimationFrame(loop) : 0;
    };

    const setState = (next: CursorState, text = '') => {
      if (next === state && label.textContent === text) return;
      state = next;
      ring.dataset.state = next;
      label.textContent = text;
    };

    const release = () => {
      if (!magnet) return;
      magnet.style.transform = '';
      magnet = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      dot.classList.remove('cursor-hidden');
      ring.classList.remove('cursor-hidden');
      if (!frame) frame = requestAnimationFrame(loop);

      const target = e.target instanceof Element ? e.target : null;
      const view = target?.closest<HTMLElement>('[data-cursor="view"]');
      const field = target?.closest('input:not([type="radio"]):not([type="checkbox"]), textarea');
      const hit = target?.closest(INTERACTIVE) ?? null;
      if (view) setState('view', view.dataset.cursorLabel ?? t('view'));
      else if (field) setState('text');
      else if (hit) setState('hover');
      else setState('idle');

      if (hit !== interactive) {
        interactive = hit;
        if (hit) playTick(view ? 0.8 : 1);
      }

      const nextMagnet = target?.closest<HTMLElement>('[data-magnetic]') ?? null;
      if (nextMagnet !== magnet) release();
      if (nextMagnet) {
        magnet = nextMagnet;
        const rect = nextMagnet.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * MAGNET_PULL;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * MAGNET_PULL;
        nextMagnet.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
    };

    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget) return;
      dot.classList.add('cursor-hidden');
      ring.classList.add('cursor-hidden');
      release();
    };
    const onDown = () => ring.animate([{ scale: 1 }, { scale: 0.82 }, { scale: 1 }], { duration: 350, easing: 'ease-out' });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('mouseout', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      release();
      enabledRef.current = false;
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('mouseout', onLeave);
    };
  }, [t]);

  return (
    <>
      <div ref={ringRef} className="cursor-ring cursor-hidden max-md:hidden" data-state="idle" aria-hidden="true">
        <span ref={labelRef} />
      </div>
      <div ref={dotRef} className="cursor-dot cursor-hidden max-md:hidden" aria-hidden="true" />
    </>
  );
}
