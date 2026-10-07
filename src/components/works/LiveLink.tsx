'use client';

import { useTranslations } from 'next-intl';
import { track } from '@/lib/analytics';

export function LiveLink({ href, slug }: { href: string; slug: string }) {
  const t = useTranslations();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary"
      onClick={() => track('live_demo_click', { project: slug })}
    >
      {t('project.live')}
      <span className="sr-only">, {t('common.newTab')}</span>
    </a>
  );
}
