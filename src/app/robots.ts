import type { MetadataRoute } from 'next';
import { publicEnv } from '@/lib/env.public';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/studio', '/api', '/thanks'] }],
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
