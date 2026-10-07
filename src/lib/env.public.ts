import { z } from '@/lib/zod';

const publicEnvSchema = z.object({
  siteUrl: z.url().default('http://localhost:3000'),
  sanityProjectId: z
    .string()
    .regex(/^[a-z0-9-]{1,64}$/)
    .optional(),
  sanityDataset: z
    .string()
    .regex(/^[a-z0-9_-]{1,64}$/)
    .default('production'),
  turnstileSiteKey: z.string().min(1).max(256).optional(),
  ga4Id: z
    .string()
    .regex(/^G-[A-Z0-9]{4,16}$/)
    .optional(),
  clarityId: z
    .string()
    .regex(/^[a-z0-9]{6,20}$/)
    .optional(),
});

const blank = (value: string | undefined) => (value ? value : undefined);

// Each NEXT_PUBLIC_ variable must be referenced literally so the bundler can inline it.
export const publicEnv = publicEnvSchema.parse({
  siteUrl:
    blank(process.env.NEXT_PUBLIC_SITE_URL) ??
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : undefined),
  sanityProjectId: blank(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
  sanityDataset: blank(process.env.NEXT_PUBLIC_SANITY_DATASET),
  turnstileSiteKey: blank(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  ga4Id: blank(process.env.NEXT_PUBLIC_GA4_ID),
  clarityId: blank(process.env.NEXT_PUBLIC_CLARITY_ID),
});
