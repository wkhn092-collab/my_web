'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ComponentProps } from 'react';

const loadLeadForm = () => import('./LeadForm').then((m) => m.LeadForm);

/** The form (validation, Turnstile, server action) stays out of the first-load bundle. */
export const LazyLeadForm = dynamic(loadLeadForm, {
  ssr: false,
  loading: () => <div className="min-h-[37rem] sm:min-h-[33rem]" aria-busy="true" />,
});

/** Warms the chunk once the page has loaded and gone idle, so opening the drawer feels instant. */
export function preloadLeadFormWhenIdle(then?: () => void) {
  let cancelled = false;
  let cancelIdle = () => {};
  const run = () => {
    if (!cancelled) loadLeadForm().then(() => !cancelled && then?.(), () => undefined);
  };
  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 6000 });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(run, 2000);
      cancelIdle = () => window.clearTimeout(id);
    }
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', schedule);
    cancelIdle();
  };
}

/**
 * Mounts the form after the page has loaded and gone idle, or sooner if its section nears the viewport (a fast
 * scroll, or a #contact link). The placeholder reserves the height so nothing jumps.
 */
export function InlineLeadForm(props: ComponentProps<typeof LazyLeadForm>) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => setNear(true);
    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && show(), { rootMargin: '800px 0px' });
    observer.observe(el);
    if (window.location.hash === '#contact') show();
    window.addEventListener('hashchange', show);
    const cancelIdle = preloadLeadFormWhenIdle(show);
    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', show);
      cancelIdle();
    };
  }, []);

  return <div ref={ref}>{near ? <LazyLeadForm {...props} /> : <div className="min-h-[37rem] sm:min-h-[33rem]" aria-busy="true" />}</div>;
}
