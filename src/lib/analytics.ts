'use client';

import { useVisitor } from '@/lib/store/visitor';

export type AnalyticsEvent =
  | 'whatsapp_click'
  | 'phone_click'
  | 'form_start'
  | 'form_submit'
  | 'generate_lead'
  | 'live_demo_click'
  | 'cta_click'
  | 'filter_niche';

type Params = Record<string, string | number | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

/** No-op until the visitor consents. Never send PII: event names and IDs only. */
export function track(event: AnalyticsEvent, params: Params = {}) {
  if (useVisitor.getState().consent !== 'granted') return;
  window.gtag?.('event', event, params);
  window.clarity?.('event', event);
}
