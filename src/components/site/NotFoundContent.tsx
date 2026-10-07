import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function NotFoundContent() {
  const t = await getTranslations('notFound');
  return (
    <div className="relative mx-auto flex min-h-[70svh] max-w-5xl flex-col justify-center px-5 py-24 md:px-10">
      <p className="text-outline pointer-events-none select-none font-display text-[clamp(8rem,30vw,20rem)] font-light leading-none" aria-hidden="true">
        404
      </p>
      <h1 className="-mt-6 max-w-2xl text-4xl font-light md:text-5xl">{t('title')}</h1>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary" data-magnetic="">
          {t('home')}
        </Link>
        <Link href="/projects" className="btn-secondary" data-magnetic="">
          {t('works')}
        </Link>
      </div>
    </div>
  );
}
