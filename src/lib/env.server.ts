import 'server-only';
import { z } from 'zod';

const optionalSecret = z.string().trim().min(1).max(4096).optional();

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),

  NEXT_PUBLIC_SANITY_PROJECT_ID: z
    .string()
    .regex(/^[a-z0-9-]{1,64}$/)
    .optional(),
  NEXT_PUBLIC_SANITY_DATASET: z
    .string()
    .regex(/^[a-z0-9_-]{1,64}$/)
    .default('production'),
  NEXT_PUBLIC_SANITY_API_VERSION: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .default('2026-10-01'),
  SANITY_LEADS_DATASET: z
    .string()
    .regex(/^[a-z0-9_-]{1,64}$/)
    .default('leads'),
  SANITY_READ_TOKEN: optionalSecret,
  SANITY_WRITE_TOKEN: optionalSecret,
  SANITY_WEBHOOK_SECRET: z.string().min(32).max(256).optional(),

  RESEND_API_KEY: optionalSecret,
  EMAIL_FROM: z.string().min(3).max(200).default('עומק <onboarding@resend.dev>'),
  OWNER_EMAIL: z.email().default('wkhn091@gmail.com'),

  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalSecret,
  TURNSTILE_SECRET_KEY: optionalSecret,

  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: optionalSecret,

  LEAD_IP_SALT: z.string().min(32).max(256).optional(),

  NEXT_PUBLIC_GA4_ID: z
    .string()
    .regex(/^G-[A-Z0-9]{4,16}$/)
    .optional(),
  NEXT_PUBLIC_CLARITY_ID: z
    .string()
    .regex(/^[a-z0-9]{6,20}$/)
    .optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const REQUIRED_ON_VERCEL: (keyof ServerEnv)[] = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'SANITY_WRITE_TOKEN',
  'SANITY_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'TURNSTILE_SECRET_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'LEAD_IP_SALT',
];

function emptyToUndefined(source: NodeJS.ProcessEnv): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(source)) {
    out[key] = value === '' ? undefined : value;
  }
  return out;
}

function loadEnv(): ServerEnv {
  const source = emptyToUndefined(process.env);
  source.NEXT_PUBLIC_SITE_URL ??= source.VERCEL_PROJECT_PRODUCTION_URL ? `https://${source.VERCEL_PROJECT_PRODUCTION_URL}` : undefined;
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Invalid environment variables: ${fields}`);
  }
  return parsed.data;
}

export const env = loadEnv();

export const isDeployed = env.VERCEL_ENV === 'production' || env.VERCEL_ENV === 'preview';

const missingOnDeploy = isDeployed ? REQUIRED_ON_VERCEL.filter((key) => !env[key]) : [];

/** Deployed without the lead-protection services: the form refuses every submission and visitors are sent to WhatsApp. */
export const leadsLocked = missingOnDeploy.length > 0;

if (leadsLocked) {
  console.warn(`[env] Lead form locked. Missing: ${missingOnDeploy.join(', ')}`);
}

export class ServiceNotConfiguredError extends Error {
  constructor(service: string) {
    super(`Service not configured: ${service}`);
    this.name = 'ServiceNotConfiguredError';
  }
}

export function requireEnv<K extends keyof ServerEnv>(
  service: string,
  ...keys: K[]
): { [P in K]-?: NonNullable<ServerEnv[P]> } {
  const result = {} as { [P in K]-?: NonNullable<ServerEnv[P]> };
  for (const key of keys) {
    const value = env[key];
    if (value === undefined || value === null || value === '') {
      throw new ServiceNotConfiguredError(service);
    }
    result[key] = value as NonNullable<ServerEnv[K]>;
  }
  return result;
}

export const isConfigured = {
  sanity: () => Boolean(env.NEXT_PUBLIC_SANITY_PROJECT_ID),
  sanityWrite: () => Boolean(env.NEXT_PUBLIC_SANITY_PROJECT_ID && env.SANITY_WRITE_TOKEN),
  resend: () => Boolean(env.RESEND_API_KEY),
  turnstile: () => Boolean(env.TURNSTILE_SECRET_KEY && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  redis: () => Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
};
