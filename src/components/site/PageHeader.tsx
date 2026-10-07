import type { ReactNode } from 'react';
import { SplitText } from '@/components/SplitText';

/** Inner-page opening: eyebrow, a large rising title, and an optional lead. */
export function PageHeader({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <header className="relative pb-12 pt-16 md:pb-16 md:pt-24">
      <div
        className="pointer-events-none absolute -top-40 left-0 -z-10 h-[60vmin] w-[60vmin] rounded-full bg-[radial-gradient(circle,rgb(62_154_168/0.14),transparent_65%)]"
        aria-hidden="true"
      />
      {eyebrow && <p className="eyebrow rise-in">{eyebrow}</p>}
      <h1 className="mt-5 max-w-5xl text-[clamp(3rem,8vw,7rem)] font-light leading-[0.98]">
        <SplitText text={title} mode="now" delayMs={150} />
      </h1>
      {lead && (
        <p className="rise-in mt-8 max-w-2xl text-lg leading-relaxed text-pearl/75 md:text-xl" style={{ '--rise-delay': '450ms' } as React.CSSProperties}>
          {lead}
        </p>
      )}
      {children}
    </header>
  );
}
