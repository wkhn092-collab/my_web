import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';

/**
 * Answers "is this for me?" honestly, in both directions, so the visitors who are not a fit (a ready-made
 * template, a big store, guaranteed rankings) find out here rather than on the call. Never mentions price.
 */
export async function FitCheck({ eyebrow }: { eyebrow: string }) {
  const t = await getTranslations('fit');
  const columns = [
    { key: 'yes', title: t('yesTitle'), items: t.raw('yes') as string[], mark: '✓', markClass: 'border-gold/50 text-gold' },
    { key: 'no', title: t('noTitle'), items: t.raw('no') as string[], mark: '✕', markClass: 'border-pearl/20 text-mist' },
  ];

  return (
    <section id="fit" aria-labelledby="fit-title" className="relative pb-24 pt-8 md:pb-32">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="fit-title" className="mt-5 max-w-3xl text-5xl font-light md:text-7xl">
          <SplitText text={t('title')} />
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {columns.map((column, i) => (
            <Reveal key={column.key} delay={i * 90} className="glass rounded-[1.75rem] p-7 md:p-10">
              <h3 className="font-display text-3xl">{column.title}</h3>
              <ul className="mt-6 space-y-5">
                {column.items.map((item) => (
                  <li key={item} className="flex gap-4">
                    <span
                      className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${column.markClass}`}
                      aria-hidden="true"
                    >
                      {column.mark}
                    </span>
                    <span className={column.key === 'yes' ? 'text-lg text-pearl/90' : 'text-lg text-mist'}>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
