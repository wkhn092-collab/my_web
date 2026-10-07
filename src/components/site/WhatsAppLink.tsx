'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';
import { FAB_MESSAGE, whatsappUrl } from '@/lib/domain/whatsapp';
import { WhatsAppIcon } from './WhatsAppIcon';

/** An inline "talk on WhatsApp" link: same prefilled message as the floating button, nothing stored. */
export function WhatsAppLink({ whatsappNumber, location, className = '', children }: { whatsappNumber: string; location: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={whatsappUrl(whatsappNumber, FAB_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      data-magnetic=""
      onClick={() => track('whatsapp_click', { location })}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <WhatsAppIcon className="h-5 w-5" />
      {children}
    </a>
  );
}
