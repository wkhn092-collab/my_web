import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BidiText } from '@/components/BidiText';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import type { Testimonial } from '@/lib/content/types';
import { summarizeRatings } from '@/lib/domain/ratings';
import { StarRating } from './StarRating';

/**
 * Answers "what if it goes wrong?" right after the services. Real testimonials when there are any;
 * the written commitments are always there, so the spot is never an empty reviews box (cold start).
 */
export async function Proof({ testimonials, eyebrow }: { testimonials: Testimonial[]; eyebrow: string }) {
  const t = await getTranslations('proof');
  const commitments = t.raw('commitments') as { title: string; body: string }[];
  const summary = summarizeRatings(testimonials);
  const hasReviews = testimonials.length > 0;

  return (
    <section id="proof" aria-labelledby="proof-title" className="relative pb-24 pt-8 md:pb-32">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="proof-title" className="mt-5 max-w-3xl text-5xl font-light md:text-7xl">
          <SplitText text={hasReviews ? t('titleWithReviews') : t('titleEmpty')} />
        </h2>

        {hasReviews && (
          <>
            {summary && (
              <p className="mt-6 flex items-center gap-3 text-lg text-pearl/85">
                <StarRating value={Number(summary.average)} label={t('rating', { value: summary.average })} className="text-xl" />
                <span>
                  <bdi>{summary.average}</bdi> {t('outOf')} · <bdi>{summary.count}</bdi> {t('count')}
                </span>
              </p>
            )}
            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((item, i) => (
                <Reveal as="li" key={item.id} delay={i * 80} className="glass flex flex-col rounded-[1.75rem] p-7">
                  <figure className="flex h-full flex-col">
                    {item.rating && <StarRating value={item.rating} label={t('rating', { value: item.rating })} className="text-lg" />}
                    <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-pearl/90">
                      <p>
                        <BidiText text={item.quote} />
                      </p>
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-4 border-t border-pearl/10 pt-5">
                      {item.photo && (
                        <Image
                          src={item.photo.url}
                          alt={item.photo.alt}
                          width={56}
                          height={56}
                          sizes="56px"
                          className="h-14 w-14 shrink-0 rounded-full object-cover"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="block font-display text-xl">{item.fullName}</span>
                        {item.role && <span className="block text-sm text-mist">{item.role}</span>}
                        {item.project && !item.project.isConcept && (
                          <span className="mt-1 flex flex-wrap items-center gap-x-3 text-sm">
                            <span className="text-gold-soft">
                              <span aria-hidden="true">✓ </span>
                              {t('verified')}
                            </span>
                            <Link href={`/projects/${item.project.slug}`} className="link">
                              {t('seeWork', { title: item.project.title })}
                            </Link>
                          </span>
                        )}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </ul>
            <p className="mt-16 text-2xl font-light md:text-3xl">{t('commitmentsTitle')}</p>
          </>
        )}

        <ul className={`grid gap-6 md:grid-cols-3 ${hasReviews ? 'mt-8' : 'mt-14'}`}>
          {commitments.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 90} className="glass rounded-[1.75rem] p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 text-gold" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <h3 className="mt-5 font-display text-2xl">{item.title}</h3>
              <p className="mt-2 text-base text-mist">{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
