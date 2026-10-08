'use client';

import { useTranslations } from 'next-intl';
import { WhatsAppIcon } from '@/components/site/WhatsAppIcon';
import { track } from '@/lib/analytics';
import { FAB_MESSAGE, whatsappUrl } from '@/lib/domain/whatsapp';

/** Shown instead of the wizard while the server refuses submissions, so nobody fills three steps for an error. */
export function LeadFormLocked({ whatsappNumber, location }: { whatsappNumber: string; location: 'drawer' | 'inline' }) {
  const t = useTranslations('form');
  return (
    <div className="py-2 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold">
        <WhatsAppIcon className="h-7 w-7" />
      </div>
      <h3 tabIndex={-1} data-wizard-heading="" className="text-2xl font-light leading-tight text-pearl outline-none md:text-3xl">
        {t('lockedTitle')}
      </h3>
      <p className="mt-3 text-lg text-pearl/80">{t('lockedBody')}</p>
      <a
        href={whatsappUrl(whatsappNumber, FAB_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-8 w-full"
        onClick={() => track('whatsapp_click', { location: `form-locked-${location}` })}
      >
        <WhatsAppIcon className="h-5 w-5" />
        {t('lockedButton')}
      </a>
    </div>
  );
}
