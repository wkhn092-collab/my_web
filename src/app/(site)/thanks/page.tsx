import { ThanksClient } from './ThanksClient';
import { getSiteContent } from '@/lib/content/site-content';
import { publicEnv } from '@/lib/env.public';

export default async function ThanksPage() {
  const content = await getSiteContent();
  return <ThanksClient projects={content.projects} siteUrl={publicEnv.siteUrl} />;
}
