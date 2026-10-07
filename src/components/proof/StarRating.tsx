const STAR = 'M12 2.5l2.94 6.1 6.56.86-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.16 1.2-6.6-4.8-4.6 6.56-.86z';

/**
 * Read-only stars. One label for the whole row ("דירוג 4 מתוך 5"), so screen readers don't read five images.
 * Partial values (an average) fill the last star proportionally.
 */
export function StarRating({ value, label, className = '' }: { value: number; label: string; className?: string }) {
  const clamped = Math.min(5, Math.max(0, value));
  return (
    <span role="img" aria-label={label} className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, clamped - i));
        return (
          <span key={i} className="relative inline-block h-[1em] w-[1em]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full text-pearl/20" fill="currentColor">
              <path d={STAR} />
            </svg>
            {fill > 0 && (
              // RTL page: the fill grows from the right, the way the row is read.
              <span className="absolute inset-y-0 right-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <svg viewBox="0 0 24 24" className="absolute right-0 top-0 h-[1em] w-[1em] text-gold" fill="currentColor">
                  <path d={STAR} />
                </svg>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
