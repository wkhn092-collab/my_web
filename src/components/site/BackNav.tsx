'use client';

import { useRouter } from 'next/navigation';

/**
 * Clear back control for works pages. Prefers history when the visitor came from inside the site;
 * otherwise goes to `fallbackHref` (home or /projects).
 */
export function BackNav({ label, fallbackHref }: { label: string; fallbackHref: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallbackHref);
      }}
      className="btn-secondary !min-h-11 !px-5 text-sm"
    >
      <span aria-hidden="true">→</span>
      {label}
    </button>
  );
}
