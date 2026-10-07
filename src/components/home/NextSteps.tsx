import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/Reveal';

/** What happens after "send": a short, honest path lowers the cost of pressing it. */
export async function NextSteps({ replyWindow, className = '' }: { replyWindow: string; className?: string }) {
  const t = await getTranslations();
  const steps = t.raw('home.nextSteps.steps') as { title: string; body: string }[];
  const trust = t.raw('home.nextSteps.trust') as string[];
  return (
    <div className={className}>
      <p className="eyebrow">{t('home.nextSteps.title')}</p>
      <ol className="relative mt-6 space-y-7 border-r border-gold/25 pr-8">
        {steps.map((step, i) => (
          <Reveal as="li" key={step.title} delay={i * 90} className="relative">
            <span
              className="absolute -right-[2.6rem] top-0 flex h-7 w-7 items-center justify-center rounded-full border border-gold/60 bg-abyss font-display text-sm text-gold"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <p className="font-display text-2xl">{step.title}</p>
            <p className="mt-1 text-base text-mist">
              {step.body}
              {i === 0 && (
                <>
                  {' '}
                  <span className="text-pearl/85">
                    {t('common.replyPrefix')} {replyWindow}.
                  </span>
                </>
              )}
            </p>
          </Reveal>
        ))}
      </ol>
      <ul className="mt-10 flex flex-wrap gap-2">
        {trust.map((item) => (
          <li key={item} className="inline-flex items-center gap-2 rounded-full border border-pearl/15 px-4 py-2 text-sm text-pearl/80">
            <span className="text-gold" aria-hidden="true">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
