/** YYYY-MM-DD → D.M.YYYY, without time zone drift. */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return `${d}.${m}.${y}`;
}
