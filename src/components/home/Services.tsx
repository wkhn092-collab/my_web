import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { OpenDrawerButton } from '@/components/site/OpenDrawerButton';
import type { HomePage, Service } from '@/lib/content/types';

/** Rows, not icon cards. No prices or delivery times at launch (decision 7.10.2026). */
export async function Services({ section, services, eyebrow }: { section: HomePage['services']; services: Service[]; eyebrow: string }) {
  const t = await getTranslations('services');
  return (
    <section id="services" aria-labelledby="services-title" className="relative pb-16 pt-28 md:pb-20 md:pt-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="services-title" className="mt-5 max-w-3xl text-5xl font-light md:text-7xl">
          <SplitText text={section.title} />
        </h2>
        <ul className="mt-16 border-t border-pearl/10">
          {services.map((service, i) => (
            <Reveal
              as="li"
              key={service.id}
              delay={i * 60}
              className="group relative isolate grid gap-6 border-b border-pearl/10 py-10 md:grid-cols-[4rem_1fr_1.3fr_auto] md:items-center md:gap-10 md:py-14"
            >
              <span
                className="pointer-events-none absolute inset-0 -z-10 origin-bottom scale-y-0 bg-gradient-to-t from-gold/[0.07] to-transparent transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-y-100"
                aria-hidden="true"
              />
              <bdi className="font-display text-lg text-gold">{String(i + 1).padStart(2, '0')}</bdi>
              <h3 className="text-4xl font-light transition-transform duration-700 ease-[var(--ease-out)] group-hover:-translate-x-3 md:text-5xl">
                {service.title}
              </h3>
              <div>
                <p className="text-pearl/85">{service.summary}</p>
                <p className="mt-3 text-base text-mist">
                  <span className="text-gold-soft">{t('includes')}</span> {service.includes}
                </p>
              </div>
              <OpenDrawerButton siteType={service.siteType} location={`service-${service.siteType}`} className="btn-secondary">
                {service.ctaLabel}
              </OpenDrawerButton>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 text-base text-mist">{section.note}</p>
      </div>
    </section>
  );
}
