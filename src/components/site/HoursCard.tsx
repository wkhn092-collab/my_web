import { getTranslations } from 'next-intl/server';

/** Availability: open status + appointment-only — no clock hours. */
export async function HoursCard({ className = '' }: { className?: string }) {
  const t = await getTranslations('about');
  const tf = await getTranslations('footer');

  return (
    <div className={`glass rounded-2xl p-5 md:rounded-[1.75rem] md:p-7 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow !mb-0">{tf('hours')}</p>
        <p className="inline-flex items-center gap-2 rounded-full border border-[#5fd38d]/35 bg-[#5fd38d]/10 px-3 py-1 text-sm text-[#9aebbc]">
          <span className="pulse-dot inline-block h-2 w-2 shrink-0 rounded-full bg-[#5fd38d]" aria-hidden="true" />
          {t('hoursOpen')}
        </p>
      </div>
      <p className="mt-5 font-display text-2xl font-light tracking-[-0.02em] text-pearl md:text-[1.75rem]">{t('hoursByAppointment')}</p>
      <p className="mt-2 text-sm leading-relaxed text-mist md:text-base">{t('hoursNote')}</p>
    </div>
  );
}
