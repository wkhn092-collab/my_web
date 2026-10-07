/** Giant outlined words drifting sideways. Decorative: the same words are spelled out elsewhere on the page. */
export function Marquee({ items }: { items: string[] }) {
  const row = (copy: number) => (
    <div className="flex shrink-0 items-center" aria-hidden={copy > 0 ? 'true' : undefined}>
      {items.map((item) => (
        <span key={`${copy}-${item}`} className="flex items-center">
          <span className="text-outline whitespace-nowrap px-8 font-display text-[clamp(3rem,8vw,7.5rem)] font-light leading-none transition-colors duration-500 hover:text-gold-soft/90">
            {item}
          </span>
          <span className="text-2xl text-gold" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y border-pearl/[0.07] py-10 md:py-14" aria-hidden="true">
      <div className="animate-marquee flex w-max">
        {row(0)}
        {row(1)}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-abyss to-transparent md:w-48" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-abyss to-transparent md:w-48" />
    </div>
  );
}
