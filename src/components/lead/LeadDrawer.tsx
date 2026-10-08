'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef } from 'react';
import type { Addon } from '@/lib/content/types';
import { useSession } from '@/lib/store/visitor';
import { LazyLeadForm, preloadLeadFormWhenIdle } from './LazyLeadForm';

/** Native <dialog>: focus trap, Escape and inert background come from the platform. */
export function LeadDrawer({ whatsappNumber, addons, nonce }: { whatsappNumber: string; addons: Addon[]; nonce?: string }) {
  const t = useTranslations('form');
  const tc = useTranslations('common');
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const open = useSession((s) => s.drawerOpen);
  const siteType = useSession((s) => s.drawerSiteType);
  const closeDrawer = useSession((s) => s.closeDrawer);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => preloadLeadFormWhenIdle(), []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-wizard-heading]')?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="drawer"
      onClose={() => {
        closeDrawer();
        returnFocus.current?.focus();
      }}
      onClick={(e) => {
        if (e.target === ref.current) closeDrawer();
      }}
    >
      <div className="flex h-full flex-col overflow-y-auto overscroll-contain px-6 pb-10 pt-8 md:px-10" data-lenis-prevent>
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{t('titleHint')}</p>
            <h2 id={titleId} className="mt-3 text-4xl font-light">
              {t('title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-pearl/15 transition-colors hover:border-gold hover:text-gold-soft"
            aria-label={tc('close')}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {open && <LazyLeadForm whatsappNumber={whatsappNumber} addons={addons} presetSiteType={siteType} nonce={nonce} location="drawer" />}
      </div>
    </dialog>
  );
}
