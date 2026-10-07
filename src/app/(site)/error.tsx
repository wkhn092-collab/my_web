'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { FAB_MESSAGE, FALLBACK_WHATSAPP_NUMBER, whatsappUrl } from '@/lib/domain/whatsapp';

export default function SiteError({ reset, error }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('error');
  useEffect(() => {
    // The server already logged the details; only the digest is useful client-side.
    if (error.digest) console.warn('error digest', error.digest);
  }, [error.digest]);

  return (
    <div className="mx-auto flex min-h-[60svh] max-w-3xl flex-col justify-center px-5 py-24">
      <h1 className="text-4xl font-light md:text-5xl">{t('title')}</h1>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={reset}>
          {t('retry')}
        </button>
        <a href={whatsappUrl(FALLBACK_WHATSAPP_NUMBER, FAB_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          {t('whatsapp')}
        </a>
      </div>
    </div>
  );
}
