/** Below this, an average looks invented ("5.0 from one review") and is not shown. */
export const RATING_SUMMARY_MIN = 3;

export function summarizeRatings(items: { rating?: number }[]): { average: string; count: number } | null {
  const ratings = items.map((i) => i.rating).filter((r): r is number => typeof r === 'number' && r >= 1 && r <= 5);
  if (ratings.length < RATING_SUMMARY_MIN) return null;
  const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return { average: average.toFixed(1), count: ratings.length };
}
