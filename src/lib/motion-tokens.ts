/** Single source for motion. globals.css mirrors these as CSS custom properties. */
export const motion = {
  duration: {
    instant: 0.1,
    fast: 0.2,
    base: 0.3,
    slow: 0.6,
    settle: 2,
  },
  stagger: 0.06,
  distance: 16,
  shake: 6,
  ease: {
    out: [0.16, 1, 0.3, 1] as const,
    in: [0.7, 0, 0.84, 0] as const,
  },
  signatureMs: 900,
} as const;
