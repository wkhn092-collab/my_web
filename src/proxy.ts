import { NextResponse, type NextRequest } from 'next/server';
import { buildAppCsp, buildStudioCsp } from '@/lib/security/csp';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/studio' || pathname.startsWith('/studio/')) {
    const response = NextResponse.next();
    response.headers.set('Content-Security-Policy', buildStudioCsp());
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildAppCsp(nonce, { preview: request.cookies.has('__prerender_bypass') });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|brand/|poster/|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico|txt)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
