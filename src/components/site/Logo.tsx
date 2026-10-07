import { useId } from 'react';

/** Logo A: the letter ע reflected in the Kinneret. Decorative here; the link carries the accessible name. */
export function Logo({ className = '' }: { className?: string }) {
  const id = useId();
  const clip = `${id}-below`;
  const fade = `${id}-fade`;
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>
          <path d="M0 68 Q15 63 30 68 T60 68 T90 68 T120 68 V120 H0 Z" />
        </clipPath>
        <linearGradient id={fade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3E9AA8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#3E9AA8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="30" cy="24" r="6" fill="#C9A66B" />
      <g fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
        <path d="M82 14 V48 Q82 62 68 62 H34" />
        <path d="M44 14 Q48 44 76 58" />
      </g>
      <g clipPath={`url(#${clip})`}>
        <g transform="translate(0 132) scale(1 -1)" fill="none" stroke={`url(#${fade})`} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
          <path d="M82 14 V48 Q82 62 68 62 H34" />
          <path d="M44 14 Q48 44 76 58" />
        </g>
      </g>
      <path d="M8 68 Q19 64 30 68 T52 68 T74 68 T96 68 T112 68" fill="none" stroke="#3E9AA8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
