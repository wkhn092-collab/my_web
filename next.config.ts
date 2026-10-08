import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // SAMEORIGIN, not DENY: Sanity Presentation at /studio previews the site in a same-origin iframe.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  // Other sites cannot embed our responses; link-preview crawlers fetch server-side and are unaffected.
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  // Where browsers send CSP violation reports (the CSP's report-to points here).
  { key: 'Reporting-Endpoints', value: 'csp="/api/csp-report"' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  experimental: {
    serverActions: {
      // The lead form is short text only.
      bodySizeLimit: '64kb',
    },
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      { source: '/thanks', headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }] },
      // 3D models: unhashed names, so a week of caching with background revalidation rather than immutable.
      { source: '/models/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }] },
    ];
  },
};

export default withNextIntl(nextConfig);
