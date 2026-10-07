'use client';

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

/**
 * Adds .is-visible once, when the element enters the viewport. By default that fades it up (.reveal);
 * `bare` skips the fade for children that animate themselves (split text).
 */
export function Reveal({
  as: Tag = 'div',
  className = '',
  delay = 0,
  bare = false,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  delay?: number;
  bare?: boolean;
  children: ReactNode;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const style = delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined;
  return (
    <Tag ref={ref} className={`${bare ? '' : 'reveal'} ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}
