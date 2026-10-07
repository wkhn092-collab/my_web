/**
 * Progress of the hero "dive", 0 at the top of the page and 1 when the pinned stage releases.
 * Without the dive (reduced motion) the hero is one screen tall and this is simply how far it has scrolled away.
 */
export function heroDiveProgress(section: Element): number {
  // At the very top the scene is always at rest, whatever the header measured or the rubber-band did.
  if (window.scrollY <= 1) return 0;
  const rect = section.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  const progress = travel > 1 ? -rect.top / travel : -rect.top / Math.max(1, rect.height);
  return Math.min(1, Math.max(0, progress));
}
