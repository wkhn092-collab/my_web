/** Remounts per route: a curtain lifts and the page rises in. CSS only, and nothing stays transformed afterwards. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-curtain" aria-hidden="true" />
      <div className="page-enter">{children}</div>
    </>
  );
}
