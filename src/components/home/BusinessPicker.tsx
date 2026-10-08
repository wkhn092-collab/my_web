import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Choice = { label: string; href: string };

/** One tap from "what business do I have" to the build closest to it, instead of scrolling a carousel to find it. */
export async function BusinessPicker() {
  const t = await getTranslations('home.picker');
  const choices = t.raw('choices') as Choice[];

  return (
    <nav aria-labelledby="picker-title" className="relative border-y border-pearl/[0.07] py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <h2 id="picker-title" className="font-display text-3xl font-light md:text-4xl">
          {t('title')}
        </h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {choices.map((choice) => (
            <li key={choice.href}>
              <Link
                href={choice.href}
                className="glass inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-base text-pearl/90 transition-colors duration-300 hover:border-gold/50 hover:text-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-soft"
              >
                {choice.label}
                <span className="text-gold" aria-hidden="true">
                  ←
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
