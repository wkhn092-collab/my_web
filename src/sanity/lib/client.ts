import 'server-only';
import { createClient, type SanityClient } from 'next-sanity';
import { env, requireEnv } from '@/lib/env.server';

let publicClient: SanityClient | null = null;
let previewClient: SanityClient | null = null;
let leadsWriteClient: SanityClient | null = null;
let contentWriteClient: SanityClient | null = null;

/** Published content through the CDN, for cached public reads. */
export function getSanityPublicClient(): SanityClient {
  if (publicClient) return publicClient;
  const { NEXT_PUBLIC_SANITY_PROJECT_ID } = requireEnv('sanity', 'NEXT_PUBLIC_SANITY_PROJECT_ID');
  publicClient = createClient({
    projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
    useCdn: true,
    perspective: 'published',
  });
  return publicClient;
}

/** Draft Mode / Presentation only: token-authenticated, uncached, sees drafts. */
export function getSanityPreviewClient(): SanityClient {
  if (previewClient) return previewClient;
  const { NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_READ_TOKEN } = requireEnv('sanity', 'NEXT_PUBLIC_SANITY_PROJECT_ID', 'SANITY_READ_TOKEN');
  previewClient = createClient({
    projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
    token: SANITY_READ_TOKEN,
    useCdn: false,
    perspective: 'drafts',
  });
  return previewClient;
}

/** Writes leads to the private `leads` dataset. The token is project-wide on the free plan: never leaves the server. */
export function getSanityLeadsWriteClient(): SanityClient {
  if (leadsWriteClient) return leadsWriteClient;
  const { NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_WRITE_TOKEN } = requireEnv('sanity', 'NEXT_PUBLIC_SANITY_PROJECT_ID', 'SANITY_WRITE_TOKEN');
  leadsWriteClient = createClient({
    projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.SANITY_LEADS_DATASET,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
    token: SANITY_WRITE_TOKEN,
    useCdn: false,
  });
  return leadsWriteClient;
}

/** Content dataset writes (seed script only). */
export function getSanityContentWriteClient(): SanityClient {
  if (contentWriteClient) return contentWriteClient;
  const { NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_WRITE_TOKEN } = requireEnv('sanity', 'NEXT_PUBLIC_SANITY_PROJECT_ID', 'SANITY_WRITE_TOKEN');
  contentWriteClient = createClient({
    projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
    token: SANITY_WRITE_TOKEN,
    useCdn: false,
  });
  return contentWriteClient;
}
