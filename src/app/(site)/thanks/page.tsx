import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/content/site-content';
import { formatReplyWindow, getReplyWindow } from '@/lib/domain/reply-window';
import { publicEnv } from '@/lib/env.public';
import { ThanksClient } from './ThanksClient';

export const metadata: Metadata = {
  title: 'תודה',
  robots: { index: false, follow: false },
};

export default async function ThanksPage() {
  const content = await getSiteContent();
  const replyWindow = formatReplyWindow(getReplyWindow(new Date(), content.hours));
  return <ThanksClient replyWindow={replyWindow} projects={content.projects} siteUrl={publicEnv.siteUrl} />;
}
