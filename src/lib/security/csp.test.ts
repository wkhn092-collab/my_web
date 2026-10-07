import { describe, expect, it } from 'vitest';
import { buildAppCsp } from './csp';

const prod = { NODE_ENV: 'production' } as NodeJS.ProcessEnv;

describe('buildAppCsp', () => {
  it('locks scripts to the nonce in production', () => {
    const csp = buildAppCsp('abc', {}, prod);
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic' 'wasm-unsafe-eval';");
    expect(csp).not.toContain("'unsafe-eval'");    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('allows analytics hosts only when ids are configured', () => {
    expect(buildAppCsp('n', {}, prod)).not.toContain('google-analytics');
    const withIds = buildAppCsp('n', {}, { ...prod, NEXT_PUBLIC_GA4_ID: 'G-ABC1234', NEXT_PUBLIC_CLARITY_ID: 'abcdef12' });
    expect(withIds).toContain('https://*.google-analytics.com');
    expect(withIds).toContain('https://*.clarity.ms');
  });

  it('ignores malformed analytics ids', () => {
    expect(buildAppCsp('n', {}, { ...prod, NEXT_PUBLIC_GA4_ID: "G-1; script-src *" })).not.toContain('google-analytics');
  });

  it('opens Sanity hosts only in preview', () => {
    expect(buildAppCsp('n', {}, prod)).not.toContain('sanity.io wss');
    expect(buildAppCsp('n', { preview: true }, prod)).toContain('wss://*.sanity.io');
  });
});
