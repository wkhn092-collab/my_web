'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';

/** A tel: link that counts the tap (after consent), so phone calls show up next to WhatsApp clicks in the KPIs. */
export function PhoneLink({ phoneE164, location, className = '', children }: { phoneE164: string; location: string; className?: string; children: ReactNode }) {
  return (
    <a href={`tel:${phoneE164}`} onClick={() => track('phone_click', { location })} className={className}>
      {children}
    </a>
  );
}
