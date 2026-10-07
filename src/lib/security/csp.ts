const GA4_ID = /^G-[A-Z0-9]{4,16}$/;
const CLARITY_ID = /^[a-z0-9]{6,20}$/;

function compact(policy: Record<string, (string | null | false | undefined)[]>): string {
  return Object.entries(policy)
    .map(([directive, sources]) => {
      const values = sources.filter(Boolean);
      return values.length > 0 ? `${directive} ${values.join(' ')}` : directive;
    })
    .join('; ');
}

export function buildAppCsp(nonce: string, options: { preview?: boolean } = {}, env: NodeJS.ProcessEnv = process.env): string {
  const isDev = env.NODE_ENV === 'development';
  // Analytics hosts are allowed only when an id is configured; the scripts still load only after consent.
  const ga4 = GA4_ID.test(env.NEXT_PUBLIC_GA4_ID ?? '');
  const clarity = CLARITY_ID.test(env.NEXT_PUBLIC_CLARITY_ID ?? '');

  const policy: Record<string, (string | null | false | undefined)[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", isDev && "'unsafe-eval'"],
    // Motion and React `style` props emit inline style attributes; scripts stay nonce-locked.
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://cdn.sanity.io',
      ga4 && 'https://*.google-analytics.com',
      ga4 && 'https://www.googletagmanager.com',
      clarity && 'https://*.clarity.ms',
      clarity && 'https://c.bing.com',
    ],
    'font-src': ["'self'"],
    'connect-src': [
      "'self'",
      // three's GLTFLoader fetch()es the textures embedded in our own .glb files through blob: URLs it creates.
      'blob:',
      'https://challenges.cloudflare.com',
      ga4 && 'https://*.google-analytics.com',
      ga4 && 'https://*.analytics.google.com',
      ga4 && 'https://www.googletagmanager.com',
      clarity && 'https://*.clarity.ms',
      options.preview && 'https://*.sanity.io',
      options.preview && 'wss://*.sanity.io',
      isDev && 'ws:',
    ],
    'frame-src': ['https://challenges.cloudflare.com'],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    // Same-origin only: the Presentation tool at /studio.
    'frame-ancestors': ["'self'"],
  };
  if (!isDev) policy['upgrade-insecure-requests'] = [];
  return compact(policy);
}

export function buildStudioCsp(): string {
  return compact({
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https://cdn.sanity.io', 'https://lh3.googleusercontent.com'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'https://*.sanity.io', 'wss://*.sanity.io', 'https://*.api.sanity.io', 'wss://*.api.sanity.io'],
    'frame-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'frame-ancestors': ["'self'"],
  });
}
