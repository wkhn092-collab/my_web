import { getTranslations } from 'next-intl/server';
import { SplitText } from '@/components/SplitText';
import { WhatsAppLink } from '@/components/site/WhatsAppLink';
import type { Faq as FaqItem, HomePage } from '@/lib/content/types';

type Contact = { whatsappNumber: string; phoneE164: string; phoneDisplay: string; reply: string };

/** Native <details>: keyboard and screen-reader behaviour for free; opens with opacity + 8px, no height animation. */
export async function Faq({ section, faqs, eyebrow, contact }: { section: HomePage['faq']; faqs: FaqItem[]; eyebrow: string; contact: Contact }) {
  const t = await getTranslations();
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-28 md:py-40">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-10 lg:grid-cols-[1fr_1.6fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="faq-title" className="mt-5 text-5xl font-light md:text-6xl">
            <SplitText text={section.title} />
          </h2>

          {/* A way out for whoever didn't find their question: straight to a person, not back to the top. */}
          <aside className="glass relative mt-10 hidden overflow-hidden rounded-[1.75rem] p-7 lg:block" aria-labelledby="faq-aside-title">
            <div
              className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgb(201_166_107/0.22),transparent_70%)]"
              aria-hidden="true"
            />
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/50 font-display text-2xl text-gilded" aria-hidden="true">
                א
              </span>
              <p id="faq-aside-title" className="font-display text-2xl">
                {t('home.faqAside.title')}
              </p>
            </div>
            <p className="mt-4 text-base text-pearl/75">{t('home.faqAside.body')}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-mist">
              <span className="pulse-dot h-2 w-2 rounded-full bg-[#5fd38d]" aria-hidden="true" />
              {contact.reply}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <WhatsAppLink whatsappNumber={contact.whatsappNumber} location="faq-aside" className="btn-secondary">
                {t('home.faqAside.whatsapp')}
                <span className="sr-only">, {t('common.newTab')}</span>
              </WhatsAppLink>
              <p className="text-sm text-mist">
                {t('home.faqAside.call')}{' '}
                <a href={`tel:${contact.phoneE164}`} className="link text-pearl">
                  <bdi>{contact.phoneDisplay}</bdi>
                </a>
              </p>
            </div>
          </aside>
        </div>
        <div className="border-t border-pearl/10">
          {faqs.map((faq) => (
            <details key={faq.id} className="group border-b border-pearl/10">
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-6 text-xl transition-colors duration-300 hover:text-gold-soft md:text-2xl">
                <span className="font-display">{faq.question}</span>
                <span
                  className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pearl/20 transition-all duration-500 group-open:rotate-45 group-open:border-gold group-open:text-gold motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="faq-answer max-w-2xl pb-8 text-lg leading-relaxed text-pearl/75">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
