import { Logo } from '@/components/site/Logo';
import { NotFoundContent } from '@/components/site/NotFoundContent';
import Link from 'next/link';

/** Unmatched URLs render outside the (site) group, so this carries a minimal header of its own. */
export default function RootNotFound() {
  return (
    <>
      <header className="mx-auto max-w-7xl px-5 py-5 md:px-10">
        <Link href="/" aria-label="עומק, לעמוד הבית" className="inline-block text-pearl">
          <Logo className="h-10 w-auto" />
        </Link>
      </header>
      <main>
        <NotFoundContent />
      </main>
    </>
  );
}
