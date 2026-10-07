import Link from 'next/link';
import type { Announcement } from '@/lib/content/types';

export function AnnouncementBar({ announcement }: { announcement: Announcement | null }) {
  if (!announcement?.active || !announcement.text) return null;
  const internal = announcement.href?.startsWith('/');
  return (
    <div className="relative z-50 border-b border-gold/20 bg-gradient-to-l from-ink via-[#161208] to-ink px-5 py-2 text-center text-sm tracking-wide text-gold-soft">
      {announcement.href ? (
        internal ? (
          <Link href={announcement.href} className="link">
            {announcement.text}
          </Link>
        ) : (
          <a href={announcement.href} className="link" rel="noopener noreferrer">
            {announcement.text}
          </a>
        )
      ) : (
        announcement.text
      )}
    </div>
  );
}
