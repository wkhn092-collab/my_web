'use client';

import { useTranslations } from 'next-intl';
import { track } from '@/lib/analytics';
import { FAB_MESSAGE, whatsappUrl } from '@/lib/domain/whatsapp';
import { WhatsAppIcon } from './WhatsAppIcon';

/** The short path on purpose: straight to WhatsApp, nothing stored. Tablet and desktop; phones get it inside the sticky CTA. */
export function WhatsAppFab({ whatsappNumber }: { whatsappNumber: string }) {
  const t = useTranslations('fab');
  return (
    <a
      href={whatsappUrl(whatsappNumber, FAB_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('label')}
      data-magnetic=""
      onClick={() => track('whatsapp_click', { location: 'fab' })}
      className="glass fixed left-4 z-40 hidden md:inline-flex h-14 w-14 items-center justify-center rounded-full text-pearl shadow-[0_10px_40px_-10px_rgb(0_0_0/0.8)] transition-[bottom,color,border-color] duration-500 ease-[var(--ease-out)] hover:border-gold/60 hover:text-gold-soft md:left-8"
      style={{ bottom: 'calc(1rem + var(--sticky-cta-height) + env(safe-area-inset-bottom))' }}
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
