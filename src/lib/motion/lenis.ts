import type Lenis from 'lenis';

let instance: Lenis | null = null;

/** The page-wide smooth scroller, when one is running (never on reduced motion). */
export function getLenis(): Lenis | null {
  return instance;
}

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Desktop-class pointer: the cursor, magnetic buttons and pinned scenes only run here. */
export function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}
