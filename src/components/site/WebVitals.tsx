'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';
import { useVisitor } from '@/lib/store/visitor';

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

/** Metrics wait here until the visitor consents and GA4 has loaded; nothing leaves the browser before that. */
const queue: Metric[] = [];

function flush() {
  if (useVisitor.getState().consent !== 'granted' || !window.gtag) return false;
  for (const metric of queue.splice(0)) {
    window.gtag('event', 'web_vital', {
      metric_name: metric.name,
      // GA4 wants integers; CLS is a small fraction, so it is sent in thousandths.
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating,
      metric_id: metric.id,
      non_interaction: true,
    });
  }
  return true;
}

const report = (metric: Metric) => {
  queue.push(metric);
  flush();
};

/** Real-visitor Core Web Vitals (LCP, INP, CLS, FCP, TTFB) as one GA4 event, only with analytics consent. */
export function WebVitals() {
  useReportWebVitals(report);

  useEffect(() => {
    let timer: number | undefined;
    const waitForGtag = (tries = 0) => {
      window.clearTimeout(timer);
      if (flush() || tries > 20) return;
      timer = window.setTimeout(() => waitForGtag(tries + 1), 500);
    };
    waitForGtag();
    const unsubscribe = useVisitor.subscribe((s, prev) => {
      if (s.consent === 'granted' && prev.consent !== 'granted') waitForGtag();
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
