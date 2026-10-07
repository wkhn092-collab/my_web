'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';
import type { LeadSiteType } from '@/lib/content/types';
import { useSession } from '@/lib/store/visitor';

export function OpenDrawerButton({
  children,
  siteType = null,
  className = 'btn-primary',
  location,
  id,
  magnetic = true,
}: {
  children: ReactNode;
  siteType?: LeadSiteType | null;
  className?: string;
  location: string;
  id?: string;
  magnetic?: boolean;
}) {
  const openDrawer = useSession((s) => s.openDrawer);
  return (
    <button
      id={id}
      type="button"
      className={className}
      aria-haspopup="dialog"
      data-magnetic={magnetic ? '' : undefined}
      onClick={() => {
        track('cta_click', { location });
        openDrawer(siteType);
      }}
    >
      {children}
    </button>
  );
}
