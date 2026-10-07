'use client';

import { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/motion/lenis';
import { heroDiveProgress } from '@/lib/motion/hero-dive';

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Turns the hero into a pinned stage the visitor scrolls through (CSS: .hero-dive.is-diving) and feeds the
 * progress to CSS as --dive: the text lifts away, a pearly light fills the screen, then it settles into the dark.
 * On touch screens one swipe plays the whole dive (and one swipe back returns to the top), so nobody gets stuck
 * dragging through the middle of it. Without JavaScript or with reduced motion, the hero stays a normal single screen.
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

    const stopTouch = window.matchMedia('(pointer: coarse)').matches ? autoDiveOnTouch(section) : undefined;

    return () => {
      cancelAnimationFrame(frame);
      stopTouch?.();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      section.classList.remove('is-diving');
      section.style.removeProperty('--dive');
    };
  }, [targetId]);
  return null;
}

function autoDiveOnTouch(section: HTMLElement): () => void {
  const diveEnd = () => section.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
  let glideFrame = 0;
  let gliding = false;
  let startX = 0;
  let startY = 0;
  let decided = true;
  let touching = false;
  let lastTouchEnd = 0;
  let lastY = window.scrollY;
  let direction = 0;
  let settleTimer = 0;

  const glide = (to: number) => {
    cancelAnimationFrame(glideFrame);
    const from = window.scrollY;
    const distance = to - from;
    if (Math.abs(distance) < 2) return;
    const duration = to > from ? 1500 : 1000;
    const startedAt = performance.now();
    gliding = true;
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / duration);
      window.scrollTo(0, from + distance * easeInOut(t));
      if (t < 1) glideFrame = requestAnimationFrame(step);
      else gliding = false;
    };
    glideFrame = requestAnimationFrame(step);
  };

  const onTouchStart = (event: TouchEvent) => {
    touching = true;
    decided = gliding || !section.contains(event.target as Node) || window.scrollY > diveEnd() + 4;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (gliding) {
      event.preventDefault();
      return;
    }
    if (decided) return;
    const end = diveEnd();
    const y = window.scrollY;
    const insideDive = y < end - 4;
    const dx = event.touches[0].clientX - startX;
    const dy = startY - event.touches[0].clientY;
    if (Math.abs(dy) < 3 && Math.abs(dx) < 3) {
      // iOS commits to native scrolling on the first uncancelled move, so hold it until the direction is known.
      if (insideDive) event.preventDefault();
      return;
    }
    decided = true;
    if (Math.abs(dx) > Math.abs(dy)) return;
    if (dy > 0 && insideDive) {
      event.preventDefault();
      glide(end);
    } else if (dy < 0 && y > 4) {
      event.preventDefault();
      glide(0);
    }
  };

  const onTouchEnd = () => {
    touching = false;
    lastTouchEnd = performance.now();
  };

  // A fling that coasts back up into the dive (or stops halfway) finishes the trip instead of parking mid-way.
  const onScroll = () => {
    const y = window.scrollY;
    if (y !== lastY) direction = Math.sign(y - lastY);
    lastY = y;
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      if (gliding || touching || performance.now() - lastTouchEnd > 2500) return;
      const end = diveEnd();
      const at = window.scrollY;
      if (at > 4 && at < end - 4) glide(direction < 0 ? 0 : end);
    }, 160);
  };

  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    cancelAnimationFrame(glideFrame);
    window.clearTimeout(settleTimer);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
    window.removeEventListener('scroll', onScroll);
  };
}
