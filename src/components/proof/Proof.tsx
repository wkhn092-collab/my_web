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

        {/* Large scroll-revealed lines instead of three identical glass cards. */}
        <ol className={`space-y-10 md:space-y-14 ${hasReviews ? 'mt-10' : 'mt-14'}`}>
          {commitments.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 100} className="grid gap-3 md:grid-cols-[auto_1fr] md:items-baseline md:gap-10">
              <span className="font-display text-5xl font-light tabular-nums text-pearl/25 md:text-7xl" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display text-3xl font-light leading-snug md:text-4xl">{item.title}</h3>
                <p className="mt-3 max-w-2xl text-lg text-mist md:text-xl">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
